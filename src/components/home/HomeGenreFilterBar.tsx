import React from "react";
import { motion } from "motion/react";
import { useLibrary } from "@/contexts/LibraryContext";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const HomeGenreFilterBar: React.FC = () => {
  const { selectedGenre, setSelectedGenre, availableGenres } = useLibrary();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <section className="w-full py-1 text-left">
      <div
        ref={scrollRef}
        {...handlers}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain" }}
      >
        {availableGenres.map((genre) => {
          const isSelected = (selectedGenre || "All") === genre;
          return (
            <motion.button
              key={genre}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectGenre(genre)}
              className={`shrink-0 snap-start px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer outline-none border ${
                isSelected
                  ? "bg-primary text-black font-black shadow-sm border-[#c0c0c0]/40"
                  : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.09] border-[#c0c0c0]/25"
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
