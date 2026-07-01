import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const TonJamButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-widest transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          variant === 'primary' && "bg-[#3B82F6] text-white hover:bg-[#2563EB]",
          variant === 'secondary' && "bg-[#0A113A] text-white hover:bg-[#1E293B] border border-[#3A3D4A]",
          variant === 'ghost' && "bg-transparent text-white hover:bg-white/5",
          variant === 'outline' && "bg-transparent text-white border border-[#3A3D4A] hover:bg-white/5",
          size === 'sm' && "h-8 px-4 text-[10px]",
          size === 'md' && "h-11 px-6 text-[12px]",
          size === 'lg' && "h-14 px-8 text-[14px]",
          className
        )}
        {...props}
      />
    );
  }
);

TonJamButton.displayName = 'TonJamButton';
