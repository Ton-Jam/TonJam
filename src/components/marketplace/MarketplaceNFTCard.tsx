import React from "react";
import { motion } from "motion/react";
import { Play, Pause, BadgeCheck, Disc, Wallet, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/context/AudioContext";
import { MOCK_TRACKS } from "@/constants";
import { cn } from "@/lib/utils";

interface MarketplaceNFTCardProps {
  nft: {
    id: string;
    trackId: string;
    title: string;
    creator: string;
    price: string;
    imageUrl: string;
    artistVerified?: boolean;
    edition?: string;
  };
  className?: string;
}

export const MarketplaceNFTCard: React.FC<MarketplaceNFTCardProps> = ({
  nft,
  className,
}) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, addNotification } = useAudio();

  const associatedTrack = MOCK_TRACKS.find((t) => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isCurrentlyPlaying = isActive && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    } else {
      addNotification("No preview track available for this asset", "error");
    }
  };

  const handleMintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addNotification(`Minting process started for ${nft.title}!`, "success");
    navigate(`/nft/${nft.id}`);
  };

  const handleCardClick = () => {
    navigate(`/nft/${nft.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className={cn(
        "cursor-pointer group relative flex flex-col bg-[#0A113A] rounded-2xl overflow-hidden border border-white/[0.04] transition-all duration-300",
        className
      )}
    >
      {/* Artwork Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/40">
        <img
          src={nft.imageUrl}
          alt={nft.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay with detail look trigger */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handlePlayClick}
            className="p-3 bg-[#5B6BFF] hover:bg-[#5B6BFF]/90 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title={isCurrentlyPlaying ? "Pause preview" : "Play preview"}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={handleMintClick}
            className="p-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white rounded-full transition-transform duration-200 transform hover:scale-110"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Streaming status indicator tab */}
        {isCurrentlyPlaying && (
          <div className="absolute top-3 left-3 bg-[#2BE08C] text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Streaming
          </div>
        )}

        {/* Edition tracker watermark */}
        {nft.edition && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
            {nft.edition}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-[13px] font-bold text-white uppercase tracking-tight line-clamp-1 mb-0.5 group-hover:text-[#5B6BFF] transition-colors">
          {nft.title}
        </h3>

        {/* Artist Line with Verified Tag */}
        <div className="flex items-center gap-1 mb-3">
          <p className="text-[10px] text-[#9AA0AE] font-semibold tracking-wider uppercase truncate">
            {nft.creator}
          </p>
          <BadgeCheck className="w-3.5 h-3.5 text-[#5B6BFF] fill-current shrink-0" />
        </div>

        {/* Floor Pricing & Quick Controls Grid */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-[#9AA0AE] font-semibold">
              Floor Price
            </span>
            <span className="text-xs font-black text-[#00B4D8] flex items-center gap-0.5">
              {nft.price}
              <span className="text-[8px] font-bold text-[#9AA0AE]">TON</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Stream trigger */}
            <button
              onClick={handlePlayClick}
              className={cn(
                "p-1.5 rounded-lg border transition-all duration-200",
                isCurrentlyPlaying
                  ? "bg-[#2BE08C]/15 border-[#2BE08C]/30 text-[#2BE08C]"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.08] text-[#9AA0AE]"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Disc className="w-3.5 h-3.5 animate-spin-slow" />
              )}
            </button>

            {/* Quick Mint trigger */}
            <button
              onClick={handleMintClick}
              className="px-2.5 py-1.5 bg-[#5B6BFF] hover:bg-[#5B6BFF]/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
            >
              <Wallet className="w-3 h-3" />
              Mint
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
