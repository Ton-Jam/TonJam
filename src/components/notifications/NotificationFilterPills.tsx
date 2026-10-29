import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, BadgeCheck, AtSign, Disc3 } from 'lucide-react';
import { NotificationFilter } from './types';

interface NotificationFilterPillsProps {
  activeFilter: NotificationFilter;
  onChangeFilter: (filter: NotificationFilter) => void;
  className?: string;
}

interface FilterPillConfig {
  id: NotificationFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const FILTER_PILLS: FilterPillConfig[] = [
  {
    id: 'all',
    label: 'All',
    icon: Sparkles,
    accentColor: 'text-[#229ED9]',
  },
  {
    id: 'verified_artists',
    label: 'Verified Artists',
    icon: BadgeCheck,
    accentColor: 'text-[#2DD4BF]',
  },
  {
    id: 'mentions',
    label: 'Mentions',
    icon: AtSign,
    accentColor: 'text-[#229ED9]',
  },
  {
    id: 'music_nfts',
    label: 'Music & NFTs',
    icon: Disc3,
    accentColor: 'text-[#9B7CFF]',
  },
];

export const NotificationFilterPills: React.FC<NotificationFilterPillsProps> = ({
  activeFilter,
  onChangeFilter,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-4 select-none touch-pan-x ${className}`}
      role="tablist"
      aria-label="Notification categories"
    >
      {FILTER_PILLS.map((pill) => {
        const Icon = pill.icon;
        const isActive = activeFilter === pill.id;

        return (
          <motion.button
            key={pill.id}
            role="tab"
            aria-selected={isActive}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChangeFilter(pill.id)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap outline-none
              ${
                isActive
                  ? 'bg-[#229ED9] text-white shadow-sm shadow-[#229ED9]/25 font-bold'
                  : 'bg-[#111C30] text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-[#16243E] border border-white/[0.06]'
              }
            `}
          >
            <Icon
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive ? 'text-white' : pill.accentColor
              }`}
            />
            <span>{pill.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default NotificationFilterPills;
