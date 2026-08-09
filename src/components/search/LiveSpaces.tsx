import React from "react";
import { motion } from "motion/react";
import { Radio, Users, Volume2 } from "lucide-react";

const LIVE_SPACES = [
  { id: '1', title: 'TON Summer Mix', listeners: 1204, host: 'DJKrupy', category: 'Live Mix' },
  { id: '2', title: 'NFT Artist Talk', listeners: 842, host: 'TonLady', category: 'Podcast' },
  { id: '3', title: 'DeFi & Beats', listeners: 450, host: 'CryptoFlow', category: 'Community' },
];

export const LiveSpaces: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3 h-3 animate-pulse" /> Live Now
          </span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Live Spaces</h3>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {LIVE_SPACES.map((space) => (
          <motion.div
            key={space.id}
            whileHover={{ y: -2 }}
            className="w-48 shrink-0 bg-[#0c133a] rounded-[12px] p-4 flex flex-col justify-between aspect-square cursor-pointer group"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-[4px] font-black uppercase tracking-wider">
                  LIVE
                </span>
                <div className="flex items-center gap-1 text-slate-500 text-[8px] font-bold">
                  <Users className="w-3 h-3" />
                  <span>{space.listeners}</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-2 pt-2 group-hover:text-[#00B4D8] transition-colors">
                {space.title}
              </h4>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Host: {space.host}
              </p>
              <div className="flex items-center gap-2 text-[8px] text-[#00B4D8] font-black uppercase tracking-widest">
                <Volume2 className="w-3 h-3" />
                <span>Join Space</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
