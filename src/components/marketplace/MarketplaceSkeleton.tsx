import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Reusable skeleton loader matching MusicNFTCard layout and dimensions.
 * Strictly adheres to design system with zero border lines.
 */
export const NFTCardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      role="status"
      aria-label="Loading NFT item"
      className={cn(
        "w-[260px] sm:w-[280px] shrink-0 snap-start flex flex-col justify-between",
        "bg-[#101A32] rounded-2xl p-3 shadow-lg shadow-black/25 select-none animate-pulse",
        className
      )}
    >
      <div>
        {/* Square Album Artwork Skeleton */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#152440]">
          {/* Badge Skeleton */}
          <div className="absolute top-2 left-2 w-16 h-4 rounded-full bg-[#1D3055]" />
          {/* Favourite Button Skeleton */}
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1D3055]" />
          {/* Audio Preview Indicator Skeleton */}
          <div className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-[#1D3055]" />
        </div>

        {/* Track & Artist Info Skeleton */}
        <div className="mt-3 space-y-2">
          {/* Title */}
          <div className="h-4 w-3/4 rounded-md bg-[#152440]" />
          {/* Artist & Genre */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="h-3 w-1/2 rounded bg-[#152440]/80" />
            <div className="h-2.5 w-12 rounded bg-[#152440]/60" />
          </div>
        </div>
      </div>

      {/* Footer Info & Action Skeleton */}
      <div className="mt-4 pt-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-2.5 w-10 rounded bg-[#152440]/70" />
          <div className="h-4 w-16 rounded bg-[#1D3055]" />
        </div>
        <div className="h-8 w-20 rounded-xl bg-[#1D3055]" />
      </div>
    </div>
  );
};

/**
 * Reusable skeleton loader matching CollectionCard layout and dimensions.
 * Strictly adheres to design system with zero border lines.
 */
export const CollectionCardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      role="status"
      aria-label="Loading collection item"
      className={cn(
        "w-[240px] sm:w-[260px] shrink-0 snap-start flex flex-col justify-between",
        "bg-[#101A32] rounded-2xl p-3 shadow-lg shadow-black/25 select-none animate-pulse",
        className
      )}
    >
      <div>
        {/* Artwork Skeleton */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#152440]">
          {/* Top Badge Skeleton */}
          <div className="absolute top-2 left-2 w-20 h-4 rounded-full bg-[#1D3055]" />
          {/* Dynamic Total NFTs Chip Skeleton */}
          <div className="absolute bottom-2 right-2 w-14 h-4 rounded-md bg-[#1D3055]" />
        </div>

        {/* Collection Name & Creator Skeleton */}
        <div className="mt-3 space-y-2">
          {/* Name */}
          <div className="h-4 w-2/3 rounded-md bg-[#152440]" />
          {/* Creator */}
          <div className="h-3 w-1/2 rounded bg-[#152440]/80" />
          {/* Total NFTs Metric Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="h-2.5 w-14 rounded bg-[#152440]/60" />
            <div className="h-3 w-8 rounded bg-[#1D3055]" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-3 pt-2.5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-2 w-10 rounded bg-[#152440]/60" />
          <div className="h-3.5 w-14 rounded bg-[#1D3055]" />
        </div>
        <div className="h-3 w-12 rounded bg-[#152440]/80" />
      </div>
    </div>
  );
};

/**
 * Helper component to render a horizontal scrolling list of skeletons
 */
interface CarouselSkeletonListProps {
  type: "nft" | "collection";
  count?: number;
  className?: string;
}

export const CarouselSkeletonList: React.FC<CarouselSkeletonListProps> = ({
  type,
  count = 4,
  className,
}) => {
  const items = Array.from({ length: count });

  return (
    <div
      className={cn(
        "overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-4 px-4 sm:px-0 pb-3",
        className
      )}
    >
      {items.map((_, idx) =>
        type === "nft" ? (
          <NFTCardSkeleton key={`nft-skeleton-${idx}`} />
        ) : (
          <CollectionCardSkeleton key={`col-skeleton-${idx}`} />
        )
      )}
    </div>
  );
};
