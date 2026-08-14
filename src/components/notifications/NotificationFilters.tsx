import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Bell, 
  Music, 
  User, 
  Gem, 
  ShoppingBag, 
  Wallet, 
  Coins, 
  Heart, 
  Award, 
  Cpu 
} from 'lucide-react';
import { NotificationFilter } from './types';

interface NotificationFiltersProps {
  activeFilter: NotificationFilter;
  onChangeFilter: (filter: NotificationFilter) => void;
  className?: string;
}

interface FilterItem {
  id: NotificationFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const FILTER_ITEMS: FilterItem[] = [
  { id: 'all', label: 'All', icon: Sparkles, color: 'from-[#00F2FE] to-[#4FACFE]' },
  { id: 'unread', label: 'Unread', icon: Bell, color: 'from-[#FF0844] to-[#FFB199]' },
  { id: 'music', label: 'Music', icon: Music, color: 'from-[#6E42E5] to-[#9B51E0]' },
  { id: 'artists', label: 'Artists', icon: User, color: 'from-[#FAD961] to-[#F76B1C]' },
  { id: 'nfts', label: 'NFTs', icon: Gem, color: 'from-[#00CDAC] to-[#8DDAD3]' },
  { id: 'marketplace', label: 'Market', icon: ShoppingBag, color: 'from-[#FF5858] to-[#F09819]' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'from-[#38ef7d] to-[#11998e]' },
  { id: 'rewards', label: 'Rewards', icon: Coins, color: 'from-[#ff9966] to-[#ff5e62]' },
  { id: 'social', label: 'Social', icon: Heart, color: 'from-[#ea384d] to-[#d31027]' },
  { id: 'tasks', label: 'Tasks', icon: Award, color: 'from-[#f12711] to-[#f5af19]' },
  { id: 'system', label: 'System', icon: Cpu, color: 'from-[#141e30] to-[#243b55]' },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeFilter,
  onChangeFilter,
  className = '',
}) => {
  return (
    <div 
      className={`
        w-full flex gap-2.5 overflow-x-auto no-scrollbar 
        py-2 px-4 select-none touch-pan-x
        ${className}
      `}
    >
      {FILTER_ITEMS.map((filter) => {
        const FilterIcon = filter.icon;
        const isActive = activeFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChangeFilter(filter.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full
              text-xs font-black tracking-wide uppercase transition-all duration-300
              cursor-pointer shrink-0 outline-none border-none
              ${isActive 
                ? 'bg-[#0088CC] text-white shadow-[0_0_16px_rgba(0,136,204,0.45)]'
                : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-[#0088CC]/20'
              }
            `}
          >
            <FilterIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
            <span>{filter.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default NotificationFilters;
