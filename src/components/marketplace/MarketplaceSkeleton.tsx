import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const NFTCardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      role="status"
      aria-label="Loading NFT item"
      className={cn(
        "w-full min-w-0 flex flex-col justify-between",
        "bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] p-2.5 select-none animate-pulse",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111F36)]">
          <div className="absolute top-1.5 left-1.5 w-12 h-4 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
          <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="h-3.5 w-3/4 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)]" />
          <div className="h-3 w-1/2 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[var(--tj-color-border-subtle)] flex items-center justify-between">
        <div className="h-3.5 w-14 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
        <div className="h-6 w-14 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
      </div>
    </div>
  );
};

export const CollectionCardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      role="status"
      aria-label="Loading collection item"
      className={cn(
        "w-full min-w-0 flex flex-col justify-between",
        "bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] p-2.5 select-none animate-pulse",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111F36)]">
          <div className="absolute top-1.5 left-1.5 w-16 h-4 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
          <div className="absolute bottom-1.5 right-1.5 w-12 h-4 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="h-3.5 w-2/3 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)]" />
          <div className="h-3 w-1/2 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[var(--tj-color-border-subtle)] flex items-center justify-between">
        <div className="h-3 w-12 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-chip-background,#102943)]" />
        <div className="h-3 w-16 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80" />
      </div>
    </div>
  );
};

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
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 px-3 sm:px-0",
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
