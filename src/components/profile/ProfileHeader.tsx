import React from 'react';
import { BadgeCheck, Globe, Calendar, Music, ShieldCheck, Settings, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileData } from './ProfileTypes';

interface ProfileHeaderProps {
  profile: ProfileData;
  onOpenSettings: () => void;
  onEditCover: () => void;
  onEditAvatar: () => void;
  isOwnProfile?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onOpenSettings,
  onEditCover,
  onEditAvatar,
  isOwnProfile = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full bg-[#050A24] text-white">
      {/* Cover Image Container */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-slate-950">
        <img 
          src={profile.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=400&q=80'} 
          alt="Profile cover" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Flat darken overlay */}
        <div className="absolute inset-0 bg-black/35" />
        
        {/* Top Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2.5 bg-[#050A24]/70 hover:bg-[#050A24] active:scale-95 text-white rounded-full transition-all cursor-pointer z-10"
          title="Back"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300 hover:text-white" />
        </button>
        
        {/* Top Floating Settings Button */}
        {isOwnProfile && (
          <button
            onClick={onOpenSettings}
            className="absolute top-4 right-4 p-2.5 bg-[#050A24]/70 hover:bg-[#050A24] active:scale-95 text-white rounded-full transition-all cursor-pointer z-10"
            title="Profile Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-300 hover:text-white" />
          </button>
        )}
        
        {isOwnProfile && (
          <button
            onClick={onEditCover}
            className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#050A24]/60 hover:bg-[#050A24]/90 text-xs font-semibold rounded-full tracking-wider uppercase backdrop-blur-sm transition-all cursor-pointer z-10"
          >
            Change Cover
          </button>
        )}
      </div>

      {/* Profile Details Container */}
      <div className="px-4 sm:px-6 relative pb-6">
        
        {/* Avatar Overlap */}
        <div className="relative -mt-16 sm:-mt-20 mb-4 flex items-end justify-between">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[4px] border-[#050A24] bg-slate-900 shadow-none">
              <img 
                src={profile.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&h=500&q=80'} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isOwnProfile && (
              <button
                onClick={onEditAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              >
                <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
              </button>
            )}
          </div>

          {/* Badges Column on Right */}
          <div className="flex flex-col items-end gap-1.5 pt-2">
            {profile.isSpotifyVerified && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider"
                title="Spotify Verified Artist"
              >
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spotify Verified</span>
              </div>
            )}
            {profile.isArtistVerified && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-[#0052FF]/10 text-[#0052FF] rounded-full text-[10px] font-bold uppercase tracking-wider"
                title="Verified NFT Music Creator"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>NFT Creator</span>
              </div>
            )}
            {profile.isTonVerified && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider"
                title="TON Verified Address"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>TON Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Name and Handle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
              {profile.name}
            </h1>
            <BadgeCheck className="w-5.5 h-5.5 text-[#0052FF] fill-current" />
          </div>
          
          <div className="text-xs sm:text-sm font-mono text-slate-400">
            @{profile.username}
          </div>
        </div>

        {/* Genre / Bio / Country Details */}
        <div className="mt-4 space-y-3 max-w-xl">
          {profile.genre && (
            <div className="inline-block px-2.5 py-0.5 bg-slate-800/60 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {profile.genre}
            </div>
          )}

          {/* Biography (3 Lines Max limit) */}
          {profile.bio && (
            <p className="text-sm text-slate-300 leading-relaxed font-sans line-clamp-3">
              {profile.bio}
            </p>
          )}

          {/* Location and Joined Date Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
            {profile.country && (
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile.country}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Joined {profile.memberSince}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
