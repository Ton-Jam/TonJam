import React, { useState } from 'react';
import { Search, SlidersHorizontal, Eye, ExternalLink, BadgeCheck } from 'lucide-react';

interface NFTAsset {
  id: string;
  title: string;
  creator: string;
  coverUrl: string;
  edition: string;
  valueTon: number;
  contractAddress: string;
}

interface NFTTabProps {
  onSelectNFT: (nftId: string) => void;
}

const MOCK_NFTS_LIST: NFTAsset[] = [
  { id: 'nft_1', title: 'Sonic Resonance #04', creator: 'DJ Krupy', coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&h=400&q=80', edition: '04/25', valueTon: 15.0, contractAddress: 'EQCt...5_fN' },
  { id: 'nft_2', title: 'Ethereal Escape #12', creator: 'DJ Starlight', coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=400&q=80', edition: '12/50', valueTon: 8.5, contractAddress: 'EQAx...9k1w' },
  { id: 'nft_3', title: 'Retro Wave #09', creator: 'Cyber Beats', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&h=400&q=80', edition: '09/100', valueTon: 25.0, contractAddress: 'EQBv...K5w9' },
  { id: 'nft_4', title: 'Cyberpunk Skyline #01', creator: 'Aero Static', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&h=400&q=80', edition: '01/10', valueTon: 75.0, contractAddress: 'EQD3...W3Fi' }
];

export const NFTTab: React.FC<NFTTabProps> = ({ onSelectNFT }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNfts = MOCK_NFTS_LIST.filter(nft =>
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
            className="w-full bg-[#101A3B] border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0052FF] transition-all placeholder:text-slate-500"
          />
        </div>
        <button className="p-2.5 bg-[#101A3B] border border-white/5 rounded-full hover:bg-[#15234f] transition-all cursor-pointer">
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
              className="bg-[#101A3B] border border-white/5 rounded-[12px] overflow-hidden group hover:bg-[#15234f] transition-all cursor-pointer flex flex-col h-full"
            >
              {/* Cover Aspect Ratio Square */}
              <div className="aspect-square w-full bg-slate-900 overflow-hidden relative">
                <img 
                  src={nft.coverUrl} 
                  alt={nft.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
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
                    <BadgeCheck className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">Valuation</span>
                  <span className="font-bold text-[#0052FF] font-mono">{nft.valueTon} TON</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-[#101A3B] border border-white/5 rounded-[12px] p-6 text-slate-400 text-sm font-semibold uppercase tracking-wider">
            No digital assets found in your vault.
          </div>
        )}
      </div>
    </div>
  );
};
