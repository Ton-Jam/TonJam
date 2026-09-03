import React from 'react';
import { cn } from '@/lib/utils';

export interface MainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide' | 'full';
  noPadding?: boolean;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  children,
  className = '',
  size = 'default',
  noPadding = false,
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-5xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto overflow-x-hidden',
        sizeClasses[size],
        !noPadding && 'px-4 sm:px-6 md:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default MainContainer;
