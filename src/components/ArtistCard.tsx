import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
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
      className="group flex flex-col items-center cursor-pointer text-center h-full"
    >
      <div className="relative w-full aspect-square max-w-[120px] mb-4 mx-auto">
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
      
      <h3 className="text-sm font-bold text-white tracking-tight mb-1 group-hover:text-blue-400 transition-colors truncate w-full px-2">
        {artist.name}
      </h3>
      
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-3">
        {artist.followers.toLocaleString()} Followers
      </p>
      
      <button 
        onClick={handleFollowClick}
        className={`mt-auto px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-widest
          ${isFollowing 
            ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }
        `}
        title={isFollowing ? "Unfollow" : "Follow"}
      >
        {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default ArtistCard;
