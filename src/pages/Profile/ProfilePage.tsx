import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  RefreshCw, 
  QrCode, 
  X, 
  Check, 
  Share2, 
  Sparkles,
  Award,
  BookOpen,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
  Sun,
  Moon,
  LogOut,
  Copy,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { getPlaceholderImage, cn } from '@/lib/utils';

// Import local Profile Components
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileTabs } from './ProfileTabs';

// Subcomponents
import { VisitorActions } from './visitor/VisitorActions';
import { CreatorTools } from './artist/CreatorTools';
import { DashboardButton } from './artist/DashboardButton';
import { ManageProfile } from './artist/ManageProfile';
import { BecomeArtistCard } from './user/BecomeArtistCard';
import { LibraryCard } from './user/LibraryCard';
import { ActivityCard } from './user/ActivityCard';
import { RewardsCard } from './user/RewardsCard';
import { ArtistVerificationWizard } from './user/ArtistVerificationWizard';

// Shared Tabs Section
import { AlbumsSection } from './shared/AlbumsSection';
import { TracksSection } from './shared/TracksSection';
import { NFTSection } from './shared/NFTSection';
import { PlaylistSection } from './shared/PlaylistSection';
import { PostsSection } from './shared/PostsSection';
import { AboutSection } from './shared/AboutSection';
import { UserProfileDashboard } from '@/components/profile/UserProfileDashboard';
import { RoyaltyTrackingSection } from '@/components/profile/RoyaltyTrackingSection';
import { ArtistAnalyticsSection } from '@/components/profile/ArtistAnalyticsSection';
import { ListenStreakIndicator } from '@/components/profile/ListenStreakIndicator';

import { MOCK_PROFILE, ProfileData } from '@/components/profile/ProfileTypes';
import { PageContainer } from '@/components/layout/PageContainer';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { ToastProvider, useToast } from '@/components/layout/ToastProvider';
import { ModalProvider, useModal } from '@/components/layout/ModalProvider';

// Import Types and Mock Creators data
import { getMockAlbums, getMockSingles } from '../ArtistProfile/mock';
import { AlbumData, ArtistPost, PlaylistData } from '../ArtistProfile/types';
import { Track, NFTItem } from '@/types';

