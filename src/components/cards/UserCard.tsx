import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare, UserPlus, UserCheck, ShieldCheck, Play } from 'lucide-react';
import { UserPlaceholder } from '../placeholders/UserPlaceholder';

export interface UserCardData {
  id: string;
  username: string; // e.g. @krupy
  displayName: string; // e.g. DJ Krupy
  avatarUrl?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  followersCount: number;
  followingCount: number;
  favoriteGenre?: string;
  recentlyPlayedTitle?: string;
  recentlyPlayedArtist?: string;
  isOnline?: boolean;
  mutualFollowers?: string[]; // Array of names or avatars
}

interface UserCardProps {
  userData?: UserCardData;
  isLoading?: boolean;
  onFollow?: (user: UserCardData) => void;
  onMessage?: (user: UserCardData) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  userData,
  isLoading = false,
  onFollow,
  onMessage,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  if (isLoading || !userData) {
    return (
      <div className={`flex flex-col p-4 rounded-[10px] bg-[#0A113A] animate-pulse w-[180px] shrink-0 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    if (onFollow) onFollow(userData);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) onMessage(userData);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col p-4 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[180px] shrink-0 snap-start select-none relative group text-center ${className}`}
    >
      {/* Avatar Section */}
      <div className="relative w-16 h-16 mx-auto mb-3 shrink-0 bg-slate-950 rounded-full">
        {imgFailed || !userData.avatarUrl ? (
          <UserPlaceholder size={24} />
        ) : (
          <img
            src={userData.avatarUrl}
            alt={userData.displayName}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover rounded-full"
          />
        )}

        {/* Online status indicator */}
        {userData.isOnline && (
          <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0A113A]" />
        )}
      </div>

      {/* Badges and Names */}
      <div className="flex flex-col items-center min-w-0">
        <div className="flex items-center justify-center gap-1 w-full max-w-full">
          <span className="text-[13px] font-black text-white truncate max-w-[80%]">
            {userData.displayName}
          </span>
          {userData.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />
          )}
          {userData.isPremium && (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-[#9AA0AE] font-mono mt-0.5 truncate w-full">
          {userData.username}
        </p>
      </div>

      {/* Followers / Following Counts */}
      <div className="flex justify-center gap-3 mt-2.5 pt-2.5 border-t border-white/5 font-mono text-[10px] text-[#9AA0AE]">
        <div>
          <span className="block font-black text-white">{userData.followersCount >= 1000 ? `${(userData.followersCount / 1000).toFixed(1)}K` : userData.followersCount}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">fans</span>
        </div>
        <div>
          <span className="block font-black text-white">{userData.followingCount >= 1000 ? `${(userData.followingCount / 1000).toFixed(1)}K` : userData.followingCount}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">syncs</span>
        </div>
      </div>

      {/* Optional Metadata: Favorite Genre & Recently Played */}
      {userData.favoriteGenre && (
        <div className="mt-2 text-[9px] text-blue-400 font-black uppercase tracking-wider bg-blue-500/10 py-0.5 px-2 rounded-full inline-block mx-auto max-w-full truncate">
          {userData.favoriteGenre}
        </div>
      )}

      {userData.recentlyPlayedTitle && (
        <div className="mt-2.5 text-left bg-white/[0.02] p-1.5 rounded-[6px] text-[10px] text-[#9AA0AE] w-full min-w-0">
          <span className="text-[8px] font-black uppercase tracking-wider text-white/40 block mb-0.5">Recently Played</span>
          <div className="flex items-center gap-1">
            <Play className="w-2.5 h-2.5 shrink-0 text-blue-400 fill-current" />
            <span className="truncate text-white font-bold max-w-[90%]">
              {userData.recentlyPlayedTitle}
            </span>
          </div>
          {userData.recentlyPlayedArtist && (
            <p className="truncate text-[9px] opacity-75 pl-3.5">{userData.recentlyPlayedArtist}</p>
          )}
        </div>
      )}

      {/* Mutual Followers indicator */}
      {userData.mutualFollowers && userData.mutualFollowers.length > 0 && (
        <p className="text-[8px] text-[#9AA0AE]/70 mt-2 truncate w-full">
          Followed by {userData.mutualFollowers.join(', ')}
        </p>
      )}

      {/* Interaction Actions */}
      <div className="mt-3.5 flex gap-1.5 w-full">
        <button
          onClick={handleFollowClick}
          className={`flex-1 py-1.5 px-2.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 ${
            isFollowing
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-blue-600 text-white hover:bg-blue-505'
          }`}
        >
          {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>{isFollowing ? 'Synced' : 'Follow'}</span>
        </button>

        <button
          onClick={handleMessageClick}
          className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-[6px] transition-colors active:scale-95 flex items-center justify-center shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
export default UserCard;
