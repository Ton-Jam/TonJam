import React from "react";

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[380px] rounded-[3px] bg-[#0A0A0A] animate-pulse border border-white/12 p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-6 shadow-none">
      <div className="flex-1 space-y-4">
        <div className="h-4 w-28 bg-white/5 rounded-[3px]" />
        <div className="h-10 w-2/3 bg-white/5 rounded-[3px]" />
        <div className="h-6 w-1/2 bg-white/5 rounded-[3px]" />
        <div className="flex gap-4 pt-4">
          <div className="h-10 w-24 bg-white/5 rounded-[3px]" />
          <div className="h-10 w-24 bg-white/5 rounded-[3px]" />
        </div>
      </div>
      <div className="w-full md:w-80 h-48 md:h-64 bg-[#101010] rounded-[3px] border border-white/10" />
    </div>
  );
};

export const CardGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#0A0A0A] border border-white/12 rounded-[3px] p-3 space-y-3 animate-pulse shadow-none">
          <div className="aspect-square w-full bg-[#101010] rounded-[3px] border border-white/10" />
          <div className="h-4 w-3/4 bg-white/5 rounded-[3px]" />
          <div className="h-3 w-1/2 bg-white/5 rounded-[3px]" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-12 bg-white/5 rounded-[3px]" />
            <div className="h-4 w-12 bg-white/5 rounded-[3px]" />
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
        <div key={i} className="min-w-[240px] max-w-[240px] bg-[#0A0A0A] border border-white/12 rounded-[3px] p-4 space-y-3 animate-pulse shadow-none">
          <div className="aspect-square w-full bg-[#101010] rounded-[3px] border border-white/10" />
          <div className="h-4 w-3/4 bg-white/5 rounded-[3px]" />
          <div className="h-3 w-1/2 bg-white/5 rounded-[3px]" />
        </div>
      ))}
    </div>
  );
};

export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-white/12 rounded-[3px] animate-pulse shadow-none">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-white/10 rounded-full" />
            <div className="h-10 w-10 bg-white/10 rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-white/5 rounded-[3px]" />
              <div className="h-3 w-16 bg-white/5 rounded-[3px]" />
            </div>
          </div>
          <div className="h-4 w-16 bg-white/5 rounded-[3px]" />
        </div>
      ))}
    </div>
  );
};
