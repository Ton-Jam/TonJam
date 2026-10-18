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
      const scrollAmount = 200;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full flex items-center select-none" id="marketplace-category-filters">
      {/* Scroll Left Button on mobile if needed */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 w-7 h-7 rounded-full bg-[#0A1628]/90 border border-[#22374D] text-[#C2C7CD] hover:text-white flex items-center justify-center transition-colors pointer-events-auto sm:hidden shadow-md"
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pill Filter Container */}
      <div
        ref={containerRef}
        role="group"
        aria-label="NFT category filters"
        className="flex gap-2.5 overflow-x-auto py-1.5 no-scrollbar scroll-smooth w-full px-1 scrollbar-none"
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
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] ${
                isActive
                  ? "bg-[#00B4D8] text-[#FFFFFF] shadow-sm shadow-[#00B4D8]/25 font-bold"
                  : "bg-[#0A1628] text-[#C2C7CD] border border-[#22374D] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button on mobile if needed */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 w-7 h-7 rounded-full bg-[#0A1628]/90 border border-[#22374D] text-[#C2C7CD] hover:text-white flex items-center justify-center transition-colors pointer-events-auto sm:hidden shadow-md"
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CategoryFilters;
