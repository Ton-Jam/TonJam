import React from 'react';
import { NFTItem } from '@/types';
import NFTCard from '@/components/NFTCard';

interface ArtistNFTsSectionProps {
  artistNFTs: NFTItem[];
  isOwnProfile: boolean;
  onNFTAction: (nft: NFTItem) => void;
}

const ArtistNFTsSection: React.FC<ArtistNFTsSectionProps> = ({
  artistNFTs,
  isOwnProfile,
  onNFTAction,
}) => {
  return (
    <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar animate-in slide-in-from-right-4 duration-500">
      {artistNFTs.map(n => (
        <div key={n.id} className="min-w-[280px] sm:min-w-[320px]">
          <NFTCard 
            nft={n} 
            onAction={isOwnProfile ? onNFTAction : undefined}
          />
        </div>
      ))}
      {artistNFTs.length === 0 && (
        <div className="w-full py-4 text-center bg-card rounded-[10px]">
          <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">No assets detected.</p>
        </div>
      )}
    </div>
  );
};

export default ArtistNFTsSection;
