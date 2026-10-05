import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Disc, Flame, Layers, Award, TrendingUp, Coins } from 'lucide-react';

interface MarketplaceQuickLaunchpadProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const MarketplaceQuickLaunchpad: React.FC<MarketplaceQuickLaunchpadProps> = ({
  onScrollToSection
}) => {
  const navigate = useNavigate();

  const launchActions = [
    {
      id: 'launchpad-drops',
      label: 'Launchpad Drops',
      description: 'Exclusive early VIP mints',
      icon: Rocket,
      color: 'text-[#00E5FF]',
      bg: 'bg-[#00E5FF]/10',
      action: () => navigate('/launchpad')
    },
    {
      id: 'mint-genesis',
      label: 'Mint Genesis',
      description: 'Forge audio master NFT',
      icon: Disc,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      action: () => navigate('/genesis-forge')
    },
    {
      id: 'live-auctions',
      label: 'Live Auctions',
      description: 'Real-time bidding on 1-of-1s',
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      action: () => {
        if (onScrollToSection) {
          onScrollToSection('marketplace-live-auctions');
        } else {
          const el = document.getElementById('marketplace-live-auctions');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'trending-collections',
      label: 'Top Collections',
      description: 'Trending albums & series',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      action: () => {
        if (onScrollToSection) {
          onScrollToSection('marketplace-trending-collections');
        } else {
          const el = document.getElementById('marketplace-trending-collections');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'top-artists',
      label: 'Top Creators',
      description: 'Verified Web3 musicians',
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      action: () => {
        if (onScrollToSection) {
          onScrollToSection('marketplace-top-artists');
        } else {
          const el = document.getElementById('marketplace-top-artists');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'floor-tracker',
      label: 'Floor Tracker',
      description: 'Historical pricing charts',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      action: () => {
        if (onScrollToSection) {
          onScrollToSection('marketplace-statistics');
        } else {
          const el = document.getElementById('marketplace-statistics');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'daily-tasks',
      label: 'Earn TJ Coins',
      description: 'Collector daily quests',
      icon: Coins,
      color: 'text-[#0088CC]',
      bg: 'bg-[#0088CC]/10',
      action: () => navigate('/tasks')
    }
  ];

  return (
    <div className="space-y-3" id="marketplace-quick-launchpad">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">⚡ Quick Launchpad</h3>
        <span className="text-[10px] font-medium text-slate-500 select-none hidden sm:inline-block">Swipe &rarr;</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth w-full -mx-1 px-1">
        {launchActions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.id}
              onClick={act.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start p-4 bg-[#0A0A0A] hover:bg-[#121212] rounded-[10px] text-left transition-colors cursor-pointer min-w-[145px] sm:min-w-[165px] shrink-0 group select-none shadow-md shadow-black/30"
            >
              <div className={`p-2 rounded-[10px] ${act.bg} ${act.color} mb-3 transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight whitespace-nowrap">{act.label}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-tight">{act.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
