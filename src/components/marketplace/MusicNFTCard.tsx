import React from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";
import { FavouriteButton } from "./FavouriteButton";

export interface MusicNFTData {
  id: string;
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
}

interface MusicNFTCardProps {
  nft: MusicNFTData;
  isPlaying?: boolean;
  onPlayPreview?: (nft: MusicNFTData) => void;
  onCollect?: (nft: MusicNFTData) => void;
  onViewNFT?: (nft: MusicNFTData) => void;
  className?: string;
}

export const MusicNFTCard: React.FC<MusicNFTCardProps> = ({
  nft,
  isPlaying = false,
  onPlayPreview,
  onCollect,
  onViewNFT,
  className,
}) => {
  const badgeText = nft.badge || (nft.edition ? `EDITION ${nft.edition}` : "LIMITED");

  const handleCardClick = () => {
    if (onViewNFT) onViewNFT(nft);
  };

  const handleCollectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCollect) {
      onCollect(nft);
    } else if (onViewNFT) {
      onViewNFT(nft);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayPreview) onPlayPreview(nft);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className={cn(
        "w-[260px] sm:w-[280px] shrink-0 snap-start flex flex-col justify-between",
        "bg-[#101A32] hover:bg-[#152440] rounded-2xl p-3 shadow-lg shadow-black/25 cursor-pointer transition-colors duration-200 select-none",
        className
      )}
    >
      {/* Top Part: Artwork + Metadata */}
      <div>
        {/* Square Album Artwork */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#070D20] group">
          <ProgressiveImage
            src={nft.imageUrl}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Artwork Bar: Badge & Favourite */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="pointer-events-auto px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#070D20]/75 backdrop-blur-md text-[#65B8FF]">
              {badgeText}
            </span>
            <div className="pointer-events-auto">
              <FavouriteButton size="sm" />
            </div>
          </div>

          {/* Play Preview Floating Action */}
          {nft.audioUrl && (
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
              className={cn(
                "absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-none outline-none shadow-md",
                isPlaying
                  ? "bg-[#3390EC] text-white scale-105"
                  : "bg-[#070D20]/80 hover:bg-[#3390EC] text-white backdrop-blur-md opacity-90 group-hover:opacity-100"
              )}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>
          )}

          {/* Subtle Waveform Motif when playing */}
          {isPlaying && (
            <div className="absolute bottom-2.5 left-2.5 flex items-end gap-0.5 h-4 px-2 py-1 rounded bg-[#070D20]/80 backdrop-blur-sm">
              <span className="w-0.5 h-3 bg-[#65B8FF] animate-pulse rounded-full" />
              <span className="w-0.5 h-4 bg-[#3390EC] animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-2 bg-[#65B8FF] animate-pulse delay-150 rounded-full" />
              <span className="w-0.5 h-3.5 bg-[#3390EC] animate-pulse delay-100 rounded-full" />
            </div>
          )}
        </div>

        {/* Track & Artist Info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-bold text-[#F5F8FF] truncate leading-tight">
            {nft.title}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <VerifiedArtistLabel
              artist={nft.artist}
              verified={nft.artistVerified ?? true}
            />
            {nft.genre && (
              <span className="text-[11px] text-[#9BAAC5]/70 shrink-0 ml-2">
                {nft.genre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Part: Pricing, Edition & CTA */}
      <div className="mt-3 pt-3 flex items-end justify-between gap-2">
        <div>
          <TonPriceLabel price={nft.price} label="Price" size="sm" />
          {nft.edition && (
            <span className="text-[10px] text-[#9BAAC5] block mt-0.5">
              {nft.edition.includes("of") ? nft.edition : `${nft.edition} editions`}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCollectClick}
          className="px-3.5 py-1.5 rounded-xl bg-[#3390EC]/15 hover:bg-[#3390EC] text-[#65B8FF] hover:text-white transition-all text-xs font-semibold cursor-pointer border-none outline-none shrink-0"
        >
          Collect
        </button>
      </div>
    </motion.div>
  );
};

export default MusicNFTCard;
