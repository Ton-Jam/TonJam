import React from 'react';
import { motion } from 'motion/react';
import { 
  Library, 
  Heart, 
  Download, 
  FolderHeart, 
  Wallet, 
  Gem, 
  Trophy, 
  Settings as SettingsIcon, 
  ChevronRight 
} from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (actionId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    { id: 'library', title: 'My Library', icon: <Library className="w-5 h-5 text-[#0052FF]" /> },
    { id: 'liked', title: 'Liked Songs', icon: <Heart className="w-5 h-5 text-red-400" /> },
    { id: 'downloads', title: 'Downloads', icon: <Download className="w-5 h-5 text-slate-300" /> },
    { id: 'playlists', title: 'My Playlists', icon: <FolderHeart className="w-5 h-5 text-indigo-400" /> },
    { id: 'wallet', title: 'Wallet', icon: <Wallet className="w-5 h-5 text-[#0052FF]" /> },
    { id: 'nfts', title: 'My NFTs', icon: <Gem className="w-5 h-5 text-slate-300" /> },
    { id: 'rewards', title: 'Rewards', icon: <Trophy className="w-5 h-5 text-amber-500" /> },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onActionClick(action.id)}
          className="bg-[#101A3B] border border-white/5 rounded-[12px] p-4 flex items-center justify-between text-left group transition-all cursor-pointer w-full"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 p-1 bg-white/5 rounded-md">
              {action.icon}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              {action.title}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-all" />
        </motion.button>
      ))}
    </div>
  );
};
