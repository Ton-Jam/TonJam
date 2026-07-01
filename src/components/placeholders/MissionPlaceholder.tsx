import React from 'react';
import { Target } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const MissionPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1E293B] to-[#B45309] text-[#FBBF24] select-none ${className}`}
    >
      <Target size={size} className="opacity-60" />
    </div>
  );
};
