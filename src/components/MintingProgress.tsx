import React from 'react';
import { cn } from '@/lib/utils';

interface MintingProgressProps {
  progress: number;
  status: string;
}

export const MintingProgress: React.FC<MintingProgressProps> = ({ progress, status }) => {
  return (
    <div className="w-full space-y-2 mt-4">
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>{status}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
