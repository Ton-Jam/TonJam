import React from 'react';

interface SkeletonRowProps {
  count?: number;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({ count = 3 }) => {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full p-4 rounded-2xl bg-[#111C30]/70 animate-pulse flex items-center justify-between gap-3.5 select-none"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-1/3 bg-white/[0.08] rounded" />
              <div className="h-2.5 w-2/3 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="h-6 w-14 bg-white/[0.06] rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonRow;
