import React, { useState } from 'react';
import { Track, NFTItem, Artist } from '@/types';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { cn } from '@/lib/utils';
import { Gem, Disc } from 'lucide-react';

interface PortfolioSectionProps {
  artist: Artist;
  tracks: Track[];
  nfts: NFTItem[];
  isOwnProfile: boolean;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ artist, tracks, nfts, isOwnProfile }) => {
  return (
    <div className="space-y-12 animate-in fade-in">
      {/* Biography Section */}
      <section className="bg-[#18181b]/20 p-8 rounded-3xl">
        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground mb-4">Biography</h3>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {artist.bio || "No biography provided yet."}
        </p>
      </section>

      {/* Discography Section (Tracks as NFTs or standard) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">Discography</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map(track => (
            <TrackCard key={`port-track-${track.id}`} track={track} />
          ))}
          {tracks.length === 0 && <p className="text-sm text-muted-foreground">No tracks yet.</p>}
        </div>
      </section>

      {/* Pinned NFTs Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">Pinned NFT Creations</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.slice(0, 4).map(nft => (
            <NFTCard key={`port-nft-${nft.id}`} nft={nft} />
          ))}
          {nfts.length === 0 && <p className="text-sm text-muted-foreground">No NFTs created yet.</p>}
        </div>
      </section>
    </div>
  );
};
