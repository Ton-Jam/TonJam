import React from 'react';
import { Sparkles } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const NFTPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#3B0764] to-[#1E1B4B] text-[#D8B4FE] select-none ${className}`}
    >
      <Sparkles size={size} className="opacity-70 animate-pulse" />
    </div>
  );
};
