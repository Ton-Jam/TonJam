import React from 'react';
import { NFTItem } from '@/types';
import ChartNFTCard from './ChartNFTCard';

interface TopChartNFTsProps {
  nfts: NFTItem[];
  title: string;
}

const TopChartNFTs: React.FC<TopChartNFTsProps> = ({ nfts, title }) => {
  const top4 = [...nfts].slice(0, 4);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[5px] p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
        {top4.map((nft, idx) => (
          <div key={nft.id} className="min-w-[240px]">
            <ChartNFTCard nft={nft} rank={idx + 1} />
          </div>
        ))}
      </div>
      
      <button className="w-full py-3 text-[8px] font-bold uppercase text-blue-500 tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6"> 
        View Full Charts 
      </button>
    </div>
  );
};

export default TopChartNFTs;
