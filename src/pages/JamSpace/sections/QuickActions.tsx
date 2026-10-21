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
      label: 'New Post',
      icon: PlusCircle,
      color: 'text-[#00B4D8]',
      bg: 'bg-[#00B4D8]/10',
      action: onStartPost
    },
    {
      id: 'create-space',
      label: 'Host Space',
      icon: Radio,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      action: onCreateSpace
    },
    {
      id: 'join-space',
      label: 'Join Space',
      icon: Compass,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      action: onJoinSpace
    },
    {
      id: 'create-community',
      label: 'Create Club',
      icon: Users,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      action: onCreateCommunity
    },
    {
      id: 'discover-artists',
      label: 'Discover',
      icon: Plus,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      action: onDiscoverArtists
    },
    {
      id: 'invite-friends',
      label: 'Invite',
      icon: Share2,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      action: onInviteFriends
    }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth w-full -mx-1 px-1">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <motion.button
            key={act.id}
            onClick={act.action}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0A1628] border border-[#22374D] rounded-full text-left transition-colors hover:bg-[#0F1C32] cursor-pointer shrink-0 group select-none"
          >
            <div className={`p-1.5 rounded-full ${act.bg} ${act.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight whitespace-nowrap">{act.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
