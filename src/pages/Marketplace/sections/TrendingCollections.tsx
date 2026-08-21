import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Award, Layers, Users, TrendingUp } from "lucide-react";
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
    <div className="w-full relative" id="marketplace-trending-collections">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#5B6BFF]" />
            Trending Collections
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/explore/playlists?title=Trending+Collections&filter=curated')}
            className="text-xs font-bold text-[#0098EA] hover:text-[#0098EA]/80 flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer"
          >
            More <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border-none"
              aria-label="Previous collections"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border-none"
              aria-label="Next collections"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel List */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
      >
        {collections.map((col) => (
          <motion.div
            key={col.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCollection(col)}
            className="min-w-[260px] max-w-[260px] bg-zinc-950 border border-zinc-900 rounded-[10px] overflow-hidden p-3 cursor-pointer select-none snap-start flex flex-col justify-between"
          >
            {/* Collection Cover Image */}
            <div className="aspect-square w-full rounded-[10px] overflow-hidden bg-zinc-900 relative mb-3">
              <img
                src={col.imageUrl}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-zinc-950/80 text-[8px] font-black text-white border border-zinc-800/40 uppercase tracking-widest font-mono">
                {col.itemCount} Items
              </div>
            </div>

            {/* Collection Meta */}
            <div className="text-left space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white uppercase truncate block max-w-[85%]">{col.name}</span>
                {col.verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black" title="Verified Creator">✓</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Creator:</span>
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider truncate max-w-[65%]">{col.creator}</span>
              </div>
            </div>

            {/* Price / Volume Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900/60">
              <div>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Floor Price</span>
                <span className="text-[11px] font-black text-white font-mono">{convertPrice(col.floorPrice)}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Vol. Volume</span>
                <span className="text-[11px] font-black text-[#00B4D8] font-mono">{convertPrice(col.volume)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
