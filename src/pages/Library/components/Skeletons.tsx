import React from 'react';

/**
 * Modern, borderless TonJam skeleton loaders for the Library screen.
 * Styled with TonJam deep-navy design tokens (#080D1A, #111C30, #1A2844)
 * and zero border lines.
 */

export const CardSkeleton: React.FC = () => (
  <div className="bg-[#111C30] rounded-2xl p-3.5 space-y-3 animate-pulse shadow-md">
    <div className="aspect-square bg-[#1A2844] rounded-xl" />
    <div className="space-y-2 pt-1">
      <div className="h-3.5 w-3/4 bg-[#1A2844] rounded-md" />
      <div className="h-2.5 w-1/2 bg-[#162238] rounded-md" />
    </div>
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-2.5 px-3 rounded-xl bg-white/[0.02] animate-pulse">
    <div className="w-12 h-12 bg-[#1A2844] rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-1/3 bg-[#1A2844] rounded-md" />
      <div className="h-2.5 w-1/4 bg-[#162238] rounded-md" />
    </div>
    <div className="w-7 h-7 bg-[#1A2844] rounded-full shrink-0" />
  </div>
);

export const TrackRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] animate-pulse">
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      <div className="w-11 h-11 bg-[#1A2844] rounded-xl shrink-0" />
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="h-3.5 w-2/5 bg-[#1A2844] rounded-md" />
        <div className="h-2.5 w-1/4 bg-[#162238] rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <div className="h-3 w-10 bg-[#162238] rounded-md hidden sm:block" />
      <div className="w-7 h-7 bg-[#1A2844] rounded-full" />
    </div>
  </div>
);

export const QuickActionsSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    <div className="flex items-center justify-between px-1">
      <div className="h-3 w-32 bg-[#1A2844] rounded-md" />
    </div>
    <div className="flex flex-col space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] bg-white/[0.03] shadow-sm"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-[10px] bg-[#1A2844] shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 w-32 bg-[#1A2844] rounded-md" />
              <div className="h-2.5 w-20 bg-[#162238] rounded-md" />
            </div>
          </div>
          <div className="w-4 h-4 bg-[#1A2844] rounded-full shrink-0 ml-3" />
        </div>
      ))}
    </div>
  </div>
);

export const ContinueListeningSkeleton: React.FC = () => (
  <div className="space-y-3.5 animate-pulse">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#1A2844]" />
        <div className="h-4 w-36 bg-[#1A2844] rounded-md" />
      </div>
      <div className="h-3 w-16 bg-[#162238] rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#111C30] shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-[#1A2844] shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3.5 w-3/4 bg-[#1A2844] rounded-md" />
            <div className="h-2.5 w-1/2 bg-[#162238] rounded-md" />
            <div className="h-1.5 w-full bg-[#162238] rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-[#229ED9]/30 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-[#111C30] p-4 rounded-2xl space-y-2 shadow-sm">
        <div className="h-3 w-1/2 bg-[#1A2844] rounded-md" />
        <div className="h-6 w-3/4 bg-[#162238] rounded-md" />
      </div>
    ))}
  </div>
);

