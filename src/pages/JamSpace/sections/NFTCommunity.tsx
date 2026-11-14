import React from 'react';
import { motion } from 'motion/react';
import { Coins, ArrowUpRight } from 'lucide-react';
import { useNFT } from '@/contexts/NFTContext';
import { useNavigate } from 'react-router-dom';

export const NFTCommunity: React.FC = () => {
  const { nfts } = useNFT();
  const navigate = useNavigate();

  const auctionNFTs = (nfts || [])
    .filter((nft) => nft.listingType === 'auction')
    .slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <h2 className="section-title">NFT Collector Vault</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TON Contract Ledger</span>
      </div>

      {auctionNFTs.length === 0 ? (
        <div className="bg-white/[0.02] rounded-2xl p-6 text-center text-xs text-zinc-400">
          No active NFT auctions in the collector vault yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auctionNFTs.map((item) => (
            <motion.div
              key={item.id}
              className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 border-none transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="relative w-full sm:w-28 h-28 shrink-0 overflow-hidden rounded-xl bg-white/[0.02]">
                <img
                  src={item.imageUrl || item.coverUrl || ''}
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
                  </div>
                  <p className="text-xs text-zinc-400">
                    Minted by <span className="text-zinc-200 font-semibold">{item.creator || item.artist}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium border-none">
                      {item.royalty ?? 10}% Royalty Share
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">PRICE</span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      {String(item.price || '0').includes('TON') ? item.price : `${item.price || 0} TON`}
                    </span>
                    <span className="text-[9px] text-zinc-500 block">
                      {Array.isArray((item as any).bids) ? (item as any).bids.length : 0} Bids
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/nft/${item.id}`)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#00B4D8] text-black hover:bg-[#00B4D8]/90 rounded-lg flex items-center gap-1 border-none transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
