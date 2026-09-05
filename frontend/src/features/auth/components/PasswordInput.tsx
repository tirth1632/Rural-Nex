import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
}

function getStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const map: Record<number, PasswordStrength> = {
    1: { score: 1, label: 'auth.register.passwordStrength.weak', color: 'bg-red-500' },
    2: { score: 2, label: 'auth.register.passwordStrength.fair', color: 'bg-amber-400' },
    3: { score: 3, label: 'auth.register.passwordStrength.good', color: 'bg-blue-500' },
    4: { score: 3, label: 'auth.register.passwordStrength.strong', color: 'bg-green-500' },
  };
  return map[Math.min(score, 4)] ?? { score: 0, label: '', color: '' };
}

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ id, label, error, showStrength = false, ...rest }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? getStrength((rest.value as string) ?? '') : null;

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            aria-describedby={error ? `${id}-error` : showStrength ? `${id}-strength` : undefined}
            aria-invalid={!!error}
            className={[
              'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition',
              'focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-300 bg-white',
            ].join(' ')}
            {...rest}
          />
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Strength meter */}
        {showStrength && strength && strength.label && (
          <div id={`${id}-strength`} className="mt-1.5">
            <div className="flex gap-1 mb-1" aria-hidden="true">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={[
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    strength.score >= bar ? strength.color : 'bg-gray-200',
                  ].join(' ')}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <span className="font-medium">{t(strength.label)}</span>
              {' · '}
              {t('auth.register.passwordStrength.hint')}
            </p>
          </div>
        )}

        {/* Field error */}
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
