import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronUp } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_ARTISTS, MOCK_USER } from '@/constants';

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
      className="flex items-center gap-5 p-4 rounded-[12px] hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer group w-full"
    >
      {/* Rank */}
      <div className="w-6 text-center flex-shrink-0">
        <span className={`text-xl font-bold tracking-tighter font-mono ${rank <= 3 ? 'text-blue-500' : 'text-white/10'}`}>
          {rank.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-14 h-14 rounded-[8px] overflow-hidden flex-shrink-0 border border-white/5">
        <img
          src={nft.imageUrl}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={nft.title}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.05em] truncate group-hover:text-blue-400 transition-colors">
          {nft.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 min-w-0">
          <p 
            className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (artist) {
                navigate(`/artist/${artist.id}`);
              } else if (nft.creator === MOCK_USER.name) {
                navigate('/profile');
              }
            }}
          >
            {nft.creator}
          </p>
          {artist?.verified && (
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center justify-end gap-2 mb-1">
          <img src={TON_LOGO} className="w-3.5 h-3.5" alt="TON" />
          <span className="text-sm font-bold text-white tracking-tighter font-mono">{nft.price}</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-500 font-mono">
          <ChevronUp className="h-2 w-2" />
          <span>+{Math.floor(Math.random() * 20 + 5)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChartNFTCard;