import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Verified, Users, UserPlus, UserCheck } from 'lucide-react';
import { Artist, UserProfile } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';

import { MOCK_ARTISTS } from '@/constants';

interface UserCardProps {
  user: Artist | UserProfile;
  variant?: 'portrait' | 'compact' | 'row';
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'portrait' }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser, userProfile } = useAudio();

  const isFollowing = followedUserIds.includes(user.uid);
  const isOwnProfile = user.uid === userProfile.uid;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the follow button
    if ((e.target as HTMLElement).closest('.follow-btn')) return;
    
    if (isOwnProfile) {
      navigate('/profile');
    } else if (verified || MOCK_ARTISTS.some(a => a.uid === user.uid)) {
      navigate(`/artist/${user.uid}`);
    } else {
      navigate(`/user/${user.uid}`);
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(user.uid);
  };

  const avatarUrl = 'avatarUrl' in user ? user.avatarUrl : user.avatar;
  const verified = 'verified' in user ? user.verified : user.isVerifiedArtist;
  const genre = 'genre' in user ? user.genre : ('username' in user ? user.username.replace('@', '') : 'Artist');

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center gap-2 p-2 rounded-[4px] bg-muted/50 hover:bg-muted/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View profile of ${user.name}`}
      >
        <div className="relative w-14 h-14 rounded-[4px] overflow-hidden">
          <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-blue-600 dark:text-foreground truncate uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
            {verified && <Verified className="h-3 w-3 text-blue-500" />}
          </div>
          <p className="text-[8px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest">{user.followers?.toLocaleString() || 0} Collectors</p>
        </div>
        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            className={`follow-btn w-8 h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-muted/50 text-blue-400' : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
            aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
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
        className="flex items-center justify-between p-2 rounded-[4px] hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View profile of ${user.name}`}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-16 h-16 rounded-[4px] overflow-hidden">
            <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="text-[12px] font-bold text-blue-600 dark:text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors truncate">{user.name}</p>
              {verified && <Verified className="h-3 w-3 text-blue-500" />}
            </div>
            <p className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest">{genre || 'Artist'}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-foreground">{((user.followers || 0) / 1000).toFixed(1)}K</p>
            <p className="text-[8px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest">Followers</p>
          </div>
          {!isOwnProfile && (
            <button 
              onClick={handleFollow}
              className={`follow-btn px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-muted/50 text-blue-400 border border-border' : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
              aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
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
      className="group relative cursor-pointer transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-[4px] p-2 bg-transparent hover:bg-white/[0.03] border border-transparent w-full"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${user.name}`}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-900 transition-all rounded-[4px] mb-2 border border-white/5">
        <img 
          src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} 
          alt={user.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`user-${user.uid}`); }}
        />
      </div>
      
      <div className="px-0.5 flex flex-col gap-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <h3 className="text-xs font-black uppercase tracking-tighter line-clamp-2 whitespace-normal break-words leading-tight text-foreground truncate">
              {user.name}
            </h3>
            {verified && <Verified className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
          </div>
          <p className="text-[10px] font-medium text-foreground/80 uppercase tracking-[0.1em] truncate">
            {genre || 'COLLECTOR'}
          </p>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div className="space-y-0.5">
            <p className="text-[8px] font-medium text-muted-foreground/30 uppercase tracking-[0.1em]">Network Fans</p>
            <div className="flex items-center gap-1 bg-muted/40 py-0.5 px-2 rounded-[4px] border border-border/10 text-muted-foreground text-[10px] font-extrabold tracking-widest">
              {user.followers?.toLocaleString() || 0}
            </div>
          </div>
          
          {!isOwnProfile && (
            <button 
              onClick={handleFollow}
              className={`cursor-pointer transition-all rounded-[4px] border-b-[2px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[4px] active:border-b-[1px] active:brightness-90 active:translate-y-[1px] h-8 px-3 text-[9px] font-black uppercase tracking-[0.1em] text-white
                ${isFollowing 
                  ? 'bg-muted text-foreground border-border' 
                  : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 border-blue-600'
                }
              `}
              aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
            >
              {isFollowing ? 'SYNCED' : 'FOLLOW'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;