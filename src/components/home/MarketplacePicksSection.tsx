import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronRight } from "lucide-react";
import NFTCard from "@/components/NFTCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { useNFT } from "@/contexts/NFTContext";

export interface MarketplacePick {
  id: string;
  title: string;
  artist: string;
  price: string;
  likes: number;
  image: string;
  badge: string;
}

export const MarketplacePicksSection: React.FC<{ picks?: MarketplacePick[] }> = ({ picks }) => {
  const navigate = useNavigate();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();
  const { nfts } = useNFT();

  const resolvedPicks = useMemo(() => {
    if (picks && picks.length > 0) return picks;
    return nfts.slice(0, 8).map((n) => ({
      id: n.id,
      title: n.title,
      artist: n.artist || n.creator,
      price: n.price || '0',
      likes: n.likes || 0,
      image: n.imageUrl || n.coverUrl || '',
      badge: n.isAuction ? 'Auction' : 'Listed',
      rawNft: n,
    }));
  }, [picks, nfts]);

  if (resolvedPicks.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            Top Marketplace Picks
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/nfts?title=Top+Marketplace+Picks&filter=top_nfts")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
      >
        {resolvedPicks.map((pick: any) => (
          <div
            key={pick.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <NFTCard 
              nft={pick.rawNft || {
                id: pick.id,
                trackId: pick.id,
                title: pick.title,
                owner: pick.artist,
                creator: pick.artist,
                artist: pick.artist,
                price: pick.price,
                imageUrl: pick.image,
                edition: '1/1',
                description: '',
                isAuction: false
              } as any}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarketplacePicksSection;
