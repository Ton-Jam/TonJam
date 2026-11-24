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
        "bg-[var(--tj-color-surface-default,#0B1424)] rounded-[var(--tj-mkt-radius-sm,9px)] p-2.5 sm:p-3 select-none animate-pulse",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[var(--tj-mkt-radius-compact,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)]">
          <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-chip-background,#102943)]" />
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="h-3.5 w-3/4 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-surface-elevated,#111C30)]" />
          <div className="h-3 w-1/2 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-surface-elevated,#111C30)]/80" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 flex items-center justify-between gap-2">
        <div className="h-3.5 w-14 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-chip-background,#102943)]" />
        <div className="h-7 w-16 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-chip-background,#102943)]" />
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
        "bg-[var(--tj-color-surface-default,#0B1424)] rounded-[var(--tj-mkt-radius-sm,9px)] p-2.5 sm:p-3 select-none animate-pulse",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[var(--tj-mkt-radius-compact,6px)] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)]">
          <div className="absolute bottom-1.5 right-1.5 w-12 h-4 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-chip-background,#102943)]" />
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="h-3.5 w-2/3 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-surface-elevated,#111C30)]" />
          <div className="h-3 w-1/2 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-surface-elevated,#111C30)]/80" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 flex items-center justify-between">
        <div className="h-3 w-12 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-chip-background,#102943)]" />
        <div className="h-3 w-16 rounded-[var(--tj-mkt-radius-compact,6px)] bg-[var(--tj-color-surface-elevated,#111C30)]/80" />
      </div>
    </div>
  );
};

interface CarouselSkeletonListProps {
  type: "nft" | "collection";
  count?: number;
  layout?: "grid" | "shelf";
  className?: string;
}

export const CarouselSkeletonList: React.FC<CarouselSkeletonListProps> = ({
  type,
  count = 4,
  layout = "grid",
  className,
}) => {
  const items = Array.from({ length: count });

  return (
    <div
      className={cn(
        layout === "shelf"
          ? "flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar px-3 sm:px-4"
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 px-3 sm:px-4",
        className
      )}
    >
      {items.map((_, idx) =>
        type === "nft" ? (
          <NFTCardSkeleton
            key={`nft-skeleton-${idx}`}
            className={layout === "shelf" ? "w-[164px] sm:w-[184px] shrink-0" : undefined}
          />
        ) : (
          <CollectionCardSkeleton
            key={`col-skeleton-${idx}`}
            className={layout === "shelf" ? "w-[178px] sm:w-[214px] shrink-0" : undefined}
          />
        )
      )}
    </div>
  );
};
