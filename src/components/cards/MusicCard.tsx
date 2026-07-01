import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MusicCardProps extends HTMLMotionProps<"div"> {
  title: string;
  artist: string;
  coverUrl: string;
}

export const MusicCard = React.forwardRef<HTMLDivElement, MusicCardProps>(
  ({ title, artist, coverUrl, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("flex flex-col p-3 rounded-xl bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] h-[250px] shrink-0 snap-start", className)}
        {...props}
      >
        <div className="relative w-full h-[180px] rounded-lg overflow-hidden mb-3">
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <h4 className="text-[14px] font-semibold text-white truncate">{title}</h4>
        <p className="text-[12px] text-[#9AA0AE] truncate">{artist}</p>
      </motion.div>
    );
  }
);

MusicCard.displayName = 'MusicCard';
