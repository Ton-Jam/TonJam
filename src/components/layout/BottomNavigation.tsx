import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, Store, Headphones, User } from 'lucide-react';

export type TabId = 'jamup' | 'discover' | 'marketplace' | 'library' | 'profile';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  badges?: Partial<Record<TabId, string | number>>;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  badges = {},
}) => {
  const tabs: TabItem[] = [
    { id: 'jamup', label: 'Jam Up', icon: Sparkles, badge: badges.jamup },
    { id: 'discover', label: 'Discover', icon: Compass, badge: badges.discover },
    { id: 'marketplace', label: 'Market', icon: Store, badge: badges.marketplace },
    { id: 'library', label: 'Library', icon: Headphones, badge: badges.library },
    { id: 'profile', label: 'Profile', icon: User, badge: badges.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#07080B]/85 backdrop-blur-2xl pb-safe-bottom select-none">
      {/* Top micro gloss line for subtle alignment (NO border line) */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

      <div className="max-w-lg mx-auto h-[64px] px-2 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer group"
              aria-label={tab.label}
            >
              {/* Springy Active Background Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute inset-x-2 top-1.5 bottom-1.5 bg-blue-500/10 rounded-xl -z-10"
                />
              )}

              {/* Icon Container with active scaling */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1.0,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Status Badges */}
                {tab.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 bg-red-500 text-white font-black text-[8px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </div>

              {/* Text label */}
              <span
                className={`
                  text-[9px] font-bold uppercase tracking-widest mt-1 transition-colors
                  ${isActive ? 'text-blue-400 font-black' : 'text-slate-400'}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNavigation;
