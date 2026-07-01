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
            className="relative px-4 py-2 shrink-0 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors duration-200"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 bg-[#0052FF] rounded-full z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              {filter.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
