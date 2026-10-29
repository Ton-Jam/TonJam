import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2.5 px-4 py-2 w-full animate-pulse select-none">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="w-full p-3.5 rounded-2xl bg-[#111C30]/70 flex items-start gap-3 border border-white/[0.03]"
        >
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 rounded-full bg-white/[0.06] shrink-0" />

          {/* Body Skeleton */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-white/[0.08] rounded" />
              <div className="h-2.5 w-12 bg-white/[0.05] rounded" />
            </div>
            <div className="h-3 w-3/4 bg-white/[0.06] rounded" />
            <div className="h-2.5 w-1/2 bg-white/[0.04] rounded" />

            {/* Optional preview placeholder on some items */}
            {idx % 2 === 0 && (
              <div className="mt-1 h-12 w-full bg-white/[0.04] rounded-xl" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
