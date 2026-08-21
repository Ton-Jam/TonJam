import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SectionTitle } from '../ui/typography/Typography';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HorizontalSectionProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const HorizontalSection = ({ title, onViewAll, children, className }: HorizontalSectionProps) => {
  return (
    <section className={cn("my-[24px]", className)}>
      <div className="px-4 mb-[12px] flex items-end justify-between">
        <div className="flex flex-col">
          <SectionTitle>{title}</SectionTitle>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            View All
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 -mx-4 pb-4">
        {React.Children.map(children, (child) => (
          <div className="snap-start flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </section>
  );
};
