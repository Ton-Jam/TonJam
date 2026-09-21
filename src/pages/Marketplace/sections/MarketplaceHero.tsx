import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Disc, Sparkles, Flame, Clock, Heart, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFTItem } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import { useGramPrice } from "@/contexts/GramPriceContext";

interface MarketplaceHeroProps {
  featuredNFT: NFTItem;
  onOpenDetails: (nft: NFTItem) => void;
  onMintSuccess?: () => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  featuredNFT,
  onOpenDetails,
  onMintSuccess
}) => {
  const { playTrack, currentTrack, isPlaying, addNotification } = useAudio();
  const { convertPrice, localCurrencyEnabled } = useGramPrice();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 24, seconds: 45 });
  const [isMinted, setIsMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Playback state of featured track
  const isThisPlaying = currentTrack?.id === featuredNFT.id && isPlaying;

  // Real-time countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 14, minutes: 24, seconds: 45 }; // Reset loop
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(featuredNFT as any);
  };

  const handleMint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMinted || isMinting) return;
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      setIsMinted(true);
      if (addNotification) {
        addNotification(
          `Successfully minted 1 edition of "${featuredNFT.title}" on TON. Verified.`,
          "success"
        );
      }
      if (onMintSuccess) onMintSuccess();
    }, 2000);
  };

  return (
    <div
      className="relative w-full rounded-[8px] bg-[#0A0A0A] border border-white/12 p-5 sm:p-7 flex flex-col md:flex-row justify-between gap-6 items-center overflow-hidden"
      id="marketplace-hero"
    >
      {/* Hero Main Content */}
      <div className="flex-1 space-y-3 sm:space-y-4 z-10 text-left w-full md:max-w-[58%]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-[#0088CC]/10 text-[#0088CC] border border-[#0088CC]/20 select-none">
          <Sparkles className="w-3 h-3" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Featured Release</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            {featuredNFT.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${featuredNFT.artistId}`}
              alt={featuredNFT.artist}
              className="w-4 h-4 rounded-full bg-[#101010] border border-white/12"
            />
            <span className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              {featuredNFT.artist}
            </span>
            {featuredNFT.artistVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#0088CC] text-white flex items-center justify-center text-[8px] font-bold" title="Verified Artist">✓</span>
            )}
          </div>
        </div>

        <p className="text-xs text-white/60 font-normal leading-relaxed line-clamp-2 max-w-lg">
          {featuredNFT.description || "Limited edition master digital collectible. Verified on TON with high fidelity lossless audio formats."}
        </p>

        {/* Bidding/price block */}
        <div className="grid grid-cols-2 gap-4 max-w-xs py-2.5 border-y border-white/10">
          <div>
            <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider block mb-0.5">Floor Price</span>
            <span className="text-base sm:text-lg font-bold text-[#F5F7FA] font-mono">{convertPrice(featuredNFT.price || "15.0 TON")}</span>
            {!localCurrencyEnabled && (
              <span className="text-[10px] text-white/50 block">≈ ${(15.0 * 5.30).toFixed(2)} USD</span>
            )}
          </div>

          <div>
            <span className="text-[9px] font-medium text-[#0088CC] uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3" /> Mint Closes In
            </span>
            <span className="text-base sm:text-lg font-bold text-[#F5F7FA] font-mono">
              {timeLeft.hours.toString().padStart(2, "0")}:{timeLeft.minutes.toString().padStart(2, "0")}:{timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-white/50 block">Edition 18/250</span>
          </div>
        </div>

        {/* Hero Interactive Actions */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button
            onClick={handlePlayToggle}
            className={`rounded-[3px] text-xs font-semibold px-4 py-2 h-9 flex items-center gap-1.5 transition-colors ${
              isThisPlaying 
                ? "bg-[#0088CC] text-white hover:bg-[#0077b3]" 
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isThisPlaying ? "Pause Preview" : "Play Preview"}
          </Button>

          <Button
            onClick={handleMint}
            disabled={isMinting || isMinted}
            className={`rounded-[3px] text-xs font-semibold px-4 py-2 h-9 flex items-center gap-1.5 transition-colors border border-white/12 ${
              isMinted 
                ? "bg-emerald-600 text-white cursor-default" 
                : "bg-[#101010] text-white hover:bg-white/10"
            }`}
          >
            <Disc className={`w-3.5 h-3.5 ${isMinting ? "animate-spin" : ""}`} />
            {isMinting ? "Minting..." : isMinted ? "Owned ✓" : `Mint (${convertPrice(featuredNFT.price || "15.0 TON")})`}
          </Button>

          <Button
            onClick={() => onOpenDetails(featuredNFT)}
            variant="ghost"
            className="rounded-[3px] hover:bg-white/10 border border-white/12 text-xs font-medium text-white/70 hover:text-white px-3.5 py-2 h-9"
          >
            Details
          </Button>
        </div>
      </div>

      {/* Hero Visual Block */}
      <div
        className="relative w-full md:w-[260px] lg:w-[300px] aspect-square rounded-[3px] border border-white/12 bg-[#101010] overflow-hidden flex-shrink-0 cursor-pointer group"
        onClick={() => onOpenDetails(featuredNFT)}
        id="hero-artwork-frame"
      >
        <img
          src={featuredNFT.coverUrl || getPlaceholderImage(featuredNFT.title)}
          alt={featuredNFT.title}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-102"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Visual corner labels */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          <span className="text-[8px] font-semibold bg-[#0A0A0A]/90 text-white px-1.5 py-0.5 rounded-[3px] border border-white/12 uppercase tracking-wide">
            {(featuredNFT as any).rarity || "Rare"}
          </span>
          <span className="text-[8px] font-semibold bg-[#0088CC] text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide">
            Master Rights
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="space-y-0.5 max-w-[70%]">
            <span className="text-[8px] font-medium text-white/60 uppercase tracking-wide block">Collection</span>
            <span className="text-xs font-semibold text-[#F5F7FA] block truncate">Solaris Odyssey Vol. 1</span>
          </div>
          <span className="text-[10px] font-mono font-medium bg-[#0A0A0A] text-white px-2 py-0.5 rounded-[3px] border border-white/12">
            0.15 TON / Stream
          </span>
        </div>
      </div>
    </div>
  );
};
