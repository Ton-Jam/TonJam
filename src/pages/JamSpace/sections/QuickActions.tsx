import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Radio, Users, Compass, Share2, Plus } from 'lucide-react';

interface QuickActionsProps {
  onStartPost: () => void;
  onCreateSpace: () => void;
  onJoinSpace: () => void;
  onCreateCommunity: () => void;
  onDiscoverArtists: () => void;
  onInviteFriends: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onStartPost,
  onCreateSpace,
  onJoinSpace,
  onCreateCommunity,
  onDiscoverArtists,
  onInviteFriends
}) => {
  const actions = [
    {
      id: 'start-post',
      label: 'Start Post',
      description: 'Broadcast a signal',
      icon: PlusCircle,
      color: 'text-[#0052FF]',
      bg: 'bg-[#0052FF]/10',
      action: onStartPost
    },
    {
      id: 'create-space',
      label: 'Create Space',
      description: 'Host live audio set',
      icon: Radio,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      action: onCreateSpace
    },
    {
      id: 'join-space',
      label: 'Join Space',
      description: 'Listen to active discussions',
      icon: Compass,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      action: onJoinSpace
    },
    {
      id: 'create-community',
      label: 'Create Club',
      description: 'Establish a fan lounge',
      icon: Users,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      action: onCreateCommunity
    },
    {
      id: 'discover-artists',
      label: 'Discover',
      description: 'Find verified producers',
      icon: Plus,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      action: onDiscoverArtists
    },
    {
      id: 'invite-friends',
      label: 'Invite Friends',
      description: 'Earn TON rewards',
      icon: Share2,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      action: onInviteFriends
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">⚡ Quick Launchpad</h3>
        <span className="text-[10px] font-medium text-slate-500 select-none hidden sm:inline-block">Swipe &rarr;</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth w-full -mx-1 px-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.id}
              onClick={act.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start p-4 bg-slate-900 rounded-[10px] text-left transition-colors hover:bg-slate-800/80 cursor-pointer min-w-[145px] sm:min-w-[165px] shrink-0 group select-none shadow-md shadow-black/20"
            >
              <div className={`p-2 rounded-[10px] ${act.bg} ${act.color} mb-3 transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight whitespace-nowrap">{act.label}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 leading-tight">{act.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
