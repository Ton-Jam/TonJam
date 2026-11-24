import React, { useState, useEffect } from "react";
import { Play, Pause, Clock } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";
import { FavouriteButton } from "./FavouriteButton";

export type NFTCardVariant = "buy_now" | "auction" | "sold" | "unlisted";

export interface MusicNFTData {
  id: string;
  trackId?: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  price: string | number;
  imageUrl: string;
  edition?: string;
  remainingEditions?: number;
  totalEditions?: number;
  genre?: string;
  badge?: string;
  audioUrl?: string;
  status?: string;
  listingStatus?: string;
  listingType?: "fixed" | "auction" | "swap" | string;
  auctionEndTime?: string;
  owner?: string;
  collectionName?: string;
  network?: string;
  floorPriceChange?: number;
  royaltySplits?: Array<{ address: string; percentage: number }>;
  variant?: NFTCardVariant;
}

interface MusicNFTCardProps {
  nft: MusicNFTData;
  variant?: NFTCardVariant;
  layout?: "grid" | "shelf";
  isPlaying?: boolean;
  isFavourited?: boolean;
  onToggleFavourite?: (nft: MusicNFTData, nextState: boolean) => void;
  onPlayPreview?: (nft: MusicNFTData) => void;
  onCollect?: (nft: MusicNFTData) => void;
  onQuickBuy?: (nft: MusicNFTData) => void;
  onViewNFT?: (nft: MusicNFTData) => void;
  className?: string;
}

function formatRemainingCountdown(endTime?: string): string | null {
  if (!endTime) return null;
  const endMs = new Date(endTime).getTime();
  if (!Number.isFinite(endMs)) return null;
  const diff = endMs - Date.now();
  if (diff <= 0) return "Ended";
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hrs >= 24) {
    const days = Math.floor(hrs / 24);
    return `${days}d ${hrs % 24}h`;
  }
  return `${hrs}h ${mins}m`;
}

function resolveCardVariant(
  nft: MusicNFTData,
  explicitVariant?: NFTCardVariant
): NFTCardVariant {
  if (explicitVariant) return explicitVariant;
  if (nft.variant) return nft.variant;

  const rawStatus = String(nft.listingStatus || nft.status || "").toLowerCase();
  if (rawStatus === "sold" || rawStatus === "ended") {
    return "sold";
  }
  if (rawStatus === "unlisted" || rawStatus === "not listed") {
    return "unlisted";
  }
  if (nft.listingType === "auction") {
    if (nft.auctionEndTime) {
      const endMs = new Date(nft.auctionEndTime).getTime();
      if (Number.isFinite(endMs) && endMs <= Date.now()) {
        return "sold";
      }
    }
    return "auction";
  }
  if (nft.listingType === "fixed" || nft.listingType === "buy_now") {
    return "buy_now";
  }
  const numericPrice = parseFloat(String(nft.price || "0").replace(/[^\d.]/g, ""));
  if (Number.isFinite(numericPrice) && numericPrice > 0 && nft.listingType !== "none") {
    return "buy_now";
  }
  return "unlisted";
}

