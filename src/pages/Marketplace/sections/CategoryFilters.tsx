import React, { useRef } from "react";
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
        className="absolute left-0 z-10 w-7 h-7 rounded-[3px] bg-[#0A0A0A] border border-white/12 text-white/70 hover:text-white flex items-center justify-center transition-colors pointer-events-auto md:hidden shadow-none"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chips Area */}
      <div
        ref={containerRef}
        role="group"
        aria-label="NFT category filters"
        className="flex gap-2 overflow-x-auto py-1.5 no-scrollbar scroll-smooth w-full px-0"
      >
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              aria-pressed={isActive}
              aria-label={`Filter by ${cat}`}
              className={`category-filter-btn px-3.5 py-1.5 rounded-[3px] text-[11px] font-medium tracking-wide transition-all duration-200 shrink-0 select-none border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0088CC] cursor-pointer shadow-none ${
                isActive
                  ? "active scale-105 bg-[#0088CC] text-white border-[#0088CC] font-semibold"
                  : "bg-[#0A0A0A] text-white/70 hover:text-white hover:border-white/25 border-white/12 hover:scale-[1.02]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 w-7 h-7 rounded-[3px] bg-[#0A0A0A] border border-white/12 text-white/70 hover:text-white flex items-center justify-center transition-colors pointer-events-auto md:hidden shadow-none"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CategoryFilters;
