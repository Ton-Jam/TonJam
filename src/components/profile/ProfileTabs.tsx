import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface ProfileTabsProps {
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'activity', label: 'Activity' },
    { id: 'following', label: 'Following' },
    { id: 'about', label: 'About' },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  // Center active tab on mobile scroll
  useEffect(() => {
    const activeElement = document.getElementById(`tab-trigger-${activeTab}`);
    if (activeElement && containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div 
      ref={containerRef}
      className="w-full flex gap-1.5 overflow-x-auto no-scrollbar py-2 px-1 select-none scroll-smooth"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-trigger-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] cursor-pointer whitespace-nowrap shrink-0 z-10"
          >
            {/* Animated Tab Indicator (Flat pill background, no borders) */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#0052FF] rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            
            <span className={isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
