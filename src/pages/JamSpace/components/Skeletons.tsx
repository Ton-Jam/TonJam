import React from 'react';

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 border border-white/[0.03] rounded-[10px] p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="h-8 bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-6 bg-slate-800 rounded w-12" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.05]">
        <div>
          <div className="h-3 bg-slate-800 rounded w-1/2 mb-1" />
          <div className="h-5 bg-slate-800 rounded w-1/3" />
        </div>
        <div>
          <div className="h-3 bg-slate-800 rounded w-1/2 mb-1" />
          <div className="h-5 bg-slate-800 rounded w-1/3" />
        </div>
        <div>
          <div className="h-3 bg-slate-800 rounded w-1/2 mb-1" />
          <div className="h-5 bg-slate-800 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

export const LiveSpaceCardSkeleton: React.FC = () => {
  return (
    <div className="w-[280px] shrink-0 bg-slate-900 border border-white/[0.03] rounded-[10px] p-4 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-16" />
        <div className="h-4 bg-slate-800 rounded-full w-8" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900" />
          <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900" />
          <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900" />
        </div>
        <div className="h-7 bg-slate-800 rounded w-16" />
      </div>
    </div>
  );
};

export const LiveSpacesSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-slate-800 rounded w-32" />
      <div className="flex gap-4 overflow-x-hidden">
        <LiveSpaceCardSkeleton />
        <LiveSpaceCardSkeleton />
        <LiveSpaceCardSkeleton />
      </div>
    </div>
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="h-3 bg-slate-800 rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-5/6" />
        <div className="h-4 bg-slate-800 rounded w-2/3" />
      </div>
      <div className="h-28 bg-slate-800 rounded-lg w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-slate-800 rounded w-12" />
        <div className="h-4 bg-slate-800 rounded w-12" />
        <div className="h-4 bg-slate-800 rounded w-12" />
        <div className="h-4 bg-slate-800 rounded w-12" />
      </div>
    </div>
  );
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
};

export const EventSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-3 flex gap-3 animate-pulse">
      <div className="w-16 h-16 bg-slate-800 rounded-[10px]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-800 rounded w-16" />
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
      </div>
    </div>
  );
};

export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-800 rounded" />
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="space-y-1">
              <div className="h-3 bg-slate-800 rounded w-24" />
              <div className="h-2 bg-slate-800 rounded w-16" />
            </div>
          </div>
          <div className="h-4 bg-slate-800 rounded w-12" />
        </div>
      ))}
    </div>
  );
};
