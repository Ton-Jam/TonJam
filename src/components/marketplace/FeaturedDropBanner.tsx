import React from "react";
import { Sparkles, ArrowRight, Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { TonPriceLabel } from "./TonPriceLabel";
import { cn } from "@/lib/utils";

interface FeaturedDropBannerProps {
  onExploreDrop?: () => void;
  onPlayPreview?: () => void;
  isPlaying?: boolean;
  className?: string;
  dropInfo?: {
    title: string;
    artist: string;
    price: string;
    edition: string;
    imageUrl: string;
  };
}

export const FeaturedDropBanner: React.FC<FeaturedDropBannerProps> = ({
  onExploreDrop,
  onPlayPreview,
  isPlaying = false,
  className,
  dropInfo = {
    title: "Midnight Frequency",
    artist: "Krupy Vibez",
    price: "3.5 TON",
    edition: "1 of 50",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
  },
}) => {
  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden bg-[#101A32] shadow-xl shadow-black/40",
        className
      )}
    >
      {/* Background Album Art with Dark Blue Overlay & Soft Highlights */}
      <div className="absolute inset-0 z-0">
        <ProgressiveImage
          src={dropInfo.imageUrl}
          alt={dropInfo.title}
          className="w-full h-full object-cover scale-105 filter blur-xl opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101A32] via-[#101A32]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101A32] via-[#101A32]/90 to-transparent" />
        {/* Soft radial blue glow */}
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-[#3390EC]/15 blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left Side: Editorial Typography & Actions */}
        <div className="flex-1 space-y-3.5 text-left w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#3390EC]/15 text-[#65B8FF]">
            <Sparkles className="w-3 h-3" />
            <span>FEATURED DROP</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5F8FF] tracking-tight leading-tight">
              Music worth owning.
            </h2>
            <p className="text-xs sm:text-sm text-[#9BAAC5] leading-relaxed max-w-md">
              Discover exclusive tracks from your favourite artists.
            </p>
          </div>

          {/* Collectible Badge / Drop Details */}
          <div className="flex items-center gap-3 pt-1">
            <TonPriceLabel price={dropInfo.price} size="md" />
            <span className="text-[#9BAAC5] text-xs font-medium">·</span>
            <span className="text-xs text-[#9BAAC5] font-medium">
              {dropInfo.edition} Exclusive
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onExploreDrop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3390EC] hover:bg-[#2879c7] text-[#F5F8FF] font-semibold text-xs tracking-wide shadow-md shadow-[#3390EC]/25 transition-all cursor-pointer border-none outline-none"
            >
              <span>Explore Drop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>

            {onPlayPreview && (
              <button
                type="button"
                onClick={onPlayPreview}
                className="w-10 h-10 rounded-xl bg-[#152440] hover:bg-[#1f3358] text-[#F5F8FF] flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Square Album Cover Display */}
        <div className="w-36 sm:w-44 md:w-52 aspect-square rounded-2xl overflow-hidden bg-[#070D20] shadow-2xl relative shrink-0">
          <ProgressiveImage
            src={dropInfo.imageUrl}
            alt={dropInfo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D20]/80 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-left">
            <p className="text-xs font-bold text-white truncate">{dropInfo.title}</p>
            <p className="text-[10px] text-[#65B8FF] truncate">{dropInfo.artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedDropBanner;
