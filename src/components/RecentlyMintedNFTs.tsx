import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNFT } from '@/contexts/NFTContext';
import { NFTItem } from '@/types';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { NFTCard } from '@/components/music';
import { getPlaceholderImage } from '@/lib/utils';

interface RecentlyMintedNFTsProps {
  title?: string;
  className?: string;
}

const RecentlyMintedNFTs: React.FC<RecentlyMintedNFTsProps> = ({ 
  title = "Recently Added", 
  className = "" 
}) => {
  const { nfts, mintingStatus } = useNFT();
  const { scrollRef: scrollContainerRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const recentNFTs = useMemo(() => {
    const list: NFTItem[] = [...(nfts || [])];

    Object.values(mintingStatus || {}).forEach((status) => {
      if (status.step === 'completed' && status.trackId) {
        const existing = list.find(n => n.trackId === status.trackId);
        if (!existing) {
          list.unshift({
            id: `mint-${status.trackId}-${status.timestamp || Date.now()}`,
            trackId: status.trackId,
            title: status.title || 'Newly Minted Track',
            artist: status.artist || 'TonJam Creator',
            creator: status.artist || 'TonJam Creator',
            owner: 'Creator',
            price: status.price || '0',
            imageUrl: status.coverUrl || getPlaceholderImage(`nft-${status.trackId}`),
            edition: status.editions ? `1 of ${status.editions}` : 'Genesis',
            rarity: 'Rare',
            artistVerified: true,
            createdAt: new Date(status.timestamp || Date.now()).toISOString()
          });
        }
      }
    });

    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [nfts, mintingStatus]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!recentNFTs || recentNFTs.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="mx-4 sm:mx-6 lg:mx-8 p-6 rounded-2xl bg-[#0A113A]/40 text-center flex flex-col items-center gap-2">
          <Sparkles className="w-5 h-5 text-slate-500" />
          <p className="text-xs text-slate-400">No recently minted Music NFTs yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-ping" />
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
          <span className="text-[10px] font-semibold text-[#00B4D8] uppercase tracking-wider bg-[#00B4D8]/10 px-2 py-0.5 rounded-full">
            Live Mints
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        {...handlers}
        className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-0.5 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full scroll-smooth snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        {recentNFTs.map((nft, idx) => {
          const displayPrice = nft.price?.toLowerCase().includes('ton')
            ? nft.price.replace(/ton/i, '').trim()
            : (nft.price || '0');

          return (
            <motion.div
              key={nft.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.24), ease: 'easeOut' }}
              className="w-[175px] sm:w-[195px] shrink-0 snap-start"
            >
              <NFTCard
                nft={{
                  ...nft,
                  price: displayPrice,
                }}
                variant="sale"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyMintedNFTs;
