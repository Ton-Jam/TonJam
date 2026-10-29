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
    <div className="w-full overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-2 min-w-max px-1">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 ${
                isActive
                  ? 'bg-[#2E8CEB] text-white shadow-sm'
                  : 'bg-white/[0.05] text-[#91A8C5] hover:bg-white/[0.08] hover:text-[#F5F7FB]'
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
