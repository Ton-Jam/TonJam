import React from 'react';
import { User } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const UserPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-full text-[#94A3B8] select-none ${className}`}
    >
      <User size={size} className="opacity-70" />
    </div>
  );
};
