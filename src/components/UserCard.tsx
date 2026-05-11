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
  const genre = 'genre' in user ? user.genre : ('username' in user ? user.username.replace('@', '') : 'Artist');

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center gap-2 p-2 rounded-[2px] bg-muted/50 hover:bg-muted/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div className="relative w-10 h-10 rounded-[2px] overflow-hidden">
          <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-blue-600 dark:text-foreground truncate uppercase tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</p>
            {verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
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
        className="flex items-center justify-between p-2 rounded-[2px] hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          <div className="relative w-12 h-12 rounded-[2px] overflow-hidden">
            <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="text-[12px] font-bold text-blue-600 dark:text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors truncate">{user.name}</p>
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
      className="flex flex-col items-center text-center h-full w-full p-3 rounded-[2px] bg-muted/20 border border-border/50 hover:bg-muted/30 transition-all min-w-[130px] cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-none hover:border-primary/50"
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
      <div className="relative mb-2 w-14 h-14">
        <div className="w-full h-full rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
          <img 
            src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} 
            alt={user.name} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
      
      <div className="flex flex-col min-w-0 w-full mb-2 items-center text-center space-y-0.5">
        <div className="flex items-center gap-1 justify-center max-w-full">
          <h3 className="text-[10px] font-bold text-foreground tracking-tight uppercase truncate">
            {user.name}
          </h3>
          {verified && <CheckCircle2 className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
        </div>
        
        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
          {user.followers?.toLocaleString() || 0} Followers
        </p>
      </div>
      
      {!isOwnProfile && (
        <button 
          onClick={handleFollow}
          className={`w-full py-1.5 text-[9px] rounded-full flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600
            ${isFollowing 
              ? 'bg-muted/50 text-muted-foreground/60 border border-border/50' 
              : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white shadow-lg shadow-blue-600/10'
            }
          `}
          aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
        >
          {isFollowing ? 'SYNCED' : 'FOLLOW'}
        </button>
      )}
    </div>
  );
};

export default UserCard;