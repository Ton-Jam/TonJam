import React from 'react';
import { motion } from 'motion/react';

interface QuickFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'collections', label: 'Collections' },
  { id: 'genres', label: 'Genres' },
  { id: 'users', label: 'Users' },
  { id: 'auctions', label: 'Live Auctions' },
  { id: 'trending', label: 'Trending' },
  { id: 'verified', label: 'Verified' },
  { id: 'nearby', label: 'Nearby' }
];

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="w-full overflow-x-auto pb-1 select-none no-scrollbar flex gap-2">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            aria-pressed={isActive}
            className={`relative px-3.5 py-1.5 shrink-0 rounded-[6px] text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 overflow-hidden outline-none ${
              isActive
                ? 'bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/20'
                : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.1]'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 bg-[#0088CC] -z-0 rounded-[6px]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 transition-colors">
              {filter.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
