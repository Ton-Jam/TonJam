import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface TonJamBackArrowProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<TonJamBackArrowProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Standardized TonJam back arrow icon using TonJam design tokens.
 * Enforces consistent stroke weight and pure white (#FFFFFF) foreground token.
 */
export const TonJamBackArrow: React.FC<TonJamBackArrowProps> = ({
  className,
  size = 'md',
}) => {
  return (
    <ArrowLeftIcon
      aria-hidden="true"
      strokeWidth={2.25}
      style={{ color: 'var(--tj-icon-back-color, #FFFFFF)' }}
      className={cn(
        'shrink-0 text-[#FFFFFF] transition-transform duration-150',
        SIZE_CLASSES[size],
        className
      )}
    />
  );
};

export default TonJamBackArrow;
