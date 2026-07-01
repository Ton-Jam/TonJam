import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SectionTitle } from '../ui/typography/Typography';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HorizontalSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const HorizontalSection = ({ title, children, className }: HorizontalSectionProps) => {
  return (
    <section className={cn("my-[24px]", className)}>
      <div className="px-4 mb-[12px]">
        <SectionTitle>{title}</SectionTitle>
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
