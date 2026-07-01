import React from 'react';
import { Mic } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const ArtistPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-full text-[#38BDF8] select-none ${className}`}
    >
      <Mic size={size} className="opacity-70" />
    </div>
  );
};
