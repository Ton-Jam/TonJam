import React from 'react';
import { Library, Music, Download, ListMusic, Wallet, Image as ImageIcon, Award, Settings, ChevronRight } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    { icon: Library, label: 'My Library' },
    { icon: Music, label: 'Liked Songs' },
    { icon: Download, label: 'Downloads' },
    { icon: ListMusic, label: 'My Playlists' },
    { icon: Wallet, label: 'Wallet' },
    { icon: ImageIcon, label: 'My NFTs' },
    { icon: Award, label: 'Rewards' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {actions.map((action, i) => (
        <button key={i} className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-all">
          <div className="flex items-center gap-3">
            <action.icon size={20} className="text-[var(--primary)]" />
            <span className="text-sm font-medium">{action.label}</span>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)]" />
        </button>
      ))}
    </div>
  );
};
