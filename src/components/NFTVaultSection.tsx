import React, { useState } from 'react';
import { NFTItem } from '@/types';
import NFTCard from './NFTCard';
import SellNFTModal from './SellNFTModal';
import SendNFTModal from './SendNFTModal';

interface NFTVaultSectionProps {
  nfts: NFTItem[];
}

const NFTVaultSection: React.FC<NFTVaultSectionProps> = ({ nfts }) => {
  const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
  const [selectedNftForSending, setSelectedNftForSending] = useState<NFTItem | null>(null);

  const handleNFTAction = (nft: NFTItem) => {
    setSelectedNftForListing(nft);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
      <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-8">My Sonic Vault</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {nfts.map(nft => (
          <NFTCard 
            key={nft.id} 
            nft={nft} 
            onAction={handleNFTAction} 
          />
        ))}
      </div>

      {selectedNftForListing && (
        <SellNFTModal nft={selectedNftForListing} onClose={() => setSelectedNftForListing(null)} />
      )}
      {selectedNftForSending && (
        <SendNFTModal nft={selectedNftForSending} onClose={() => setSelectedNftForSending(null)} />
      )}
    </section>
  );
};

export default NFTVaultSection;
