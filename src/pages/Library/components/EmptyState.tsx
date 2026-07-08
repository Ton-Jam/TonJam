import React from 'react';
import { Music, Download, Zap, Disc, WifiOff, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  type: 'library' | 'downloads' | 'nfts' | 'playlists' | 'offline';
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, actionText }) => {
  const config = {
    library: {
      icon: Music,
      title: 'Your Library is Empty',
      description: 'Start exploring TonJam and save your favorite tracks, albums, or artists directly on-chain.',
      color: 'text-[#0052FF] bg-[#0052FF]/10'
    },
    downloads: {
      icon: Download,
      title: 'No Offline Audio',
      description: 'Download tracks and albums so you can stream high-fidelity lossless tunes without any cellular network.',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    nfts: {
      icon: Zap,
      title: 'No NFTs Collected',
      description: 'Own your music. Buy digital audio collectibles and premium limited-edition albums to earn instant royalty splits.',
      color: 'text-purple-500 bg-purple-500/10'
    },
    playlists: {
      icon: Disc,
      title: 'No Custom Playlists',
      description: 'Create curated soundwaves and share them with the TON community. Compile your favorite decentralized nodes.',
      color: 'text-pink-500 bg-pink-500/10'
    },
    offline: {
      icon: WifiOff,
      title: 'You are Offline',
      description: 'Your internet link is down. Streaming is currently locked, but your local downloads are ready to spin.',
      color: 'text-amber-500 bg-amber-500/10'
    }
  }[type];

  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-black/5 dark:border-white/5 rounded-[10px] bg-black/[0.01] dark:bg-white/[0.01] max-w-md mx-auto my-6 space-y-4"
    >
      <div className={`p-4 rounded-full ${config.color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground tracking-tight">{config.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
      </div>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all cursor-pointer"
        >
          {type === 'playlists' && <Plus className="w-4 h-4" />}
          <span>{actionText}</span>
        </button>
      )}
    </motion.div>
  );
};
