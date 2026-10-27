import React from 'react';

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* HEADER & BALANCE CARD SKELETON */}
      <div className="w-full h-44 rounded-2xl bg-white/[0.04] animate-pulse" />

      {/* FILTERS SKELETON */}
      <div className="flex gap-2 py-1">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="w-24 h-8 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
        ))}
      </div>

      {/* FEATURED TASK SKELETON */}
      <div className="w-full h-36 rounded-2xl bg-white/[0.04] animate-pulse" />

      {/* TASK CARDS SKELETON */}
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="w-full h-20 rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default TaskSkeleton;
