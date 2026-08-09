import React from "react";
import { motion } from "motion/react";
import { Coins, ChevronRight, Gift, Trophy } from "lucide-react";

export const EarnTJPreview: React.FC = () => {
  return (
    <div className="p-6 rounded-[12px] bg-[#0c133a] relative overflow-hidden group cursor-pointer">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-[#00B4D8]/10 p-2 rounded-[8px]">
            <Coins className="w-5 h-5 text-[#00B4D8]" />
          </div>
          <div className="flex items-center gap-1.5 text-[#00B4D8]">
            <span className="text-[10px] font-black uppercase tracking-widest">Rewards</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black text-white uppercase tracking-tighter">
            Earn $TJ Tokens
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
            Listen to curated tracks, complete daily quests, and boost your ecosystem rank.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[8px]">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Top 5% Rank</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[8px]">
            <Gift className="w-3 h-3 text-[#00B4D8]" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Weekly AirDrop</span>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#00B4D8]/5 blur-3xl rounded-full transition-all group-hover:bg-[#00B4D8]/10" />
    </div>
  );
};
