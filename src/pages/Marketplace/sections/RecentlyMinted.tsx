import React from "react";
import { Sparkles } from "lucide-react";
import { NFTItem } from "@/types";
import NFTCard from "@/components/NFTCard";

interface RecentlyMintedProps {
  nfts: NFTItem[];
}

export const RecentlyMinted: React.FC<RecentlyMintedProps> = ({ nfts }) => {
  return (
    <div className="w-full text-left" id="marketplace-recently-minted">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0088CC]" />
            Recently Minted Tracks
          </h2>
        </div>
      </div>

      {/* Grid of newly minted items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
        {nfts.map((nft) => (
          <div key={nft.id} className="relative group">
            {/* Corner NEW Badge */}
            <div className="absolute top-2 left-2 z-10 select-none pointer-events-none">
              <span className="bg-[#0088CC] text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                New
              </span>
            </div>
            
            <NFTCard
              nft={{ ...nft, owner: 'marketplace' } as any}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
