import React, { useState, useEffect, useMemo } from 'react';
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
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { UserProfile as UserProfileType } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

// Import subcomponents
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileActionButton } from '@/components/profile/ProfileActionButton';
import { QuickActions } from '@/components/profile/QuickActions';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { OverviewTab } from '@/components/profile/OverviewTab';
import { TracksTab } from '@/components/profile/TracksTab';
import { NFTTab } from '@/components/profile/NFTTab';
import { PlaylistTab } from '@/components/profile/PlaylistTab';
import { ActivityTab } from '@/components/profile/ActivityTab';
import { AboutTab } from '@/components/profile/AboutTab';
import { ArtistAnalyticsSection } from '@/components/profile/ArtistAnalyticsSection';
import { ArtistDashboardCard } from '@/components/profile/ArtistDashboardCard';
import { TonWalletVerification } from '@/components/profile/TonWalletVerification';
import { MOCK_PROFILE, ProfileData } from '@/components/profile/ProfileTypes';
import EditProfileModal from '@/components/EditProfileModal';

// Import layout components and contexts
import { PageContainer } from '@/components/layout/PageContainer';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { useToast } from '@/components/layout/ToastProvider';
import { useModal } from '@/components/layout/ModalProvider';

const ProfileScreenContent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { openModal } = useModal();
  const { user: authUser, userProfile: authUserProfile } = useAuth();
  const { playlists } = useAudio();
  const { nfts } = useNFT();
  
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (authUserProfile) {
      return {
        uid: authUserProfile.uid,
        name: authUserProfile.name || 'TONJAM User',
        username: authUserProfile.username || 'tonjam_user',
        avatar: authUserProfile.avatar || getPlaceholderImage(`user-${authUserProfile.uid}`),
        bannerUrl: authUserProfile.bannerUrl || MOCK_PROFILE.bannerUrl,
        bio: authUserProfile.bio || MOCK_PROFILE.bio,
        genre: MOCK_PROFILE.genre,
        country: MOCK_PROFILE.country,
        memberSince: authUserProfile.createdAt ? new Date(authUserProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : MOCK_PROFILE.memberSince,
        walletAddress: authUserProfile.walletAddress || MOCK_PROFILE.walletAddress,
        isSpotifyVerified: Boolean(authUserProfile.isVerifiedArtist),
        isArtistVerified: Boolean(authUserProfile.isVerifiedArtist || authUserProfile.role === 'artist'),
        isTonVerified: Boolean(authUserProfile.walletAddress),
        verificationStatus: authUserProfile.isVerifiedArtist ? 'verified' : 'none',
        followers: authUserProfile.followers || 0,
        following: authUserProfile.following || 0,
        monthlyListeners: 1200,
        totalStreams: 4500,
        nftsOwned: 0,
        nftsSold: 0,
        playlistsCount: 0,
        tjPoints: authUserProfile.tjBalance || 150,
        socials: authUserProfile.socials || MOCK_PROFILE.socials
      };
    }
    return MOCK_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isArtistDashboardMode, setIsArtistDashboardMode] = useState<boolean>(false);

  const targetUid = authUser?.uid || authUserProfile?.uid || profile.uid;

  // Real-time Firestore subscription for users/{uid}
  useEffect(() => {
    if (!targetUid) return;

    const userDocRef = doc(db, 'users', targetUid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile((prev) => ({
            ...prev,
            uid: docSnap.id,
            name: data.name || prev.name,
            username: data.username || prev.username,
            avatar: data.avatar || prev.avatar,
            bannerUrl: data.bannerUrl || prev.bannerUrl,
            bio: data.bio !== undefined ? data.bio : prev.bio,
            genre: data.genre || prev.genre,
            country: data.country || prev.country,
            memberSince: data.memberSince || (data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : prev.memberSince),
            walletAddress: data.walletAddress || prev.walletAddress,
            isSpotifyVerified: Boolean(data.isSpotifyVerified ?? prev.isSpotifyVerified),
            isArtistVerified: Boolean(data.isArtistVerified || data.isVerifiedArtist || data.role === 'artist' || prev.isArtistVerified),
            isTonVerified: Boolean(data.isTonVerified ?? (data.walletAddress ? true : prev.isTonVerified)),
            verificationStatus: data.verificationStatus || (data.isVerifiedArtist ? 'verified' : prev.verificationStatus),
            followers: typeof data.followers === 'number' ? data.followers : prev.followers,
            following: typeof data.following === 'number' ? data.following : prev.following,
            monthlyListeners: typeof data.monthlyListeners === 'number' ? data.monthlyListeners : prev.monthlyListeners,
            totalStreams: typeof data.totalStreams === 'number' ? data.totalStreams : prev.totalStreams,
            nftsSold: typeof data.nftsSold === 'number' ? data.nftsSold : prev.nftsSold,
            tjPoints: typeof data.tjPoints === 'number' ? data.tjPoints : (data.tjBalance ?? prev.tjPoints),
            socials: data.socials || prev.socials
          }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${targetUid}`);
      }
    );

    return () => unsubscribe();
  }, [targetUid]);

  // Compute real owned NFTs
  const ownedNfts = useMemo(() => {
    return nfts.filter(
      (nft) =>
        nft.ownerId === targetUid ||
        (profile.walletAddress && nft.owner === profile.walletAddress) ||
        nft.owner === profile.name ||
        nft.owner === profile.username
    );
  }, [nfts, targetUid, profile.walletAddress, profile.name, profile.username]);

  // Compute real user playlists
  const userPlaylists = useMemo(() => {
    return playlists.filter(
      (pl) =>
        pl.creator === profile.name ||
        pl.creator === profile.username ||
        (pl as any).creatorId === targetUid ||
        (pl as any).userId === targetUid
    );
  }, [playlists, profile.name, profile.username, targetUid]);

  // Keep stats in sync with computed NFTs and Playlists count
  const dynamicProfile: ProfileData = useMemo(() => ({
    ...profile,
    nftsOwned: ownedNfts.length > 0 ? ownedNfts.length : profile.nftsOwned,
    playlistsCount: userPlaylists.length > 0 ? userPlaylists.length : profile.playlistsCount
  }), [profile, ownedNfts.length, userPlaylists.length]);

  // Apply Theme Toggle Class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Pull to refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Profile Refreshed', 'Ecosystem synchronization completed');
    }, 1200);
  };

  const handleBecomeArtist = async () => {
    setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
    toast.info('Application Pending', 'Verification application submitted successfully');
    
    try {
      if (targetUid) {
        const userRef = doc(db, 'users', targetUid);
        await updateDoc(userRef, cleanUpdateData({
          verificationStatus: 'pending'
        }));
      }
    } catch (err) {
      console.warn('Could not update pending status:', err);
    }
    
    // Auto-approve after 4 seconds to show transition layout animation
    setTimeout(async () => {
      setProfile(prev => ({ 
        ...prev, 
        verificationStatus: 'verified',
        isArtistVerified: true 
      }));
      toast.success('Verification Complete', 'Congratulations! You are now a verified TonJam artist');
      try {
        if (targetUid) {
          const userRef = doc(db, 'users', targetUid);
          await updateDoc(userRef, cleanUpdateData({
            verificationStatus: 'verified',
            isArtistVerified: true,
            role: 'artist'
          }));
        }
      } catch (e) {
        console.warn('Could not persist verified artist state:', e);
      }
    }, 4500);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://tonjam.app/user/${dynamicProfile.username}`);
    setCopiedLink(true);
    toast.success('Link Copied', 'Profile URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProfileUpdate = (updated: UserProfileType) => {
    setProfile((prev) => ({
      ...prev,
      name: updated.name || prev.name,
      username: updated.username || prev.username,
      bio: updated.bio !== undefined ? updated.bio : prev.bio,
      avatar: updated.avatar || prev.avatar,
      socials: updated.socials || prev.socials
    }));
    toast.success('Profile Updated', 'Your profile details have been saved.');
  };

  const renderActiveTabContent = () => {
    if (isArtistDashboardMode && dynamicProfile.isArtistVerified) {
      return (
        <ArtistDashboardCard 
          onUploadTrack={() => navigate('/upload')}
          onMintNFT={() => navigate('/mint')}
          onOpenAnalytics={() => navigate('/artist-analytics')}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            profile={dynamicProfile}
            onPlayTrack={(id) => toast.info('Playing Track', `Frequency sequence ${id} loaded`)}
            onSelectArtist={(uid) => toast.info('Opening Artist', `Navigating to artist ${uid}`)}
          />
        );
      case 'analytics':
        return <ArtistAnalyticsSection profile={dynamicProfile} />;
      case 'tracks':
        return <TracksTab onPlayTrack={(id) => toast.info('Playing Track', `Frequency sequence ${id} loaded`)} />;
      case 'nfts':
        return (
          <NFTTab 
            nfts={ownedNfts.length > 0 ? ownedNfts : undefined}
            onSelectNFT={(id) => {
              navigate(`/nft/${id}`);
            }} 
          />
        );
      case 'playlists':
        return (
          <PlaylistTab 
            playlists={userPlaylists.length > 0 ? userPlaylists : undefined}
            onSelectPlaylist={(id) => {
              navigate(`/playlist/${id}`);
            }} 
          />
        );
      case 'activity':
        return <ActivityTab />;
      case 'about':
        return <AboutTab profile={dynamicProfile} />;
      case 'following':
        return (
          <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-6 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
            You are following {dynamicProfile.following} creators in the ecosystem.
          </div>
        );
      default:
        return null;
    }
  };

  const userProfileForModal: UserProfileType = {
    uid: dynamicProfile.uid,
    name: dynamicProfile.name,
    username: dynamicProfile.username,
    avatar: dynamicProfile.avatar,
    bio: dynamicProfile.bio || '',
    walletAddress: dynamicProfile.walletAddress || '',
    socials: dynamicProfile.socials || {},
    followers: dynamicProfile.followers,
    following: dynamicProfile.following,
    earnings: 0,
    tjBalance: dynamicProfile.tjPoints
  };

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="text-white">
      {/* Android Refresh Indicator */}
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

      {/* Floating Swipe Gesture Trigger zone */}
      <div 
        onClick={handleRefresh}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 cursor-pointer p-1.5 hover:bg-white/5 rounded-full opacity-50 hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-300"
        title="Pull to Refresh"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh</span>
      </div>

      {/* Profile Header Block */}
      <ProfileHeader 
        profile={dynamicProfile}
        onOpenSettings={() => setShowSettings(true)}
        onEditCover={() => toast.info('Cover Update', 'Select new banner artwork')}
        onEditAvatar={() => setShowEditModal(true)}
        onEditProfile={() => setShowEditModal(true)}
      />

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 py-3.5 px-6 bg-white/10 hover:bg-white/20 active:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-[12px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Edit3 className="w-4 h-4 shrink-0 text-[#0052FF]" />
            <span>Edit Profile</span>
          </button>
          
          <div className="flex-1">
            <ProfileActionButton 
              isArtistVerified={dynamicProfile.isArtistVerified}
              verificationStatus={dynamicProfile.verificationStatus}
              onBecomeArtist={handleBecomeArtist}
              onOpenDashboard={() => setIsArtistDashboardMode(!isArtistDashboardMode)}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <ProfileStats profile={dynamicProfile} />

        {/* Reusable Quick Actions Grids */}
        <QuickActions 
          onActionClick={(actionId) => {
            if (actionId === 'settings') {
              setShowSettings(true);
            } else if (actionId === 'wallet') {
              openModal('wallet', 'Connect Web3 Wallet');
            } else if (actionId === 'share') {
              openModal('share', 'Share Profile');
            } else {
              toast.info('Action Triggered', `Opening ${actionId} parameters`);
            }
          }}
        />

        {/* TON Blockchain Wallet Verification Node */}
        <TonWalletVerification 
          walletAddress={dynamicProfile.walletAddress}
          isVerified={dynamicProfile.isTonVerified}
          onVerifiedSuccess={() => setProfile(prev => ({ ...prev, isTonVerified: true }))}
        />

        {/* Custom Tabs Navigation */}
        {!isArtistDashboardMode && (
          <ProfileTabs 
            activeTab={activeTab}
            onChangeTab={(tabId) => setActiveTab(tabId)}
          />
        )}

        {/* Dynamic Tab Panel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isArtistDashboardMode ? 'dashboard' : activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={userProfileForModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* Unified Draggable Bottom Sheet for Options Settings */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Profile Options"
      >
        <div className="space-y-1 py-1">
          <button
            onClick={() => { setShowEditModal(true); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
          >
            <User className="w-5 h-5 text-[#0052FF]" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => { toast.info('Cover Image', 'Select cover image asset'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <span>Change Cover</span>
          </button>

          <button
            onClick={() => { openModal('share', 'Share Profile'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
          >
            <Share2 className="w-5 h-5 text-[#0052FF]" />
            <span>Share Profile</span>
          </button>

          <button
            onClick={handleCopyProfileLink}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
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
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
          >
            <QrCode className="w-5 h-5 text-[#0052FF]" />
            <span>QR Code</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors text-left text-sm font-medium cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-[#0052FF]" />
              )}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {isDarkMode ? 'Light Theme' : 'Dark Theme'}
            </span>
          </button>

          <div className="h-px bg-white/5 my-3" />

          <button
            onClick={() => { toast.success('Logged Out', 'Successfully disconnected from node'); setShowSettings(false); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 active:bg-red-500/20 text-red-400 rounded-xl transition-colors text-left text-sm font-bold cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </BottomSheet>

      {/* QR Code Dialog Overlay */}
      <AnimatePresence>
        {showQRCode && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#050A24] border border-white/5 rounded-[20px] p-6 max-w-xs w-full text-center relative text-white"
            >
              <button 
                onClick={() => setShowQRCode(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-300 mb-5">
                Share Profile QR
              </h3>
              
              <div className="w-48 h-48 bg-white p-3 rounded-[12px] mx-auto flex items-center justify-center">
                {/* Simulated high fidelity QR code */}
                <div className="w-full h-full border-[6px] border-[#050A24] bg-white flex flex-col items-center justify-center relative">
                  <QrCode className="w-36 h-36 text-[#050A24]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#0052FF] text-white flex items-center justify-center rounded-lg font-bold text-xs">
                      TJ
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono">
                @{dynamicProfile.username}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export const ProfileScreen: React.FC = () => {
  return (
    <ProfileScreenContent />
  );
};

export default ProfileScreen;
