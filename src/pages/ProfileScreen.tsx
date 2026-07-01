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
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
import { ArtistDashboardCard } from '@/components/profile/ArtistDashboardCard';
import { TonWalletVerification } from '@/components/profile/TonWalletVerification';
import { MOCK_PROFILE, ProfileData } from '@/components/profile/ProfileTypes';

// Import newly updated layout components and contexts
import { PageContainer } from '@/components/layout/PageContainer';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { ToastProvider, useToast } from '@/components/layout/ToastProvider';
import { ModalProvider, useModal } from '@/components/layout/ModalProvider';

const ProfileScreenContent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { openModal } = useModal();
  
  const [profile, setProfile] = useState<ProfileData>(MOCK_PROFILE);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isArtistDashboardMode, setIsArtistDashboardMode] = useState<boolean>(false);

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

  const handleBecomeArtist = () => {
    setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
    toast.info('Application Pending', 'Verification application submitted successfully');
    
    // Auto-approve after 4 seconds to show transition layout animation
    setTimeout(() => {
      setProfile(prev => ({ 
        ...prev, 
        verificationStatus: 'verified',
        isArtistVerified: true 
      }));
      toast.success('Verification Complete', 'Congratulations! You are now a verified TonJam artist');
    }, 4500);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://tonjam.app/user/${profile.username}`);
    setCopiedLink(true);
    toast.success('Link Copied', 'Profile URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderActiveTabContent = () => {
    if (isArtistDashboardMode && profile.isArtistVerified) {
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
            profile={profile}
            onPlayTrack={(id) => toast.info('Playing Track', `Frequency sequence ${id} loaded`)}
            onSelectArtist={(uid) => toast.info('Opening Artist', `Navigating to artist ${uid}`)}
          />
        );
      case 'tracks':
        return <TracksTab onPlayTrack={(id) => toast.info('Playing Track', `Frequency sequence ${id} loaded`)} />;
      case 'nfts':
        return <NFTTab onSelectNFT={(id) => toast.info('NFT Details', `Accessing metadata block ${id}`)} />;
      case 'playlists':
        return <PlaylistTab onSelectPlaylist={(id) => toast.info('Opening Playlist', `Accessing node list ${id}`)} />;
      case 'activity':
        return <ActivityTab />;
      case 'about':
        return <AboutTab profile={profile} />;
      case 'following':
        return (
          <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-6 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
            You are following {profile.following} creators in the ecosystem.
          </div>
        );
      default:
        return null;
    }
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
        profile={profile}
        onOpenSettings={() => setShowSettings(true)}
        onEditCover={() => toast.info('Cover Update', 'Select new banner artwork')}
        onEditAvatar={() => toast.info('Avatar Update', 'Select new profile image')}
      />

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Action Buttons Row */}
        <div className="flex gap-3">
          <ProfileActionButton 
            isArtistVerified={profile.isArtistVerified}
            verificationStatus={profile.verificationStatus}
            onBecomeArtist={handleBecomeArtist}
            onOpenDashboard={() => setIsArtistDashboardMode(!isArtistDashboardMode)}
          />
        </div>

        {/* Quick Stats Grid */}
        <ProfileStats profile={profile} />

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
          walletAddress={profile.walletAddress}
          isVerified={profile.isTonVerified}
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

      {/* Unified Draggable Bottom Sheet for Options Settings */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Profile Options"
      >
        <div className="space-y-1 py-1">
          <button
            onClick={() => { navigate('/edit-profile'); setShowSettings(false); }}
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
                @{profile.username}
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
    <ToastProvider>
      <ModalProvider>
        <ProfileScreenContent />
      </ModalProvider>
    </ToastProvider>
  );
};

export default ProfileScreen;
