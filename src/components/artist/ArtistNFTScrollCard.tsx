import React from 'react';
import { NFTItem } from '@/types';
import NFTCard from '@/components/NFTCard';

interface ArtistNFTScrollCardProps {
  nft: NFTItem;
  onAction?: (nft: NFTItem) => void;
}

export const ArtistNFTScrollCard: React.FC<ArtistNFTScrollCardProps> = ({ nft, onAction }) => {
  return (
    <div className="w-[168px]">
      <NFTCard nft={nft} onAction={onAction} />
    </div>
  );
};

export default ArtistNFTScrollCard;
