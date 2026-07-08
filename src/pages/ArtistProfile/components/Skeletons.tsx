import * as React from "react";

export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Banner Skeleton */}
      <div className="w-full h-[240px] bg-neutral-900 rounded-[10px]" />
      
      <div className="px-4 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-20">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-800 border-4 border-black" />
        <div className="flex-1 space-y-3 pt-6 md:pt-0">
          <div className="h-8 bg-neutral-800 rounded-[10px] w-1/3" />
          <div className="h-4 bg-neutral-800 rounded-[10px] w-1/4" />
        </div>
      </div>
      
      {/* Quick Action Skeletons */}
      <div className="px-4 flex flex-wrap gap-3">
        <div className="h-10 bg-neutral-800 rounded-full w-28" />
        <div className="h-10 bg-neutral-800 rounded-full w-28" />
        <div className="h-10 bg-neutral-800 rounded-full w-32" />
      </div>
    </div>
  );
};

export const StatsRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-neutral-950 rounded-[10px] animate-pulse">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="space-y-2 p-3 bg-neutral-900/40 rounded-[10px]">
          <div className="h-4 bg-neutral-800 rounded-[10px] w-1/2" />
          <div className="h-6 bg-neutral-800 rounded-[10px] w-3/4" />
        </div>
      ))}
    </div>
  );
};

export const TrackListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-neutral-900/30 rounded-[10px]">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-4 h-4 bg-neutral-800 rounded" />
            <div className="w-12 h-12 bg-neutral-800 rounded-[10px]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-800 rounded-[10px] w-1/3" />
              <div className="h-3 bg-neutral-800 rounded-[10px] w-1/5" />
            </div>
          </div>
          <div className="w-16 h-4 bg-neutral-800 rounded-[10px]" />
        </div>
      ))}
    </div>
  );
};

export const CardGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-neutral-900/30 rounded-[10px] overflow-hidden p-3 space-y-4">
          <div className="aspect-square bg-neutral-800 rounded-[10px]" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded-[10px] w-3/4" />
            <div className="h-3 bg-neutral-800 rounded-[10px] w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const PostFeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-xl mx-auto animate-pulse">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="bg-neutral-900/30 rounded-[10px] p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 rounded-full" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-neutral-800 rounded-[10px] w-1/4" />
              <div className="h-3 bg-neutral-800 rounded-[10px] w-1/6" />
            </div>
          </div>
          <div className="h-16 bg-neutral-800 rounded-[10px]" />
          <div className="h-[200px] bg-neutral-800 rounded-[10px]" />
        </div>
      ))}
    </div>
  );
};

export const EventListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-neutral-900/30 rounded-[10px] p-4 flex gap-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-[10px]" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-neutral-800 rounded-[10px] w-3/4" />
            <div className="h-4 bg-neutral-800 rounded-[10px] w-1/2" />
            <div className="h-3 bg-neutral-800 rounded-[10px] w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
