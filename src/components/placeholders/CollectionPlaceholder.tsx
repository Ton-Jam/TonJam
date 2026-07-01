import React from 'react';
import { Layers } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const CollectionPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#020617] to-[#1E1B4B] text-[#818CF8] select-none ${className}`}
    >
      <Layers size={size} className="opacity-60" />
    </div>
  );
};
