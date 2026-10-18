import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Layers, CheckCircle2 } from "lucide-react";
import { NFTCollection } from "../types";
import { useGramPrice } from "@/contexts/GramPriceContext";
import { getPlaceholderImage } from "@/lib/utils";

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
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative text-left" id="marketplace-trending-collections">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00B4D8]" />
            Trending Collections
          </h2>
          <p className="text-xs text-[#8C8C8C]">
            Curated audio collections with verified origin on TON
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/collections')}
            className="text-xs font-semibold text-[#00B4D8] hover:text-[#009CC0] flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer"
          >
            All Collections <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-lg bg-[#0A1628] border border-[#22374D] text-[#C2C7CD] hover:text-white flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Previous collections"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-lg bg-[#0A1628] border border-[#22374D] text-[#C2C7CD] hover:text-white flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Next collections"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel List */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
      >
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollection(col)}
            className="min-w-[240px] max-w-[240px] bg-[#0A1628] hover:bg-[#0F1C32] border border-[#22374D] hover:border-[#38516B] rounded-2xl overflow-hidden p-3.5 cursor-pointer select-none snap-start flex flex-col justify-between transition-all duration-200"
          >
            {/* Collection Cover Image */}
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#07111F] relative mb-3">
              <img
                src={col.imageUrl || getPlaceholderImage(col.name)}
                alt={col.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = getPlaceholderImage(col.name);
                }}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              {col.itemCount !== undefined && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#07111F]/80 backdrop-blur-md text-[9px] font-mono font-semibold text-[#FFFFFF] uppercase tracking-wider border border-[#22374D]">
                  {col.itemCount} Items
                </div>
              )}
            </div>

            {/* Collection Meta */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#FFFFFF] truncate block max-w-[85%]">{col.name}</span>
                {col.verified && (
                  <span title="Verified Creator" className="inline-flex">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-[#00B4D8] text-[#07111F] shrink-0" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-[#C2C7CD]">
                <span className="text-[#8C8C8C]">By</span>
                <span className="truncate">{col.creator}</span>
              </div>
            </div>

            {/* Price / Volume Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#22374D]/60">
              <div>
                <span className="text-[9px] font-medium text-[#8C8C8C] uppercase tracking-wider block">Floor Price</span>
                <span className="text-xs font-bold text-[#00B4D8] font-mono">{convertPrice(col.floorPrice || "1.5 TON")}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-medium text-[#8C8C8C] uppercase tracking-wider block">Volume</span>
                <span className="text-xs font-bold text-[#FFFFFF] font-mono">{convertPrice(col.volume || "0 TON")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCollections;
