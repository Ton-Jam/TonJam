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
            className={`pill border-0 !border-none relative px-3.5 py-1.5 shrink-0 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden outline-none ${
              isActive
                ? 'active bg-[#00B4D8] text-white'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12]'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="relative z-10 transition-colors">
              {filter.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

