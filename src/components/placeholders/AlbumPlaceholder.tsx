import React from 'react';
import { Disc } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const AlbumPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1E1B4B] to-[#311042] text-[#A5B4FC] select-none ${className}`}
    >
      <Disc size={size} className="opacity-60 animate-spin-slow" />
    </div>
  );
};
