import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NFTItem } from '../types';
import { TON_LOGO } from '../constants';

interface TopChartNFTsProps {
  nfts: NFTItem[];
  title?: string;
}

const TopChartNFTs: React.FC<TopChartNFTsProps> = ({ nfts, title = "Top Chart NFTs" }) => {
  const navigate = useNavigate();

  // Sort by price or offers to simulate a top chart ranking
  const rankedNfts = [...nfts].sort((a, b) => {
    const scoreA = (a.offers?.length || 0) * 10 + parseFloat(a.price);
    const scoreB = (b.offers?.length || 0) * 10 + parseFloat(b.price);
    return scoreB - scoreA;
  }).slice(0, 10);

  return (
    <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 electric-blue-bg rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
          <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">
            {title}
          </h2>
        </div>
        <button className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2">
          Full Chart <i className="fas fa-arrow-right text-[7px]"></i>
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        {rankedNfts.map((nft, index) => (
          <div 
            key={nft.id}
            onClick={() => navigate(`/nft/${nft.id}`)}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
          >
            {/* Rank */}
            <div className="w-8 text-center flex-shrink-0">
              <span className={`text-lg font-black tracking-tighter ${index < 3 ? 'text-blue-500' : 'text-white/20'}`}>
                {index + 1}
              </span>
            </div>

            {/* Image */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img src={nft.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={nft.title} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
                {nft.title}
              </h4>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest truncate mt-0.5">
                {nft.creator}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                <span className="text-sm font-black text-white tracking-tighter">{nft.price}</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-[8px] font-black uppercase tracking-widest text-green-400">
                <i className="fas fa-caret-up"></i>
                <span>{Math.floor(Math.random() * 20 + 5)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopChartNFTs;
