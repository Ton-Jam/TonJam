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
      className="relative w-full overflow-hidden bg-blue-950 border border-white/5 rounded-[12px] p-8 text-white shadow-2xl"
    >
      {/* Decorative ambient color nodes */}
      <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4" />
            <span>TonJam Community Nexus</span>
          </div>
          <h1 className="tonjam-hero text-white">
            The heart of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Decentralized Music</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
            Broadcast your vibe, join live audio spaces, and connect with the world's most innovative artists and collectors on the TON blockchain.
          </p>
          
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{activeMembers.toLocaleString()} Jammers Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{liveSpacesCount} Live Spaces</span>
            </div>
          </div>
        </div>

        {/* Floating Trending Badge */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white/5 backdrop-blur-md p-6 rounded-[16px] border border-white/10 shrink-0 w-full lg:w-auto"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Trending Frequency</span>
              <Hash className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tighter">{trendingHashtag}</div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">+12.4% Volatility</div>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
