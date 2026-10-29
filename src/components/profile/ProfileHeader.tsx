import React, { useState } from 'react';
import { 
  BadgeCheck, 
  Globe, 
  Calendar, 
  Music, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  ArrowLeft, 
  LayoutDashboard, 
  QrCode, 
  Share2, 
  UserPlus, 
  UserCheck, 
  Zap, 
  Upload, 
  Coins, 
  Edit3,
  Camera,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProfileData } from './ProfileTypes';
import { UserProfile as UserProfileType } from '@/types';
import { ProfileQRCodeModal } from './ProfileQRCodeModal';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProfileHeaderProps {
  profile?: ProfileData;
  user?: UserProfileType;
  onOpenSettings?: () => void;
  onEditCover?: () => void;
  onEditAvatar?: () => void;
  onEditProfile?: () => void;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
  onTipArtist?: () => void;
  followersCount?: number;
  followingCount?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  user,
  onOpenSettings,
  onEditCover,
  onEditAvatar,
  onEditProfile,
  isOwnProfile = true,
  isFollowing = false,
  onFollow,
  onShare,
  onTipArtist,
  followersCount,
  followingCount,
}) => {
  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Unify data from either user or profile
  const displayName = user?.name || profile?.name || 'TonJam Explorer';
  const username = user?.username || profile?.username || (displayName || 'user').toLowerCase().replace(/\s+/g, '');
  const avatarUrl = user?.avatar || profile?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&h=500&q=80';
  const bannerUrl = user?.bannerUrl || profile?.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&h=500&q=80';
  const bio = user?.bio || profile?.bio || '';
  const walletAddress = user?.walletAddress || profile?.walletAddress || '';
  const isVerifiedArtist = Boolean(
    user?.isVerifiedArtist || 
    user?.isVerified || 
    user?.role === 'artist' || 
    profile?.isArtistVerified || 
    profile?.isSpotifyVerified
  );

  const followers = followersCount ?? (user?.followers ?? profile?.followers ?? 0);
  const following = followingCount ?? (user?.following ?? profile?.following ?? 0);

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      navigate('/settings');
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      setIsQRModalOpen(true);
    }
  };

  return (
    <div className="relative w-full text-white overflow-hidden bg-[#080D1A]">
      {/* 1. Page Header (Maintains navy background color #080D1A) */}
      <PageHeader
        title="Profile"
        showBack={true}
        transparent={false}
        className="bg-[#080D1A]/90 backdrop-blur-xl"
        rightContent={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer flex items-center justify-center"
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-5 h-5 text-[#229ED9]" />
            </button>
            <button
              type="button"
              onClick={handleSettingsClick}
              className="p-2 text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[#229ED9]" />
            </button>
          </div>
        }
      />

      {/* 2. Crisp Mobile-First Cover Picture Banner */}
      <div className="relative w-full h-36 sm:h-48 md:h-60 overflow-hidden bg-[#111C30]">
        <img
          src={bannerUrl}
          alt="Cover Picture"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-black/30" />

        {isOwnProfile && (
          <button
            type="button"
            onClick={onEditCover || (() => navigate('/edit-profile'))}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            title="Edit Cover Picture"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Cover</span>
          </button>
        )}
      </div>

      {/* 3. Mobile-Optimized Profile Info & Avatar Block */}
      <div className="px-4 sm:px-8 pb-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
          
          {/* Avatar Photo */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl bg-[#111C30] ring-4 ring-[#080D1A] transition-transform duration-300 group-hover:scale-105">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {isOwnProfile && onEditAvatar && (
              <button
                type="button"
                onClick={onEditAvatar}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                title="Change Profile Photo"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </div>
              </button>
            )}
          </div>

          {/* Profile Details & Action Buttons */}
          <div className="flex-1 text-center md:text-left space-y-2.5 min-w-0">
            
            {/* Role & Wallet Badges */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-1">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#229ED9] bg-[#229ED9]/15 px-3 py-1 rounded-full">
                {isVerifiedArtist ? 'Verified Artist' : 'Music Collector'}
              </span>

              {walletAddress && (
                <span className="text-[10px] font-mono text-zinc-300 bg-white/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#229ED9]" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              )}
            </div>

            {/* Display Name */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {displayName}
              </h1>
              {isVerifiedArtist && (
                <ArtistVerificationBadge
                  isVerified={true}
                  artistName={displayName}
                  size="md"
                  showLabel={false}
                />
              )}
            </div>

            {/* Username & Stats */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-zinc-400 font-medium flex-wrap">
              <span className="font-mono text-zinc-300">@{username}</span>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => navigate('/followers')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                <strong className="text-white font-mono">{followers.toLocaleString()}</strong> Followers
              </button>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => navigate('/following')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                <strong className="text-white font-mono">{following.toLocaleString()}</strong> Following
              </button>
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-xl line-clamp-2">
                {bio}
              </p>
            )}

            {/* Primary Actions Row */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              {!isOwnProfile ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onFollow}
                    className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-colors duration-300 flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-[#229ED9] hover:bg-[#168AC4] text-white shadow-[#229ED9]/25'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{isVerifiedArtist ? 'Follow Artist' : 'Follow'}</span>
                      </>
                    )}
                  </motion.button>

                  {isVerifiedArtist && onTipArtist && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={onTipArtist}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Tip TON</span>
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  {/* Settings Button (Replaces Edit Profile icon button) */}
                  <button
                    type="button"
                    onClick={handleSettingsClick}
                    className="px-5 py-2.5 bg-[#111C30] hover:bg-[#182742] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
                  >
                    <Settings className="w-4 h-4 text-[#229ED9]" />
                    <span>Settings</span>
                  </button>

                  {/* Verified Artist Owner Entry Points */}
                  {isVerifiedArtist && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate('/artist-dashboard')}
                        className="px-5 py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95 shadow-[#229ED9]/25"
                        title="Artist Dashboard"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Artist Dashboard</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <ProfileQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={{
          name: displayName,
          username: username,
          avatar: avatarUrl,
          role: isVerifiedArtist ? 'Verified Artist' : 'Music Collector',
          bio: bio,
          isVerified: isVerifiedArtist,
          uid: user?.uid || profile?.uid || 'user'
        }}
      />
    </div>
  );
};

export default ProfileHeader;
