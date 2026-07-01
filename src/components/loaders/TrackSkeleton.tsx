import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TrackSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center p-3 rounded-xl bg-[#0A113A] w-full animate-pulse", className)}>
      <div className="w-12 h-12 rounded-lg bg-[#1E293B] shrink-0" />
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-[#1E293B]" />
        <div className="h-3 w-1/2 rounded bg-[#1E293B]" />
      </div>
      <div className="w-10 h-4 rounded bg-[#1E293B]" />
    </div>
  );
};
