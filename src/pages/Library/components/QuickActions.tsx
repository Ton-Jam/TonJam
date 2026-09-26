import React from 'react';
import { Heart, Download, Clock, Gem, ListMusic, Plus, ArrowDownToLine, History } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onSelectAction: (actionId: string) => void;
  likedCount: number;
  downloadCount: number;
  nftCount?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onSelectAction, 
  likedCount, 
  downloadCount,
  nftCount = 0 
}) => {
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
      id: 'my-nfts',
      title: 'My NFTs',
      subtitle: `${nftCount} owned`,
      icon: Gem,
      color: 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/15'
    },
    {
      id: 'import-playlist',
      title: 'Imported Playlists',
      subtitle: 'Spotify synced',
      icon: ArrowDownToLine,
      color: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/15'
    },
    {
      id: 'queue',
      title: 'Active Queue',
      subtitle: 'Up next',
      icon: ListMusic,
      color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/15'
    },
    {
      id: 'history',
      title: 'Timeline Log',
      subtitle: 'Full history',
      icon: History,
      color: 'text-teal-500 bg-teal-500/10 hover:bg-teal-500/15'
    },
    {
      id: 'create-playlist',
      title: 'Create Playlist',
      subtitle: 'New node mix',
      icon: Plus,
      color: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/15'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Library Destinations
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectAction(action.id)}
              className={`flex flex-col items-start p-4 rounded-[10px] border border-[#c0c0c0]/20 bg-white/[0.02] text-left transition-all cursor-pointer w-full group ${action.color}`}
            >
              <div className="p-2.5 rounded-full bg-white/10 dark:bg-black/20 mb-3 text-current group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-[10px] font-medium text-muted-foreground">{action.subtitle}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
