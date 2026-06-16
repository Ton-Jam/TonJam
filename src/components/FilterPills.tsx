import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FilterPillsProps {
  selectedGenre: string | null;
  onSelect: (category: string | null) => void;
  isLoading?: boolean;
}

const CATEGORY_PILLS = [
  'All',
  'Trending',
  'Playlists',
  'Albums',
  'Artists',
  'Podcasts',
  'Live'
];

export const FilterPills: React.FC<FilterPillsProps> = ({
  selectedGenre,
  onSelect,
  isLoading = false,
}) => {
  // Skeleton Loader State
  if (isLoading) {
    const skeletonWidths = [
      'w-12',
      'w-20',
      'w-22',
      'w-18',
      'w-16',
      'w-24',
      'w-14'
    ];

    return (
      <div className="filter-wrapper select-none">
        <div className="filter-scroll">
          {skeletonWidths.map((width, index) => (
            <div
              key={`skeleton-pill-${index}`}
              className="pill pointer-events-none opacity-40 relative overflow-hidden bg-[#0a113a]/50 border-white/5"
            >
              <div className={cn("h-4 rounded bg-white/10 animate-pulse", width)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeCategory = selectedGenre || 'All';

  return (
    <div className="filter-wrapper select-none">
      <div className="filter-scroll">
        {CATEGORY_PILLS.map((category) => {
          const isSelected = activeCategory === category;
          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(category === 'All' ? null : category)}
              className={cn(
                "pill relative z-10 overflow-hidden",
                isSelected && "active"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="activePillBackground"
                  className="absolute inset-0 bg-[#5B6BFF] -z-10 rounded-full"
                  style={{ originY: '0px' }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPills;
