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

interface Ripple {
  id: number;
  x: number;
  y: number;
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

  const [ripples, setRipples] = React.useState<Record<string, Ripple[]>>({});

  const triggerRipple = (tabId: string, event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in event) {
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const newRipple: Ripple = {
      id: Math.random() + Date.now(),
      x,
      y,
    };
    
    setRipples((prev) => ({
      ...prev,
      [tabId]: [...(prev[tabId] || []), newRipple],
    }));
  };

  const clearRipple = (tabId: string, rippleId: number) => {
    setRipples((prev) => ({
      ...prev,
      [tabId]: (prev[tabId] || []).filter((r) => r.id !== rippleId),
    }));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-opaque pb-[calc(env(safe-area-inset-bottom,0px)+12px)] select-none">
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
              onMouseDown={(e) => triggerRipple(tab.id, e)}
              onTouchStart={(e) => triggerRipple(tab.id, e)}
              className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer group overflow-hidden"
              aria-label={tab.label}
            >
              {/* Native-like Ripple Container */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {(ripples[tab.id] || []).map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    onAnimationComplete={() => clearRipple(tab.id, ripple.id)}
                    className="absolute bg-blue-500/25 rounded-full pointer-events-none"
                    style={{
                      top: ripple.y - 20,
                      left: ripple.x - 20,
                      width: 40,
                      height: 40,
                    }}
                  />
                ))}
              </div>

              {/* Springy Active Background Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute inset-x-2 top-1.5 bottom-1.5 bg-blue-500/10 rounded-xl -z-10"
                />
              )}

              {/* Icon Container with active scaling */}
              <div className="relative pointer-events-none">
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
                  text-[9px] font-bold uppercase tracking-widest mt-1 transition-colors pointer-events-none
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
