import React from 'react';
import { TON_LOGO } from '@/constants';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'row' | 'compact';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-neutral-900/60 w-full select-none ${className}`}>
        {/* Animated Shimmer Wave */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-10" />
        
        <div className="relative flex items-center gap-3 p-2.5">
          <div className="relative w-11 h-11 rounded-md bg-neutral-800/80 shrink-0 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 animate-shimmer-fast" />
            <img src={TON_LOGO} alt="TON" className="w-4 h-4 opacity-20 animate-blockchain-glow" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 bg-neutral-800/90 rounded-sm w-3/4 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="h-2.5 bg-neutral-800/60 rounded-sm w-1/2 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-neutral-900/40 w-full select-none ${className}`}>
        {/* Animated Shimmer Wave */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-10" />

        <div className="relative flex items-center gap-3.5 p-2">
          {/* Thumbnail Skeleton */}
          <div className="relative w-12 h-12 rounded-md bg-neutral-800/90 shrink-0 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 animate-shimmer-fast" />
            <img src={TON_LOGO} alt="TON" className="w-4 h-4 opacity-25 animate-blockchain-glow" />
          </div>

          {/* Title & Creator Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 bg-neutral-800/90 rounded-sm w-3/5 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 bg-neutral-800/60 rounded-sm w-1/3 overflow-hidden relative">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-500/30 animate-pulse" />
            </div>
          </div>

          {/* Price & Action Skeleton */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800/70 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
              <img src={TON_LOGO} alt="TON" className="w-3 h-3 opacity-40 shrink-0" />
              <div className="w-10 h-3 bg-neutral-700/80 rounded-sm" />
            </div>
            <div className="w-16 h-7 rounded-full bg-neutral-800/90 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer-fast" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid NFT Card Skeleton
  return (
    <div className={`relative overflow-hidden rounded-lg bg-transparent flex flex-col w-[155px] shrink-0 select-none ${className}`}>
      {/* 1:1 Aspect Ratio Artwork Box with Shimmer */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900/90 shadow-md flex items-center justify-center">
        {/* Multi-layered Shimmering Waves */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-10" />
        <div className="absolute inset-0 animate-shimmer-fast opacity-40 pointer-events-none z-10" />
        
        {/* Central Blockchain Node / Crystal Watermark */}
        <div className="flex flex-col items-center gap-1.5 opacity-30 animate-blockchain-glow z-0">
          <img src={TON_LOGO} alt="TON" className="w-7 h-7 drop-shadow-sm" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400/80 uppercase">ON-CHAIN</span>
        </div>

        {/* Floating Play Action Button Ghost */}
        <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-neutral-800/80 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 animate-shimmer-fast" />
        </div>
      </div>

      {/* Metadata Skeleton */}
      <div className="flex flex-col w-full min-w-0 mt-2.5 space-y-2">
        {/* Title placeholder */}
        <div className="h-3.5 bg-neutral-800/90 rounded-sm w-4/5 overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        
        {/* Creator / Artist placeholder */}
        <div className="h-2.5 bg-neutral-800/60 rounded-sm w-3/5 overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
        </div>

        {/* TON Price placeholder */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <img src={TON_LOGO} className="w-3 h-3 opacity-40 shrink-0" alt="TON" />
          <div className="h-3 bg-neutral-800/80 rounded-sm w-12 overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer-fast" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

