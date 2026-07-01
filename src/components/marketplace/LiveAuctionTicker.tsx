import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';
import { AuctionCountdownTimer } from '../AuctionCountdownTimer';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';

export const LiveAuctionTicker: React.FC = () => {
  const { allNFTs } = useAudio();
  const navigate = useNavigate();

  const activeAuctions = useMemo(() => {
    return allNFTs.filter(
      (nft) =>
        nft.listingType === 'auction' &&
        nft.auctionEndTime &&
        new Date(nft.auctionEndTime).getTime() > Date.now()
    ).slice(0, 5); // Take first 5 active auctions
  }, [allNFTs]);

  if (activeAuctions.length === 0) return null;

  return (
    <div className="w-full bg-[#0A113A]/60 py-3 border-y border-white/[0.04] mb-8">
      <div className="flex items-center justify-between px-4 md:px-8 mb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF3A5C]" />
            Live Auctions Ending Soon
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-4 md:px-8">
        {activeAuctions.map((nft) => (
          <div 
            key={nft.id}
            onClick={() => navigate(`/nft/${nft.id}`)}
            className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] transition-colors min-w-[280px]"
          >
            <img src={nft.imageUrl} alt={nft.title} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-white uppercase truncate">{nft.title}</span>
                <AuctionCountdownTimer nft={nft} variant="mini" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
