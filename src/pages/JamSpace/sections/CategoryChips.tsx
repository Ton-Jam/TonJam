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
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">🏷️ Filter Channels</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex-shrink-0 snap-start px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-all border-[2px] ${
                isActive
                  ? 'bg-[#0088CC] border-[#0088CC] text-white shadow-[0_0_15px_rgba(0,136,204,0.4)]'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-[#0088CC]/20'
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
