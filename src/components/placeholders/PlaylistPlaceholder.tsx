import React from 'react';
import { ListMusic } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const PlaylistPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-bl from-[#111827] to-[#1F2937] text-[#9CA3AF] select-none ${className}`}
    >
      <ListMusic size={size} className="opacity-60" />
    </div>
  );
};
