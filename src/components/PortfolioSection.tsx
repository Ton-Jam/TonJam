import React, { useState } from 'react';
import { Track, NFTItem } from '@/types';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { cn } from '@/lib/utils';

interface PortfolioSectionProps {
  tracks: Track[];
  nfts: NFTItem[];
  isOwnProfile: boolean;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ tracks, nfts, isOwnProfile }) => {
  const [filter, setFilter] = useState<'All' | 'Tracks' | 'NFTs'>('All');

  const filteredItems: Array<{ type: 'track'; data: Track } | { type: 'nft'; data: NFTItem }> = [
    ...(filter === 'All' || filter === 'Tracks' ? tracks.map(t => ({ type: 'track' as const, data: t })) : []),
    ...(filter === 'All' || filter === 'NFTs' ? nfts.map(n => ({ type: 'nft' as const, data: n })) : [])
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-2xl font-bold tracking-tight">Portfolio</h3>
        <div className="flex overflow-x-auto no-scrollbar gap-1 max-w-full bg-muted/30 rounded-full p-1 border border-border flex-nowrap shrink-0 snap-x">
          {(['All', 'Tracks', 'NFTs'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap snap-center cursor-pointer",
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, i) => (
          item.type === 'track' ? (
            <TrackCard key={`track-${item.data.id}`} track={item.data} />
          ) : (
            <NFTCard key={`nft-${item.data.id}`} nft={item.data} />
          )
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No items in portfolio.</p>
        </div>
      )}
    </div>
  );
};
