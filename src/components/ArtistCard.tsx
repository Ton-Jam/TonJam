import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ArtistCardProps {
  artist?: Artist;
  variant?: 'default' | 'row' | 'compact';
  className?: string;
  isLoading?: boolean;
}

const variantConfig = {
    default: {
      container: 'flex flex-col items-center text-center h-full w-full p-4 rounded-sm bg-muted/10 hover:bg-muted/20 transition-all min-w-[140px] sm:min-w-[160px]',
      image: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
      button: 'mt-2 px-4 py-2 text-[10px] w-full',
      name: 'text-sm sm:text-base',
    },
  row: {
    container: 'flex items-center gap-4 p-3 rounded-[12px] hover:bg-muted/50 w-full transition-all bg-card/10',
    image: 'w-14 h-14',
    button: 'px-3 py-2 text-[9px]',
    name: 'text-sm',
  },
  compact: {
    container: 'flex flex-col items-center text-center p-3 rounded-[16px] bg-muted/10 hover:bg-muted/20 w-[140px] transition-all',
    image: 'w-18 h-18',
    button: 'w-full py-2 text-[9px]',
    name: 'text-[11px]',
  },
};

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, variant = 'default', className = '', isLoading = false }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();
  const config = variantConfig[variant];

  if (isLoading || !artist) {
    return (
      <div className={`group ${config.container} ${className}`}>
        <div className={`relative mb-2 ${config.image}`}>
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <Skeleton className={`h-4 w-3/4 mb-2 ${config.name}`} />
        {variant !== 'row' && <Skeleton className="h-3 w-1/2 mb-2" />}
        <Skeleton className={`${config.button} rounded-full w-full`} />
      </div>
    );
  }

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
      className={`group cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${config.container} ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`View artist: ${artist.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className={`relative mb-2 ${config.image}`}>
        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
          <img 
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className={cn("flex flex-col min-w-0 w-full mb-1", variant === 'row' ? "items-start" : "items-center text-center")}>
        <div className={cn("flex items-center gap-1.5 max-w-full overflow-hidden", variant === 'row' ? "justify-start" : "justify-center")}>
          <h3 className={cn("font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate", config.name)}>
            {artist.name}
          </h3>
          {artist.verified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          )}
        </div>
        
        {variant !== 'row' && (
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            {artist.followers.toLocaleString()} Followers
          </p>
        )}
      </div>
      
      <button 
        onClick={handleFollowClick}
        className={`${config.button} rounded-full flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
          ${isFollowing 
            ? 'bg-muted text-muted-foreground/60 hover:bg-muted/80' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
          }
        `}
        aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
      >
        {variant === 'default' && (isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />)}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default ArtistCard;
