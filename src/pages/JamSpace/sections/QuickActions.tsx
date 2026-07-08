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
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">⚡ Quick Launchpad</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.id}
              onClick={act.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start p-4 bg-slate-900 border border-white/[0.03] rounded-[10px] text-left transition-colors hover:bg-slate-800/80 cursor-pointer w-full group"
            >
              <div className={`p-2 rounded-[10px] ${act.bg} ${act.color} mb-3 transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">{act.label}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 leading-tight">{act.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
