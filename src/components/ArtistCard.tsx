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
        className="group flex flex-col items-center cursor-pointer text-center p-2 rounded-[8px] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-[120px]"
        role="button"
        tabIndex={0}
        aria-label={`View artist: ${artist.name}`}
      >
        <div className="relative w-16 h-16 mb-2">
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full rounded-full object-cover" />
        </div>
        <h3 className="text-[10px] font-bold text-white tracking-tight truncate w-full mb-0.5">{artist.name}</h3>
        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">{artist.followers.toLocaleString()} Followers</p>
        <button 
          onClick={handleFollowClick}
          className={`w-full py-1 rounded-[4px] flex items-center justify-center gap-1 transition-all text-[8px] font-bold uppercase tracking-widest
            ${isFollowing 
              ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
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
        className="group flex items-center gap-4 p-2 rounded-[10px] hover:bg-white/5 transition-all cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-white group-hover:text-blue-400 transition-colors">{artist.name}</h4>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
            {artist.genre || 'Electronic'}
          </p>
        </div>
        <button 
          onClick={handleFollowClick}
          className={`px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all text-[8px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            ${isFollowing 
              ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
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
      className="group flex flex-col items-center cursor-pointer text-center h-full w-full p-4 rounded-xl hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-4 mx-auto">
        <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
          <img 
            src={artist.avatarUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {artist.verified && (
          <div className="absolute bottom-1 right-1 bg-black rounded-full p-0.5 z-10">
            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
          </div>
        )}
      </div>
      
      <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight mb-1 group-hover:text-blue-400 transition-colors truncate w-full max-w-full px-2">
        {artist.name}
      </h3>
      
      <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
        {artist.genre || 'Electronic'}
      </p>
      
      <p className="text-[7px] sm:text-[8px] font-bold text-white/20 uppercase tracking-widest mb-3">
        {artist.followers.toLocaleString()} Followers
      </p>
      
      <button 
        onClick={handleFollowClick}
        className={`mt-auto px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all text-[8px] sm:text-[9px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${isFollowing 
            ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
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
