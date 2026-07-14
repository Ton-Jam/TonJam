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

export const RoyaltiesSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse text-left">
    {/* top metrics cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#121833]/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-800/40 rounded-xl" />
            <div className="w-12 h-4 bg-slate-800/40 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-800/40 rounded" />
            <div className="h-6 w-32 bg-slate-800/40 rounded" />
            <div className="h-2 w-full bg-slate-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* visualizer chart placeholder */}
    <div className="bg-[#121833]/20 p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-slate-800/40 rounded" />
          <div className="h-2 w-64 bg-slate-800/40 rounded" />
        </div>
        <div className="w-36 h-8 bg-slate-800/40 rounded-xl" />
      </div>
      <div className="h-[200px] w-full flex items-end justify-between gap-4 pt-4 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex gap-1.5 items-end h-full">
            <div className="flex-1 bg-slate-800/30 rounded-t" style={{ height: `${(i % 3 + 2) * 20}%` }} />
            <div className="flex-1 bg-slate-800/15 rounded-t" style={{ height: `${(i % 2 + 1) * 25}%` }} />
          </div>
        ))}
      </div>
    </div>

    {/* bottom columns */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-[#121833]/20 p-5 rounded-2xl space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-800/40 rounded" />
          <div className="h-2.5 w-full bg-slate-800/40 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
          <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
        </div>
        <div className="h-[120px] bg-slate-900/40 rounded-xl" />
      </div>

      <div className="lg:col-span-3 bg-[#121833]/20 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-800/40 rounded" />
          <div className="h-4 w-16 bg-slate-800/40 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900/40 p-3 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800/40 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-slate-800/40 rounded" />
                  <div className="h-2 w-20 bg-slate-800/40 rounded" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-16 bg-slate-800/40 rounded" />
                <div className="h-2 w-10 bg-slate-800/40 rounded" />
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
    {/* selector switcher */}
    <div className="p-4 rounded-xl bg-[#0e163d]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="h-2.5 w-32 bg-slate-800/40 rounded" />
        <div className="h-3 w-64 bg-slate-800/40 rounded" />
      </div>
      <div className="w-32 h-8 bg-slate-800/40 rounded-lg" />
    </div>

    {/* main profile box */}
    <div className="bg-[#121833]/30 rounded-2xl overflow-hidden">
      <div className="h-44 sm:h-52 w-full bg-slate-900/40" />
      <div className="px-6 pb-6 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800/50 ring-4 ring-[#050A24] shrink-0" />
            <div className="space-y-2 pt-2 sm:pt-0">
              <div className="h-6 w-40 bg-slate-800/40 rounded mx-auto sm:mx-0" />
              <div className="h-3.5 w-24 bg-slate-800/40 rounded mx-auto sm:mx-0" />
              <div className="h-5 w-16 bg-slate-800/40 rounded mx-auto sm:mx-0" />
            </div>
          </div>
          <div className="w-40 h-12 bg-slate-800/40 rounded-xl self-center md:self-end" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
          <div className="lg:col-span-2 space-y-2.5">
            <div className="h-3 w-20 bg-slate-800/40 rounded" />
            <div className="h-3 w-full bg-slate-800/40 rounded" />
            <div className="h-3 w-5/6 bg-slate-800/40 rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-800/40 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-800/40 rounded-lg" />
              <div className="h-6 w-16 bg-slate-800/40 rounded-lg" />
              <div className="h-6 w-16 bg-slate-800/40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* NFTs grid subtitle */}
    <div className="space-y-1.5">
      <div className="h-3 w-32 bg-slate-800/40 rounded" />
      <div className="h-2.5 w-48 bg-slate-800/40 rounded" />
    </div>

    {/* NFTs cards grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white/[0.02] rounded-[10px] p-3 space-y-3">
          <div className="aspect-square bg-slate-800/40 rounded-[10px]" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-slate-800/40 rounded" />
            <div className="h-2.5 w-1/2 bg-slate-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CardSkeleton;

