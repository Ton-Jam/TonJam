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
      subtitle: `${likedCount} tracks`,
      icon: Heart,
      color: 'text-pink-500 bg-pink-500/10'
    },
    {
      id: 'downloads',
      title: 'Downloads',
      subtitle: `${downloadCount} tracks`,
      icon: Download,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'local-files',
      title: 'Device & Local Music',
      subtitle: localCount > 0 ? `${localCount} device tracks` : 'Play from local folders',
      icon: HardDrive,
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      id: 'recently-played',
      title: 'Recently Played',
      subtitle: 'Audio history',
      icon: Clock,
      color: 'text-[#0052FF] bg-[#0052FF]/10'
    },
    {
      id: 'my-nfts',
      title: 'My NFTs',
      subtitle: `${nftCount} owned`,
      icon: Gem,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      id: 'import-playlist',
      title: 'Imported Playlists',
      subtitle: 'Spotify synced',
      icon: ArrowDownToLine,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      id: 'queue',
      title: 'Active Queue',
      subtitle: queueCount > 0 ? `${queueCount} tracks queued` : 'Empty queue',
      icon: ListMusic,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'history',
      title: 'Timeline Log',
      subtitle: 'Full history',
      icon: History,
      color: 'text-teal-500 bg-teal-500/10'
    },
    {
      id: 'create-playlist',
      title: 'Create Playlist',
      subtitle: 'New node mix',
      icon: Plus,
      color: 'text-sky-500 bg-sky-500/10'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Library Destinations
        </h3>
      </div>
      <div className="flex flex-col space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectAction(action.id)}
              className="flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.07] text-left transition-all cursor-pointer w-full group shadow-sm select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-[10px] ${action.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate group-hover:text-[#0088CC] transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{action.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
