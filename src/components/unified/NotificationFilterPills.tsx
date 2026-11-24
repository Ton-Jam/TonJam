import React from 'react';
import { NotificationFilterType } from './types';

interface NotificationFilterPillsProps {
  activeFilter: NotificationFilterType;
  onFilterChange: (filter: NotificationFilterType) => void;
  unreadCount?: number;
}

const FILTERS: { id: NotificationFilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified_artists', label: 'Verified Artists' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'music_nfts', label: 'Music & NFTs' },
];

export const NotificationFilterPills: React.FC<NotificationFilterPillsProps> = ({
  activeFilter,
  onFilterChange,
  unreadCount = 0,
}) => {
  return (
    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar py-1 select-none touch-pan-x">
      <div className="flex items-center gap-2 min-w-max pr-4">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              aria-pressed={isActive}
              className={`filter-btn filter-pill filter-silver-border border-silver-2 border-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'active bg-[#2E8CEB] border-[rgba(192,192,192,0.35)] text-white shadow-sm'
                  : 'bg-white/[0.05] border-[rgba(192,192,192,0.22)] text-[#91A8C5] hover:bg-white/[0.08] hover:text-[#F5F7FB] hover:border-[rgba(192,192,192,0.35)]'
              }`}
            >
              <span>{f.label}</span>
              {f.id === 'all' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationFilterPills;
