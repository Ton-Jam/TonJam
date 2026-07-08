import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coins, Flame, ArrowUpRight, TrendingUp } from 'lucide-react';
import { NFTDiscussion } from '../types';
import { MOCK_NFT_DISCUSSIONS } from '../mock';
import { useAudio } from '@/context/AudioContext';

export const NFTCommunity: React.FC = () => {
  const { addNotification } = useAudio();
  const [items, setItems] = useState<NFTDiscussion[]>(MOCK_NFT_DISCUSSIONS);

  const placeBidSimulated = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const bidNum = parseFloat(item.currentBid.split(' ')[0]);
        const newBid = (bidNum + 15).toFixed(0);
        addNotification(`Bid submitted! Current high bid is now ${newBid} TON`, 'success');
        return {
          ...item,
          currentBid: `${newBid} TON`,
          bidsCount: item.bidsCount + 1
        };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">NFT Collector Vault</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TON Contract Ledger</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-4 flex flex-col sm:flex-row gap-4"
            whileHover={{ y: -2 }}
          >
            <div className="relative w-full sm:w-28 h-28 shrink-0 overflow-hidden rounded-[10px] bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold bg-[#0052FF]/80 text-white rounded-[10px] tracking-wider uppercase">
                AUCTION
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.timeLeft} Left</span>
                </div>
                <p className="text-xs text-slate-400">Minted by <span className="text-slate-300 font-semibold">{item.author}</span></p>
                
                {/* Royalty Shares & Achievements */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    🍰 {item.royaltyPercent}% Royalty Share
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-[#0052FF]/10 text-blue-300 px-1.5 py-0.5 rounded border border-[#0052FF]/20">
                    💎 Collected: {item.royaltiesEarned}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.02]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">CURRENT BID</span>
                  <span className="text-sm font-extrabold text-white font-mono">{item.currentBid}</span>
                  <span className="text-[9px] text-slate-500 block">{item.bidsCount} Active Bids</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => placeBidSimulated(item.id)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-750 text-white rounded-[10px] transition-colors cursor-pointer"
                  >
                    Bid +15
                  </button>
                  <a
                    href={`#${item.marketplaceUrl}`}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#0052FF] text-white hover:bg-[#0052FF]/90 rounded-[10px] flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
