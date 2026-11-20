import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
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
    <div className="w-full bg-[#121824] py-3 rounded-[var(--tj-radius-sm,8px)] mb-8">
      <div className="flex items-center justify-between px-3 mb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF3A5C]" />
            Live Auctions Ending Soon
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-2">
        {activeAuctions.map((nft) => (
          <div 
            key={nft.id}
            onClick={() => navigate(`/nft/${nft.id}`)}
            className="flex items-center gap-3 bg-[#182032] p-3 rounded-[var(--tj-radius-sm,8px)] cursor-pointer hover:bg-[#1f2940] transition-colors min-w-[280px]"
          >
            <img src={nft.imageUrl} referrerPolicy="no-referrer" alt={nft.title} className="w-12 h-12 rounded-[var(--tj-radius-compact,5px)] object-cover" />
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
