import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';

interface ArtistCardProps {
  artist: Artist;
  variant?: 'default' | 'row' | 'compact';
  className?: string;
}

const variantConfig = {
  default: {
    container: 'flex flex-col items-center text-center h-full w-full p-2 rounded-[16px] bg-muted/50 backdrop-blur-md hover:bg-muted',
    image: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    button: 'mt-auto px-2 py-2 text-[9px]',
    name: 'text-sm sm:text-base',
  },
  row: {
    container: 'flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 w-full',
    image: 'w-12 h-12',
    button: 'px-2 py-3 text-[8px]',
    name: 'text-xs',
  },
  compact: {
    container: 'flex flex-col items-center text-center p-2 rounded-[12px] bg-muted/50 backdrop-blur-md hover:bg-muted w-[130px]',
    image: 'w-16 h-16',
    button: 'w-full py-3 text-[8px]',
    name: 'text-[10px]',
  },
};

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, variant = 'default', className = '' }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();
  const isFollowing = followedUserIds.includes(artist.id);
  const config = variantConfig[variant];

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
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.id}`)} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>
        {variant === 'default' && artist.verified && (
          <div className="absolute bottom-1 right-1 z-10">
            <CheckCircle2 className="w-5 h-5 text-blue-500 fill-background" />
          </div>
        )}
      </div>
      
      <h3 className={`font-bold text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors truncate w-full ${config.name}`}>
        {artist.name}
        {variant !== 'default' && artist.verified && <CheckCircle2 className="w-3 h-3 text-blue-500 inline ml-1" />}
      </h3>
      
      {variant !== 'row' && (
        <p className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest mb-2">
          {artist.followers.toLocaleString()} Followers
        </p>
      )}
      
      <button 
        onClick={handleFollowClick}
        className={`${config.button} rounded-full flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
          ${isFollowing 
            ? 'bg-muted text-muted-foreground/60 hover:bg-muted/80' 
            : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-xl shadow-blue-600/20'
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
