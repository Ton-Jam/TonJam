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
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {top4.map((nft, idx) => (
          <ChartNFTCard key={nft.id} nft={nft} rank={idx + 1} />
        ))}
      </div>
      
      <button className="w-full py-3 text-[8px] font-bold uppercase text-blue-500 tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6"> 
        View Full Charts 
      </button>
    </div>
  );
};

export default TopChartNFTs;
