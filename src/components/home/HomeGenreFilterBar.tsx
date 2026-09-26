import React from "react";
import { motion } from "motion/react";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const CATEGORIES = ["All", "Music", "Playlists", "NFTs", "Artists"] as const;
export type HomeCategory = (typeof CATEGORIES)[number];

interface HomeGenreFilterBarProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const HomeGenreFilterBar: React.FC<HomeGenreFilterBarProps> = ({
  activeCategory = "All",
  onSelectCategory,
}) => {
  const [internalCategory, setInternalCategory] = React.useState("All");
  const currentCategory = onSelectCategory ? activeCategory : internalCategory;

  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const handleSelect = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      setInternalCategory(category);
    }
  };

  return (
    <section className="w-full py-1 text-left">
      <div
        ref={scrollRef}
        {...handlers}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain" }}
      >
        {CATEGORIES.map((category) => {
          const isSelected = currentCategory === category;
          return (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(category)}
              className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer outline-none border-0 ${
                isSelected
                  ? "bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/20"
                  : "bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1]"
              }`}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default HomeGenreFilterBar;

