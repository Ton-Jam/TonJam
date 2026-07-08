import React from 'react';
import { Zap, Tag, Coins, Award, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LibraryNFT } from '../types';

interface NFTCollectionProps {
  nfts: LibraryNFT[];
  totalFloorValue: number;
}

export const NFTCollection: React.FC<NFTCollectionProps> = ({ nfts, totalFloorValue }) => {
  const navigate = useNavigate();

  const getRarityColor = (rarity: LibraryNFT['rarity']) => {
    switch (rarity) {
      case 'Legendary': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Epic': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Rare': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mini NFT collection stats header */}
      <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-[10px] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Music NFT Vault</h3>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-sm">
            Decentralized audio artifacts secured on The Open Network (TON). Earn active royalty rewards.
          </p>
        </div>

        {/* Stats box */}
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Owned NFTs</span>
            <p className="text-base font-black text-purple-400 font-mono leading-none">{nfts.length} Items</p>
          </div>
          <div className="h-8 w-[1px] bg-purple-500/10" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Est. Vault Value</span>
            <p className="text-base font-black text-amber-400 font-mono leading-none flex items-center gap-1">
              <Coins className="w-4 h-4 shrink-0" />
              <span>{totalFloorValue} TON</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Collectibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <motion.div
            key={nft.id}
            whileHover={{ y: -4 }}
            className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex flex-col justify-between group relative"
          >
            {/* Cover art image */}
            <div className="relative aspect-video w-full rounded-[10px] overflow-hidden mb-3.5 bg-slate-800">
              <img src={nft.coverUrl} alt={nft.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              
              {/* Floating rarity & contract checks */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </span>
                <span className="bg-black/60 text-emerald-400 p-1 rounded-full border border-emerald-500/10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Token ID */}
              <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md text-slate-300">
                {nft.tokenId}
              </span>
            </div>

            {/* Details details */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-purple-400 uppercase font-bold tracking-wider">{nft.collectionName}</span>
                <h4 className="text-xs font-black text-foreground truncate">{nft.title}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Artist: {nft.artist}</p>
              </div>

              {/* Price & Royalties specs */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-mono">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold">Floor Price</span>
                  <p className="font-bold text-amber-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{nft.floorPriceTon} TON</span>
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold">Your Royalty</span>
                  <p className="font-bold text-indigo-400 flex items-center justify-end gap-1">
                    <Award className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{nft.royaltyPercent}% splits</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct routing button */}
            <button
              onClick={() => navigate(`/nft/${nft.id}`)}
              className="mt-4 w-full py-2 bg-purple-500/10 hover:bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Collectible</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Primary marketplace CTA button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => navigate('/marketplace')}
          className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-widest rounded-[10px] transition-all cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <span>Open NFT Marketplace</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
