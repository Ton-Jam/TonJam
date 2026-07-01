import React from 'react';
import { Wallet } from 'lucide-react';

interface PlaceholderProps {
  className?: string;
  size?: number;
}

export const WalletPlaceholder = ({ className = '', size = 32 }: PlaceholderProps) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#0F172A] to-[#047857] text-[#34D399] select-none ${className}`}
    >
      <Wallet size={size} className="opacity-60" />
    </div>
  );
};
