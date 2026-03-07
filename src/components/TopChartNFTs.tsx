import React from 'react';
import { NFTItem } from '@/types';
import ChartNFTCard from './ChartNFTCard';
import { ArrowRight } from 'lucide-react';

interface TopChartNFTsProps {
  nfts: NFTItem[];
  title: string;
}

const TopChartNFTs: React.FC<TopChartNFTsProps> = ({ nfts, title }) => {
  const top4 = [...nfts].slice(0, 4);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-[12px] p-8 space-y-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em]">{title}</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full border border-blue-600/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Live_Feed</span>
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        {top4.map((nft, idx) => (
          <ChartNFTCard key={nft.id} nft={nft} rank={idx + 1} />
        ))}
      </div>
      
      <button className="w-full py-4 text-[9px] font-bold uppercase text-white/30 tracking-[0.3em] hover:text-blue-500 transition-all border-t border-white/5 pt-8 flex items-center justify-center gap-3 group/btn"> 
        VIEW FULL ANALYTICS <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default TopChartNFTs;
