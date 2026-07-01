import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Star, Calendar, Music, Sparkles, CheckCircle2, ShieldCheck, 
  UserCheck, UserPlus, MessageSquare, Headphones, Award, TrendingUp 
} from 'lucide-react';
import { UserPlaceholder } from '../../placeholders/UserPlaceholder';
import { ArtistPlaceholder } from '../../placeholders/ArtistPlaceholder';

// --- TS INTERFACES ---

export interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  followersCount: number;
  followingCount: number;
  streamsCount?: number;
  nftsCount?: number;
  xpPoints?: number;
  level?: number;
  streakDays?: number;
}

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  iconName: string; // Trophy, Star, etc.
  unlockedAt?: string;
  xpValue: number;
  isUnlocked: boolean;
}

export interface FollowUserData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  followersCount: number;
  isFollowingBack?: boolean;
}

// --- 1. USER PROFILE SUMMARY CARD ---
export const ProfileSummaryCard: React.FC<{
  profile?: UserProfileData;
  isLoading?: boolean;
  className?: string;
}> = ({ profile, isLoading, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading || !profile) {
    return (
      <div className={`p-4 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-full max-w-[340px] ${className}`}>
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-3.5 bg-white/10 rounded w-1/3" />
          </div>
        </div>
        <div className="h-8 bg-white/10 rounded w-full" />
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-3.5">
        <div className="relative w-14 h-14 bg-slate-950 rounded-full overflow-hidden shrink-0">
          {imgFailed || !profile.avatarUrl ? (
            <UserPlaceholder size={20} />
          ) : (
            <img src={profile.avatarUrl} alt={profile.displayName} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-black truncate leading-none uppercase tracking-tight">{profile.displayName}</h3>
            {profile.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
            {profile.isPremium && <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />}
          </div>
          <p className="text-[10px] text-[#9AA0AE] font-mono mt-1">{profile.username}</p>
          {profile.level !== undefined && (
            <span className="text-[8px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-1.5">Level {profile.level} Creator</span>
          )}
        </div>
      </div>

      {profile.bio && <p className="text-xs text-white/70 leading-relaxed mt-3.5">{profile.bio}</p>}

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 font-mono text-[10px] text-[#9AA0AE] text-center">
        <div>
          <span className="block font-black text-white text-[13px]">{profile.followersCount >= 1000 ? `${(profile.followersCount / 1000).toFixed(1)}K` : profile.followersCount}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">fans</span>
        </div>
        <div>
          <span className="block font-black text-white text-[13px]">{profile.nftsCount || 0}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">NFTs</span>
        </div>
        <div>
          <span className="block font-black text-white text-[13px]">{profile.streakDays || 0} 🔥</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">streak</span>
        </div>
      </div>
    </div>
  );
};

// --- 2. ACHIEVEMENTS CARD ---
export const AchievementsCard: React.FC<{
  achievements: AchievementData[];
  className?: string;
}> = ({ achievements, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Badges & Achievements</span>
      </div>
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {achievements.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-[6px]">
            <div className={`p-2 rounded-lg shrink-0 ${item.isUnlocked ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-[#9AA0AE]'}`}>
              {item.isUnlocked ? <Award className="w-5 h-5 fill-current" /> : <Trophy className="w-5 h-5 opacity-40" />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className={`text-[12px] font-bold truncate ${item.isUnlocked ? 'text-white' : 'text-white/40'}`}>{item.title}</h4>
              <p className="text-[10px] text-[#9AA0AE] truncate">{item.description}</p>
            </div>
            <span className="text-[9px] font-mono text-blue-400 font-bold shrink-0">+{item.xpValue} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. FOLLOWERS / FANS LIST CARD ---
export const FollowersCard: React.FC<{
  userData: FollowUserData;
  onFollowToggle?: (userData: FollowUserData) => void;
  className?: string;
}> = ({ userData, onFollowToggle, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [following, setFollowing] = useState(userData.isFollowingBack || false);

  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-950 shrink-0">
          {imgFailed || !userData.avatarUrl ? (
            <UserPlaceholder size={16} />
          ) : (
            <img src={userData.avatarUrl} alt={userData.displayName} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-[13px] font-bold truncate">{userData.displayName}</h4>
            {userData.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
          </div>
          <p className="text-[10px] text-[#9AA0AE] font-mono leading-none mt-0.5">{userData.username}</p>
        </div>
      </div>
      <button
        onClick={() => { setFollowing(!following); onFollowToggle?.(userData); }}
        className={`py-1 px-3 rounded-[6px] text-[10px] font-black uppercase tracking-wider transition-all ${
          following ? 'bg-white/10 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        {following ? 'Synced' : 'Sync'}
      </button>
    </div>
  );
};

// --- 4. FOLLOWING CARD ---
export const FollowingCard: React.FC<{
  userData: FollowUserData;
  onMessage?: (userData: FollowUserData) => void;
  className?: string;
}> = ({ userData, onMessage, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-950 shrink-0">
          {imgFailed || !userData.avatarUrl ? (
            <UserPlaceholder size={16} />
          ) : (
            <img src={userData.avatarUrl} alt={userData.displayName} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-[13px] font-bold truncate">{userData.displayName}</h4>
            {userData.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
          </div>
          <p className="text-[10px] text-[#9AA0AE] font-mono leading-none mt-0.5">{userData.username}</p>
        </div>
      </div>
      <button onClick={() => onMessage?.(userData)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-[6px] transition-colors shrink-0">
        <MessageSquare className="w-3.5 h-3.5 text-white/80" />
      </button>
    </div>
  );
};

// --- 5. FAVORITE ARTISTS CARD (Horizontal Grid) ---
export const FavoriteArtistsCard: React.FC<{
  artists: { id: string; name: string; avatarUrl: string; isVerified?: boolean; streams: string }[];
  onArtistClick?: (artistId: string) => void;
  className?: string;
}> = ({ artists, onArtistClick, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Music className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">My Top Artists</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {artists.map((art) => (
          <div
            key={art.id}
            onClick={() => onArtistClick?.(art.id)}
            className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-[6px] cursor-pointer flex items-center gap-2.5 min-w-0 transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-950 shrink-0">
              <img src={art.avatarUrl} alt={art.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-[11px] font-bold text-white truncate">{art.name}</h4>
              <span className="text-[9px] text-[#9AA0AE] font-mono truncate block">{art.streams} syncs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
