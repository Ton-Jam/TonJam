import React, { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 240;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full flex items-center select-none" id="marketplace-category-filters">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800/40 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shadow-lg pointer-events-auto md:hidden"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chips Area */}
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth w-full px-1 scroll-padding"
      >
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-wider transition-all duration-200 shrink-0 select-none border-[2px] ${
                isActive
                  ? "bg-[#0088CC] text-white border-[#0088CC] shadow-[0_0_15px_rgba(0,136,204,0.4)] font-black"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-[#0088CC]/20 border-white/10"
              }`}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800/40 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shadow-lg pointer-events-auto md:hidden"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
