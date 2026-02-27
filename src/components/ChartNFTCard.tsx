import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronUp } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_ARTISTS } from '@/constants';

interface ChartNFTCardProps {
  nft: NFTItem;
  rank: number;
}

const ChartNFTCard: React.FC<ChartNFTCardProps> = ({ nft, rank }) => {
  const navigate = useNavigate();
  const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);

  return (
    <div
      onClick={() => navigate(`/nft/${nft.id}`)}
      className="flex items-center gap-4 p-3 rounded-[10px] hover:bg-white/5 transition-all cursor-pointer group w-full"
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        <span className={`text-lg font-bold tracking-tighter ${rank <= 3 ? 'text-blue-500' : 'text-white/20'}`}>
          {rank}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[10px] overflow-hidden flex-shrink-0 ">
        <img
          src={nft.imageUrl}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={nft.title}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
          {nft.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
            {nft.creator}
          </p>
          {artist?.verified && (
            <CheckCircle2 className="h-2 w-2 text-blue-500" />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center justify-end gap-1.5 mb-1">
          <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
          <span className="text-sm font-bold text-white tracking-tighter">{nft.price}</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-widest text-green-400">
          <ChevronUp className="h-2 w-2" />
          <span>{Math.floor(Math.random() * 20 + 5)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChartNFTCard;