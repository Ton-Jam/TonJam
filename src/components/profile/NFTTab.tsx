import React, { useState } from 'react';
import { Search, SlidersHorizontal, BadgeCheck } from 'lucide-react';
import { NFTItem } from '@/types';
import { useAudio } from '@/contexts/AudioContext';

interface NFTTabProps {
  onSelectNFT: (nftId: string) => void;
  nfts?: (NFTItem | any)[];
}

export const NFTTab: React.FC<NFTTabProps> = ({ onSelectNFT, nfts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { userNFTs } = useAudio();

  const sourceNfts = nfts !== undefined ? nfts : userNFTs;

  const displayList = (sourceNfts || []).map(nft => ({
    id: nft.id,
    title: nft.title || 'Music NFT Collectible',
    creator: nft.creator || nft.artist || 'Creator',
    coverUrl: nft.coverUrl || nft.imageUrl || nft.image || '',
    edition: nft.edition || '1/1',
    valueTon: typeof nft.price === 'number' ? nft.price : (parseFloat(nft.price || '0') || 0),
    contractAddress: nft.contractAddress || 'TON Blockchain',
    verified: !!nft.artistVerified,
  }));

  const filteredNfts = displayList.filter(nft =>
    nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-white font-sans pb-8">
      {/* Filters Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search owned NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101A3B] rounded-full pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition-all placeholder:text-slate-500"
          />
        </div>
        <button className="p-2.5 bg-[#101A3B] rounded-full hover:bg-[#15234f] transition-all cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Grid of NFTs */}
      <div className="grid grid-cols-2 gap-3">
        {filteredNfts.length > 0 ? (
          filteredNfts.map((nft) => (
            <div
              key={nft.id}
              onClick={() => onSelectNFT(nft.id)}
              className="bg-[#101A3B] rounded-[12px] overflow-hidden group hover:bg-[#15234f] transition-all cursor-pointer flex flex-col h-full"
            >
              {/* Cover Aspect Ratio Square */}
              <div className="aspect-square w-full bg-slate-900 overflow-hidden relative">
                {nft.coverUrl && (
                  <img 
                    src={nft.coverUrl} 
                    alt={nft.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider text-slate-200">
                  {nft.edition}
                </div>
              </div>

              {/* Body details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                    {nft.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                      by {nft.creator}
                    </span>
                    {nft.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />}
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">Valuation</span>
                  <span className="font-bold text-[#0052FF] font-mono">
                    {nft.valueTon > 0 ? `${nft.valueTon} TON` : 'Unlisted'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-[#101A3B] rounded-[12px] p-6 text-slate-400 text-sm font-semibold uppercase tracking-wider">
            No digital assets found in your vault.
          </div>
        )}
      </div>
    </div>
  );
};
