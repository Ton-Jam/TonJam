import React from "react";

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[340px] rounded-2xl bg-[#0F1C32] animate-pulse border border-[#22374D] p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 shadow-none">
      <div className="flex-1 space-y-4">
        <div className="h-6 w-32 bg-[#22374D]/60 rounded-full" />
        <div className="h-9 w-2/3 bg-[#22374D]/60 rounded-xl" />
        <div className="h-5 w-1/2 bg-[#22374D]/40 rounded-lg" />
        <div className="flex gap-4 pt-4">
          <div className="h-10 w-28 bg-[#22374D]/60 rounded-xl" />
          <div className="h-10 w-28 bg-[#22374D]/60 rounded-xl" />
        </div>
      </div>
      <div className="w-full md:w-72 h-48 md:h-64 bg-[#0A1628] rounded-xl border border-[#22374D]" />
    </div>
  );
};

export const CardGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#0A1628] border border-[#22374D] rounded-2xl p-3 space-y-3 animate-pulse">
          <div className="aspect-square w-full bg-[#07111F] rounded-xl border border-[#22374D]/40" />
          <div className="h-4 w-3/4 bg-[#22374D]/60 rounded" />
          <div className="h-3 w-1/2 bg-[#22374D]/40 rounded" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-12 bg-[#22374D]/60 rounded" />
            <div className="h-4 w-12 bg-[#22374D]/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CarouselSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 overflow-x-hidden w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[240px] max-w-[240px] bg-[#0A1628] border border-[#22374D] rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="aspect-square w-full bg-[#07111F] rounded-xl border border-[#22374D]/40" />
          <div className="h-4 w-3/4 bg-[#22374D]/60 rounded" />
          <div className="h-3 w-1/2 bg-[#22374D]/40 rounded" />
        </div>
      ))}
    </div>
  );
};

export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3.5 bg-[#0A1628] border border-[#22374D] rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-[#22374D] rounded-full" />
            <div className="h-10 w-10 bg-[#22374D] rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-[#22374D]/60 rounded" />
              <div className="h-3 w-16 bg-[#22374D]/40 rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-[#22374D]/60 rounded" />
        </div>
      ))}
    </div>
  );
};
