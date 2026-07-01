import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  count?: number;
}

export const TracksSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-track-${i}`}
          className="p-3 rounded-xl bg-[#090f2d] flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Album cover skeleton */}
            <div className="w-10 h-10 rounded-xl bg-[#132354] animate-pulse shrink-0" />
            
            <div className="space-y-2 flex-1 min-w-0 pr-4">
              {/* Title skeleton */}
              <div className="h-3 bg-[#132354] rounded w-2/3 animate-pulse" />
              {/* Artist skeleton */}
              <div className="h-2 bg-[#132354] rounded w-1/3 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Stat indicator skeleton */}
            <div className="w-12 h-2.5 bg-[#132354] rounded animate-pulse" />
            {/* Option icon skeleton */}
            <div className="w-5 h-5 rounded-full bg-[#132354] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardsSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-card-${i}`}
          className="bg-[#090f2d] rounded-xl p-4 flex flex-col justify-between aspect-[4/5] w-full"
        >
          {/* Image skeleton */}
          <div className="aspect-square rounded-xl bg-[#132354] animate-pulse w-full" />
          
          <div className="mt-4 space-y-2.5">
            {/* Title */}
            <div className="h-3 bg-[#132354] rounded w-11/12 animate-pulse" />
            {/* Subtitle */}
            <div className="h-2 bg-[#132354] rounded w-7/12 animate-pulse" />
            
            {/* Floor price/Status block */}
            <div className="flex justify-between items-center pt-2 mt-2">
              <div className="space-y-1">
                <div className="h-1.5 bg-[#132354] rounded w-8 animate-pulse" />
                <div className="h-2.5 bg-[#132354] rounded w-12 animate-pulse" />
              </div>
              <div className="h-5 bg-[#132354] rounded-lg w-12 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ArtistsSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-artist-${i}`}
          className="bg-[#090f2d] rounded-xl p-4 flex flex-col items-center justify-between space-y-4 text-center w-full"
        >
          {/* Circular avatar skeleton */}
          <div className="h-20 w-20 rounded-full bg-[#132354] animate-pulse" />
          
          <div className="space-y-2 w-full flex flex-col items-center">
            {/* Artist name */}
            <div className="h-3 bg-[#132354] rounded w-3/4 animate-pulse" />
            {/* Genre */}
            <div className="h-2 bg-[#132354] rounded w-1/2 animate-pulse" />
            {/* Metric */}
            <div className="h-1.5 bg-[#132354] rounded w-2/3 animate-pulse" />
          </div>

          {/* Follow button skeleton */}
          <div className="h-8 bg-[#132354] rounded-lg w-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const TrendingSkeleton: React.FC<SkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-trending-${i}`}
          className="w-[280px] shrink-0 bg-[#090f2d] rounded-xl p-4 flex items-start gap-3 aspect-[16/10]"
        >
          {/* Cover image */}
          <div className="w-16 h-16 rounded-xl bg-[#132354] animate-pulse shrink-0" />

          <div className="flex-1 space-y-2.5">
            {/* Tag/Badge */}
            <div className="h-3 bg-[#132354] rounded w-1/3 animate-pulse" />
            {/* Title */}
            <div className="h-3 bg-[#132354] rounded w-3/4 animate-pulse" />
            {/* Subtitle */}
            <div className="h-2 bg-[#132354] rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const FullDiscoverSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in w-full">
      {/* For you sync cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[#090f2d] h-28 animate-pulse" />
        <div className="p-5 rounded-xl bg-[#090f2d] h-28 animate-pulse" />
      </div>

      {/* Suggested neural stream tracks */}
      <div className="space-y-4">
        <div className="h-3 bg-[#132354] rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#090f2d] h-24 animate-pulse" />
          <div className="p-4 rounded-xl bg-[#090f2d] h-24 animate-pulse" />
        </div>
      </div>

      {/* Trending carousel */}
      <div className="space-y-4">
        <div className="h-3 bg-[#132354] rounded w-1/5 animate-pulse" />
        <TrendingSkeleton count={3} />
      </div>

      {/* Artists grid */}
      <div className="space-y-4">
        <div className="h-3 bg-[#132354] rounded w-1/6 animate-pulse" />
        <ArtistsSkeleton count={4} />
      </div>
    </div>
  );
};
