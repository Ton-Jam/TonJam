import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, UserPlus, UserCheck } from 'lucide-react';
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
    } else if (MOCK_ARTISTS.some(a => a.uid === user.uid)) {
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
  const genre = 'genre' in user ? user.genre : ('username' in user ? user.username : 'Artist');

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center gap-2 p-2 rounded-[5px] border border-blue-500/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div className="relative w-10 h-10 rounded-[5px] overflow-hidden">
          <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-blue-600 dark:text-foreground truncate uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
            {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
          </div>
          <p className="text-[8px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest">{user.followers?.toLocaleString() || 0} Collectors</p>
        </div>
        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            className={`follow-btn w-8 h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-foreground shadow-lg shadow-blue-600/20'}`}
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
        className="flex items-center justify-between p-2 rounded-[5px] border border-blue-500/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          <div className="relative w-12 h-12 rounded-[5px] overflow-hidden">
            <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-blue-600 dark:text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
              {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
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
              className={`follow-btn px-2 py-3 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-foreground shadow-lg shadow-blue-600/20'}`}
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
      className="flex flex-col items-center text-center p-2 rounded-[5px] border border-blue-500/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[5px] overflow-hidden border border-blue-500/30 group-hover:border-neutral-500/50 transition-all mb-2">
        <img 
          src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} 
          alt={user.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h3 className="text-sm font-bold text-blue-600 dark:text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</h3>
          {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
        </div>
        <p className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest">{genre || 'Electronic'}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-blue-500/30 w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-blue-500/50 dark:text-muted-foreground/50" />
          <span className="text-[10px] font-bold text-blue-500/70 dark:text-muted-foreground uppercase tracking-widest">{user.followers?.toLocaleString() || 0}</span>
        </div>
        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            className={`follow-btn px-2 -3 rounded-[5px] text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-foreground shadow-lg shadow-blue-600/20'}`}
            aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
          >
            {isFollowing ? 'Synced' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;