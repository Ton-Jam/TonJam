import React from 'react';
import { Music } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const TrackPlaceholder = ({ className = '', size = 24 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] dark:from-[#020617] dark:to-[#0F172A] text-[#94A3B8] select-none ${className}`}
    >
      <Music size={size} className="opacity-60 animate-pulse" />
    </div>
  );
};
