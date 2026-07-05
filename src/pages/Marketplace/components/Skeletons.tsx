import React from "react";
import { motion } from "motion/react";

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[380px] rounded-[10px] bg-zinc-900/60 animate-pulse border border-zinc-800/40 p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex-1 space-y-4">
        <div className="h-4 w-28 bg-zinc-800 rounded-[4px]" />
        <div className="h-10 w-2/3 bg-zinc-800 rounded-[4px]" />
        <div className="h-6 w-1/2 bg-zinc-800 rounded-[4px]" />
        <div className="flex gap-4 pt-4">
          <div className="h-10 w-24 bg-zinc-800 rounded-[4px]" />
          <div className="h-10 w-24 bg-zinc-800 rounded-[4px]" />
        </div>
      </div>
      <div className="w-full md:w-80 h-48 md:h-64 bg-zinc-800 rounded-[10px]" />
    </div>
  );
};

export const CardGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-zinc-900/60 border border-zinc-800/40 rounded-[10px] p-3 space-y-3 animate-pulse">
          <div className="aspect-square w-full bg-zinc-800 rounded-[10px]" />
          <div className="h-4 w-3/4 bg-zinc-800 rounded-[4px]" />
          <div className="h-3 w-1/2 bg-zinc-800 rounded-[4px]" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-12 bg-zinc-800 rounded-[4px]" />
            <div className="h-4 w-12 bg-zinc-800 rounded-[4px]" />
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
        <div key={i} className="min-w-[240px] max-w-[240px] bg-zinc-900/60 border border-zinc-800/40 rounded-[10px] p-4 space-y-3 animate-pulse">
          <div className="aspect-square w-full bg-zinc-800 rounded-[10px]" />
          <div className="h-4 w-3/4 bg-zinc-800 rounded-[4px]" />
          <div className="h-3 w-1/2 bg-zinc-800 rounded-[4px]" />
        </div>
      ))}
    </div>
  );
};

export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-[10px] animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-zinc-800 rounded-full" />
            <div className="h-10 w-10 bg-zinc-800 rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-zinc-800 rounded-[4px]" />
              <div className="h-3 w-16 bg-zinc-800 rounded-[4px]" />
            </div>
          </div>
          <div className="h-4 w-16 bg-zinc-800 rounded-[4px]" />
        </div>
      ))}
    </div>
  );
};
