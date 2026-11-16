import React, { useState, useEffect } from "react";
import { Play, Pause, Clock } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";
import { FavouriteButton } from "./FavouriteButton";

export interface MusicNFTData {
  id: string;
  trackId?: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  price: string | number;
  imageUrl: string;
  edition?: string;
  genre?: string;
  badge?: string;
  audioUrl?: string;
  status?: string;
  listingType?: "fixed" | "auction" | "swap" | string;
  auctionEndTime?: string;
  owner?: string;
  collectionName?: string;
  floorPriceChange?: number;
  royaltySplits?: Array<{ address: string; percentage: number }>;
}

interface MusicNFTCardProps {
  nft: MusicNFTData;
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

export const MusicNFTCard: React.FC<MusicNFTCardProps> = ({
  nft,
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
  const isAuction = nft.listingType === "auction";
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
    if (onViewNFT) {
      onViewNFT(nft);
    } else if (onQuickBuy) {
      onQuickBuy(nft);
    } else if (onCollect) {
      onCollect(nft);
    }
  };

  const editionText = nft.edition ? `Ed. ${nft.edition}` : "1/1";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View NFT: ${nft.title} by ${nft.artist}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-md",
        "border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] rounded-[var(--tj-radius-md,8px)] p-2.5",
        "transition-colors duration-150 cursor-pointer select-none text-left",
        layout === "shelf"
          ? "w-[154px] sm:w-[172px] shrink-0 snap-start"
          : "w-full min-w-0",
        className
      )}
    >
      <div>
        {/* Square 1:1 Artwork */}
        <div className="relative aspect-square w-full rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0D1628)] border border-[var(--tj-color-border-subtle)]">
          <ProgressiveImage
            src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
            fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Top Left: Edition Badge */}
          <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-[var(--tj-radius-xs,4px)] text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--tj-color-surface-overlay,#07182BCC)] text-[var(--tj-color-text-secondary,#C2C7CD)] border border-[var(--tj-color-border-subtle)] pointer-events-none">
            {editionText}
          </span>

          {/* Top Right: Favorite Button */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <FavouriteButton
              initialFavourited={isFavourited}
              size="sm"
              onToggle={(next) => onToggleFavourite?.(nft, next)}
              className="rounded-[var(--tj-radius-xs,4px)] border border-[var(--tj-color-border-subtle)]"
            />
          </div>

          {/* Bottom Left: Real Auction Countdown ONLY when applicable */}
          {isAuction && countdownLabel && (
            <div className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)] text-[9px] font-mono font-bold text-[var(--tj-color-brand-primary,#00B4D8)]">
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
                "absolute bottom-1.5 right-1.5 z-10 w-7 h-7 rounded-[var(--tj-radius-xs,4px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white flex items-center justify-center border border-white/20 cursor-pointer transition-opacity",
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

        {/* Title & Verified Artist */}
        <div className="mt-2 space-y-0.5 min-w-0">
          <h3 className="text-xs font-bold text-[var(--tj-color-text-primary,#FFFFFF)] truncate leading-snug">
            {nft.title}
          </h3>
          <VerifiedArtistLabel
            artist={nft.artist}
            verified={Boolean(nft.artistVerified)}
          />
        </div>
      </div>

      {/* Price & Compact View Details Action */}
      <div className="mt-2.5 pt-2 border-t border-[var(--tj-color-border-subtle)] flex items-center justify-between gap-1.5 min-w-0">
        <TonPriceLabel price={nft.price} label="" size="sm" />

        <button
          type="button"
          onClick={handleActionClick}
          className="px-2 py-1 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-brand-primary,#00B4D8)] text-[var(--tj-color-text-primary,#FFFFFF)] text-[10px] font-bold uppercase tracking-wider border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-brand-primary,#00B4D8)] cursor-pointer transition-colors shrink-0"
          title="View NFT details"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default MusicNFTCard;
