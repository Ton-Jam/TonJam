import React from "react";
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
      <div className="space-y-0.5 mb-3">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <Disc className="w-4 h-4 text-[#0088CC]" />
          Discover Genres
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {genres.map((gen) => (
          <div
            key={gen.id}
            onClick={() => onSelectGenre(gen)}
            className="relative h-20 rounded-[3px] bg-[#0A0A0A] border border-white/12 p-3 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-colors hover:border-white/20 shadow-none"
          >
            {/* Ambient Background Disc Graphic */}
            <div className="absolute right-[-8px] bottom-[-8px] w-14 h-14 opacity-10 pointer-events-none">
              <Disc className="w-full h-full text-white" />
            </div>

            <div className="z-10">
              <span className="text-xs sm:text-sm font-semibold text-[#F5F7FA] uppercase tracking-tight block">
                {gen.name}
              </span>
              <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block mt-0.5">
                {gen.count}
              </span>
            </div>
            
            <span className="text-[8px] font-semibold uppercase tracking-wider text-[#0088CC] self-end z-10">
              Explore →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
