import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface ArtistCardProps {
  artist: Artist;
  variant?: 'default' | 'row' | 'compact';
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, variant = 'default' }) => {
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

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleCardClick}
        className="group flex flex-col items-center cursor-pointer text-center p-2 rounded-[12px] bg-muted/50 backdrop-blur-md border border-border hover:bg-muted hover:border-border/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-[130px]"
        role="button"
        tabIndex={0}
        aria-label={`View artist: ${artist.name}`}
      >
        <div className="relative w-16 h-16 mb-2">
          <img 
            src={artist.avatarUrl} 
            alt={artist.name} 
            className="w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/400'; }}
          />
        </div>
        <h3 className="text-[10px] font-bold text-foreground tracking-tight truncate w-full mb-3">{artist.name}</h3>
        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2">{artist.followers.toLocaleString()} Followers</p>
        <button 
          onClick={handleFollowClick}
          className={`w-full py-3 rounded-[6px] flex items-center justify-center gap-2 transition-all text-[8px] font-bold uppercase tracking-widest
            ${isFollowing 
              ? 'bg-muted text-muted-foreground/60 hover:bg-muted/80' 
              : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-600/20'
            }
          `}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div 
        onClick={handleCardClick}
        className="group flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View artist: ${artist.name}`}
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={artist.avatarUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/400'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">{artist.name}</h4>
        </div>
        <button 
          onClick={handleFollowClick}
          className={`px-2 py-3 rounded-full flex items-center justify-center gap-3 transition-all text-[8px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            ${isFollowing 
              ? 'bg-muted text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground' 
              : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-600/20'
            }
          `}
          aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col items-center cursor-pointer text-center h-full w-full p-2 rounded-[16px] bg-muted/50 backdrop-blur-md border border-border hover:bg-muted hover:border-border/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View artist: ${artist.name}`}
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-2 mx-auto">
        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300 relative border-2 border-border group-hover:border-primary/50">
          <img 
            src={artist.avatarUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/400'; }}
          />
        </div>
        
        {artist.verified && (
          <div className="absolute bottom-1 right-1 bg-background rounded-full p-2 z-10 border border-border">
            <CheckCircle2 className="w-4 h-4 text-primary fill-primary/20" />
          </div>
        )}
      </div>
      
      <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors truncate w-full max-w-full px-2">
        {artist.name}
      </h3>
      
      <p className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest mb-2">
        {artist.followers.toLocaleString()} Followers
      </p>
      
      <button 
        onClick={handleFollowClick}
        className={`mt-auto px-2 py-2 rounded-full flex items-center justify-center gap-2 transition-all text-[9px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
          ${isFollowing 
            ? 'bg-muted text-muted-foreground/60 hover:bg-muted/80' 
            : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-xl shadow-blue-600/20'
          }
        `}
        title={isFollowing ? "Unfollow" : "Follow"}
        aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
      >
        {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default ArtistCard;
