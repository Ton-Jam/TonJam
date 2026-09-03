import React, { useRef } from "react";
import { motion } from "motion/react";
import { useLibrary } from "@/contexts/LibraryContext";

export const HomeGenreFilterBar: React.FC = () => {
  const { selectedGenre, setSelectedGenre, availableGenres } = useLibrary();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <section className="w-full py-1 text-left">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 w-full snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {availableGenres.map((genre) => {
          const isSelected = (selectedGenre || "All") === genre;
          return (
            <motion.button
              key={genre}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectGenre(genre)}
              className={`shrink-0 snap-start px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer border-none outline-none ${
                isSelected
                  ? "bg-primary text-black font-black shadow-sm"
                  : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              {genre === "All" ? "All Genres" : genre}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default HomeGenreFilterBar;
