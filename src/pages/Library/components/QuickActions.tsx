import React from 'react';
import { Heart, Download, Clock, Wifi, History, ListMusic, Plus, ArrowDownToLine } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onSelectAction: (actionId: string) => void;
  likedCount: number;
  downloadCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction, likedCount, downloadCount }) => {
  const actions = [
    {
      id: 'liked',
      title: 'Liked Songs',
      subtitle: `${likedCount} tracks`,
      icon: Heart,
      color: 'text-pink-500 bg-pink-500/10 hover:bg-pink-500/15'
    },
    {
      id: 'downloads',
      title: 'Downloads',
      subtitle: `${downloadCount} tracks`,
      icon: Download,
      color: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15'
    },
    {
      id: 'recently-played',
      title: 'Recently Played',
      subtitle: 'Audio history',
      icon: Clock,
      color: 'text-[#0052FF] bg-[#0052FF]/10 hover:bg-[#0052FF]/15'
    },
    {
      id: 'queue',
      title: 'Queue',
      subtitle: 'Up next',
      icon: ListMusic,
      color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/15'
    },
    {
      id: 'history',
      title: 'Listening History',
      subtitle: 'Detailed timeline',
      icon: History,
      color: 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/15'
    },
    {
      id: 'offline',
      title: 'Offline Mode',
      subtitle: 'Locally cached',
      icon: Wifi,
      color: 'text-teal-500 bg-teal-500/10 hover:bg-teal-500/15'
    },
    {
      id: 'create-playlist',
      title: 'Create Playlist',
      subtitle: 'Start compiling',
      icon: Plus,
      color: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/15'
    },
    {
      id: 'import-playlist',
      title: 'Import Playlist',
      subtitle: 'Spotify / TON sync',
      icon: ArrowDownToLine,
      color: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/15'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectAction(action.id)}
              className={`flex flex-col items-start p-4 rounded-[10px] border border-black/5 dark:border-white/5 bg-white/[0.02] dark:bg-white/[0.02] text-left transition-all cursor-pointer w-full group ${action.color}`}
            >
              <div className="p-2.5 rounded-full bg-white/10 dark:bg-black/20 mb-3 text-current group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">{action.title}</h4>
                <p className="text-[10px] font-medium text-muted-foreground">{action.subtitle}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
