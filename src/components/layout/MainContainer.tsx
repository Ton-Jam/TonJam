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
  size = 'full',
  noPadding = true,
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-full',
    default: 'max-w-full',
    wide: 'max-w-full',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full px-0 overflow-x-hidden',
        sizeClasses[size],
        !noPadding && 'px-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default MainContainer;
