import React, { useState, useEffect } from "react";
import { ArrowRight, Play, Pause, Clock } from "lucide-react";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { TonPriceLabel } from "./TonPriceLabel";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { cn, getPlaceholderImage } from "@/lib/utils";

interface FeaturedDropBannerProps {
  onExploreDrop?: () => void;
  onPlayPreview?: () => void;
  isPlaying?: boolean;
  className?: string;
  dropInfo?: {
    id?: string;
    title: string;
    artist: string;
    artistVerified?: boolean;
    collectionName?: string;
    price: string;
    edition?: string;
    remainingEditions?: number;
    totalEditions?: number;
    listingType?: "fixed" | "auction" | "swap" | string;
    auctionEndTime?: string;
    genre?: string;
    imageUrl: string;
    hasAudio?: boolean;
  } | null;
}

function formatAuctionCountdown(endTime?: string): string | null {
  if (!endTime) return null;
  const target = new Date(endTime).getTime();
  if (!Number.isFinite(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${mins}m`;
  }
  return `${hours}h ${mins}m ${secs}s`;
}

export const FeaturedDropBanner: React.FC<FeaturedDropBannerProps> = ({
  onExploreDrop,
  onPlayPreview,
  isPlaying = false,
  className,
  dropInfo,
}) => {
  const isAuction = dropInfo?.listingType === "auction";
  const [countdown, setCountdown] = useState<string | null>(() =>
    isAuction ? formatAuctionCountdown(dropInfo?.auctionEndTime) : null
  );

  useEffect(() => {
    if (!isAuction || !dropInfo?.auctionEndTime) {
      setCountdown(null);
      return;
    }
    const update = () => setCountdown(formatAuctionCountdown(dropInfo.auctionEndTime));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [isAuction, dropInfo?.auctionEndTime]);

  if (!dropInfo) return null;

  const kickerParts = [
    "Featured NFT",
    dropInfo.collectionName?.trim() || null,
    dropInfo.genre?.trim() || null,
  ].filter(Boolean) as string[];

  const editionsLabel =
    typeof dropInfo.remainingEditions === "number" &&
    typeof dropInfo.totalEditions === "number" &&
    dropInfo.totalEditions > 0
      ? `${dropInfo.remainingEditions} of ${dropInfo.totalEditions} left`
      : dropInfo.edition
      ? `Edition ${dropInfo.edition}`
      : null;

  return (
    <section
      aria-label="Featured NFT"
      onClick={onExploreDrop}
      className={cn(
        "group relative w-full rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] hover:border-[rgba(192,192,192,0.35)] overflow-hidden bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-none transition-colors duration-200 cursor-pointer",
        className
      )}
    >
      <div className="p-3 sm:p-4 flex items-center gap-3.5 sm:gap-5">
        {/* Square 1:1 Primary Artwork */}
        <div className="relative w-24 h-24 sm:w-36 sm:h-36 shrink-0 rounded-[8px] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)] border-2 border-[rgba(192,192,192,0.22)]">
          <ProgressiveImage
            src={
              dropInfo.imageUrl ||
              getPlaceholderImage(`featured-${dropInfo.id || dropInfo.title}`)
            }
            fallbackSrc={getPlaceholderImage(
              `featured-${dropInfo.id || dropInfo.title}`
            )}
            alt={dropInfo.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {onPlayPreview && dropInfo.hasAudio && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayPreview();
              }}
              aria-label={
                isPlaying ? "Pause featured preview" : "Play featured preview"
              }
              className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-[8px] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#FFFFFF)] flex items-center justify-center cursor-pointer transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
          )}
        </div>

        {/* Details & CTA */}
        <div className="flex-1 min-w-0 space-y-1.5 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium">
            {kickerParts.map((part, idx) => (
              <React.Fragment key={`${part}-${idx}`}>
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="text-[var(--tj-color-text-muted,#7F91AA)]"
                  >
                    ·
                  </span>
                )}
                <span
                  className={cn(
                    "truncate",
                    idx === 0
                      ? "font-semibold text-[var(--tj-color-brand-primary,#00B4D8)]"
                      : "text-[var(--tj-color-text-secondary,#C2C7CD)]"
                  )}
                >
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h2 className="text-sm sm:text-lg font-semibold text-[var(--tj-color-text-primary,#FFFFFF)] tracking-tight truncate">
            {dropInfo.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <VerifiedArtistLabel
              artist={dropInfo.artist}
              verified={Boolean(dropInfo.artistVerified)}
            />
            {editionsLabel && (
              <span className="text-[11px] font-mono tabular-nums text-[var(--tj-color-text-secondary,#C2C7CD)]">
                · {editionsLabel}
              </span>
            )}
            {isAuction && countdown && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[var(--tj-color-surface-elevated,#111C30)] text-[10px] font-mono font-semibold tabular-nums text-[var(--tj-color-state-warning,#FFC857)]">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{countdown}</span>
              </span>
            )}
          </div>

          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2.5">
            <TonPriceLabel
              price={dropInfo.price}
              label={isAuction ? "Current Bid" : "Price"}
              size="md"
            />

            {onExploreDrop && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreDrop();
                }}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#FFFFFF)] font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>View NFT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDropBanner;
