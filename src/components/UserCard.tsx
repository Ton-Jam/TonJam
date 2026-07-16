import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Verified, Users, UserPlus, UserCheck } from 'lucide-react';
import { Artist, UserProfile } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { cardTokens } from '@/design';

import { MOCK_ARTISTS } from '@/constants';

interface UserCardProps {
  user: Artist | UserProfile;
  variant?: 'portrait' | 'compact' | 'row';
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'portrait', className = '' }) => {
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
      style={{ width: cardTokens.user.width, padding: cardTokens.global.padding, borderRadius: cardTokens.global.borderRadius }}
      className={cn("group relative cursor-pointer bg-[#0A113A]/50 hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between items-center text-center overflow-hidden", className)}
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
      <div 
        style={{ width: cardTokens.user.avatarSize, height: cardTokens.user.avatarSize }}
        className="relative rounded-full overflow-hidden bg-neutral-900 mb-2.5 border border-white/5 flex-shrink-0"
      >
        <img 
          src={avatarUrl || getPlaceholderImage(`user-${user.uid}`)} 
          alt={user.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`user-${user.uid}`); }}
        />
      </div>
      
      <div className="w-full flex flex-col gap-1 text-center items-center">
        <div className="space-y-0.5 w-full">
          <div className="flex items-center gap-1 justify-center max-w-full">
            <h3 style={{ fontSize: cardTokens.user.usernameSize }} className="font-extrabold uppercase tracking-tight text-foreground truncate max-w-[80px] leading-tight">
              {user.name}
            </h3>
            {verified && <Verified className="text-blue-400 fill-current flex-shrink-0" style={{ width: cardTokens.user.verifiedBadgeSize, height: cardTokens.user.verifiedBadgeSize }} />}
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate w-full">
            {genre || 'COLLECTOR'}
          </p>
        </div>

        <div className="w-full mt-2">
          {!isOwnProfile && (
            <button 
              onClick={handleFollow}
              className={`cursor-pointer transition-all rounded-full h-7 w-full text-[8px] font-black uppercase tracking-[0.1em] text-white flex items-center justify-center
                ${isFollowing 
                  ? 'bg-muted text-foreground border border-border' 
                  : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 shadow-lg shadow-blue-500/20'
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