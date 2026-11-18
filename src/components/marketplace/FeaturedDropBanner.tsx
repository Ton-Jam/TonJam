import React from "react";
import { ArrowRight, Play, Pause } from "lucide-react";
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
    genre?: string;
    imageUrl: string;
    hasAudio?: boolean;
  } | null;
}

export const FeaturedDropBanner: React.FC<FeaturedDropBannerProps> = ({
  onExploreDrop,
  onPlayPreview,
  isPlaying = false,
  className,
  dropInfo,
}) => {
  if (!dropInfo) return null;

  const kickerParts = [
    "Featured NFT",
    dropInfo.collectionName?.trim() || null,
    dropInfo.genre?.trim() || null,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-label="Featured NFT"
      onClick={onExploreDrop}
      className={cn(
        "group relative rounded-[var(--tj-radius-compact,5px)] overflow-hidden bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)]/70 backdrop-blur-md border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] transition-colors duration-200 cursor-pointer",
        className
      )}
    >
      <div className="p-3 sm:p-4 flex items-center gap-3.5 sm:gap-5">
        {/* Square 1:1 Primary Artwork */}
        <div className="relative w-24 h-24 sm:w-36 sm:h-36 shrink-0 rounded-[var(--tj-radius-compact,5px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0D1628)] border border-[var(--tj-color-border-subtle)]">
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
              className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-[var(--tj-radius-compact,5px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#FFFFFF)] flex items-center justify-center border border-[var(--tj-color-border-strong)] cursor-pointer transition-colors"
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

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <VerifiedArtistLabel
              artist={dropInfo.artist}
              verified={Boolean(dropInfo.artistVerified)}
            />
            {dropInfo.edition && (
              <span className="text-[11px] font-mono tabular-nums text-[var(--tj-color-text-secondary,#C2C7CD)]">
                · Edition {dropInfo.edition}
              </span>
            )}
          </div>

          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2.5">
            <TonPriceLabel price={dropInfo.price} label="" size="md" />

            {onExploreDrop && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreDrop();
                }}
                className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--tj-radius-compact,5px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#FFFFFF)] font-semibold text-xs transition-colors cursor-pointer border border-[var(--tj-color-brand-primary,#00B4D8)] whitespace-nowrap"
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
