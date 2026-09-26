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

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      setIsQRModalOpen(true);
    }
  };

  const handleEditProfileClick = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      navigate('/edit-profile');
    }
  };

  return (
    <div className="relative w-full text-white overflow-hidden">
      {/* 1. Spotify-Style Ambient Backdrop Blur (No Boxed Card) */}
      <div className="absolute inset-0 h-64 sm:h-80 md:h-96 w-full pointer-events-none overflow-hidden -z-10">
        <img
          src={bannerUrl}
          alt=""
          className="w-full h-full object-cover blur-2xl opacity-25 scale-110 transform-gpu"
          referrerPolicy="no-referrer"
        />
        {/* Soft atmospheric gradient flowing seamlessly into dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A24]/40 via-[#050A24]/75 to-[#050A24]" />
        <div className="absolute -top-12 left-1/4 w-80 h-80 bg-[#0052FF]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Transparent Glass Navigation Bar */}
      <PageHeader
        title="Profile"
        showBack={true}
        transparent={true}
        sticky={false}
        rightContent={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer border-none outline-none flex items-center justify-center"
                title="Profile Options"
                aria-label="Profile Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 text-white min-w-[160px] shadow-2xl rounded-xl border-none">
              <DropdownMenuItem
                onClick={handleShareClick}
                className="flex items-center gap-2 p-2.5 text-xs font-semibold hover:bg-white/10 cursor-pointer text-slate-200 hover:text-white"
              >
                <Share2 className="w-4 h-4 text-[#00B4D8]" />
                <span>Share Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center gap-2 p-2.5 text-xs font-semibold hover:bg-white/10 cursor-pointer text-slate-200 hover:text-white"
              >
                <QrCode className="w-4 h-4 text-[#00B4D8]" />
                <span>Show QR Code</span>
              </DropdownMenuItem>
              {isOwnProfile && onOpenSettings && (
                <DropdownMenuItem
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 p-2.5 text-xs font-semibold hover:bg-white/10 cursor-pointer text-slate-200 hover:text-white"
                >
                  <Settings className="w-4 h-4 text-[#00B4D8]" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* 3. Spotify-Inspired Music Profile Hero Content */}
      <div className="px-4 sm:px-8 pt-4 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        
        {/* Large Profile Image */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden shadow-2xl bg-slate-900 ring-4 ring-[#0052FF]/30 transition-transform duration-300 group-hover:scale-105">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {isOwnProfile && onEditAvatar && (
            <button
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

        {/* Profile Info & Actions Column */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          
          {/* Identity Subheader: Role Badge */}
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0098EA] bg-[#0052FF]/15 px-3 py-1 rounded-full">
              {isVerifiedArtist ? 'Verified Artist' : 'Music Collector'}
            </span>

            {profile?.isSpotifyVerified && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Music className="w-3 h-3" /> Spotify Connected
              </span>
            )}

            {walletAddress && (
              <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0098EA]" />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>

          {/* Display Name with Verified Badge */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
              {displayName}
            </h1>
            {isVerifiedArtist && (
              <ArtistVerificationBadge
                isVerified={true}
                artistName={displayName}
                size="lg"
                showLabel={false}
              />
            )}
          </div>

          {/* Username & Social Stats */}
          <div className="flex items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-slate-400 font-medium flex-wrap">
            <span className="font-mono text-slate-300">@{username}</span>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => navigate('/followers')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              <strong className="text-white font-mono">{followers.toLocaleString()}</strong> Followers
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => navigate('/following')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              <strong className="text-white font-mono">{following.toLocaleString()}</strong> Following
            </button>
          </div>

          {/* Bio Snippet */}
          {bio && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl line-clamp-2">
              {bio}
            </p>
          )}

          {/* Primary Action Buttons Row */}
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
                      : 'bg-[#0052FF] hover:bg-[#1a66ff] text-white shadow-blue-500/25'
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
                <button
                  onClick={handleEditProfileClick}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {/* Verified Artist Owner Entry Points */}
                {isVerifiedArtist && (
                  <>
                    <button
                      onClick={() => navigate('/artist-dashboard')}
                      className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95 shadow-blue-500/25"
                      title="Artist Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Artist Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigate('/upload')}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hidden sm:flex items-center gap-1.5 active:scale-95"
                      title="Upload New Music"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                    <button
                      onClick={() => navigate('/mint')}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hidden sm:flex items-center gap-1.5 active:scale-95"
                      title="Mint Music NFT"
                    >
                      <Coins className="w-3.5 h-3.5 text-[#0098EA]" />
                      <span>Mint</span>
                    </button>
                  </>
                )}
              </>
            )}
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
