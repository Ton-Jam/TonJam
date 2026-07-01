import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BaseCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn("bg-[#0A113A] rounded-xl p-4 border border-[#20336D]", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
