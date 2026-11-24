import React from "react";
import { Users, Sparkles } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";

export interface VerifiedArtistData {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  isVerified: boolean;
  followersCount?: number;
  salesCount?: number;
}

interface VerifiedArtistCardProps {
  artist: VerifiedArtistData;
  layout?: "grid" | "shelf";
  onView?: (artist: VerifiedArtistData) => void;
  className?: string;
}

export const VerifiedArtistCard: React.FC<VerifiedArtistCardProps> = ({
  artist,
  layout = "shelf",
  onView,
  className,
}) => {
  const handleClick = () => {
    onView?.(artist);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View Artist: ${artist.name}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "group flex flex-col justify-between bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-none",
        "rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] hover:border-[rgba(192,192,192,0.35)] p-2.5 sm:p-3",
        "cursor-pointer transition-colors duration-150 select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]",
        layout === "shelf"
          ? "w-[164px] sm:w-[184px] shrink-0 snap-start"
          : "w-full min-w-0",
        className
      )}
    >
      <div>
        <div className="relative aspect-square w-full rounded-[8px] overflow-hidden bg-[var(--tj-color-surface-elevated,#111C30)]">
          <ProgressiveImage
            src={artist.avatar || getPlaceholderImage(`artist-${artist.id}`)}
            fallbackSrc={getPlaceholderImage(`artist-${artist.id}`)}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#07182B]/90 text-[9px] font-semibold uppercase tracking-wider text-[var(--tj-color-brand-primary,#229ED9)]">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Verified</span>
          </span>
        </div>

        <div className="mt-2.5 space-y-0.5 min-w-0">
          <VerifiedArtistLabel
            artist={artist.name}
            verified={Boolean(artist.isVerified)}
            className="text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)]"
          />
          {artist.username && (
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
              @{artist.username.replace(/^@/, "")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 flex items-center justify-between gap-2 text-[10px] text-[var(--tj-color-text-secondary,#A8B7CC)]">
        <span className="inline-flex items-center gap-1 font-mono tabular-nums truncate">
          <Users className="w-3 h-3 text-[var(--tj-color-brand-primary,#229ED9)] shrink-0" />
          <span>{(artist.followersCount || 0).toLocaleString()}</span>
        </span>
        <span className="font-semibold text-[var(--tj-color-brand-primary,#229ED9)] shrink-0">
          Profile &rarr;
        </span>
      </div>
    </div>
  );
};

export default VerifiedArtistCard;
