import React from 'react';
import { RuralNexLogoMark } from './RuralNexLogo';

export interface RuralLogoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'screen' | 'radar';
  text?: string;
  subtext?: string;
  progress?: number;
  className?: string;
  showCard?: boolean;
}

export const RuralLogoLoader: React.FC<RuralLogoLoaderProps> = ({
  size = 'md',
  text = 'RuralNex',
  subtext,
  progress,
  className = '',
  showCard = false,
}) => {
  // Dimensions and styling based on requested size
  const config = {
    sm: {
      outerSize: 'w-16 h-16',
      logoSize: 'w-9 h-9',
      borderThickness: 'border-2',
      glowSize: 'w-16 h-16',
      textSize: 'text-xs',
      subtextSize: 'text-[10px]',
    },
    md: {
      outerSize: 'w-24 h-24',
      logoSize: 'w-14 h-14',
      borderThickness: 'border-2',
      glowSize: 'w-24 h-24',
      textSize: 'text-sm font-bold',
      subtextSize: 'text-xs',
    },
    lg: {
      outerSize: 'w-32 h-32',
      logoSize: 'w-20 h-20',
      borderThickness: 'border-[3px]',
      glowSize: 'w-32 h-32',
      textSize: 'text-base font-extrabold',
      subtextSize: 'text-xs',
    },
    radar: {
      outerSize: 'w-20 h-20',
      logoSize: 'w-11 h-11',
      borderThickness: 'border-2',
      glowSize: 'w-20 h-20',
      textSize: 'text-xs font-bold',
      subtextSize: 'text-[10px]',
    },
    screen: {
      outerSize: 'w-28 h-28 sm:w-32 sm:h-32',
      logoSize: 'w-16 h-16 sm:w-20 sm:h-20',
      borderThickness: 'border-[3px]',
      glowSize: 'w-36 h-36',
      textSize: 'text-lg sm:text-xl font-black',
      subtextSize: 'text-xs sm:text-sm',
    },
  }[size];

  // Core animated logo core element
  const logoCore = (
    <div className={`relative ${config.outerSize} flex items-center justify-center shrink-0`}>
      {/* 1. Concentric ambient radar pulse waves */}
      <div className="absolute inset-0 rounded-full border border-emerald-500/30 dark:border-emerald-400/30 animate-rural-radar" />
      <div 
        className="absolute inset-[-8px] rounded-full border border-teal-500/20 dark:border-teal-400/20 animate-rural-radar" 
        style={{ animationDelay: '0.9s' }} 
      />

      {/* 2. Ambient neon green-cyan backlight glow */}
      <div className={`absolute ${config.glowSize} bg-gradient-to-tr from-emerald-500/30 via-teal-500/25 to-emerald-400/30 rounded-full blur-xl pointer-events-none`} />

      {/* 3. Outer orbital neon gradient ring (Clockwise rotation) */}
      <div className={`absolute inset-0 rounded-full ${config.borderThickness} border-transparent border-t-emerald-500 border-r-teal-400 dark:border-t-emerald-400 dark:border-r-teal-300 animate-rural-orbit-cw opacity-90`} />

      {/* 4. Inner reverse-rotation dashed telemetry ring (Counter-clockwise rotation) */}
      <div className={`absolute inset-1.5 rounded-full border border-dashed border-emerald-400/40 dark:border-emerald-500/40 animate-rural-orbit-ccw`} />

      {/* 5. Center emblem disc with frosted glass reflection */}
      <div className="relative rounded-full p-2 bg-gradient-to-b from-white/95 to-emerald-50/90 dark:from-zinc-900/95 dark:to-[#0a1813]/95 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xl shadow-emerald-900/15 dark:shadow-black/50 flex items-center justify-center backdrop-blur-md">
        {/* Animated breathing RuralNex SVG logo */}
        <div className={`${config.logoSize} flex items-center justify-center select-none animate-rural-breathe`}>
          <RuralNexLogoMark size={999} className="w-full h-full" />
        </div>
      </div>

      {/* 6. Orbital luminous satellites / sparkles */}
      <div className="absolute inset-0 animate-rural-orbit-fast pointer-events-none">
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
      </div>
      <div className="absolute inset-0 animate-rural-orbit-ccw pointer-events-none">
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_6px_#2DD4BF]" />
      </div>
    </div>
  );

  // If fullscreen screen loader requested
  if (size === 'screen') {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50/90 dark:bg-[#07090e]/95 backdrop-blur-md text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300 ${className}`}>
        {/* Atmospheric ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Floating Card Container */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-8 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-500/20 dark:border-zinc-800 shadow-2xl shadow-emerald-950/10 dark:shadow-black/60 backdrop-blur-xl space-y-5">
          {logoCore}

          {/* Typography */}
          <div className="text-center space-y-1.5 w-full">
            <h2 className={`${config.textSize} tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent flex items-center justify-center gap-1.5`}>
              <span>{text}</span>
            </h2>
            <p className={`${config.subtextSize} text-gray-500 dark:text-zinc-400 font-medium`}>
              {subtext || 'Empowering Rural Dreams & Feasibility...'}
            </p>
          </div>

          {/* Shimmer progress bar */}
          <div className="w-full max-w-[200px] space-y-1">
            <div className="w-full h-1.5 bg-gray-200/80 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
              {progress !== undefined ? (
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              ) : (
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full animate-rural-shimmer" />
              )}
            </div>
            {progress !== undefined && (
              <div className="text-right text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {progress}%
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If rendered as a boxed card
  if (showCard) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-500/20 dark:border-zinc-800 shadow-xl backdrop-blur-md space-y-3.5 ${className}`}>
        {logoCore}
        {(text || subtext) && (
          <div className="text-center space-y-1">
            {text && (
              <span className={`block ${config.textSize} bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent`}>
                {text}
              </span>
            )}
            {subtext && (
              <span className={`block ${config.subtextSize} text-gray-500 dark:text-zinc-400 font-medium`}>
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline loader default
  return (
    <div className={`flex flex-col items-center justify-center space-y-2.5 ${className}`}>
      {logoCore}
      {(text || subtext) && (
        <div className="text-center space-y-0.5">
          {text && (
            <span className={`block ${config.textSize} bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent`}>
              {text}
            </span>
          )}
          {subtext && (
            <span className={`block ${config.subtextSize} text-gray-500 dark:text-zinc-400 font-medium`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RuralLogoLoader;
