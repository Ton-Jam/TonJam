import React, { useState, useEffect } from "react";
import { Clock, Radio } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";

export interface AuctionData {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  highestBid: string | number;
  bidsCount: number;
  endTime: string | number | Date;
  imageUrl: string;
  genre?: string;
}

interface AuctionCardProps {
  auction: AuctionData;
  onPlaceBid?: (auction: AuctionData) => void;
  onView?: (auction: AuctionData) => void;
  className?: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  onPlaceBid,
  onView,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 4,
    minutes: 25,
    seconds: 40,
  });

  useEffect(() => {
    // Dynamic countdown timer
    const target = typeof auction.endTime === "number"
      ? auction.endTime
      : typeof auction.endTime === "string"
      ? new Date(auction.endTime).getTime()
      : auction.endTime instanceof Date
      ? auction.endTime.getTime()
      : Date.now() + 1000 * 60 * 60 * 4.5;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const handlePlaceBid = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlaceBid) onPlaceBid(auction);
    else if (onView) onView(auction);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onView && onView(auction)}
      className={cn(
        "w-[260px] sm:w-[280px] shrink-0 snap-start flex flex-col justify-between",
        "bg-[#101A32] hover:bg-[#152440] rounded-2xl p-3 shadow-lg shadow-black/25 cursor-pointer transition-colors duration-200 select-none",
        className
      )}
    >
      <div>
        {/* Square Artwork */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#070D20] group">
          <ProgressiveImage
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* LIVE Indicator Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#070D20]/80 backdrop-blur-md text-white">
            <span className="w-2 h-2 rounded-full bg-[#FF4A6B] animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Bid Counter Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#070D20]/75 backdrop-blur-md text-[#9BAAC5]">
            {auction.bidsCount} bids
          </div>

          {/* Countdown Timer Overlay at bottom of artwork */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#070D20]/85 backdrop-blur-md text-xs">
            <div className="flex items-center gap-1.5 text-[#9BAAC5]">
              <Clock className="w-3.5 h-3.5 text-[#65B8FF]" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Ends in</span>
            </div>
            <span className="font-mono font-bold text-[#F5F8FF] text-[11px]">
              {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
            </span>
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-bold text-[#F5F8FF] truncate leading-tight">
            {auction.title}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <VerifiedArtistLabel
              artist={auction.artist}
              verified={auction.artistVerified ?? true}
            />
            {auction.genre && (
              <span className="text-[11px] text-[#9BAAC5]/70 shrink-0 ml-2">
                {auction.genre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Highest Bid & Place Bid Button */}
      <div className="mt-3 pt-3 flex items-end justify-between gap-2">
        <TonPriceLabel
          price={auction.highestBid}
          label="Highest Bid"
          size="sm"
        />

        <button
          type="button"
          onClick={handlePlaceBid}
          className="px-3.5 py-1.5 rounded-xl bg-[#3390EC] hover:bg-[#2879c7] text-[#F5F8FF] transition-all text-xs font-semibold cursor-pointer border-none outline-none shrink-0 shadow-sm shadow-[#3390EC]/30"
        >
          Place Bid
        </button>
      </div>
    </motion.div>
  );
};

export default AuctionCard;
