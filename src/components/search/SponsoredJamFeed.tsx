import React from "react";
import { motion } from "motion/react";
import { Megaphone, ExternalLink, Play } from "lucide-react";

const SPONSORED_CONTENT = [
  { id: '1', title: 'The Sound of TON', artist: 'Blockchain Beats', banner: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80' },
  { id: '2', title: 'Genesis Mint Now', artist: 'TonJam DAO', banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
];

export const SponsoredJamFeed: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Megaphone className="w-3 h-3" /> Featured Ads
          </span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Sponsored Jam Feed</h3>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {SPONSORED_CONTENT.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className="w-72 shrink-0 bg-[#0c133a] rounded-[12px] border border-white/5 overflow-hidden group cursor-pointer"
          >
            <div className="relative h-32 w-full overflow-hidden">
              <img 
                src={item.banner} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c133a] to-transparent opacity-60" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-[6px] border border-white/10">
                <Play className="w-3 h-3 text-[#00B4D8] fill-[#00B4D8]" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Play Clip</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.artist}</p>
              </div>
              <div className="text-[#00B4D8]">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
