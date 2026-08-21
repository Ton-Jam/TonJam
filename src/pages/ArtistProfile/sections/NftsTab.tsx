import * as React from "react";
import { NFTItem } from "@/types";
import NFTCard from "@/components/NFTCard";
import { Sparkles, Tag, Layers } from "lucide-react";

interface NftsTabProps {
  nfts: NFTItem[];
}

export const NftsTab: React.FC<NftsTabProps> = ({ nfts }) => {
  const activeListings = React.useMemo(() => {
    return nfts.filter(nft => nft.listingType === "fixed" || nft.listingType === "auction");
  }, [nfts]);

  const allCreated = nfts;

  return (
    <div className="space-y-10 animate-in fade-in" id="spotify-nfts-tab">
      
      {/* Active Listings Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-purple-400">
            <Tag className="w-4 h-4" />
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-widest text-[11px]">Active Marketplace Listings</h3>
          </div>
          <p className="text-xs text-neutral-400">Premium music rights, fractional royalties, and audio masters open for bids or buyout.</p>
        </div>

        {activeListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeListings.map(nft => (
              <NFTCard key={`active-${nft.id}`} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl text-center bg-neutral-900/30">
            <Sparkles className="w-6 h-6 text-neutral-500 mb-2" />
            <p className="text-xs text-neutral-400">No active auctions or listings at the moment.</p>
          </div>
        )}
      </div>

      {/* Complete Creator Registry */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-widest text-[11px]">Complete Creator Ledger</h3>
          </div>
          <p className="text-xs text-neutral-400 font-normal">All creative items officially minted and signed by this artist's verified TON wallet.</p>
        </div>

        {allCreated.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allCreated.map(nft => (
              <NFTCard key={`registry-${nft.id}`} nft={nft} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No minted items found in this ledger.</p>
        )}
      </div>
    </div>
  );
};
