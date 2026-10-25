import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Heart, Sparkles, CheckCircle2, Flame } from "lucide-react";
import { NFTItem } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import { useGramPrice } from "@/contexts/GramPriceContext";

interface FeaturedMusicNFTsProps {
  nfts: NFTItem[];
  title?: string;
  subtitle?: string;
}

export const FeaturedMusicNFTs: React.FC<FeaturedMusicNFTsProps> = ({
  nfts,
  title = "Trending Music NFTs",
  subtitle = "Popular audio master recordings on TON"
}) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { convertPrice } = useGramPrice();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (nftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [nftId]: !prev[nftId] }));
  };

  const handleCardClick = (nft: NFTItem) => {
    navigate(`/nft/${nft.id}`);
  };

  const handlePlayToggle = (nft: NFTItem, e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(nft as any);
  };

  return (
    <div className="w-full text-left" id="marketplace-trending-grid">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#00B4D8]" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#8C8C8C]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Section */}
      <div className="-mx-3 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 px-3 sm:mx-0 sm:px-0 scroll-smooth">
        {nfts.slice(0, 24).map((nft) => {
          const isThisPlaying = currentTrack?.id === nft.id && isPlaying;
          const isFav = Boolean(favorites[nft.id]);
          const artwork = nft.coverUrl || nft.imageUrl || getPlaceholderImage(nft.title);
          const priceFormatted = nft.price ? (nft.price.includes("TON") ? nft.price : `${nft.price} TON`) : "2.5 TON";

          return (
            <div
              key={nft.id}
              onClick={() => handleCardClick(nft)}
              className="w-[160px] sm:w-[190px] shrink-0 group bg-[#0A1628] hover:bg-[#0F1C32] border border-[#22374D] hover:border-[#38516B] rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none overflow-hidden relative"
            >
              {/* Artwork Media Area */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#07111F] mb-3">
                <img
                  src={artwork}
                  alt={nft.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(nft.title);
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Edition or Category Badge */}
                {nft.edition && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[10px] font-semibold bg-[#07111F]/80 backdrop-blur-sm text-[#00B4D8] border border-[#22374D] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {nft.edition}
                    </span>
                  </div>
                )}

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(nft.id, e)}
                  aria-label={isFav ? `Remove ${nft.title} from favorites` : `Add ${nft.title} to favorites`}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-[#07111F]/70 backdrop-blur-sm border border-[#22374D] text-[#FFFFFF] hover:text-[#00B4D8] flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-[#00B4D8] text-[#00B4D8]" : "text-[#FFFFFF]"}`} />
                </button>

                {/* Play Button Overlay */}
                <div className={`absolute inset-0 bg-[#07111F]/40 flex items-center justify-center transition-opacity duration-200 ${
                  isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <button
                    type="button"
                    onClick={(e) => handlePlayToggle(nft, e)}
                    aria-label={isThisPlaying ? `Pause ${nft.title}` : `Play preview of ${nft.title}`}
                    className="w-10 h-10 rounded-full bg-[#00B4D8] text-[#07111F] flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="space-y-1 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#FFFFFF] truncate leading-tight group-hover:text-[#00B4D8] transition-colors">
                    {nft.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-[#C2C7CD] truncate">
                      {nft.artist || nft.creator}
                    </span>
                    {nft.artistVerified && (
                      <span title="Verified Artist" className="inline-flex">
                        <CheckCircle2 className="w-3 h-3 fill-[#00B4D8] text-[#07111F] shrink-0" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Line */}
                <div className="pt-2 mt-2 border-t border-[#22374D]/60 flex items-center justify-between">
                  <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider">
                    Price
                  </span>
                  <span className="text-xs font-bold text-[#00B4D8] font-mono">
                    {convertPrice(priceFormatted)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedMusicNFTs;
