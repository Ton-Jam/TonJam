import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-3 animate-pulse space-y-3">
    <div className="aspect-square bg-slate-800/40 rounded-[10px]" />
    <div className="space-y-2">
      <div className="h-3 w-3/4 bg-slate-800/40 rounded" />
      <div className="h-2.5 w-1/2 bg-slate-800/40 rounded" />
    </div>
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-2 animate-pulse">
    <div className="w-12 h-12 bg-slate-800/40 rounded-[10px] shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/3 bg-slate-800/40 rounded" />
      <div className="h-2.5 w-1/4 bg-slate-800/40 rounded" />
    </div>
    <div className="w-6 h-6 bg-slate-800/40 rounded-full" />
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] p-4 rounded-[10px] border border-black/5 dark:border-white/5 space-y-2">
        <div className="h-3 w-1/2 bg-slate-800/40 rounded" />
        <div className="h-6 w-3/4 bg-slate-800/40 rounded" />
      </div>
    ))}
  </div>
);
export default CardSkeleton;
