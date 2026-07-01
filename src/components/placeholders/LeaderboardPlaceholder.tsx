import React from 'react';
import { Trophy } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const LeaderboardPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1E1B4B] to-[#111827] text-[#F59E0B] select-none ${className}`}
    >
      <Trophy size={size} className="opacity-60" />
    </div>
  );
};
