import React, { useRef, useEffect } from 'react';
import { 
  MapPin, 
  Briefcase, 
  Calculator, 
  Wallet, 
  Award, 
  Landmark, 
  TrendingUp, 
  PieChart, 
  FileText,
  Check
} from 'lucide-react';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
  completedSteps: number[];
}

const STEPS = [
  { id: 1, label: 'Promoter & Location', icon: MapPin },
  { id: 2, label: 'Business Selection', icon: Briefcase },
  { id: 3, label: 'Project Cost', icon: Calculator },
  { id: 4, label: 'Capital & Funding', icon: Wallet },
  { id: 5, label: 'Scheme Matching', icon: Award },
  { id: 6, label: 'Loan Calculator', icon: Landmark },
  { id: 7, label: 'Forecast', icon: TrendingUp },
  { id: 8, label: 'Feasibility & Risks', icon: PieChart },
  { id: 9, label: 'Bank DPR', icon: FileText }
];

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  onSelectStep,
  completedSteps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  // Auto scroll active step into view on smaller screens
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);

  const progressPercent = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div className="w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-zinc-800/80 sticky top-0 z-30 shadow-xs">
      {/* Top subtle progress bar line */}
      <div className="w-full h-1 bg-gray-100 dark:bg-zinc-900 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out rounded-r-full shadow-[0_0_8px_#10B981]"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>

      <div className="w-full px-2 py-1.5 sm:px-4 sm:py-2">
        <div 
          ref={containerRef}
          className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1.5 sm:gap-2 px-0.5 py-0.5"
        >
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <button
                key={step.id}
                ref={isActive ? activeStepRef : null}
                onClick={() => onSelectStep(step.id)}
                title={`${step.id}. ${step.label}`}
                className={`flex-1 min-w-[110px] sm:min-w-[125px] xl:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer select-none border ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30 scale-[1.01]'
                    : isCompleted
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-gray-50 dark:bg-zinc-900/80 text-gray-600 dark:text-zinc-400 border-gray-200/70 dark:border-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-800/90 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {/* Step Icon Badge (No numbers) */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200/80 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : (
                    <Icon size={13} className="shrink-0" />
                  )}
                </div>

                {/* Step Label */}
                <span className="whitespace-nowrap font-semibold text-[11px] sm:text-xs tracking-tight truncate">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