// Let's seed complete mock data for user context
const MOCK_PLAYLISTS: PlaylistData[] = [
  { id: 'p_1', name: 'Late Night Chill Synth', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop', trackCount: 15, type: 'Official', plays: 45800 },
  { id: 'p_2', name: 'DeFi Summer Beats', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop', trackCount: 12, type: 'Featured', plays: 28900 }
];

const MOCK_POSTS: ArtistPost[] = [
  {
    id: 'post_1',
    type: 'announcement',
    content: '🚨 ANNOUNCEMENT: "Solar Pulse (Extended Cut)" is dropping as a limited-edition music NFT on TON this Friday! Only 50 copies will ever be minted. Stay tuned, frequencies are warming up.',
    mediaUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    isPinned: true,
    likes: 124,
    comments: 18,
    shares: 42,
    timestamp: 'Yesterday'
  },
  {
    id: 'post_2',
    type: 'studio-update',
    content: 'Late night mixing sessions. Synthesizing sonic waveforms with clean bass lines on analog boards. Can\'t wait to share what we have built.',
    likes: 85,
    comments: 9,
    shares: 11,
    timestamp: '3 days ago'
  }
];

const MOCK_NFTS: NFTItem[] = [
  {
    id: 'nft_1',
    trackId: 'single-quantum-leap',
    title: 'Solar Pulse Master #01',
    owner: 'DJ Krupy',
    ownerId: 'tj_user_99',
    creator: 'DJ Krupy',
    artist: 'DJ Krupy',
    price: '12.5',
    imageUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    coverUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    edition: '1/1',
    description: 'An exclusive collectible audio track master node, registered securely on the TON blockchain.'
  },
  {
    id: 'nft_2',
    trackId: 'single-crypto-synth',
    title: 'Cyber Dream #04',
    owner: 'DJ Krupy',
    ownerId: 'tj_user_99',
    creator: 'DJ Krupy',
    artist: 'DJ Krupy',
    price: '8.5',
    imageUrl: 'https://i.postimg.cc/LhhtQkF0/drake.jpg',
    coverUrl: 'https://i.postimg.cc/LhhtQkF0/drake.jpg',
    edition: '1/50',
    description: 'Vibrant melodic synth waves crafted for late night city explorers.'
  }
];

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
  const { openModal } = useModal();
  const { userProfile: currentUserProfile, artists, setHeaderTitle, allTracks } = useAudio();
  const { nfts: contextNfts, getNFTsByArtist } = useNFT();
  const isOwnProfile = !visitorId;
  
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (isOwnProfile && currentUserProfile) {
      return {
        uid: currentUserProfile.uid,
        name: currentUserProfile.name || 'TONJAM User',
        username: currentUserProfile.username || 'tonjam_user',
        avatar: currentUserProfile.avatar || getPlaceholderImage(`user-${currentUserProfile.uid}`),
        bannerUrl: currentUserProfile.bannerUrl || '',
        bio: currentUserProfile.bio || '',
        memberSince: currentUserProfile.createdAt ? new Date(currentUserProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'March 2026',
        walletAddress: currentUserProfile.walletAddress || '',
        isSpotifyVerified: true,
        isArtistVerified: currentUserProfile.isVerifiedArtist || forceArtistDashboard,
        verificationStatus: currentUserProfile.verificationStatus || (forceArtistDashboard ? 'verified' : 'none'),
        followers: currentUserProfile.followers || 0,
        following: currentUserProfile.following || 0,
        monthlyListeners: 84300,
        totalStreams: 245900,
        nftsOwned: currentUserProfile.ownedNftIds?.length || 0,
        nftsSold: 0,
        playlistsCount: currentUserProfile.createdPlaylistIds?.length || 0,
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
      isArtistVerified: forceArtistDashboard,
      verificationStatus: forceArtistDashboard ? 'verified' : 'none'
    };
  });
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isCreatorDashboardMode, setIsCreatorDashboardMode] = useState<boolean>(forceArtistDashboard);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [showVerificationWizard, setShowVerificationWizard] = useState<boolean>(false);

  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setProfile((prev) => {
        const nextUid = currentUserProfile.uid;
        const nextName = currentUserProfile.name || 'TONJAM User';
        const nextAvatar = currentUserProfile.avatar || getPlaceholderImage(`user-${currentUserProfile.uid}`);
        const nextBio = currentUserProfile.bio || '';
        if (
          prev.uid === nextUid &&
          prev.name === nextName &&
          prev.avatar === nextAvatar &&
          prev.bio === nextBio &&
          prev.followers === (currentUserProfile.followers || 0) &&
          prev.following === (currentUserProfile.following || 0)
        ) {
          return prev;
        }
        return {
          uid: nextUid,
          name: nextName,
          username: currentUserProfile.username || 'tonjam_user',
          avatar: nextAvatar,
          bannerUrl: currentUserProfile.bannerUrl || '',
          bio: nextBio,
          memberSince: currentUserProfile.createdAt ? new Date(currentUserProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'March 2026',
          walletAddress: currentUserProfile.walletAddress || '',
          isSpotifyVerified: true,
          isArtistVerified: currentUserProfile.isVerifiedArtist || forceArtistDashboard,
          verificationStatus: currentUserProfile.verificationStatus || (forceArtistDashboard ? 'verified' : 'none'),
          followers: currentUserProfile.followers || 0,
          following: currentUserProfile.following || 0,
          monthlyListeners: 84300,
          totalStreams: 245900,
          nftsOwned: currentUserProfile.ownedNftIds?.length || 0,
          nftsSold: 0,
          playlistsCount: currentUserProfile.createdPlaylistIds?.length || 0,
          tjPoints: currentUserProfile.tjBalance || 100,
        } as ProfileData;
      });
    } else if (visitorId) {
      const foundArtist = artists.find(a => a.uid === visitorId);
      if (foundArtist) {
        setProfile((prev) => {
          if (prev.uid === foundArtist.uid && prev.name === foundArtist.name) {
            return prev;
          }
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
        });
      }
    }
  }, [isOwnProfile, currentUserProfile?.uid, currentUserProfile?.name, currentUserProfile?.avatar, visitorId, artists, forceArtistDashboard]);

  // Load real consistent albums & tracks from ArtistProfile mock system and user uploads
  const albumsList: AlbumData[] = getMockAlbums(profile.uid);
  const userUploadedTracks = React.useMemo(() => {
    return allTracks.filter(t => t.artistId === profile.uid || (isOwnProfile && currentUserProfile && t.artistId === currentUserProfile.uid));
  }, [allTracks, profile.uid, isOwnProfile, currentUserProfile]);
  const mockSingles = getMockSingles(profile.uid);
  const tracksList: Track[] = React.useMemo(() => {
    const combined = [...userUploadedTracks, ...mockSingles];
    return Array.from(new Map(combined.map(t => [t.id, t])).values());
  }, [userUploadedTracks, mockSingles]);

  // Set header title to user name
  useEffect(() => {
    if (profile.name) {
      setHeaderTitle(profile.name);
    }
    return () => {
      setHeaderTitle('');
    };
  }, [profile.name, setHeaderTitle]);

  // Apply Theme Toggle Class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Simulated Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Profile Synced', 'Ecosystem nodes and Web3 wallet synchronized.');
    }, 1200);
  };

  const handleApplyArtist = () => {
    setShowVerificationWizard(true);
  };

  const handleCompleteVerification = () => {
    setProfile(prev => ({ 
      ...prev, 
      verificationStatus: 'verified',
      isArtistVerified: true 
    }));
    setIsCreatorDashboardMode(true);
    toast.success('Creator Space Unlocked', 'Explore your listener analytics, earnings split, and mint music NFTs!');
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://tonjam.app/user/${profile.username}`);
    setCopiedLink(true);
    toast.success('Link Copied', 'Ecosystem profile link saved to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = (updated: Partial<ProfileData>) => {
    setProfile(prev => ({
      ...prev,
      ...updated
    }));
  };

  const renderActiveTabContent = () => {
    // If Creator mode is explicitly active, override standard tabs
    if (isCreatorDashboardMode && profile.isArtistVerified) {
      return (
        <CreatorTools profile={profile} />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Visual Header / Visitor Action Row */}
            <VisitorActions 
              profile={profile} 
              onShare={() => setShowSettings(true)}
              onOpenChat={() => toast.info('Direct Message', 'Loading secure end-to-end telegram chat tunnel...')}
            />

            {/* Listen Streak Indicator */}
            <div id="listen-streak-section">
              <ListenStreakIndicator isOwnProfile={isOwnProfile} />
            </div>

            {/* Artist Analytics Section Preview */}
            <ArtistAnalyticsSection profile={profile} />

            {/* If unverified, offer option card */}
            {isOwnProfile && !profile.isArtistVerified && (
              <BecomeArtistCard 
                status={profile.verificationStatus} 
                onApply={handleApplyArtist} 
              />
            )}

            {/* Core User cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LibraryCard tracksCount={24} playlistsCount={profile.playlistsCount} />
              <RewardsCard initialTjPoints={profile.tjPoints} />
            </div>

            <ActivityCard />
          </div>
        );

      case 'analytics':
        return <ArtistAnalyticsSection profile={profile} />;

      case 'dashboard':
        return <UserProfileDashboard />;

      case 'royalties':
        return <RoyaltyTrackingSection />;

      case 'tracks':
        return (
          <TracksSection 
            tracks={tracksList}
            onPlayTrack={(id) => toast.info('Playing Waveform', `Loading track ID ${id}`)}
          />
        );

      case 'albums':
        return (
          <AlbumsSection 
            albums={albumsList}
            onPlayAlbum={(id) => toast.info('Playing Album', `Streaming full album tracks: ${id}`)}
          />
        );

      case 'nfts': {
        const profileNFTs = isOwnProfile 
          ? contextNfts 
          : getNFTsByArtist(profile.uid).length > 0 
            ? getNFTsByArtist(profile.uid) 
            : contextNfts.filter(nft => nft.artistId === profile.uid || nft.creator.toLowerCase() === profile.name.toLowerCase());
        return (
          <NFTSection 
            nfts={profileNFTs} 
            isOwnProfile={isOwnProfile} 
          />
        );
      }

      case 'playlists':
        return (
          <PlaylistSection 
            playlists={MOCK_PLAYLISTS}
            onPlayPlaylist={(id) => toast.info('Playing Playlist', `Streaming playlist frequencies: ${id}`)}
          />
        );

      case 'posts':
        return <PostsSection posts={MOCK_POSTS} />;

      case 'about':
        return <AboutSection profile={profile} />;

      default:
        return null;
    }
  };

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="text-white min-h-screen relative pb-24">
      {/* Pull To Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 15, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 z-50 bg-[#0052FF] p-2.5 rounded-full text-white flex items-center justify-center shadow-lg"
          >
            <RefreshCw className="w-5 h-5 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sync Gesture */}
      <div 
        onClick={handleRefresh}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 cursor-pointer p-1.5 hover:bg-white/5 rounded-full opacity-50 hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-opacity"
        title="Sync Nodes"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Sync Nodes</span>
      </div>

      {/* Header Banner & Meta */}
      <ProfileHeader 
        profile={profile}
        onOpenSettings={() => setShowSettings(true)}
        onEditCover={() => toast.info('Edit Cover', 'Select new banner graphic from assets.')}
        onEditAvatar={() => toast.info('Edit Avatar', 'Select new profile picture.')}
        isOwnProfile={isOwnProfile}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Toggle dashboard / Profile tools */}
        {profile.isArtistVerified && (
          <DashboardButton 
            isDashboardActive={isCreatorDashboardMode} 
            onToggle={() => setIsCreatorDashboardMode(!isCreatorDashboardMode)} 
          />
        )}

        {/* Global profile statistics */}
        <ProfileStats profile={profile} />

        {/* Navigation tabs */}
        {!isCreatorDashboardMode && (
          <ProfileTabs 
            activeTab={activeTab} 
            onChangeTab={setActiveTab} 
            isArtist={profile.isArtistVerified}
          />
        )}

        {/* Main interactive cards panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isCreatorDashboardMode ? 'creator' : activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Unified Draggable Bottom Sheet for Options Settings */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Profile Options"
      >
        <div className="space-y-1 py-1">
          <button
            onClick={() => { setIsEditProfileOpen(true); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <User className="w-5 h-5 text-[#0052FF]" />
            <span>Edit Profile Details</span>
          </button>

          <button
            onClick={() => { toast.info('Cover Image', 'Select cover image asset'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <span>Change Cover Artwork</span>
          </button>

          <button
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
            onClick={() => { setShowQRCode(true); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <QrCode className="w-5 h-5 text-[#0052FF]" />
            <span>Show QR Code</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-semibold cursor-pointer text-white"
          >
            <div className="flex items-center gap-4">
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-[#0052FF]" />
              )}
              <span>{isDarkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
          </button>

          <div className="h-px bg-white/5 my-3" />

          <button
            onClick={() => { toast.success('Logged Out', 'Successfully disconnected from node'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 active:bg-red-500/20 text-red-400 rounded-xl transition-colors text-left text-sm font-bold cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout Wallet Node</span>
          </button>
        </div>
      </BottomSheet>

      {/* QR Code Dialog Overlay */}
      <AnimatePresence>
        {showQRCode && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#050A24] rounded-[24px] p-6 max-w-xs w-full text-center relative text-white shadow-2xl"
            >
              <button 
                onClick={() => setShowQRCode(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-5">
                Share Profile QR
              </h3>
              
              <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center">
                <div className="w-full h-full bg-white flex flex-col items-center justify-center relative rounded-xl">
                  <QrCode className="w-36 h-36 text-[#050A24]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#0052FF] text-white flex items-center justify-center rounded-lg font-bold text-xs shadow-md">
                      TJ
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono">
                @{profile.username}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Profile Edit Form Dialog */}
      <ManageProfile 
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Interactive Artist Onboarding Steps Wizard */}
      <ArtistVerificationWizard 
        isOpen={showVerificationWizard}
        onClose={() => setShowVerificationWizard(false)}
        onComplete={handleCompleteVerification}
      />
    </PageContainer>
  );
};

const ArtistDashboardProfile: React.FC = () => {
  return <ProfileScreenContent forceArtistDashboard={true} />;
};

const UserProfile: React.FC = () => {
  return <ProfileScreenContent forceArtistDashboard={false} />;
};

const VisitorProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return <ProfileScreenContent visitorId={id} />;
};

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { userProfile } = useAudio();
  const isOwnProfile = !id || id === userProfile?.uid;
  const user = userProfile;

  return (
    <>
      {(() => {
          if (isOwnProfile && user?.isVerifiedArtist) {
            return <ArtistDashboardProfile />
          }

          if (isOwnProfile) {
            return <UserProfile />
          }

          return <VisitorProfile />
        })()}
    </>
  );
};

export default ProfilePage;
