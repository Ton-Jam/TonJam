import React from 'react';
import { motion } from 'motion/react';
import { Zap, Heart, Disc, Users } from 'lucide-react';

const ACTIVITIES = [
  { id: 1, text: 'DJ Krupy just dropped "Solar Flare"', icon: <Zap className="w-3 h-3 text-amber-400" /> },
  { id: 2, text: 'User_442 minted Genesis NFT #82', icon: <Disc className="w-3 h-3 text-cyan-400" /> },
  { id: 3, text: 'Lofi Beats is now LIVE in Space', icon: <Users className="w-3 h-3 text-emerald-400" /> },
  { id: 4, text: '500+ Jammers listening to "Cyber Pulse"', icon: <Heart className="w-3 h-3 text-rose-400" /> },
  { id: 5, text: 'New Marketplace Collection: "Neon Dreams"', icon: <Zap className="w-3 h-3 text-purple-400" /> },
];

export const HomeVibeTicker: React.FC = () => {
  return (
    <div className="w-full bg-[#0c133a] border-y border-white/5 py-2.5 overflow-hidden flex items-center mb-8">
      <div className="shrink-0 px-4 flex items-center gap-2 border-r border-white/10 mr-4">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 animate-pulse">Live</span>
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
      </div>
      
      <motion.div 
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
            <div className="bg-white/5 p-1 rounded-md">
              {item.icon}
            </div>
            <span className="text-[10px] font-bold text-white/60 tracking-wide uppercase">
              {item.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
