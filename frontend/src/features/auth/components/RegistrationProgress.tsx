import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  currentStep: 1 | 2;
}

export const RegistrationProgress: React.FC<Props> = ({ currentStep }) => {
  const { t } = useTranslation();

  const steps = [
    { num: 1, label: t('auth.register.stepLabel1') },
    { num: 2, label: t('auth.register.stepLabel2') },
  ];

  return (
    <nav aria-label="Registration progress" className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <React.Fragment key={step.num}>
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2',
                  isDone
                    ? 'bg-green-600 border-green-600 text-white'
                    : isActive
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-400',
                ].join(' ')}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : <span>{String(step.num).padStart(2, '0')}</span>}
              </div>
              <span
                className={[
                  'text-xs font-semibold tracking-wide uppercase',
                  isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {idx < steps.length - 1 && (
              <div
                className={[
                  'h-0.5 w-16 mx-2 mb-5 transition-all duration-300',
                  isDone ? 'bg-green-500' : 'bg-gray-200',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
