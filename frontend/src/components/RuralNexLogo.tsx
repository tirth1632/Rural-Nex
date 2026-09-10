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
 * RuralNex SVG Logo Mark
 * A simple, professional geometric mark:
 *   - Emerald green hexagonal ring (rural connectivity)
 *   - Sprouting leaf arrow pointing upward (rural growth)
 *   - Clean white inner emblem
 */
export const RuralNexLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="RuralNex"
    role="img"
  >
    {/* Outer hexagon ring */}
    <path
      d="M20 2L35.59 11V29L20 38L4.41 29V11L20 2Z"
      fill="url(#rn-grad-outer)"
      opacity="0.95"
    />
    {/* Inner lighter hex panel */}
    <path
      d="M20 7L31.26 13.5V26.5L20 33L8.74 26.5V13.5L20 7Z"
      fill="url(#rn-grad-inner)"
    />
    {/* Upward sprout / leaf arrow — growth */}
    <path
      d="M20 27V15"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Left branch */}
    <path
      d="M20 22C20 22 15.5 20 15 16C18 16 20.5 19 20 22Z"
      fill="white"
      opacity="0.92"
    />
    {/* Right branch */}
    <path
      d="M20 19C20 19 24.5 17 25 13C22 13 19.5 16 20 19Z"
      fill="white"
      opacity="0.92"
    />
    {/* Top arrowhead tip */}
    <path
      d="M17.5 17.5L20 14.5L22.5 17.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <defs>
      <linearGradient id="rn-grad-outer" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#0D9488" />
      </linearGradient>
      <linearGradient id="rn-grad-inner" x1="8" y1="7" x2="32" y2="33" gradientUnits="userSpaceOnUse">
        <stop stopColor="#047857" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
    </defs>
  </svg>
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
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <RuralNexLogoMark size={size} />
      <span
        className={`font-extrabold tracking-tight leading-none select-none ${textColor}`}
        style={{ fontSize: Math.round(size * 0.55) }}
      >
        Rural<span style={{ color: '#059669' }}>Nex</span>
      </span>
    </span>
  );
};

export default RuralNexLogo;
