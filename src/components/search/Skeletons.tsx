import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  count?: number;
}

export const TracksSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-track-${i}`}
          className="p-3 rounded-2xl bg-white/[0.03] flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Album cover skeleton */}
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
            
            <div className="space-y-2 flex-1 min-w-0 pr-4">
              {/* Title skeleton */}
              <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
              {/* Artist skeleton */}
              <div className="h-2 bg-white/5 rounded w-1/3 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Stat indicator skeleton */}
            <div className="w-12 h-2.5 bg-white/5 rounded animate-pulse" />
            {/* Option icon skeleton */}
            <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardsSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-card-${i}`}
          className="bg-white/[0.03] rounded-2xl p-3.5 flex flex-col justify-between aspect-[4/5] w-full"
        >
          {/* Image skeleton */}
          <div className="aspect-square rounded-xl bg-white/5 animate-pulse w-full" />
          
          <div className="mt-3.5 space-y-2">
            {/* Title */}
            <div className="h-3 bg-white/5 rounded w-11/12 animate-pulse" />
            {/* Subtitle */}
            <div className="h-2 bg-white/5 rounded w-7/12 animate-pulse" />
            
            {/* Floor price/Status block */}
            <div className="flex justify-between items-center pt-2 mt-2">
              <div className="space-y-1">
                <div className="h-1.5 bg-white/5 rounded w-8 animate-pulse" />
                <div className="h-2.5 bg-white/5 rounded w-12 animate-pulse" />
              </div>
              <div className="h-5 bg-white/5 rounded-full w-12 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ArtistsSkeleton: React.FC<SkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-artist-${i}`}
          className="bg-white/[0.03] rounded-2xl p-4 flex flex-col items-center justify-between space-y-4 text-center w-full"
        >
          {/* Circular avatar skeleton */}
          <div className="h-20 w-20 rounded-full bg-white/5 animate-pulse" />
          
          <div className="space-y-2 w-full flex flex-col items-center">
            {/* Artist name */}
            <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
            {/* Genre */}
            <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse" />
            {/* Metric */}
            <div className="h-1.5 bg-white/5 rounded w-2/3 animate-pulse" />
          </div>

          {/* Follow button skeleton */}
          <div className="h-7 bg-white/5 rounded-full w-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const TrendingSkeleton: React.FC<SkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 no-scrollbar w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-trending-${i}`}
          className="w-[260px] sm:w-[280px] shrink-0 bg-white/[0.03] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 aspect-[16/10]"
        >
          {/* Cover image */}
          <div className="w-16 h-16 rounded-xl bg-white/5 animate-pulse shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Tag/Badge */}
            <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
            {/* Title */}
            <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
            {/* Subtitle */}
            <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const FullDiscoverSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in w-full">
      {/* For you sync cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] h-28 animate-pulse" />
        <div className="p-5 rounded-2xl bg-white/[0.03] h-28 animate-pulse" />
      </div>

      {/* Suggested tracks */}
      <div className="space-y-3.5">
        <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] h-24 animate-pulse" />
          <div className="p-4 rounded-2xl bg-white/[0.03] h-24 animate-pulse" />
        </div>
      </div>

      {/* Trending carousel */}
      <div className="space-y-3.5">
        <div className="h-3 bg-white/5 rounded w-1/5 animate-pulse" />
        <TrendingSkeleton count={3} />
      </div>

      {/* Artists grid */}
      <div className="space-y-3.5">
        <div className="h-3 bg-white/5 rounded w-1/6 animate-pulse" />
        <ArtistsSkeleton count={4} />
      </div>
    </div>
  );
};

export const SearchResultsSkeleton: React.FC<{ activeFilter?: string }> = ({ activeFilter = 'all' }) => {
  const isAll = activeFilter === 'all';
  const isTracksOnly = activeFilter === 'tracks';
  const isArtistsOnly = activeFilter === 'artists';
  const isAlbumsOnly = activeFilter === 'albums';
  const isPlaylistsOnly = activeFilter === 'playlists';
  const isNftsOnly = activeFilter === 'nfts';

  return (
    <div className="space-y-8 animate-fade-in w-full select-none">
      {/* Top Section for All Filter: Top Result + Song Rows */}
      {isAll && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Top Result Skeleton */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="h-3.5 bg-white/5 rounded w-24 animate-pulse" />
            <div className="bg-white/[0.03] rounded-2xl p-5 flex flex-col justify-between min-h-[230px] relative overflow-hidden">
              <div className="w-20 h-20 rounded-xl bg-white/5 animate-pulse" />
              <div className="space-y-2.5 mt-4">
                <div className="h-5 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-[#00B4D8]/10 rounded-full w-14 animate-pulse" />
                  <div className="h-3.5 bg-white/5 rounded w-24 animate-pulse" />
                </div>
              </div>
              <div className="absolute right-5 bottom-5 w-11 h-11 rounded-full bg-[#00B4D8]/10 animate-pulse" />
            </div>
          </div>

          {/* Songs List Skeleton */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="h-3.5 bg-white/5 rounded w-16 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-track-row-${i}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                      <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
                      <div className="h-2.5 bg-white/5 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-8 h-2.5 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tracks Only Filter Skeleton */}
      {isTracksOnly && (
        <div className="space-y-2.5">
          <div className="h-3.5 bg-white/5 rounded w-20 animate-pulse" />
          <TracksSkeleton count={6} />
        </div>
      )}

      {/* Artists Skeleton */}
      {(isAll || isArtistsOnly) && (
        <div className="space-y-2.5">
          <div className="h-3.5 bg-white/5 rounded w-20 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: isArtistsOnly ? 8 : 4 }).map((_, i) => (
              <div
                key={`skeleton-artist-card-${i}`}
                className="bg-white/[0.03] rounded-2xl p-4 flex flex-col items-center space-y-3"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-white/5 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums / Playlists Skeleton */}
      {(isAll || isAlbumsOnly || isPlaylistsOnly) && (
        <div className="space-y-2.5">
          <div className="h-3.5 bg-white/5 rounded w-24 animate-pulse" />
          <CardsSkeleton count={4} />
        </div>
      )}

      {/* NFTs Collectibles Skeleton */}
      {(isAll || isNftsOnly) && (
        <div className="space-y-2.5">
          <div className="h-3.5 bg-white/5 rounded w-36 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-nft-card-${i}`}
                className="bg-white/[0.03] rounded-2xl p-3 sm:p-3.5 space-y-2.5"
              >
                <div className="aspect-square rounded-xl bg-white/5 animate-pulse w-full" />
                <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-[#00B4D8]/10 rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
