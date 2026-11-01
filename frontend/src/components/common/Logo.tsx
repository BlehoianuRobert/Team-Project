import React from 'react';
import './Logo.css';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark';
  tone?: 'light' | 'dark';
  className?: string;
}

/** Brand mark: price tag (Fjord blue) with amber hole. Wordmark is live text so it uses the web font. */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
    <path d="M30 6h20a4 4 0 0 1 4 4v20L30 54a4 4 0 0 1-5.7 0L6 35.7A4 4 0 0 1 6 30z" fill="#1d5bd8" />
    <circle cx="43" cy="17" r="5.5" fill="#f5a524" />
    <path d="M19 33l7 7" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ variant = 'horizontal', tone = 'light', className = '' }) => {
  const markSize = variant === 'stacked' ? 72 : 36;
  return (
    <span
      className={`brand-logo brand-logo--${variant} brand-logo--${tone} ${className}`.trim()}
      role="img"
      aria-label="Online Rental System"
    >
      <LogoMark size={markSize} />
      {variant !== 'mark' && (
        <span className="brand-logo-word" aria-hidden="true">
          online <span className="brand-logo-word-accent">rental</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
