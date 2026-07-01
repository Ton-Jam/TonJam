import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement> {
  children: React.ReactNode;
}

export const Hero = ({ className, children, ...props }: TypographyProps) => (
  <h1 className={cn("tonjam-hero", className)} {...props}>{children}</h1>
);

export const PageTitle = ({ className, children, ...props }: TypographyProps) => (
  <h1 className={cn("page-title", className)} {...props}>{children}</h1>
);

export const SectionTitle = ({ className, children, ...props }: TypographyProps) => (
  <h2 className={cn("section-title", className)} {...props}>{children}</h2>
);

export const CardTitle = ({ className, children, ...props }: TypographyProps) => (
  <h3 className={cn("card-title", className)} {...props}>{children}</h3>
);

export const Subtitle = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("card-subtitle", className)} {...props}>{children}</p>
);

export const Body = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("text-[14px] leading-normal", className)} {...props}>{children}</p>
);

export const Caption = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("text-[12px] opacity-70", className)} {...props}>{children}</p>
);

export const Label = ({ className, children, ...props }: TypographyProps) => (
  <span className={cn("text-[11px] font-semibold uppercase tracking-wider opacity-80", className)} {...props}>{children}</span>
);

export const Statistic = ({ className, children, ...props }: TypographyProps) => (
  <span className={cn("text-[18px] font-black font-display", className)} {...props}>{children}</span>
);

export const Price = ({ className, children, ...props }: TypographyProps) => (
  <span className={cn("text-[16px] font-bold font-mono", className)} {...props}>{children}</span>
);

export const ButtonText = ({ className, children, ...props }: TypographyProps) => (
  <span className={cn("text-[12px] font-bold uppercase tracking-widest", className)} {...props}>{children}</span>
);

export const MicroLabel = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("micro-label", className)} {...props}>{children}</p>
);
