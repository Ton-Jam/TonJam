import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { UserProfile } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface ChartArtistCardProps {
  artist: UserProfile;
  rank: number;
}

const ChartArtistCard: React.FC<ChartArtistCardProps> = ({ artist, rank }) => {
  const navigate = useNavigate();
  const isUp = Math.random() > 0.3;
  const trendValue = Math.floor(Math.random() * 20 + 1);

  return (
    <div
      onClick={() => navigate(`/artist/${artist.uid}`)}
      className="flex items-center gap-2 p-2 rounded-sm hover:bg-muted/50 transition-all cursor-pointer group w-full"
    >
      {/* Rank */}
      <div className="w-6 text-center flex-shrink-0">
        <span className={`text-xl font-bold tracking-tighter font-mono ${rank <= 3 ? 'text-primary' : 'text-muted-foreground/10'}`}>
          {rank.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={artist.avatar || getPlaceholderImage(`artist-${artist.uid}`)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          alt={artist.name}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.05em] truncate group-hover:text-primary transition-colors flex items-center gap-1">
          {artist.name}
          {artist.isVerifiedArtist && (
             <div className="w-1.5 h-1.5 bg-primary rounded-full ml-1 flex-shrink-0"></div>
          )}
        </h4>
        <div className="flex items-center gap-2 mt-2 min-w-0">
          <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest truncate">
            {artist.followers || Math.floor(Math.random() * 10000)} Followers
          </p>
        </div>
      </div>

      {/* Trend */}
      <div className="text-right flex-shrink-0">
        <div className={`flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          <span>{isUp ? '+' : '-'}{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

export default ChartArtistCard;
