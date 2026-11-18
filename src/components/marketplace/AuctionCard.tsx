import React, { useState, useEffect } from "react";
import { Clock, Gavel } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";
import { AuctionStatus } from "@/pages/Marketplace/types";

export interface AuctionData {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  highestBid: string | number;
  minimumNextBid?: string | number;
  bidsCount: number;
  endTime: string;
  startsAt?: string;
  status: AuctionStatus;
  imageUrl: string;
  genre?: string;
  recentBids?: Array<{ id: string; bidder: string; amount: string }>;
}

interface AuctionCardProps {
  auction: AuctionData;
  layout?: "grid" | "shelf";
  onPlaceBid?: (auction: AuctionData) => void;
  onView?: (auction: AuctionData) => void;
  className?: string;
}

const STATUS_BADGE: Record<
  AuctionStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: "Active",
    dotClass: "bg-[var(--tj-color-state-success,#34D399)]",
    badgeClass:
      "bg-[var(--tj-color-state-success-bg,#103B32)] text-[var(--tj-color-state-success,#34D399)] border-[var(--tj-color-border-subtle)]",
  },
  ended: {
    label: "Ended",
    dotClass: "bg-[var(--tj-color-text-muted,#7F91AA)]",
    badgeClass:
      "bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-secondary,#A8B7CC)] border-[var(--tj-color-border-subtle)]",
  },
  pending: {
    label: "Pending",
    dotClass: "bg-[var(--tj-color-state-warning,#FFC857)]",
    badgeClass:
      "bg-[var(--tj-color-state-warning-bg,#493516)] text-[var(--tj-color-state-warning,#FFC857)] border-[var(--tj-color-border-subtle)]",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-[var(--tj-color-state-danger,#F87171)]",
    badgeClass:
      "bg-[var(--tj-color-state-danger-bg,#451F2A)] text-[var(--tj-color-state-danger,#F87171)] border-[var(--tj-color-border-subtle)]",
  },
};

function computeRealCountdown(endTime?: string): string | null {
  if (!endTime) return null;
  const target = new Date(endTime).getTime();
  if (!Number.isFinite(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${pad(hours % 24)}h ${pad(minutes)}m`;
  }
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  layout = "grid",
  onPlaceBid,
  onView,
  className,
}) => {
  const [countdown, setCountdown] = useState<string | null>(() =>
    auction.status === "active" ? computeRealCountdown(auction.endTime) : null
  );

  useEffect(() => {
    if (auction.status !== "active" || !auction.endTime) {
      setCountdown(null);
      return;
    }

    const updateTimer = () => {
      setCountdown(computeRealCountdown(auction.endTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  const statusMeta = STATUS_BADGE[auction.status] || STATUS_BADGE.active;

  const formattedEndDate = React.useMemo(() => {
    if (!auction.endTime) return "End time unavailable";
    const parsed = new Date(auction.endTime);
    if (Number.isNaN(parsed.getTime())) return "End time unavailable";
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [auction.endTime]);

  const handlePlaceBid = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlaceBid) onPlaceBid(auction);
    else if (onView) onView(auction);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView && onView(auction)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView?.(auction);
        }
      }}
      className={cn(
        "flex flex-col justify-between bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-md",
        "border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)] rounded-[var(--tj-radius-compact,5px)] p-2.5",
        "cursor-pointer transition-colors duration-150 select-none text-left",
        layout === "shelf"
          ? "w-[220px] sm:w-[248px] shrink-0 snap-start"
          : "w-full min-w-0",
        className
      )}
    >
      <div>
        {/* Square Artwork */}
        <div className="relative aspect-square w-full rounded-[var(--tj-radius-compact,5px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] border border-[var(--tj-color-border-subtle)] group">
          <ProgressiveImage
            src={auction.imageUrl || getPlaceholderImage(`auction-${auction.id}`)}
            fallbackSrc={getPlaceholderImage(`auction-${auction.id}`)}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Auction Status Badge */}
          <div
            className={cn(
              "absolute top-1.5 left-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-md",
              statusMeta.badgeClass
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", statusMeta.dotClass)} />
            <span>{statusMeta.label}</span>
          </div>

          {/* Bid Count */}
          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-mono font-semibold bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)] text-[var(--tj-color-text-secondary,#A8B7CC)]">
            {auction.bidsCount} {auction.bidsCount === 1 ? "bid" : "bids"}
          </div>

          {/* Real Countdown or Explicit End Timestamp */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-2 px-2 py-1 rounded-[var(--tj-radius-compact,5px)] bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)] text-[10px]">
            <div className="flex items-center gap-1 text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0">
              <Clock className="w-3 h-3 text-[var(--tj-color-brand-primary,#229ED9)]" />
              <span className="uppercase tracking-wider">
                {auction.status === "active" && countdown ? "Ends" : "Closing"}
              </span>
            </div>
            <span className="font-mono font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
              {auction.status === "active" && countdown ? countdown : formattedEndDate}
            </span>
          </div>
        </div>

        {/* Title & Artist */}
        <div className="mt-2.5 space-y-0.5 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate leading-tight">
            {auction.title}
          </h3>
          <VerifiedArtistLabel
            artist={auction.artist}
            verified={Boolean(auction.artistVerified)}
          />
        </div>

        {/* Bid Metrics */}
        <div className="mt-2 pt-2 border-t border-[var(--tj-color-border-subtle)] grid grid-cols-2 gap-2 text-[11px]">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)] block">
              Highest Bid
            </span>
            <TonPriceLabel price={auction.highestBid} label="" size="sm" />
          </div>
          <div className="min-w-0 text-right">
            <span className="text-[10px] uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)] block">
              Min Next Bid
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate block">
              {auction.minimumNextBid || auction.highestBid}
            </span>
          </div>
        </div>

        {/* Recent Bid History Preview (strictly real offers if recorded) */}
        {auction.recentBids && auction.recentBids.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[var(--tj-color-border-subtle)] space-y-1">
            {auction.recentBids.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-[10px] font-mono text-[var(--tj-color-text-secondary,#A8B7CC)]"
              >
                <span className="truncate">
                  {b.bidder.length > 10
                    ? `${b.bidder.slice(0, 5)}...${b.bidder.slice(-4)}`
                    : b.bidder}
                </span>
                <span className="font-semibold text-[var(--tj-color-brand-primary,#229ED9)] shrink-0">
                  {b.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-2.5 pt-2 border-t border-[var(--tj-color-border-subtle)] flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
          {auction.status === "ended"
            ? "Bidding closed"
            : auction.status === "cancelled"
            ? "Auction cancelled"
            : auction.status === "pending"
            ? "Scheduled"
            : "Live on TON"}
        </span>
        <button
          type="button"
          onClick={handlePlaceBid}
          className={cn(
            "min-h-[32px] px-2.5 py-1 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer border transition-colors shrink-0 whitespace-nowrap",
            auction.status === "active"
              ? "bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-[var(--tj-color-text-primary,#F8FAFC)] border-[var(--tj-color-brand-primary,#229ED9)]"
              : "bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-primary,#F8FAFC)] border-[var(--tj-color-border-subtle)]"
          )}
        >
          <Gavel className="w-3 h-3" />
          <span>{auction.status === "active" ? "Place Bid" : "View Details"}</span>
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;
