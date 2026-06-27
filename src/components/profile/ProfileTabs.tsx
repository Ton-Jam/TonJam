import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OverviewTab } from './OverviewTab';
import { TracksTab } from './TracksTab';
import { NFTTab } from './NFTTab';
import { PlaylistTab } from './PlaylistTab';
import { ActivityTab } from './ActivityTab';
import { AboutTab } from './AboutTab';
import { UserProfile } from '../../types';

interface ProfileTabsProps {
  user: UserProfile;
}

const tabs = ['Overview', 'Tracks', 'NFTs', 'Playlists', 'Activity', 'About'];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto border-b border-[var(--border)] px-4 mb-4 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${
              activeTab === tab ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="h-0.5 bg-[var(--primary)] mt-3" />
            )}
          </button>
        ))}
      </div>
      
      <div className="px-4">
        {activeTab === 'Overview' && <OverviewTab user={user} />}
        {activeTab === 'Tracks' && <TracksTab user={user} />}
        {activeTab === 'NFTs' && <NFTTab user={user} />}
        {activeTab === 'Playlists' && <PlaylistTab user={user} />}
        {activeTab === 'Activity' && <ActivityTab user={user} />}
        {activeTab === 'About' && <AboutTab user={user} />}
      </div>
    </div>
  );
};
