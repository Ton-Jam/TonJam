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
              className={`flex-shrink-0 snap-start h-8 px-3.5 text-xs font-medium rounded-full cursor-pointer transition-all border select-none active:scale-95 ${
                isActive
                  ? 'bg-[#00B4D8] text-black font-semibold shadow-md shadow-[#00B4D8]/20 border-[#c0c0c0]/40'
                  : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.09] border-[#c0c0c0]/25'
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

