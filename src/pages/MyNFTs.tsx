import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import NFTCard from '@/components/NFTCard';
import ManageNFTModal from '@/components/ManageNFTModal';
import { Sparkles } from 'lucide-react';
import { NFTItem } from '@/types';

const MyNFTs: React.FC = () => {
  const { userNFTs } = useAudio();
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleManage = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setIsManageModalOpen(true);
  };

  return (
    <div className="p-4 lg:p-8 space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.5em]">Collector Protocol</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tighter uppercase">My NFTs</h1>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userNFTs && userNFTs.length > 0 ? (
          userNFTs.map((nft) => (
            <NFTCard 
              key={nft.id} 
              nft={nft} 
              onAction={nft.listingType ? () => handleManage(nft) : undefined}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center glass border border-border/50 rounded-[10px]">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter">No NFTs Found</h3>
            <p className="text-muted-foreground/80 text-sm mt-2">Your collection is currently empty.</p>
          </div>
        )}
      </section>

      {selectedNFT && (
        <ManageNFTModal 
          nft={selectedNFT} 
          isOpen={isManageModalOpen} 
          onClose={() => setIsManageModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default MyNFTs;
