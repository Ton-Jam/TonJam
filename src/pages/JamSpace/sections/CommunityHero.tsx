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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full overflow-hidden bg-slate-900 border border-white/[0.03] rounded-[10px] p-6 text-white"
    >
      {/* Decorative ambient color nodes (strictly following No Glassmorphism rule, but standard flat visual background elements) */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-[#0052FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#0052FF] font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>TONJAM Hub Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Vibe together, <span className="text-[#0052FF]">{user.name}</span>!
          </h1>
          <p className="text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
            Welcome to JamSpace—the decentralized social heartbeat of TonJam. Connect directly with artists, stream live audio stems, and trade exclusive NFT tracks.
          </p>
        </div>

        {/* Dashboard Metrics Panel */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 bg-slate-950/40 p-4 rounded-[10px] border border-white/[0.02] shrink-0">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-[#0052FF]" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>
            </div>
            <span className="text-base font-extrabold text-white">{activeMembers.toLocaleString()}</span>
          </div>

          <div className="text-center px-2 border-x border-white/[0.05]">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Spaces</span>
            </div>
            <span className="text-base font-extrabold text-white">{liveSpacesCount} Live</span>
          </div>

          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <Hash className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Trends</span>
            </div>
            <span className="text-xs font-extrabold text-[#0052FF] block truncate max-w-[80px]">{trendingHashtag}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
