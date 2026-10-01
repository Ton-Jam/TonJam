import * as React from "react";
import { NFTItem } from "@/types";
import ArtistNFTScrollCard from "@/components/artist/ArtistNFTScrollCard";
import ArtistNFTVolumeFloorChart from "@/components/artist/ArtistNFTVolumeFloorChart";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { Sparkles, Tag, Layers } from "lucide-react";

interface NftsTabProps {
  nfts: NFTItem[];
}

export const NftsTab: React.FC<NftsTabProps> = ({ nfts }) => {
  const { scrollRef: scrollRef1, handlers: handlers1 } = useHorizontalDragScroll<HTMLDivElement>();
  const { scrollRef: scrollRef2, handlers: handlers2 } = useHorizontalDragScroll<HTMLDivElement>();

  const activeListings = React.useMemo(() => {
    return nfts.filter(nft => nft.listingType === "fixed" || nft.listingType === "auction");
  }, [nfts]);

  const allCreated = nfts;

  return (
    <div className="space-y-10 animate-in fade-in" id="spotify-nfts-tab">
      
      {/* Active Listings Section (Horizontal Scroll with Hover-to-Play) */}
      <div className="space-y-4 text-left">
        <div className="flex flex-col gap-1 px-4 sm:px-6">
          <div className="flex items-center gap-2 text-purple-400">
            <Tag className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Active Marketplace Listings</h3>
          </div>
          <p className="text-xs text-zinc-400">Premium music rights, fractional royalties, and audio masters open for bids or buyout.</p>
        </div>

        {activeListings.length > 0 ? (
          <div
            ref={scrollRef1}
            {...handlers1}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4 sm:px-6 w-full snap-x snap-mandatory overscroll-x-contain select-none"
            style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory' }}
          >
            {activeListings.map(nft => (
              <div key={`active-${nft.id}`} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
                <ArtistNFTScrollCard nft={nft} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl text-center bg-white/[0.02] mx-4">
            <Sparkles className="w-6 h-6 text-zinc-500 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No active auctions or listings at the moment.</p>
          </div>
        )}
      </div>

      {/* Complete Creator Registry (Horizontal Scroll with Hover-to-Play) */}
      <div className="space-y-4 pt-4 text-left">
        <div className="flex flex-col gap-1 px-4 sm:px-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Complete Creator Ledger</h3>
          </div>
          <p className="text-xs text-zinc-400 font-normal">All creative items officially minted and signed by this artist's verified TON wallet.</p>
        </div>

        {allCreated.length > 0 ? (
          <div
            ref={scrollRef2}
            {...handlers2}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4 sm:px-6 w-full snap-x snap-mandatory overscroll-x-contain select-none"
            style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory' }}
          >
            {allCreated.map(nft => (
              <div key={`registry-${nft.id}`} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
                <ArtistNFTScrollCard nft={nft} />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 sm:px-6">
            <p className="text-xs text-zinc-400">No minted items found in this ledger.</p>
          </div>
        )}
      </div>

      {/* NFT Market Volume & Floor Price Analytics */}
      <div className="px-4 sm:px-6 pt-2">
        <ArtistNFTVolumeFloorChart nfts={nfts} />
      </div>
    </div>
  );
};

export default NftsTab;
