import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Loader2, ChevronLeft } from 'lucide-react';
import { profileSchema, type ProfileFormValues } from '../../../schemas/registration.schema';
import { LocationCascade, type LocationValue } from './LocationCascade';

interface Props {
  onSuccess: (data: ProfileFormValues) => void;
  onBack: () => void;
  isLoading: boolean;
  serverError?: string;
}

const ENTREPRENEUR_TYPES = [
  { value: 'aspiring', labelKey: 'profile.entrepreneurType.aspiring' },
  { value: 'new', labelKey: 'profile.entrepreneurType.new' },
  { value: 'existing', labelKey: 'profile.entrepreneurType.existing' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'none', labelKey: 'profile.experience.none' },
  { value: 'lt1', labelKey: 'profile.experience.lt1' },
  { value: '1_3', labelKey: 'profile.experience.1_3' },
  { value: '3_5', labelKey: 'profile.experience.3_5' },
  { value: 'gt5', labelKey: 'profile.experience.gt5' },
];

const BUSINESS_CATEGORIES = [
  'Dairy', 'Agriculture', 'Retail', 'Grocery', 'Textiles',
  'Food Processing', 'Handicrafts', 'Manufacturing',
  'Services', 'Transportation', 'Other',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const selectCls = (hasError = false) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white outline-none transition',
    'focus:ring-2 focus:ring-primary/40 focus:border-primary',
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-300',
  ].join(' ');

const inputCls = (hasError = false) =>
  [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition',
    'focus:ring-2 focus:ring-primary/40 focus:border-primary',
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-300 bg-white',
  ].join(' ');

export const ProfileStep: React.FC<Props> = ({ onSuccess, onBack, isLoading, serverError }) => {
  const { t, i18n } = useTranslation();

  const [location, setLocation] = useState<LocationValue>({
    stateId: null,
    districtId: null,
    blockId: null,
    villageId: null,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { preferred_language: (i18n.language as 'en' | 'hi' | 'gu') ?? 'en' },
    mode: 'onSubmit',
  });

  const fieldErr = (key: keyof ProfileFormValues) => {
    const msg = errors[key]?.message as string | undefined;
    if (!msg) return undefined;
    return msg.includes('.') ? t(msg) : msg;
  };

  const onSubmit = (data: ProfileFormValues) => {
    onSuccess({
      ...data,
      default_state: location.stateId,
      default_district: location.districtId,
      default_block: location.blockId,
      default_village: location.villageId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Server error */}
      {serverError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Language */}
      <div className="mb-4">
        <label htmlFor="reg-lang" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.language')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select id="reg-lang" className={selectCls()} {...register('preferred_language')}>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Entrepreneur type */}
      <div className="mb-4">
        <label htmlFor="reg-etype" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.entrepreneurType')}
        </label>
        <select id="reg-etype" className={selectCls()} {...register('entrepreneur_type')}>
          <option value="">— Select —</option>
          {ENTREPRENEUR_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div className="mb-5">
        <label htmlFor="reg-exp" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.experience')}
        </label>
        <select id="reg-exp" className={selectCls()} {...register('experience')}>
          <option value="">— Select —</option>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
      </div>

      {/* Location cascade */}
      <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Your Location
        </p>
        <LocationCascade value={location} onChange={setLocation} />
      </div>

      {/* Own Capital */}
      <div className="mb-4">
        <label htmlFor="reg-capital" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.ownCapital')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium" aria-hidden="true">
            ₹
          </span>
          <input
            id="reg-capital"
            type="number"
            min={0}
            step={1000}
            placeholder={t('profile.ownCapital.placeholder')}
            className={`${inputCls(!!fieldErr('own_capital'))} pl-7`}
            aria-describedby="cap-hint"
            {...register('own_capital')}
          />
        </div>
        <p id="cap-hint" className="mt-1 text-xs text-gray-500">{t('profile.ownCapital.hint')}</p>
        {fieldErr('own_capital') && (
          <p role="alert" className="mt-1 text-xs text-red-600">{fieldErr('own_capital')}</p>
        )}
      </div>

      {/* Business category */}
      <div className="mb-5">
        <label htmlFor="reg-biz" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.businessCategory')}
        </label>
        <select id="reg-biz" className={selectCls()} {...register('business_interest')}>
          <option value="">{t('profile.businessCategory.placeholder')}</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">{t('profile.businessCategory.hint')}</p>
      </div>

      {/* Terms & Consent */}
      <div className="mb-6">
        <Controller
          name="terms_accepted"
          control={control}
          render={({ field }) => (
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  aria-required="true"
                  aria-invalid={!!errors.terms_accepted}
                  aria-describedby={errors.terms_accepted ? 'err-terms' : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  {t('auth.register.terms')}{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer"
                    className="text-primary underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    {t('auth.register.termsLink')}
                  </a>
                  {' '}{t('auth.register.and')}{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-primary underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    {t('auth.register.privacyLink')}
                  </a>
                </span>
              </label>
              {errors.terms_accepted && (
                <p id="err-terms" role="alert" className="mt-1 text-xs text-red-600">
                  {t('auth.register.termsRequired')}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {t('auth.register.back')}
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-white font-semibold rounded-lg py-3 px-4 text-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>{t('saving')}</span>
            </>
          ) : (
            t('auth.register.submit')
          )}
        </button>
      </div>
    </form>
  );
};