export const RoyaltiesSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse text-left">
    {/* Top metrics cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#111C30] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-[#1A2844] rounded-xl" />
            <div className="w-12 h-4 bg-[#162238] rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[#1A2844] rounded" />
            <div className="h-6 w-32 bg-[#162238] rounded" />
            <div className="h-2 w-full bg-[#162238] rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* Visualizer chart placeholder */}
    <div className="bg-[#111C30] p-6 rounded-2xl space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-[#1A2844] rounded" />
          <div className="h-2 w-64 bg-[#162238] rounded" />
        </div>
        <div className="w-36 h-8 bg-[#1A2844] rounded-xl" />
      </div>
      <div className="h-[200px] w-full flex items-end justify-between gap-4 pt-4 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex gap-1.5 items-end h-full">
            <div className="flex-1 bg-[#1A2844] rounded-t" style={{ height: `${((i % 3) + 2) * 20}%` }} />
            <div className="flex-1 bg-[#162238] rounded-t" style={{ height: `${((i % 2) + 1) * 25}%` }} />
          </div>
        ))}
      </div>
    </div>

    {/* Bottom columns */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-[#111C30] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#1A2844] rounded" />
          <div className="h-2.5 w-full bg-[#162238] rounded" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full bg-[#1A2844] rounded-xl" />
          <div className="h-10 w-full bg-[#1A2844] rounded-xl" />
        </div>
        <div className="h-[120px] bg-[#0B1424] rounded-xl" />
      </div>

      <div className="lg:col-span-3 bg-[#111C30] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-[#1A2844] rounded" />
          <div className="h-4 w-16 bg-[#162238] rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0B1424] p-3 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1A2844] rounded-lg" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-[#1A2844] rounded" />
                  <div className="h-2 w-20 bg-[#162238] rounded" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-16 bg-[#1A2844] rounded" />
                <div className="h-2 w-10 bg-[#162238] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ArtistProfileSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse text-left">
    {/* Selector switcher */}
    <div className="p-4 rounded-2xl bg-[#111C30] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="space-y-1.5">
        <div className="h-2.5 w-32 bg-[#1A2844] rounded" />
        <div className="h-3 w-64 bg-[#162238] rounded" />
      </div>
      <div className="w-32 h-8 bg-[#1A2844] rounded-xl" />
    </div>

    {/* Main profile box */}
    <div className="bg-[#111C30] rounded-2xl overflow-hidden shadow-sm">
      <div className="h-44 sm:h-52 w-full bg-[#0B1424]" />
      <div className="px-6 pb-6 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#1A2844] ring-4 ring-[#080D1A] shrink-0 shadow-lg" />
            <div className="space-y-2 pt-2 sm:pt-0">
              <div className="h-6 w-40 bg-[#1A2844] rounded mx-auto sm:mx-0" />
              <div className="h-3.5 w-24 bg-[#162238] rounded mx-auto sm:mx-0" />
              <div className="h-5 w-16 bg-[#162238] rounded mx-auto sm:mx-0" />
            </div>
          </div>
          <div className="w-40 h-12 bg-[#1A2844] rounded-xl self-center md:self-end" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-6">
          <div className="lg:col-span-2 space-y-2.5">
            <div className="h-3 w-20 bg-[#1A2844] rounded" />
            <div className="h-3 w-full bg-[#162238] rounded" />
            <div className="h-3 w-5/6 bg-[#162238] rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-[#1A2844] rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[#1A2844] rounded-lg" />
              <div className="h-6 w-16 bg-[#1A2844] rounded-lg" />
              <div className="h-6 w-16 bg-[#1A2844] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* NFTs grid subtitle */}
    <div className="space-y-1.5">
      <div className="h-3 w-32 bg-[#1A2844] rounded" />
      <div className="h-2.5 w-48 bg-[#162238] rounded" />
    </div>

    {/* NFTs cards grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Full-featured Library screen dynamic skeleton loader matching the TonJam layout
 */
export const LibraryScreenSkeleton: React.FC<{ activeChip?: string }> = ({ activeChip = 'All' }) => {
  // Grid-focused view (Playlists, Albums, NFT Music)
  if (activeChip === 'Playlists' || activeChip === 'Albums' || activeChip === 'NFT Music' || activeChip === 'Collections') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1A2844]" />
            <div className="h-4 w-40 bg-[#1A2844] rounded-md" />
          </div>
          <div className="h-7 w-24 bg-[#1A2844] rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Row-focused view (Tracks, Downloads, History, Recently Played)
  if (
    activeChip === 'Tracks' ||
    activeChip === 'Downloads' ||
    activeChip === 'Recently Played' ||
    activeChip === 'History' ||
    activeChip === 'Liked'
  ) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1A2844]" />
            <div className="h-4 w-36 bg-[#1A2844] rounded-md" />
          </div>
          <div className="h-3 w-16 bg-[#162238] rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrackRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Default: Comprehensive 'All' Library Screen Skeleton
  return (
    <div className="space-y-10 animate-pulse">
      {/* 1. Continue Listening */}
      <ContinueListeningSkeleton />

      {/* 2. Liked Songs / Track Highlights */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1A2844]" />
            <div className="h-4 w-32 bg-[#1A2844] rounded-md" />
          </div>
          <div className="h-3 w-16 bg-[#162238] rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <TrackRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 3. Playlists & Collections Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1A2844]" />
            <div className="h-4 w-28 bg-[#1A2844] rounded-md" />
          </div>
          <div className="h-3 w-16 bg-[#162238] rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
