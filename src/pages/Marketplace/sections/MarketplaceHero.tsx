import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Sparkles, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
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
}) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { convertPrice } = useGramPrice();

  // Playback state of featured track
  const isThisPlaying = currentTrack?.id === featuredNFT.id && isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(featuredNFT as any);
  };

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetails(featuredNFT);
  };

  const coverImage = featuredNFT.coverUrl || featuredNFT.imageUrl || getPlaceholderImage(featuredNFT.title);
  const formattedPrice = featuredNFT.price ? (featuredNFT.price.includes("TON") ? featuredNFT.price : `${featuredNFT.price} TON`) : "15.0 TON";

  return (
    <div
      className="relative w-full rounded-2xl bg-[#0F1C32] border border-[#22374D] p-5 sm:p-7 flex flex-col-reverse md:flex-row justify-between gap-6 items-center overflow-hidden transition-all duration-300"
      id="marketplace-hero"
    >
      {/* Background ambient gradient glow */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#00B4D8]/10 blur-3xl pointer-events-none"
        aria-hidden="true" 
      />

      {/* Hero Left Content */}
      <div className="flex-1 space-y-3 sm:space-y-4 z-10 text-left w-full md:max-w-[58%]">
        {/* Featured Drop Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">FEATURED DROP</span>
        </div>

        {/* Headline & Artist */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] leading-tight font-sans">
            {featuredNFT.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#C2C7CD]">
              {featuredNFT.artist || featuredNFT.creator}
            </span>
            {featuredNFT.artistVerified && (
              <span className="inline-flex items-center gap-0.5 text-[#00B4D8]" title="Verified Artist">
                <CheckCircle2 className="w-4 h-4 fill-[#00B4D8] text-[#07111F]" />
              </span>
            )}
            {featuredNFT.edition && (
              <span className="text-xs text-[#8C8C8C] ml-1">
                · Edition {featuredNFT.edition}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#C2C7CD] font-normal leading-relaxed line-clamp-2 max-w-lg">
          {featuredNFT.description || "Exclusive master recording audio collectible minted on the TON blockchain with high-fidelity lossless master audio."}
        </p>

        {/* Pricing & Rarity info */}
        <div className="flex items-center gap-6 py-2.5 border-y border-[#22374D]/70 max-w-sm">
          <div>
            <span className="text-[10px] font-medium text-[#8C8C8C] uppercase tracking-wider block mb-0.5">
              Floor Price
            </span>
            <span className="text-lg font-bold text-[#FFFFFF] font-mono">
              {convertPrice(formattedPrice)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-medium text-[#00B4D8] uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3" /> Status
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#FFFFFF]">
              Live on Marketplace
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            onClick={handleExplore}
            className="rounded-xl text-xs font-semibold px-5 py-2.5 h-10 flex items-center gap-2 bg-[#00B4D8] hover:bg-[#009CC0] text-[#07111F] font-bold transition-colors cursor-pointer border-none shadow-md shadow-[#00B4D8]/20"
          >
            Explore Drop
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={handlePlayToggle}
            variant="ghost"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 h-10 flex items-center gap-2 bg-[#0A1628] hover:bg-[#0A1628]/80 text-[#FFFFFF] border border-[#22374D] transition-colors cursor-pointer"
          >
            {isThisPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-[#00B4D8]" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#00B4D8] ml-0.5" />
                <span>Play Preview</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Right Media Card */}
      <div 
        onClick={handleExplore}
        className="w-full sm:w-64 md:w-72 aspect-square rounded-xl overflow-hidden relative group cursor-pointer bg-[#0A1628] border border-[#22374D] shrink-0"
      >
        <img
          src={coverImage}
          alt={featuredNFT.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImage(featuredNFT.title);
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/80 via-transparent to-transparent flex items-end p-4">
          <div className="w-full flex items-center justify-between text-xs text-[#FFFFFF]">
            <span className="font-semibold">{(featuredNFT as any).genre || "Master Audio"}</span>
            <span className="text-[#00B4D8] font-mono font-bold">{convertPrice(formattedPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHero;
