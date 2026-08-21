import React from "react";
import { Sparkles, Play, Pause, Heart, MessageCircle } from "lucide-react";
import { NFTItem } from "@/types";
import NFTCard from "@/components/NFTCard";

interface RecentlyMintedProps {
  nfts: NFTItem[];
}

export const RecentlyMinted: React.FC<RecentlyMintedProps> = ({ nfts }) => {
  return (
    <div className="w-full" id="marketplace-recently-minted">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Recently Minted Tracks
          </h2>
        </div>
      </div>

      {/* Grid of newly minted items */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {nfts.map((nft) => (
          <div key={nft.id} className="relative group">
            {/* Corner Animated NEW Badge */}
            <div className="absolute top-4 left-4 z-10 select-none pointer-events-none">
              <span className="bg-[#00B4D8] text-zinc-950 text-[8px] font-black px-2.5 py-0.5 rounded-[4px] uppercase tracking-widest animate-pulse">
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
