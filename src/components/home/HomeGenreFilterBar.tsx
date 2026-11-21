import React from "react";
import { motion } from "motion/react";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const CATEGORIES = ["All", "Music", "NFTs", "Artists"] as const;
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
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 after:content-[''] after:shrink-0 after:w-2 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain" }}
      >
        {CATEGORIES.map((category) => {
          const isSelected = currentCategory === category;
          return (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
              className={`filter-btn filter-silver-border border-silver-2 border-2 shrink-0 snap-start px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer outline-none shadow-none ${
                isSelected
                  ? "active bg-[var(--tj-color-brand-primary,#00B4D8)] border-[rgba(192,192,192,0.35)] text-white"
                  : "bg-[var(--tj-color-chip-background,#102943)] border-[rgba(192,192,192,0.22)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:border-[rgba(192,192,192,0.35)]"
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

