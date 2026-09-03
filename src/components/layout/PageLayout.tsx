import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full';
  topSpacing?: 'none' | 'sm' | 'default' | 'lg';
  bottomSpacing?: 'none' | 'sm' | 'default' | 'player';
  noPadding?: boolean;
  animate?: boolean;
  id?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  containerClassName = '',
  maxWidth = 'default',
  topSpacing = 'default',
  bottomSpacing = 'player',
  noPadding = false,
  animate = false,
  id,
  ...props
}) => {
  const maxWidthClasses = {
    narrow: 'max-w-5xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  const topSpacingClasses = {
    none: 'pt-0',
    sm: 'pt-2 sm:pt-4',
    default: 'pt-4 sm:pt-6',
    lg: 'pt-6 sm:pt-8 md:pt-10',
  };

  const bottomSpacingClasses = {
    none: 'pb-0',
    sm: 'pb-12',
    default: 'pb-24',
    player: 'pb-32 sm:pb-36',
  };

  const content = (
    <div
      id={id}
      className={cn(
        'w-full min-h-screen bg-black text-white font-sans overflow-x-hidden',
        bottomSpacingClasses[bottomSpacing],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'w-full mx-auto',
          maxWidthClasses[maxWidth],
          topSpacingClasses[topSpacing],
          !noPadding && 'px-4 sm:px-6 md:px-8',
          containerClassName
        )}
      >
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default PageLayout;
