import React from 'react';

interface RuralNexLogoProps {
  /** size of the square emblem in px */
  size?: number;
  className?: string;
  /** show only the emblem mark, no wordmark */
  markOnly?: boolean;
  /** force light or dark text for wordmark */
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * RuralNex Green Tree Logo Mark
 * Official brand icon: Vibrant green tree with roots & golden fruit nodes.
 */
export const RuralNexLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <img
    src="/logo.png"
    alt="RuralNex Logo"
    width={size}
    height={size}
    style={{ width: size === 999 ? '100%' : `${size}px`, height: size === 999 ? '100%' : `${size}px` }}
    className={`object-contain shrink-0 filter drop-shadow-xs transition-transform ${className}`}
  />
);

/**
 * Full RuralNex Logo — mark + wordmark side by side
 */
const RuralNexLogo: React.FC<RuralNexLogoProps> = ({
  size = 36,
  className = '',
  markOnly = false,
  theme = 'auto',
}) => {
  if (markOnly) {
    return <RuralNexLogoMark size={size} className={className} />;
  }

  const textColor =
    theme === 'light'
      ? 'text-white'
      : theme === 'dark'
      ? 'text-gray-900'
      : 'text-gray-900 dark:text-white';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <RuralNexLogoMark size={size} />
      <span
        className={`font-extrabold tracking-tight leading-none select-none ${textColor}`}
        style={{ fontSize: Math.round(size * 0.55) }}
      >
        Rural<span style={{ color: '#10B981' }}>Nex</span>
      </span>
    </span>
  );
};

export default RuralNexLogo;

