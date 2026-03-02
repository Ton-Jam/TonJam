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

  return (
    <div 
      onClick={() => navigate(`/artist/${artist.id}`)}
      className="group flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-[10px] hover:bg-white/10 transition-all cursor-pointer text-center"
    >
      <div className="relative w-20 h-20 mb-3">
        <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
          <img 
            src={artist.avatarUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none mix-blend-overlay" />
        </div>
        {artist.verified && (
          <div className="absolute bottom-0 right-0 bg-black rounded-full p-0.5 z-10">
            <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-bold text-white tracking-tight mb-1 group-hover:text-blue-400 transition-colors truncate w-full px-2">
        {artist.name}
      </h3>
      
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-4">
        {artist.followers.toLocaleString()} Followers
      </p>
      
      <button 
        onClick={handleFollowClick}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
          ${isFollowing 
            ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }
        `}
        title={isFollowing ? "Unfollow" : "Follow"}
      >
        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ArtistCard;
