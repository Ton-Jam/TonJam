import React from 'react';
import { Artist, Track, NFTItem } from '@/types';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import { MOCK_NFTS } from '@/constants';

interface ArtistPortfolioProps {
  artist: Artist;
  tracks: Track[];
}

export const ArtistPortfolio: React.FC<ArtistPortfolioProps> = ({ artist, tracks }) => {
  const pinnedNFTs = artist.pinnedNftIds 
    ? MOCK_NFTS.filter(nft => artist.pinnedNftIds?.includes(nft.id))
    : [];

  return (
    <div className="space-y-12 animate-in fade-in">
      {/* Biography Section */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight mb-4">Biography</h3>
        <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
            {artist.bio || "No biography provided yet. This creator is building the soundscapes of the future."}
        </p>
      </section>
      
      {/* Pinned NFTs Section */}
      {pinnedNFTs.length > 0 && (
         <section>
           <h3 className="text-2xl font-bold tracking-tight mb-6">Pinned NFTs</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {pinnedNFTs.map(nft => <NFTCard key={nft.id} nft={nft} />)}
           </div>
         </section>
      )}

      {/* Discography Section */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight mb-6">Discography</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map(track => <TrackCard key={track.id} track={track} />)}
        </div>
      </section>
    </div>
  );
};
