import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck, ChevronRight } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface ArtistListItemProps {
  artist: Artist;
}

const ArtistListItem: React.FC<ArtistListItemProps> = ({ artist }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();
  const isFollowing = followedUserIds.includes(artist.id);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(artist.id);
  };

  const handleCardClick = () => {
    navigate(`/artist/${artist.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex items-center gap-4 p-3 rounded-[10px] bg-foreground/[0.02] border border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-lg border border-border/50">
        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">
            {artist.name}
          </h4>
          {artist.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
        </div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
          {artist.genre || 'Electronic'} • {(artist.followers || 0).toLocaleString()} Fans
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleFollowClick}
          className={`px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-all text-[8px] font-bold uppercase tracking-widest border
            ${isFollowing 
              ? 'bg-muted/50 border-border text-muted-foreground/80 hover:bg-muted hover:text-foreground' 
              : 'bg-blue-600 border-blue-500 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-600/20'
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
