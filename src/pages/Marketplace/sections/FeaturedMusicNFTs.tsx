import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, Flame, Sliders } from "lucide-react";
import NFTCard from "@/components/NFTCard";
import { NFTItem } from "@/types";

interface FeaturedMusicNFTsProps {
  nfts: NFTItem[];
  title?: string;
  subtitle?: string;
}

export const FeaturedMusicNFTs: React.FC<FeaturedMusicNFTsProps> = ({
  nfts,
  title = "Featured Music NFTs",
  subtitle = "Premium master recording digital collectibles on TON"
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full relative" id="marketplace-featured-music-nfts">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2BE08C]" />
            {title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/explore/nfts?title=${encodeURIComponent(title)}&filter=top_nfts`)}
            className="text-xs font-bold text-[#0098EA] hover:text-[#0098EA]/80 flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer"
          >
            More <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border-none"
              aria-label="Previous tracks"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border-none"
              aria-label="Next tracks"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal List of NFT Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
      >
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            nft={{ ...nft, owner: 'marketplace' } as any}
            className="w-[155px] flex-shrink-0 snap-start"
          />
        ))}
      </div>
    </div>
  );
};
