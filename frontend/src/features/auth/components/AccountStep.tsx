import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
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
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition',
    'focus:ring-2 focus:ring-primary/40 focus:border-primary',
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-300 bg-white',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* First Name */}
        <div>
          <label htmlFor="reg-first-name" className="block text-sm font-medium text-gray-700 mb-1">
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
            <p id="err-first-name" role="alert" className="mt-1 text-xs text-red-600">
              {fieldError('first_name')}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="reg-last-name" className="block text-sm font-medium text-gray-700 mb-1">
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
            <p id="err-last-name" role="alert" className="mt-1 text-xs text-red-600">
              {fieldError('last_name')}
            </p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="mb-4">
        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">
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
          <p id="err-username" role="alert" className="mt-1 text-xs text-red-600">
            {fieldError('username')}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
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
          <p id="err-email" role="alert" className="mt-1 text-xs text-red-600">
            {fieldError('email')}
          </p>
        )}
      </div>

      {/* Mobile */}
      <div className="mb-4">
        <label htmlFor="reg-mobile" className="block text-sm font-medium text-gray-700 mb-1">
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
          <p id="err-mobile" role="alert" className="mt-1 text-xs text-red-600">
            {fieldError('phone_number')}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <PasswordInput
          id="reg-password"
          label={`${t('auth.register.password')} *`}
          placeholder={t('auth.register.password.placeholder')}
          autoComplete="new-password"
          showStrength
          value={passwordValue}
          error={fieldError('password')}
          {...register('password')}
        />
      </div>

      {/* Confirm Password */}
      <div className="mb-5">
        <PasswordInput
          id="reg-confirm-password"
          label={`${t('auth.register.confirmPassword')} *`}
          placeholder={t('auth.register.confirmPassword.placeholder')}
          autoComplete="new-password"
          error={fieldError('confirm_password')}
          {...register('confirm_password')}
        />
      </div>

      {/* MediaPipe Face Detector */}
      <FaceDetectorInput onFaceCaptured={(url) => setFaceAvatarUrl(url)} />

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white font-semibold rounded-lg py-3 px-4 text-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Sign-in link */}
      <p className="mt-5 text-center text-sm text-gray-500">
        {t('auth.register.signinPrompt')}{' '}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          {t('auth.register.signin')}
        </Link>
      </p>
    </form>
  );
};
