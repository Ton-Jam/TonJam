import React from "react";
import { Play, Pause, Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";
import { TonPriceLabel } from "./TonPriceLabel";
import { FavouriteButton } from "./FavouriteButton";
import MediaCard from "@/components/common/MediaCard";

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
  owner?: string;
  floorPriceChange?: number;
  royaltySplits?: Array<{ address: string; percentage: number }>;
}

interface MusicNFTCardProps {
  nft: MusicNFTData;
  isPlaying?: boolean;
  onPlayPreview?: (nft: MusicNFTData) => void;
  onCollect?: (nft: MusicNFTData) => void;
  onQuickBuy?: (nft: MusicNFTData) => void;
  onViewNFT?: (nft: MusicNFTData) => void;
  className?: string;
}

export const MusicNFTCard: React.FC<MusicNFTCardProps> = ({
  nft,
  isPlaying = false,
  onPlayPreview,
  onCollect,
  onQuickBuy,
  onViewNFT,
  className,
}) => {
  const badgeText = nft.badge || (nft.edition ? `EDITION ${nft.edition}` : "LIMITED");

  const handleCardClick = () => {
    if (onViewNFT) onViewNFT(nft);
  };

  const handleQuickBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickBuy) {
      onQuickBuy(nft);
    } else if (onCollect) {
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
    <MediaCard
      type="nft"
      isActive={isPlaying}
      onClick={handleCardClick}
      className={cn("snap-start shrink-0", className)}
      role="button"
      tabIndex={0}
      aria-label={`View NFT: ${nft.title} by ${nft.artist}`}
      artwork={
        <>
          <ProgressiveImage
            src={nft.imageUrl}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Artwork Badge */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/65 backdrop-blur-md text-[#65B8FF]">
              {badgeText}
            </span>
          </div>

          {/* Spotify-style Floating Action Button */}
          {nft.audioUrl && (
            <div className={cn(
              "absolute bottom-2 right-2 transition-all duration-200 z-10",
              isPlaying 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
            )}>
              <button 
                type="button"
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
                onClick={handlePlayClick}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          )}
        </>
      }
      title={nft.title}
      subtitle={
        <span className="inline-flex items-center gap-1 truncate w-full">
          <span className="truncate">{nft.artist}</span>
          <VerifiedArtistLabel artist={nft.artist} verified={nft.artistVerified ?? true} />
        </span>
      }
      meta={
        <div className="flex items-center justify-between pt-1">
          <TonPriceLabel price={nft.price} label="" size="sm" />
          {onQuickBuy && (
            <button
              type="button"
              onClick={handleQuickBuyClick}
              className="px-2.5 py-1 rounded-lg bg-[#229ED9] hover:bg-[#168AC4] text-white text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-transform active:scale-95"
              title="Quick Buy"
            >
              Buy
            </button>
          )}
        </div>
      }
    />
  );
};

export default MusicNFTCard;
