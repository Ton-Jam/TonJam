import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, UserPlus, UserCheck } from 'lucide-react';
import { Artist, UserProfile } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface UserCardProps {
  user: Artist | UserProfile;
  variant?: 'portrait' | 'compact' | 'row';
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'portrait' }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser, userProfile } = useAudio();

  const isFollowing = followedUserIds.includes(user.id);
  const isOwnProfile = user.id === userProfile.id;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the follow button
    if ((e.target as HTMLElement).closest('.follow-btn')) return;
    navigate(`/artist/${user.id}`);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(user.id);
  };

  const avatarUrl = 'avatarUrl' in user ? user.avatarUrl : user.avatar;
  const verified = 'verified' in user ? user.verified : user.isVerifiedArtist;
  const genre = 'genre' in user ? user.genre : ('handle' in user ? user.handle : 'Artist');

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center gap-3 p-3 rounded-[5px] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
      >
        <div className="relative w-10 h-10 rounded-[5px] overflow-hidden">
          <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-bold text-white truncate uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
            {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
          </div>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{user.followers?.toLocaleString() || 0} Collectors</p>
        </div>
        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            className={`follow-btn w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
          >
            {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center justify-between p-4 rounded-[5px] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-[5px] overflow-hidden">
            <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
              {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{genre || 'Artist'}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-xs font-bold text-white">{((user.followers || 0) / 1000).toFixed(1)}K</p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Followers</p>
          </div>
          {!isOwnProfile && (
            <button 
              onClick={handleFollow}
              className={`follow-btn px-4 py-1.5 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-black shadow-lg shadow-white/5'}`}
            >
              {isFollowing ? 'Synced' : 'Follow'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col items-center text-center p-6 rounded-[5px] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[5px] overflow-hidden border-2 border-white/5 group-hover:border-blue-500/50 transition-all mb-4">
        <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</h3>
          {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
        </div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{genre || 'Electronic'}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-white/20" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{user.followers?.toLocaleString() || 0}</span>
        </div>
        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            className={`follow-btn px-4 py-1.5 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-black shadow-lg shadow-white/5'}`}
          >
            {isFollowing ? 'Synced' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;