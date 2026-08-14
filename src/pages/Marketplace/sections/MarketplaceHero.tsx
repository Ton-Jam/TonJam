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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full min-h-[400px] sm:min-h-[440px] rounded-[10px] bg-gradient-to-br from-[#0F143A] via-[#090C22] to-zinc-950 border border-zinc-800/40 p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-8 items-center overflow-hidden"
      id="marketplace-hero"
    >
      {/* Animated premium background visualizer accents (Flat shapes instead of heavy glass) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5B6BFF] rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00B4D8] rounded-full filter blur-[120px] animate-pulse delay-75" />
      </div>

      {/* Hero Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 z-10 text-left w-full md:max-w-[55%]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#5B6BFF]/10 text-[#5B6BFF] border border-[#5B6BFF]/20 select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Featured NFT Track</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            {featuredNFT.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${featuredNFT.artistId}`}
              alt={featuredNFT.artist}
              className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/60"
            />
            <span className="text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider">
              {featuredNFT.artist}
            </span>
            {featuredNFT.artistVerified && (
              <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-black" title="Verified Artist">✓</span>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide leading-relaxed max-w-lg">
          {featuredNFT.description || "The limited edition master digital collectibles track of the upcoming summer EP. Exclusively minted with custom animated visuals, master rights splits, and high fidelity lossless audio formats verified on TON."}
        </p>

        {/* Live bidding/price box */}
        <div className="grid grid-cols-2 gap-4 max-w-sm py-4 border-y border-zinc-800/40">
          <div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Floor Price</span>
            <span className="text-lg font-black text-white font-mono">{convertPrice(featuredNFT.price || "15.0 TON")}</span>
            {!localCurrencyEnabled && (
              <span className="text-[10px] text-zinc-400 font-bold block">≈ ${(15.0 * 5.30).toFixed(2)} USD</span>
            )}
          </div>

          <div>
            <span className="text-[9px] font-black text-[#00B4D8] uppercase tracking-widest flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 animate-spin duration-3000" /> Mint Closes In
            </span>
            <span className="text-lg font-black text-white font-mono">
              {timeLeft.hours.toString().padStart(2, "0")}:{timeLeft.minutes.toString().padStart(2, "0")}:{timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold block">Limited Edition 18/250</span>
          </div>
        </div>

        {/* Hero Interactive Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={handlePlayToggle}
            className={`rounded-[10px] text-xs font-black uppercase tracking-wider px-6 py-5 flex items-center gap-2 transition-all duration-300 ${
              isThisPlaying 
                ? "bg-[#00B4D8] text-zinc-950 hover:bg-[#009bba]" 
                : "bg-white text-zinc-950 hover:bg-zinc-200"
            }`}
          >
            {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isThisPlaying ? "Pause Preview" : "Play Preview"}
          </Button>

          <Button
            onClick={handleMint}
            disabled={isMinting || isMinted}
            className={`rounded-[10px] text-xs font-black uppercase tracking-wider px-6 py-5 flex items-center gap-2 transition-all duration-300 border border-zinc-700/60 ${
              isMinted 
                ? "bg-emerald-600 text-white cursor-default hover:bg-emerald-600" 
                : "bg-zinc-900 text-white hover:bg-zinc-850"
            }`}
          >
            <Disc className={`w-4 h-4 ${isMinting ? "animate-spin" : ""}`} />
            {isMinting ? "Minting on TON..." : isMinted ? "Owned in Wallet ✓" : `Mint NFT (${convertPrice(featuredNFT.price || "15.0 TON")})`}
          </Button>

          <Button
            onClick={() => onOpenDetails(featuredNFT)}
            variant="ghost"
            className="rounded-[10px] hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800/40 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white px-5 py-5"
          >
            View Specs
          </Button>
        </div>
      </div>

      {/* Hero Visual Block */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="relative w-full md:w-[340px] aspect-square rounded-[10px] border border-zinc-800/50 bg-zinc-900 overflow-hidden shadow-2xl flex-shrink-0 cursor-pointer"
        onClick={() => onOpenDetails(featuredNFT)}
        id="hero-artwork-frame"
      >
        <img
          src={featuredNFT.coverUrl || getPlaceholderImage(featuredNFT.title)}
          alt={featuredNFT.title}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
        
        {/* Visual corner labels */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[8px] font-black bg-zinc-950/80 text-white px-2 py-0.5 rounded-[4px] border border-zinc-800/40 uppercase tracking-widest">
            {(featuredNFT as any).rarity || "Legendary"}
          </span>
          <span className="text-[8px] font-black bg-[#5B6BFF]/90 text-white px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
            Master Rights
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="space-y-0.5 max-w-[70%]">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Collection Series</span>
            <span className="text-xs font-black text-white uppercase block truncate">Solaris Odyssey Vol. 1</span>
          </div>
          <span className="text-[10px] font-black font-mono bg-zinc-950 text-white px-2.5 py-1 rounded-[4px] border border-zinc-800/40">
            0.15 TON / Stream
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
