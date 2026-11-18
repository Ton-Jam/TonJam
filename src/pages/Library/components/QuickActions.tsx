import React from 'react';
import { Heart, Download, Clock, Gem, ListMusic, Plus, ArrowDownToLine, History, ChevronRight, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onSelectAction: (actionId: string) => void;
  likedCount: number;
  downloadCount: number;
  nftCount?: number;
  localCount?: number;
  queueCount?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  likedCount,
  downloadCount,
  nftCount = 0,
  localCount = 0,
  queueCount = 0
}) => {
  const actions = [
    {
      id: 'liked',
      title: 'Liked Songs',
      subtitle: `${likedCount} ${likedCount === 1 ? 'track' : 'tracks'}`,
      icon: Heart,
      color: 'text-pink-400 bg-pink-500/12'
    },
    {
      id: 'downloads',
      title: 'Downloads',
      subtitle: `${downloadCount} cached offline`,
      icon: Download,
      color: 'text-emerald-400 bg-emerald-500/12'
    },
    {
      id: 'local-files',
      title: 'Device & Local Music',
      subtitle: localCount > 0 ? `${localCount} device ${localCount === 1 ? 'track' : 'tracks'}` : 'Scan local folders',
      icon: HardDrive,
      color: 'text-amber-400 bg-amber-400/12'
    },
    {
      id: 'recently-played',
      title: 'Recently Played',
      subtitle: 'Recent streams',
      icon: Clock,
      color: 'text-[var(--tj-color-brand-primary,#00B4D8)] bg-[var(--tj-color-brand-primary,#00B4D8)]/12'
    },
    {
      id: 'my-nfts',
      title: 'My NFTs',
      subtitle: `${nftCount} owned`,
      icon: Gem,
      color: 'text-purple-400 bg-purple-500/12'
    },
    {
      id: 'import-playlist',
      title: 'Imported Playlists',
      subtitle: 'Spotify synced',
      icon: ArrowDownToLine,
      color: 'text-indigo-400 bg-indigo-500/12'
    },
    {
      id: 'queue',
      title: 'Active Queue',
      subtitle: queueCount > 0 ? `${queueCount} ${queueCount === 1 ? 'track' : 'tracks'} queued` : 'Empty queue',
      icon: ListMusic,
      color: 'text-amber-400 bg-amber-500/12'
    },
    {
      id: 'history',
      title: 'Timeline Log',
      subtitle: 'Full history',
      icon: History,
      color: 'text-teal-400 bg-teal-500/12'
    },
    {
      id: 'create-playlist',
      title: 'Create Playlist',
      subtitle: 'New compilation',
      icon: Plus,
      color: 'text-sky-400 bg-sky-500/12'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-bold text-[var(--tj-color-text-muted,#7F91AA)] uppercase tracking-widest">
          Library Destinations
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectAction(action.id)}
              className="flex items-center justify-between min-h-[60px] p-3 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-left transition-colors cursor-pointer w-full group select-none border-0 shadow-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-[var(--tj-radius-md,8px)] ${action.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] tracking-tight leading-snug truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] font-normal truncate mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--tj-color-text-muted,#7F91AA)] group-hover:text-[var(--tj-color-text-primary,#F8FAFC)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
