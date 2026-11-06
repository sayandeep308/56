import React from 'react';

export type LuxuryButtonVariant =
  | 'burnt-amber'
  | 'champagne-pearl'
  | 'dark-espresso'
  | 'brushed-taupe'
  | 'glass-mesh';

export type LuxuryButtonShape =
  | 'wide'
  | 'square-tile'
  | 'pill'
  | 'compact'
  | 'icon'
  | 'icon-square';

export interface LuxuryButtonProps {
  children?: React.ReactNode;
  variant?: LuxuryButtonVariant;
  shape?: LuxuryButtonShape;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

/**
 * 3D Frosted Liquid Glass Pill Button with Diffused Color Mesh Glow
 * Matches reference image architecture:
 * - Rounded-full frosted glass shell with 3D specular bevel & inner rim
 * - Electric Blue & Warm Coral/Peach aurora blobs on the right
 * - Adaptive typography with smooth slate-to-white contrast
 * - Smooth hover scale and tactile click press
 */
export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  children,
  variant = 'glass-mesh',
  shape = 'pill',
  size = 'md',
  icon,
  iconRight,
  href,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  title,
  ariaLabel,
  target,
  rel,
}) => {
  // Shape geometry classes
  const shapeClasses: Record<LuxuryButtonShape, string> = {
    wide: 'px-7 sm:px-8 py-3.5 rounded-full',
    'square-tile': 'aspect-square w-36 md:w-44 rounded-3xl flex-col p-4 text-center',
    pill: 'px-7 py-3.5 rounded-full',
    compact: 'px-4 py-2 rounded-full text-xs min-h-[40px]',
    icon: 'p-3 rounded-full aspect-square min-w-[42px] min-h-[42px] flex items-center justify-center',
    'icon-square': 'w-10 h-10 min-w-[40px] min-h-[40px] rounded-full p-0 flex items-center justify-center aspect-square shrink-0',
  };

  // Size typography
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-xs tracking-tight py-2.5 px-5',
    md: 'text-xs sm:text-sm tracking-tight',
    lg: 'text-sm sm:text-base tracking-tight py-4 px-8',
  };

  const isSquareOrIcon =
    shape === 'square-tile' || shape === 'icon' || shape === 'icon-square' || shape === 'compact';

  const baseClasses = [
    'group relative inline-flex items-center justify-center select-none overflow-hidden cursor-pointer',
    'transition-all duration-300 ease-out font-medium',
    'btn-liquid-glass-mesh',
    shapeClasses[shape] || shapeClasses.pill,
    !isSquareOrIcon ? sizeClasses[size] : '',
    disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'active:scale-[0.97]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* 1. Internal Aurora Mesh Glow: Electric Blue & Coral/Peach Blobs */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full"
      >
        {/* Electric Blue Orb (top-right) */}
        <span
          className="absolute -top-[10%] right-[12%] h-[120%] w-[55%] rounded-full opacity-90 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:-translate-x-1 group-hover:translate-y-1"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.85) 0%, rgba(99, 102, 241, 0.6) 35%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Warm Coral / Peach Orb (bottom-right) */}
        <span
          className="absolute -bottom-[15%] right-[4%] h-[120%] w-[60%] rounded-full opacity-85 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:-translate-x-2 group-hover:-translate-y-1"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 92, 0.85) 0%, rgba(251, 191, 146, 0.6) 45%, transparent 75%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Specular Top Reflection Rim */}
        <span
          className="absolute inset-x-3 top-[1px] h-[1px] rounded-full opacity-90"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.7) 100%)',
          }}
        />
      </span>

      {/* 2. Button Foreground Content: High-contrast solid typography (no color-splitting gradient) */}
      <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-tight text-[#1E2433] group-hover:text-[#111827] transition-colors duration-200">
        {icon && (
          <span className="inline-flex shrink-0 items-center justify-center text-[#1E2433] group-hover:scale-105 transition-transform duration-200">
            {icon}
          </span>
        )}
        {children && (
          <span className="btn-glass-text-solid select-none text-[#1E2433]">
            {children}
          </span>
        )}
        {iconRight && (
          <span className="inline-flex shrink-0 items-center justify-center text-[#1E2433] group-hover:translate-x-1 transition-transform duration-200">
            {iconRight}
          </span>
        )}
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        onClick={onClick as any}
        target={target}
        rel={target === '_blank' ? (rel || 'noopener noreferrer') : rel}
        className={baseClasses}
        title={title}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick as any}
      disabled={disabled}
      className={baseClasses}
      title={title}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};

