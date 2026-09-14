import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coins, Flame, ArrowUpRight, TrendingUp } from 'lucide-react';
import { NFTDiscussion } from '../types';
import { MOCK_NFT_DISCUSSIONS } from '../mock';
import { useAudio } from '@/contexts/AudioContext';

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
          <h2 className="section-title">NFT Collector Vault</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TON Contract Ledger</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 border-none transition-colors"
            whileHover={{ y: -2 }}
          >
            <div className="relative w-full sm:w-28 h-28 shrink-0 overflow-hidden rounded-xl bg-white/[0.02]">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold bg-[#00B4D8] text-black rounded-md tracking-wider uppercase">
                AUCTION
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">{item.timeLeft} Left</span>
                </div>
                <p className="text-xs text-zinc-400">Minted by <span className="text-zinc-200 font-semibold">{item.author}</span></p>
                
                {/* Royalty Shares & Achievements */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium border-none">
                    🍰 {item.royaltyPercent}% Royalty Share
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-[#00B4D8]/15 text-[#00B4D8] px-1.5 py-0.5 rounded-md font-medium border-none">
                    💎 Collected: {item.royaltiesEarned}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">CURRENT BID</span>
                  <span className="text-sm font-extrabold text-white font-mono">{item.currentBid}</span>
                  <span className="text-[9px] text-zinc-500 block">{item.bidsCount} Active Bids</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => placeBidSimulated(item.id)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-lg transition-colors cursor-pointer border-none"
                  >
                    Bid +15
                  </button>
                  <a
                    href={`#${item.marketplaceUrl}`}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#00B4D8] text-black hover:bg-[#00B4D8]/90 rounded-lg flex items-center gap-1 border-none transition-colors"
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
