import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Search, Radio, Headphones, ShoppingBag } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';

export type TabId = 
  | 'home' 
  | 'search' 
  | 'jamspace' 
  | 'library'
  | 'marketplace'
  | 'wallet' 
  | 'profile' 
  | 'jamup' 
  | 'discover';

export interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }>;
  path: string;
  badge?: string | number;
}

export interface BottomNavigationProps {
  activeTab?: TabId;
  onTabChange?: (id: TabId) => void;
  badges?: Partial<Record<TabId, string | number>>;
  isHidden?: boolean;
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
  isHidden = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFullPlayerOpen, setFullPlayerOpen } = useAudio();

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/', badge: badges.home },
    { id: 'search', label: 'Search', icon: Search, path: '/discover', badge: badges.search ?? badges.discover },
    { id: 'jamspace', label: 'JamSpace', icon: Radio, path: '/jamspace', badge: badges.jamspace },
    { id: 'library', label: 'Library', icon: Headphones, path: '/library', badge: badges.library },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace', badge: badges.marketplace },
  ];

  const currentTab = React.useMemo<TabId>(() => {
    if (activeTab) {
      if (activeTab === 'discover') return 'search';
      if (activeTab === 'jamup') return 'home';
      return activeTab;
    }
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/discover' || path === '/search') return 'search';
    if (path.startsWith('/jamspace')) return 'jamspace';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/wallet')) return 'wallet';
    if (path.startsWith('/profile') || path.startsWith('/user/')) return 'profile';
    return 'home';
  }, [activeTab, location.pathname]);

  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});

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

  const handleTabClick = (tab: TabItem) => {
    if (isFullPlayerOpen && setFullPlayerOpen) {
      setFullPlayerOpen(false);
    }
    if (onTabChange) {
      onTabChange(tab.id);
    }
    navigate(tab.path);
  };

  return (
    <nav 
      id="tonjam-bottom-navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-[18px] border-none shadow-[0_-8px_24px_rgba(0,0,0,0.45)] pb-[calc(env(safe-area-inset-bottom,0px)+8px)] select-none transition-all duration-300 ${
        isHidden ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      aria-label="Bottom Navigation"
    >
      <div className="max-w-lg mx-auto h-[60px] px-2 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              onMouseDown={(e) => triggerRipple(tab.id, e)}
              onTouchStart={(e) => triggerRipple(tab.id, e)}
              className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] relative cursor-pointer group overflow-hidden border-none bg-transparent active:scale-95 transition-transform"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Native-like Ripple Container */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {(ripples[tab.id] || []).map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.35 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    onAnimationComplete={() => clearRipple(tab.id, ripple.id)}
                    className="absolute bg-[#00B4D8]/25 rounded-full pointer-events-none"
                    style={{
                      top: ripple.y - 20,
                      left: ripple.x - 20,
                      width: 40,
                      height: 40,
                    }}
                  />
                ))}
              </div>

              {/* Icon Container with active scaling */}
              <div className="relative pointer-events-none">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1.0,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`${isActive ? 'text-[#00B4D8]' : 'text-[#8C8C8C] group-hover:text-[#C2C7CD]'} transition-colors`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
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
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors pointer-events-none ${
                  isActive ? 'text-[#00B4D8] font-bold' : 'text-[#8C8C8C] group-hover:text-[#C2C7CD]'
                }`}
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
