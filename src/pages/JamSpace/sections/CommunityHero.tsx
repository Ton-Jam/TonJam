import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Radio, Hash } from 'lucide-react';
import { User } from '../types';

interface CommunityHeroProps {
  user: User;
  activeMembers: number;
  liveSpacesCount: number;
  trendingHashtag: string;
}

export const CommunityHero: React.FC<CommunityHeroProps> = ({
  user,
  activeMembers,
  liveSpacesCount,
  trendingHashtag
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full bg-[#0A1628] border border-[#22374D] rounded-[12px] p-5 text-white"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>JamSpace</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] font-bold">Feed</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>{activeMembers.toLocaleString()} Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#00B4D8] rounded-full" />
            <span>{liveSpacesCount} Spaces</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
