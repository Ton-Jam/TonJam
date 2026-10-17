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
              className={`flex-shrink-0 snap-start h-8 px-3.5 text-xs font-semibold rounded-full cursor-pointer transition-all border-none select-none active:scale-95 ${
                isActive
                  ? 'bg-[#00B4D8] text-white shadow-md shadow-[#00B4D8]/20'
                  : 'bg-[#0A1628] text-[#C2C7CD] hover:text-white hover:bg-[#0F1C32]'
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

