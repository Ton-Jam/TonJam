import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { NFTCollection } from "../types";
import { useGramPrice } from "@/contexts/GramPriceContext";

interface TrendingCollectionsProps {
  collections: NFTCollection[];
  onSelectCollection: (col: NFTCollection) => void;
}

export const TrendingCollections: React.FC<TrendingCollectionsProps> = ({
  collections,
  onSelectCollection
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { convertPrice } = useGramPrice();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full relative text-left" id="marketplace-trending-collections">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0088CC]" />
            Trending Collections
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/explore/playlists?title=Trending+Collections&filter=curated')}
            className="text-xs font-semibold text-[#0088CC] hover:text-[#0088CC]/80 flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer"
          >
            More <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-[3px] bg-white/5 text-white/60 hover:text-white flex items-center justify-center transition-colors border-none focus:outline-none"
              aria-label="Previous collections"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-[3px] bg-white/5 text-white/60 hover:text-white flex items-center justify-center transition-colors border-none focus:outline-none"
              aria-label="Next collections"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel List */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
      >
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollection(col)}
            className="min-w-[240px] max-w-[240px] bg-[#0A0A0A] border border-white/12 rounded-[3px] overflow-hidden p-3 cursor-pointer select-none snap-start flex flex-col justify-between transition-colors hover:border-white/20"
          >
            {/* Collection Cover Image */}
            <div className="aspect-square w-full rounded-[3px] overflow-hidden bg-[#101010] border border-white/10 relative mb-2.5">
              <img
                src={col.imageUrl}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-103"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-[3px] bg-black/70 text-[8px] font-medium text-white border border-white/10 uppercase tracking-wider font-mono">
                {col.itemCount} Items
              </div>
            </div>

            {/* Collection Meta */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#F5F7FA] truncate block max-w-[85%]">{col.name}</span>
                {col.verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0088CC] text-white flex items-center justify-center text-[8px] font-bold" title="Verified Creator">✓</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] font-normal text-white/50">Creator:</span>
                <span className="text-[9px] font-medium text-white/70 truncate max-w-[65%]">{col.creator}</span>
              </div>
            </div>

            {/* Price / Volume Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
              <div>
                <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block">Floor Price</span>
                <span className="text-[11px] font-semibold text-[#F5F7FA] font-mono">{convertPrice(col.floorPrice)}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block">Volume</span>
                <span className="text-[11px] font-semibold text-[#0088CC] font-mono">{convertPrice(col.volume)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
