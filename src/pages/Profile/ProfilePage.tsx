import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  QrCode, 
  Settings, 
  Sparkles,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
  Sun,
  Moon,
  LogOut,
  Copy,
  Check,
  Clock,
  ListMusic,
  Gem,
  Heart,
  ChevronRight,
  LayoutDashboard,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { getPlaceholderImage } from '@/lib/utils';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';
import { ProfileData, MOCK_PROFILE } from '@/components/profile/ProfileTypes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { useToast } from '@/components/layout/ToastProvider';
import { ProfileQRCodeModal } from '@/components/profile/ProfileQRCodeModal';
import { CreatorTools } from './artist/CreatorTools';
import { DashboardButton } from './artist/DashboardButton';

interface ProfileScreenContentProps {
  forceArtistDashboard?: boolean;
  visitorId?: string;
}

const ProfileScreenContent: React.FC<ProfileScreenContentProps> = ({
  forceArtistDashboard = false,
  visitorId
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { 
    userProfile: currentUserProfile, 
    artists, 
    setHeaderTitle,
    recentlyPlayed,
    likedTrackIds,
    playlists: userPlaylists
  } = useAudio();
  const { nfts: contextNfts } = useNFT();
  const isOwnProfile = !visitorId;
  
  const getValidStatus = (status?: string): 'none' | 'verified' | 'pending' | 'rejected' => {
    if (status === 'verified' || status === 'pending' || status === 'rejected') return status;
    return 'none';
  };

  const [profile, setProfile] = useState<ProfileData>(() => {
    if (isOwnProfile && currentUserProfile) {
      return {
        uid: currentUserProfile.uid,
        name: currentUserProfile.name || 'Krupy',
        username: currentUserProfile.username || 'krupy',
        avatar: currentUserProfile.avatar || getPlaceholderImage(`user-${currentUserProfile.uid}`),
        bannerUrl: currentUserProfile.bannerUrl || '',
        bio: currentUserProfile.bio || '',
        memberSince: currentUserProfile.createdAt ? new Date(currentUserProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'March 2026',
        walletAddress: currentUserProfile.walletAddress || '',
        isSpotifyVerified: true,
        isArtistVerified: currentUserProfile.isVerifiedArtist || forceArtistDashboard,
        verificationStatus: getValidStatus(currentUserProfile.verificationStatus) || (forceArtistDashboard ? 'verified' : 'none'),
        followers: currentUserProfile.followers || 128,
        following: currentUserProfile.following || 42,
        monthlyListeners: 84300,
        totalStreams: 245900,
        nftsOwned: currentUserProfile.ownedNftIds?.length || 3,
        nftsSold: 0,
        playlistsCount: currentUserProfile.createdPlaylistIds?.length || 4,
        tjPoints: currentUserProfile.tjBalance || 100,
      } as ProfileData;
    }
    
    if (visitorId) {
      const foundArtist = artists.find(a => a.uid === visitorId);
      if (foundArtist) {
        return {
          uid: foundArtist.uid,
          name: foundArtist.name,
          username: foundArtist.username || foundArtist.name.toLowerCase().replace(/\s+/g, ''),
          avatar: foundArtist.avatarUrl || getPlaceholderImage(`user-${foundArtist.uid}`),
          bannerUrl: foundArtist.bannerUrl || foundArtist.bannerImageUrl || '',
          bio: foundArtist.bio || '',
          memberSince: 'March 2026',
          walletAddress: foundArtist.walletAddress || '',
          isSpotifyVerified: true,
          isArtistVerified: foundArtist.isVerifiedArtist || true,
          verificationStatus: 'verified',
          followers: foundArtist.followers || 0,
          following: 0,
          monthlyListeners: foundArtist.monthlyListeners || 5000,
          totalStreams: 12500,
          nftsOwned: 0,
          nftsSold: 0,
          playlistsCount: 0,
          tjPoints: 0,
        } as ProfileData;
      }
    }
    
    return {
      ...MOCK_PROFILE,
      name: 'Krupy',
      username: 'krupy',
      followers: 128,
      following: 42,
      isArtistVerified: forceArtistDashboard,
      verificationStatus: forceArtistDashboard ? 'verified' : 'none'
    };
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isCreatorDashboardMode, setIsCreatorDashboardMode] = useState<boolean>(forceArtistDashboard);

  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setProfile((prev) => ({
        ...prev,
        uid: currentUserProfile.uid,
        name: currentUserProfile.name || prev.name || 'Krupy',
        username: currentUserProfile.username || prev.username || 'krupy',
        avatar: currentUserProfile.avatar || prev.avatar || getPlaceholderImage(`user-${currentUserProfile.uid}`),
        bio: currentUserProfile.bio || prev.bio,
        followers: currentUserProfile.followers ?? prev.followers ?? 128,
        following: currentUserProfile.following ?? prev.following ?? 42,
        isArtistVerified: currentUserProfile.isVerifiedArtist || forceArtistDashboard,
        verificationStatus: getValidStatus(currentUserProfile.verificationStatus) || (forceArtistDashboard ? 'verified' : 'none')
      }));
    }
  }, [isOwnProfile, currentUserProfile, forceArtistDashboard]);

  // Set header title
  useEffect(() => {
    if (profile.name) {
      setHeaderTitle(profile.name);
    }
    return () => {
      setHeaderTitle('');
    };
  }, [profile.name, setHeaderTitle]);

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://tonjam.app/user/${profile.username}`);
    setCopiedLink(true);
    toast.success('Link Copied', 'Profile link saved to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const recentCount = recentlyPlayed?.length || 0;
  const playlistCount = userPlaylists?.length || profile.playlistsCount || 0;
  const nftsCount = contextNfts?.length || profile.nftsOwned || 0;
  const likedCount = likedTrackIds?.length || 0;

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="text-white min-h-screen relative pb-28">
      <PageHeader
        title="Profile"
        showBack={true}
        rightContent={
          isOwnProfile ? (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 -mr-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-none outline-none"
              aria-label="Profile options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowQRCode(true)}
              className="p-2 -mr-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-none outline-none"
              aria-label="Share QR code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          )
        }
      />

      {/* 2. PROFILE HERO DETAILS (Centered per ASCII Specification) */}
      <div className="flex flex-col items-center text-center px-4 pt-2 pb-6">
        {/* [PROFILE PHOTO] */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-neutral-900 shadow-xl">
            <img 
              src={profile.avatar || getPlaceholderImage(`user-${profile.uid}`)} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => navigate('/edit-profile')}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-xs font-semibold text-white cursor-pointer"
              aria-label="Change profile photo"
            >
              Change
            </button>
          )}
        </div>

        {/* Krupy (Display Name) */}
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {profile.name}
          </h1>
          <ArtistVerificationBadge 
            isVerified={Boolean(profile.isArtistVerified || profile.isSpotifyVerified)}
            artistName={profile.name}
            size="sm"
          />
        </div>

        {/* @krupy (Username Handle) */}
        <p className="text-xs sm:text-sm font-normal text-zinc-400 mb-4">
          @{profile.username}
        </p>

        {/* Followers & Following */}
        <div className="flex items-center justify-center gap-6 text-sm mb-5">
          <button
            type="button"
            onClick={() => navigate('/followers-following')}
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="font-bold text-white mr-1.5">{profile.followers}</span>
            <span className="text-zinc-400">Followers</span>
          </button>
          <span className="text-zinc-600">•</span>
          <button
            type="button"
            onClick={() => navigate('/followers-following')}
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="font-bold text-white mr-1.5">{profile.following}</span>
            <span className="text-zinc-400">Following</span>
          </button>
        </div>

        {/* Edit Profile Button */}
        {isOwnProfile ? (
          <button
            type="button"
            onClick={() => navigate('/edit-profile')}
            className="px-6 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={() => toast.info('Followed', `You are now following ${profile.name}`)}
            className="px-6 py-2 rounded-full bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Follow
          </button>
        )}
      </div>

      {/* Creator Dashboard toggle if artist verified */}
      {profile.isArtistVerified && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <DashboardButton 
            isDashboardActive={isCreatorDashboardMode} 
            onToggle={() => setIsCreatorDashboardMode(!isCreatorDashboardMode)} 
          />
        </div>
      )}

      {/* 3. CORE MUSIC LIST SECTIONS (Matching ASCII structure) */}
      <div className="max-w-md mx-auto px-4 pt-2">
        {isCreatorDashboardMode && profile.isArtistVerified ? (
          <CreatorTools profile={profile} />
        ) : (
          <div className="divide-y-0 space-y-1">
            {/* Recently Played */}
            <div
              onClick={() => navigate('/library/recently-played')}
              className="group flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/library/recently-played');
                }
              }}
              aria-label="Go to Recently Played"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center shrink-0 text-[#00B4D8]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#00B4D8] transition-colors">
                    Recently Played
                  </p>
                  {recentCount > 0 && (
                    <p className="text-xs text-zinc-400">{recentCount} tracks</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="h-px bg-white/[0.06] mx-2" />

            {/* My Playlists */}
            <div
              onClick={() => navigate('/library')}
              className="group flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/library');
                }
              }}
              aria-label="Go to My Playlists"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center shrink-0 text-[#0052FF]">
                  <ListMusic className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#0052FF] transition-colors">
                    My Playlists
                  </p>
                  {playlistCount > 0 && (
                    <p className="text-xs text-zinc-400">{playlistCount} playlists</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="h-px bg-white/[0.06] mx-2" />

            {/* My NFTs */}
            <div
              onClick={() => navigate('/library/my-nfts')}
              className="group flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/library/my-nfts');
                }
              }}
              aria-label="Go to My NFTs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center shrink-0 text-[#00B4D8]">
                  <Gem className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#00B4D8] transition-colors">
                    My NFTs
                  </p>
                  {nftsCount > 0 && (
                    <p className="text-xs text-zinc-400">{nftsCount} collectibles</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
            </div>

            <div className="h-px bg-white/[0.06] mx-2" />

            {/* Liked / Saved */}
            <div
              onClick={() => navigate('/favorite-tracks')}
              className="group flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/favorite-tracks');
                }
              }}
              aria-label="Go to Liked and Saved tracks"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#242424] flex items-center justify-center shrink-0 text-[#E02424]">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#E02424] transition-colors">
                    Liked / Saved
                  </p>
                  {likedCount > 0 && (
                    <p className="text-xs text-zinc-400">{likedCount} favorite tracks</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Profile Options"
      >
        <div className="space-y-1 py-1">
          <button
            type="button"
            onClick={() => { navigate('/edit-profile'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <User className="w-5 h-5 text-[#0052FF]" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => { handleCopyProfileLink(); setShowSettings(false); }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <div className="flex items-center gap-4">
              <LinkIcon className="w-5 h-5 text-slate-400" />
              <span>Copy Profile Link</span>
            </div>
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => { setShowQRCode(true); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <QrCode className="w-5 h-5 text-[#0052FF]" />
            <span>Show QR Code</span>
          </button>

          <div className="h-px bg-white/5 my-3" />

          <button
            type="button"
            onClick={() => { toast.success('Logged Out', 'Successfully disconnected wallet'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 active:bg-red-500/20 text-red-400 rounded-xl transition-colors text-left text-sm font-bold cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </BottomSheet>

      {/* QR Code Modal */}
      <ProfileQRCodeModal 
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        profile={{
          name: profile.name,
          username: profile.username,
          avatar: profile.avatar,
          role: profile.isArtistVerified ? 'Artist' : 'TonJam User',
          bio: profile.bio,
          isVerified: Boolean(profile.isArtistVerified || profile.isSpotifyVerified),
          uid: profile.uid
        }}
      />
    </PageContainer>
  );
};

export const ProfilePage: React.FC<ProfileScreenContentProps> = (props) => {
  return <ProfileScreenContent {...props} />;
};

export default ProfilePage;
