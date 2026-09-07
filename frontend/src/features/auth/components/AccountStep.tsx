import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { accountSchema, type AccountFormValues } from '../../../schemas/registration.schema';
import { PasswordInput } from './PasswordInput';
import { FaceDetectorInput } from './FaceDetectorInput';

interface Props {
  onSuccess: (data: AccountFormValues, faceAvatarUrl?: string) => void;
  serverErrors?: Record<string, string[]>;
  isLoading: boolean;
}

/** Shared input class helper */
const inputCls = (hasError: boolean) =>
  [
    'w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 outline-none transition-all font-medium',
    'focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
    hasError
      ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 bg-gray-50',
  ].join(' ');

export const AccountStep: React.FC<Props> = ({ onSuccess, serverErrors, isLoading }) => {
  const { t } = useTranslation();
  const [faceAvatarUrl, setFaceAvatarUrl] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');

  // Helper: merge server errors onto a field
  const serverErr = (field: keyof AccountFormValues) =>
    serverErrors?.[field]?.join(' ');

  const fieldError = (field: keyof AccountFormValues) => {
    const zodMsg = errors[field]?.message;
    const srvMsg = serverErr(field);
    const raw = zodMsg ?? srvMsg;
    if (!raw) return undefined;
    // Translate if it looks like an i18n key
    return raw.includes('.') ? t(raw) : raw;
  };

  return (
    <form onSubmit={handleSubmit((data) => onSuccess(data, faceAvatarUrl))} noValidate>
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* First Name */}
        <div>
          <label htmlFor="reg-first-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            {t('auth.register.firstName')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="reg-first-name"
            type="text"
            autoComplete="given-name"
            placeholder={t('auth.register.firstName.placeholder')}
            aria-required="true"
            aria-invalid={!!fieldError('first_name')}
            aria-describedby={fieldError('first_name') ? 'err-first-name' : undefined}
            className={inputCls(!!fieldError('first_name'))}
            {...register('first_name')}
          />
          {fieldError('first_name') && (
            <p id="err-first-name" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {fieldError('first_name')}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="reg-last-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            {t('auth.register.lastName')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="reg-last-name"
            type="text"
            autoComplete="family-name"
            placeholder={t('auth.register.lastName.placeholder')}
            aria-required="true"
            aria-invalid={!!fieldError('last_name')}
            aria-describedby={fieldError('last_name') ? 'err-last-name' : undefined}
            className={inputCls(!!fieldError('last_name'))}
            {...register('last_name')}
          />
          {fieldError('last_name') && (
            <p id="err-last-name" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {fieldError('last_name')}
            </p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="mb-3">
        <label htmlFor="reg-username" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          {t('auth.register.username')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="reg-username"
          type="text"
          autoComplete="username"
          placeholder={t('auth.register.username.placeholder')}
          aria-required="true"
          aria-invalid={!!fieldError('username')}
          aria-describedby={fieldError('username') ? 'err-username' : undefined}
          className={inputCls(!!fieldError('username'))}
          {...register('username')}
        />
        {fieldError('username') && (
          <p id="err-username" role="alert" className="mt-1 text-xs text-red-600 font-medium">
            {fieldError('username')}
          </p>
        )}
      </div>

      {/* Email & Mobile Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            {t('auth.register.email')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.register.email.placeholder')}
            aria-required="true"
            aria-invalid={!!fieldError('email')}
            aria-describedby={fieldError('email') ? 'err-email' : undefined}
            className={inputCls(!!fieldError('email'))}
            {...register('email')}
          />
          {fieldError('email') && (
            <p id="err-email" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {fieldError('email')}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label htmlFor="reg-mobile" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            {t('auth.register.mobile')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="reg-mobile"
            type="tel"
            autoComplete="tel"
            placeholder={t('auth.register.mobile.placeholder')}
            aria-required="true"
            aria-invalid={!!fieldError('phone_number')}
            aria-describedby={fieldError('phone_number') ? 'err-mobile' : undefined}
            className={inputCls(!!fieldError('phone_number'))}
            {...register('phone_number')}
          />
          {fieldError('phone_number') && (
            <p id="err-mobile" role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {fieldError('phone_number')}
            </p>
          )}
        </div>
      </div>

      {/* Password & Confirm Password Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Password */}
        <div>
          <PasswordInput
            id="reg-password"
            label={`${t('auth.register.password')} *`}
            placeholder={t('auth.register.password.placeholder')}
            autoComplete="new-password"
            showStrength={false}
            value={passwordValue}
            error={fieldError('password')}
            {...register('password')}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <PasswordInput
            id="reg-confirm-password"
            label={`${t('auth.register.confirmPassword')} *`}
            placeholder={t('auth.register.confirmPassword.placeholder')}
            autoComplete="new-password"
            error={fieldError('confirm_password')}
            {...register('confirm_password')}
          />
        </div>
      </div>

      {/* MediaPipe Face Detector Option */}
      <div className="mb-3">
        <FaceDetectorInput onFaceCaptured={(url) => setFaceAvatarUrl(url)} />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl py-2.5 px-4 text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
    </form>
  );
};
