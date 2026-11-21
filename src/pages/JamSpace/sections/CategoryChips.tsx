import React from 'react';

interface CategoryChipsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Filter Channels</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              aria-pressed={isActive}
              className={`filter-btn filter-chip filter-silver-border border-silver-2 border-2 flex-shrink-0 snap-start h-8 px-3.5 text-xs font-semibold rounded-full cursor-pointer transition-all select-none active:scale-95 ${
                isActive
                  ? 'active bg-[#00B4D8] border-[rgba(192,192,192,0.35)] text-white shadow-md shadow-[#00B4D8]/20'
                  : 'bg-[#0A1628] border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white hover:bg-[#0F1C32] hover:border-[rgba(192,192,192,0.35)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

