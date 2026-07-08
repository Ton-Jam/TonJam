import React, { useState } from 'react';
import { Gem, ArrowUpRight, ShieldCheck, Hammer } from 'lucide-react';
import { motion } from 'motion/react';
import { NFTItem } from '@/types';
import { useToast } from '@/components/layout/ToastProvider';
import { BuyNFTButton } from '../visitor/BuyNFTButton';

interface NFTSectionProps {
  nfts: NFTItem[];
  isOwnProfile?: boolean;
}

export const NFTSection: React.FC<NFTSectionProps> = ({
  nfts,
  isOwnProfile = false
}) => {
  const toast = useToast();

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12 bg-[#101A3B]/40 border border-white/5 rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
        No collectibles owned or listed
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Decentralized Music Collectibles ({nfts.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <motion.div
            key={nft.id}
            className="bg-[#101A3B] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Header */}
            <div className="relative aspect-square w-full bg-slate-900">
              <img
                src={nft.imageUrl || nft.coverUrl}
                alt={nft.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-3 left-3 bg-slate-950/70 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>Verified Contract</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {nft.artist || 'TonJam Original'}
                </span>
                <h4 className="text-sm font-bold text-white mt-1 leading-tight">{nft.title}</h4>
                
                {/* Description or Meta */}
                {nft.description && (
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {nft.description}
                  </p>
                )}
              </div>

              {/* Price / Ledger stats */}
              <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Floor Price</span>
                  <span className="text-xs font-bold text-slate-200">{nft.price || '12.5'} TON</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Rarity</span>
                  <span className="text-xs font-bold text-purple-400">Rare #0{nft.id.slice(-2)}</span>
                </div>
              </div>

              {/* Actions row */}
              {!isOwnProfile ? (
                <BuyNFTButton 
                  nftId={nft.id} 
                  nftName={nft.title} 
                  priceTon={parseFloat(nft.price || '12.5')} 
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toast.info('Transfer Asset', 'Triggering transfer of Web3 token address...')}
                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => toast.info('List for Sale', 'Open listing details & set floor prices...')}
                    className="py-2.5 px-3 bg-[#0052FF] hover:bg-[#0040D9] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NFTSection;
