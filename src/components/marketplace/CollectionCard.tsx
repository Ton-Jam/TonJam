import React from "react";
import { Disc3 } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";

export interface CollectionData {
  id: string;
  name: string;
  creator: string;
  creatorVerified?: boolean;
  verified?: boolean;
  itemCount: number;
  totalNFTs?: number;
  imageUrl: string;
  badge?: string;
  floorPrice?: string;
  volume?: string;
  change?: string;
}

interface CollectionCardProps {
  collection: CollectionData;
  layout?: "grid" | "shelf";
  onView?: (collection: CollectionData) => void;
  onClick?: () => void;
  className?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  layout = "grid",
  onView,
  onClick,
  className,
}) => {
  const totalNFTsCount = collection.totalNFTs ?? collection.itemCount;
  const isVerified = Boolean(collection.creatorVerified ?? collection.verified);

  const hasValidMetric = (val?: string) => {
    if (!val) return false;
    const num = parseFloat(String(val).replace(/[^\d.]/g, ""));
    return Number.isFinite(num) && num > 0;
  };
  const showFloor = hasValidMetric(collection.floorPrice);
  const showVolume = hasValidMetric(collection.volume);

  const handleClick = () => {
    if (onClick) onClick();
    else if (onView) onView(collection);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "flex flex-col justify-between bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-none",
        "rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] hover:border-[rgba(192,192,192,0.35)] p-2.5 sm:p-3",
        "cursor-pointer transition-colors duration-150 select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]",
        layout === "shelf"
          ? "w-[178px] sm:w-[214px] shrink-0 snap-start"
          : "w-full min-w-0",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[8px] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)] group">
          <ProgressiveImage
            src={collection.imageUrl || getPlaceholderImage(`col-${collection.id}`)}
            fallbackSrc={getPlaceholderImage(`col-${collection.id}`)}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] text-[9px] font-semibold tracking-wider uppercase bg-[#07182B]/85 text-[var(--tj-color-brand-primary,#229ED9)]">
            <Disc3 className="w-3 h-3" />
            <span>Collection</span>
          </div>

          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[8px] text-[10px] font-mono font-semibold tabular-nums bg-[#07182B]/85 text-[var(--tj-color-text-primary,#F8FAFC)]">
            {totalNFTsCount} {totalNFTsCount === 1 ? "NFT" : "NFTs"}
          </div>
        </div>

        <div className="mt-2.5 space-y-0.5 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate leading-tight">
            {collection.name}
          </h3>
          <VerifiedArtistLabel artist={collection.creator} verified={isVerified} />
        </div>
      </div>

      {/* Metrics & Action — hide floor/volume when unavailable */}
      <div className="mt-2.5 pt-2 space-y-2">
        {(showFloor || showVolume) && (
          <div className="flex items-center justify-between gap-2 text-[11px]">
            {showFloor && (
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] block">
                  Floor Price
                </span>
                <span className="font-mono font-semibold tabular-nums text-[var(--tj-color-brand-primary,#229ED9)] truncate block">
                  {collection.floorPrice}
                </span>
              </div>
            )}
            {showVolume && (
              <div className="min-w-0 text-right ml-auto">
                <span className="text-[10px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] block">
                  Total Volume
                </span>
                <span className="font-mono font-semibold tabular-nums text-[var(--tj-color-text-primary,#F8FAFC)] truncate block">
                  {collection.volume}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono tabular-nums text-[var(--tj-color-text-secondary,#A8B7CC)]">
            {totalNFTsCount} {totalNFTsCount === 1 ? "item" : "items"}
          </span>
          <span className="font-semibold text-[var(--tj-color-brand-primary,#229ED9)] hover:text-[var(--tj-color-text-primary,#F8FAFC)] transition-colors text-[11px]">
            View Collection &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
