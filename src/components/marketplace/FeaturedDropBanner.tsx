import React from "react";
import { ArrowRight, Play, Pause, Sparkles } from "lucide-react";
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

  return (
    <section
      aria-label="Featured NFT"
      className={cn(
        "relative rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)]",
        className
      )}
    >
      <div className="p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-5">
        {/* Square 1:1 Artwork */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0D1628)] border border-[var(--tj-color-border-subtle)]">
          <ProgressiveImage
            src={dropInfo.imageUrl || getPlaceholderImage(`featured-${dropInfo.id || dropInfo.title}`)}
            fallbackSrc={getPlaceholderImage(`featured-${dropInfo.id || dropInfo.title}`)}
            alt={dropInfo.title}
            className="w-full h-full object-cover"
          />
          {onPlayPreview && dropInfo.hasAudio && (
            <button
              type="button"
              onClick={onPlayPreview}
              aria-label={isPlaying ? "Pause featured preview" : "Play featured preview"}
              className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white flex items-center justify-center border border-white/20 cursor-pointer transition-colors"
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--tj-radius-xs,4px)] text-[10px] font-bold uppercase tracking-wider bg-[var(--tj-color-chip-active-background,#063C55)] text-[var(--tj-color-brand-primary,#00B4D8)] border border-[var(--tj-color-border-interactive,#245078)]">
              <Sparkles className="w-3 h-3" />
              Featured NFT
            </span>
            {dropInfo.genre && (
              <span className="text-[10px] font-semibold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider truncate">
                {dropInfo.genre}
              </span>
            )}
          </div>

          <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
            {dropInfo.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <VerifiedArtistLabel
              artist={dropInfo.artist}
              verified={Boolean(dropInfo.artistVerified)}
            />
            {dropInfo.edition && (
              <span className="text-[11px] font-mono text-[var(--tj-color-text-secondary,#C2C7CD)]">
                · Edition {dropInfo.edition}
              </span>
            )}
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
            <TonPriceLabel price={dropInfo.price} label="" size="sm" />

            {onExploreDrop && (
              <button
                type="button"
                onClick={onExploreDrop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer border border-[var(--tj-color-brand-primary,#00B4D8)]"
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
