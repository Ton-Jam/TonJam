import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronUp } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_ARTISTS, MOCK_USER } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';

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
      className="flex items-center gap-2 p-2 rounded-[2px] hover:bg-muted/50 transition-all cursor-pointer group w-full"
    >
      {/* Rank */}
      <div className="w-6 text-center flex-shrink-0">
        <span className={`text-xl font-bold tracking-tighter font-mono ${rank <= 3 ? 'text-primary' : 'text-muted-foreground/10'}`}>
          {rank.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-14 h-14 rounded-[2px] overflow-hidden flex-shrink-0">
        <img
          src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          alt={nft.title}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.05em] truncate group-hover:text-primary transition-colors">
          {nft.title}
        </h4>
        <div className="flex items-center gap-2 mt-2 min-w-0">
          <p 
            className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest truncate hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (artist) {
                navigate(`/artist/${artist.uid}`);
              } else if (nft.creator === MOCK_USER.name) {
                navigate('/profile');
              }
            }}
          >
            {nft.creator}
          </p>
          {artist?.verified && (
            <CheckCircle2 className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center justify-end gap-2 mb-2">
          <img src={TON_LOGO} className="w-3.5 h-3.5" alt="TON" />
          <span className="text-sm font-bold text-foreground tracking-tighter font-mono">{nft.price}</span>
        </div>
        <div className="flex items-center justify-end gap-2 text-[8px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
          <ChevronUp className="h-2 w-2" />
          <span>+{Math.floor(Math.random() * 20 + 5)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChartNFTCard;