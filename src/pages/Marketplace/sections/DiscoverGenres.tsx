import React from "react";
import { motion } from "motion/react";
import { Disc } from "lucide-react";
import { GenreCategory } from "../types";

interface DiscoverGenresProps {
  genres: GenreCategory[];
  onSelectGenre: (genre: GenreCategory) => void;
}

export const DiscoverGenres: React.FC<DiscoverGenresProps> = ({
  genres,
  onSelectGenre
}) => {
  return (
    <div className="w-full text-left" id="marketplace-discover-genres">
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Disc className="w-5 h-5 text-[#00B4D8] animate-spin-slow" />
          Discover Genres
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          Explore curated music NFT ecosystems by auditory style
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {genres.map((gen) => (
          <motion.div
            key={gen.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGenre(gen)}
            className={`relative h-24 rounded-[10px] bg-gradient-to-br ${gen.colorClass} border border-white/[0.03] p-4 flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
          >
            {/* Ambient Background Disc Graphic */}
            <div className="absolute right-[-10px] bottom-[-10px] w-16 h-16 opacity-15 rotate-45 pointer-events-none">
              <Disc className="w-full h-full text-white" />
            </div>

            <div className="z-10">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight block">
                {gen.name}
              </span>
              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest block mt-0.5">
                {gen.count}
              </span>
            </div>
            
            <span className="text-[8px] font-black uppercase tracking-widest bg-black/30 border border-white/5 w-fit px-2 py-0.5 rounded-[4px] text-white/80 self-end">
              Explore →
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
