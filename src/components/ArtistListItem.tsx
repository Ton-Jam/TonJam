import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck, ChevronRight } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';

interface ArtistListItemProps {
  artist: Artist;
}

const ArtistListItem: React.FC<ArtistListItemProps> = ({ artist }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();
  const isFollowing = followedUserIds.includes(artist.uid);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(artist.uid);
  };

  const handleCardClick = () => {
    navigate(`/artist/${artist.uid}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex items-center gap-2 p-2 rounded-[2px] bg-foreground/[0.02] hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full"
    >
      <div className="relative w-14 h-14 rounded-[2px] overflow-hidden flex-shrink-0 shadow-lg">
        <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">
            {artist.name}
          </h4>
          {artist.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
        </div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
          {artist.genre || 'Electronic'} • {(artist.followers || 0).toLocaleString()} Fans
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleFollowClick}
          className={`px-4 py-2 rounded-[2px] flex items-center justify-center gap-2 transition-all text-[8px] font-bold uppercase tracking-widest
            ${isFollowing 
              ? 'bg-muted/50 text-muted-foreground/80 hover:bg-muted border border-border' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
            }
          `}
        >
          {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
          <span className="hidden xs:inline">{isFollowing ? 'Following' : 'Follow'}</span>
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

export default ArtistListItem;