export const MusicNFTCard: React.FC<MusicNFTCardProps> = ({
  nft,
  variant,
  layout = "grid",
  isPlaying = false,
  isFavourited = false,
  onToggleFavourite,
  onPlayPreview,
  onCollect,
  onQuickBuy,
  onViewNFT,
  className,
}) => {
  const cardVariant = resolveCardVariant(nft, variant);
  const isAuction = cardVariant === "auction";
  const isBuyNow = cardVariant === "buy_now";
  const isSold = cardVariant === "sold";
  const isUnlisted = cardVariant === "unlisted";

  const [countdownLabel, setCountdownLabel] = useState<string | null>(() =>
    isAuction ? formatRemainingCountdown(nft.auctionEndTime) : null
  );

  useEffect(() => {
    if (!isAuction || !nft.auctionEndTime) {
      setCountdownLabel(null);
      return;
    }
    const update = () => setCountdownLabel(formatRemainingCountdown(nft.auctionEndTime));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [isAuction, nft.auctionEndTime]);

  const handleCardClick = () => {
    if (onViewNFT) onViewNFT(nft);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayPreview) onPlayPreview(nft);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBuyNow) {
      if (onQuickBuy) {
        onQuickBuy(nft);
        return;
      }
      if (onCollect) {
        onCollect(nft);
        return;
      }
    }
    if (onViewNFT) {
      onViewNFT(nft);
    }
  };

  const editionText =
    typeof nft.remainingEditions === "number" &&
    typeof nft.totalEditions === "number" &&
    nft.totalEditions > 0
      ? `${nft.remainingEditions}/${nft.totalEditions} left`
      : nft.edition
      ? `Ed. ${nft.edition}`
      : null;

  const statusText = isSold
    ? "Sold"
    : isUnlisted
    ? "Unlisted"
    : isAuction
    ? "On Auction"
    : "Buy Now";

  const actionLabel = isBuyNow
    ? "Buy Now"
    : isAuction
    ? "Place Bid"
    : "View Details";

  return (
    <div
      role="button"
      tabIndex={0}
      data-card-variant={cardVariant}
      aria-label={`View NFT: ${nft.title} by ${nft.artist}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-none",
        "rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] hover:border-[rgba(192,192,192,0.35)] p-2 sm:p-2.5",
        "transition-colors duration-150 cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]",
        layout === "shelf"
          ? "w-[164px] sm:w-[184px] shrink-0 snap-start"
          : "w-full min-w-0",
        className
      )}
    >
      <div>
        {/* Square 1:1 Artwork */}
        <div className="relative aspect-square w-full rounded-[8px] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)]">
          <ProgressiveImage
            src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
            fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Top Left: Edition Label */}
          {editionText && (
            <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-[8px] text-[9px] font-mono font-semibold uppercase tracking-wider bg-[#07182B]/90 text-[var(--tj-color-text-secondary,#A8B7CC)] pointer-events-none">
              {editionText}
            </span>
          )}

          {/* Top Right: Favorite Button */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <FavouriteButton
              initialFavourited={isFavourited}
              size="sm"
              onToggle={(next) => onToggleFavourite?.(nft, next)}
              className="rounded-[8px]"
            />
          </div>

          {/* Bottom Left: Real Auction Countdown ONLY when applicable */}
          {isAuction && countdownLabel && (
            <div className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#07182B]/90 text-[9px] font-mono font-semibold tabular-nums text-[var(--tj-color-brand-primary,#229ED9)]">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              <span>{countdownLabel}</span>
            </div>
          )}

          {/* Bottom Right: Play Preview Toggle */}
          {nft.audioUrl && onPlayPreview && (
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
              className={cn(
                "absolute bottom-1.5 right-1.5 z-10 w-8 h-8 rounded-[8px] bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#F8FAFC)] flex items-center justify-center cursor-pointer transition-opacity",
                isPlaying ? "opacity-100" : "opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>
          )}
        </div>

        {/* Title, Verified Artist, Collection & Listing State */}
        <div className="mt-2 space-y-0.5 min-w-0">
          <h3 className="text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate leading-snug">
            {nft.title}
          </h3>
          <VerifiedArtistLabel
            artist={nft.artist}
            verified={Boolean(nft.artistVerified)}
          />
          <div className="flex items-center justify-between gap-1.5 pt-0.5 text-[10px] leading-tight min-w-0">
            <span className="text-[var(--tj-color-text-muted,#7F91AA)] truncate">
              {nft.collectionName || nft.genre || "Single"}
            </span>
            <span
              className={cn(
                "font-semibold shrink-0 uppercase tracking-wider text-[9px]",
                isAuction
                  ? "text-[var(--tj-color-state-warning,#FFC857)]"
                  : isBuyNow
                  ? "text-[var(--tj-color-brand-primary,#229ED9)]"
                  : isSold
                  ? "text-[var(--tj-color-state-success,#34D399)]"
                  : "text-[var(--tj-color-text-muted,#7F91AA)]"
              )}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Price & Compact Action */}
      <div className="mt-2 pt-2 flex items-center justify-between gap-1.5 min-w-0">
        {isUnlisted ? (
          <span className="text-[11px] font-medium text-[var(--tj-color-text-muted,#7F91AA)] truncate">
            Not Listed
          </span>
        ) : (
          <TonPriceLabel price={nft.price} label="" size="sm" />
        )}

        <button
          type="button"
          onClick={handleActionClick}
          className={cn(
            "min-h-[32px] px-2.5 py-1 rounded-[8px] text-[10px] font-semibold cursor-pointer transition-colors shrink-0 whitespace-nowrap",
            isBuyNow || isAuction
              ? "bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#F8FAFC)]"
              : "bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-primary,#F8FAFC)]"
          )}
          title={actionLabel}
          aria-label={`${actionLabel}: ${nft.title}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default MusicNFTCard;
