import * as React from "react";
import { NFTCollectionData } from "../types";
import { Layers, Users, TrendingUp, Compass } from "lucide-react";
import { toast } from "sonner";

interface CollectionsTabProps {
  collections: NFTCollectionData[];
}

export const CollectionsTab: React.FC<CollectionsTabProps> = ({ collections }) => {
  const handleViewCollection = (name: string) => {
    toast(`Opening collection registry for: ${name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="collections-tab-root">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Minted NFT Collections</h3>
        <p className="text-xs text-neutral-400">Decentralized catalogs organizing the artist's digital outputs on TON.</p>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div 
              key={col.id}
              onClick={() => handleViewCollection(col.name)}
              className="bg-neutral-900/40 hover:bg-neutral-900/80 p-4 rounded-2xl space-y-4 cursor-pointer group transition-all shadow-md"
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-950">
                <img 
                  src={col.coverUrl} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{col.name}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-neutral-950/60 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block">Volume</span>
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#1DB954]" /> {col.volume}
                  </span>
                </div>
                
                <div className="bg-neutral-950/60 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block">Floor</span>
                  <span className="text-xs font-bold text-purple-400 font-mono">{col.floorPrice}</span>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block">Owners</span>
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" /> {col.owners.toLocaleString()}
                  </span>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block">Items</span>
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" /> {col.items}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-neutral-900/30 rounded-2xl text-center space-y-3">
          <Compass className="w-8 h-8 text-neutral-500" />
          <h4 className="text-base font-semibold text-white">No Collections Found</h4>
          <p className="text-xs text-neutral-400 max-w-xs">This artist hasn't indexed their NFTs into formal collections yet.</p>
        </div>
      )}
    </div>
  );
};
