import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Link2,
  EyeOff,
  UserX,
  Trash2,
  Bell,
  Heart,
  MessageCircle,
  Radio,
  Sparkles,
  ShoppingBag,
  Volume2,
  Play,
  Smartphone,
  HardDrive,
  Wifi,
  Palette,
  Globe,
  Wallet,
  Coins,
  Layers,
  Database,
  HelpCircle,
  Mail,
  FileText,
  Info,
  LogOut,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  TonJamHeader,
  ProfileSummaryCard,
  SectionHeading,
  SettingsRow,
  SettingsToggleRow,
  SettingsSelectionRow,
  ConfirmationDialog,
  BottomSheet,
} from '../index';
import { ProfileData } from '../types';
import { toast } from 'sonner';

interface MobileSettingsScreenProps {
  profile?: ProfileData;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const MobileSettingsScreen: React.FC<MobileSettingsScreenProps> = ({
  profile = {
    name: 'Alex Rivers',
    username: 'alexrivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    role: 'Artist',
    walletAddress: 'EQB...4f2a',
  },
  onNavigate,
  onBack,
  showBack = false,
}) => {
  // Notification toggle states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [likesEnabled, setLikesEnabled] = useState(true);
  const [mentionsEnabled, setMentionsEnabled] = useState(true);
  const [artistReleasesEnabled, setArtistReleasesEnabled] = useState(true);
  const [jamSpaceEnabled, setJamSpaceEnabled] = useState(false);
  const [nftActivityEnabled, setNftActivityEnabled] = useState(true);

  // Playback toggle states
  const [autoplay, setAutoplay] = useState(true);
  const [backgroundPlayback, setBackgroundPlayback] = useState(true);

  // Selected values
  const [audioQuality, setAudioQuality] = useState('Lossless (FLAC)');
  const [dataUsage, setDataUsage] = useState('Adaptive');
  const [theme, setTheme] = useState('Deep Dark (Default)');
  const [language, setLanguage] = useState('English (US)');

  // Sheet & dialog states
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isAudioQualitySheetOpen, setIsAudioQualitySheetOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    isDestructive: boolean;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    isDestructive: false,
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const handleEditProfile = () => {
    if (onNavigate) {
      onNavigate('/edit-profile');
    } else {
      toast.info('Opening Edit Profile screen');
    }
  };

  const handleClearCache = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Local Audio Cache?',
      description: 'This will free up 148 MB of cached audio tracks from your device storage. Offline playback will need to be re-downloaded.',
      isDestructive: false,
      confirmLabel: 'Clear Cache',
      onConfirm: () => {
        toast.success('Local cache cleared successfully (148 MB freed)');
      },
    });
  };

  const handleDisconnectWallet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect TON Wallet?',
      description: 'Your wallet session will be disconnected. You will not be able to purchase Music NFTs or claim TJ rewards until reconnected.',
      isDestructive: true,
      confirmLabel: 'Disconnect',
      onConfirm: () => {
        toast.success('TON wallet disconnected');
      },
    });
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete TonJam Account?',
      description: 'This action is permanent and cannot be undone. All your listening history, playlists, and non-NFT achievements will be deleted.',
      isDestructive: true,
      confirmLabel: 'Delete Forever',
      onConfirm: () => {
        toast.error('Account deletion initiated. Contact support if this was in error.');
      },
    });
  };

  const handleSignOut = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out of TonJam?',
      description: 'You will need to sign in again to access your private library, JamSpace rooms, and reward missions.',
      isDestructive: false,
      confirmLabel: 'Sign Out',
      onConfirm: () => {
        toast.success('Signed out successfully');
      },
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#080D1A] text-white select-none pb-24 text-left">
      {/* SCREEN HEADER */}
      <TonJamHeader
        title="Settings"
        subtitle="Make TonJam yours."
        showBack={showBack}
        onBack={onBack}
      />

      <div className="px-4 space-y-5 pt-1">
        {/* PROFILE SUMMARY CARD */}
        <ProfileSummaryCard
          profile={profile}
          onEditProfile={handleEditProfile}
        />

        {/* SECTION A: ACCOUNT */}
        <div className="space-y-1">
          <SectionHeading title="Account" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsRow
              icon={User}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Edit Profile"
              description="Name, username, bio, and artist artwork"
              onClick={handleEditProfile}
            />
            <SettingsRow
              icon={Shield}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Account Information"
              description="Email address, phone, and registration details"
              onClick={() => toast.info('Account Information details')}
            />
            <SettingsRow
              icon={Key}
              iconBgColor="bg-[#2DD4BF]/15"
              iconColor="text-[#2DD4BF]"
              title="Password & Security"
              description="Two-factor authentication and passwords"
              onClick={() => toast.info('Opening Security settings')}
            />
            <SettingsRow
              icon={Link2}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="Connected Accounts"
              description="Telegram, Spotify, Apple Music sync"
              onClick={() => toast.info('Connected accounts management')}
            />
            <SettingsRow
              icon={EyeOff}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Privacy"
              description="Listening activity visibility and profile discovery"
              onClick={() => toast.info('Privacy preferences')}
            />
            <SettingsRow
              icon={UserX}
              iconBgColor="bg-[#F472B6]/15"
              iconColor="text-[#F472B6]"
              title="Blocked Accounts"
              description="Manage restricted users in JamSpace"
              onClick={() => toast.info('0 accounts currently blocked')}
            />
            <SettingsRow
              icon={Trash2}
              iconBgColor="bg-rose-500/15"
              iconColor="text-rose-400"
              title="Delete Account"
              description="Permanently remove your profile and data"
              isDestructive={true}
              onClick={handleDeleteAccount}
            />
          </div>
        </div>

        {/* SECTION B: NOTIFICATIONS */}
        <div className="space-y-1">
          <SectionHeading
            title="Notifications"
            actionText="View Feed"
            onAction={() => onNavigate?.('/notifications')}
          />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsToggleRow
              icon={Bell}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Push Notifications"
              description="Real-time alerts on your device"
              checked={pushEnabled}
              onChange={setPushEnabled}
            />
            <SettingsToggleRow
              icon={Heart}
              iconBgColor="bg-[#F472B6]/15"
              iconColor="text-[#F472B6]"
              title="Likes and Replies"
              description="When someone likes or responds to your posts"
              checked={likesEnabled}
              onChange={setLikesEnabled}
            />
            <SettingsToggleRow
              icon={MessageCircle}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Mentions"
              description="When artists or fans mention your handle"
              checked={mentionsEnabled}
              onChange={setMentionsEnabled}
            />
            <SettingsToggleRow
              icon={Radio}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="Artist Releases"
              description="New tracks and albums from followed artists"
              checked={artistReleasesEnabled}
              onChange={setArtistReleasesEnabled}
            />
            <SettingsToggleRow
              icon={Sparkles}
              iconBgColor="bg-[#2DD4BF]/15"
              iconColor="text-[#2DD4BF]"
              title="JamSpace Activity"
              description="Live audio rooms and DJ session alerts"
              checked={jamSpaceEnabled}
              onChange={setJamSpaceEnabled}
            />
            <SettingsToggleRow
              icon={ShoppingBag}
              iconBgColor="bg-[#FFC857]/15"
              iconColor="text-[#FFC857]"
              title="Music NFT Activity"
              description="Bids, drops, auctions, and floor alerts"
              checked={nftActivityEnabled}
              onChange={setNftActivityEnabled}
            />
          </div>
        </div>

        {/* SECTION C: MUSIC & PLAYBACK */}
        <div className="space-y-1">
          <SectionHeading title="Music & Playback" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsSelectionRow
              icon={Volume2}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="Audio Quality"
              description="Streaming bitrate & resolution"
              currentValue={audioQuality}
              onClick={() => setIsAudioQualitySheetOpen(true)}
            />
            <SettingsToggleRow
              icon={Play}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Autoplay"
              description="Keep playing similar songs when track ends"
              checked={autoplay}
              onChange={setAutoplay}
            />
            <SettingsToggleRow
              icon={Smartphone}
              iconBgColor="bg-[#2DD4BF]/15"
              iconColor="text-[#2DD4BF]"
              title="Background Playback"
              description="Continue audio playback when screen is locked"
              checked={backgroundPlayback}
              onChange={setBackgroundPlayback}
            />
            <SettingsRow
              icon={HardDrive}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Local Music Preferences"
              description="Include audio files from device storage"
              onClick={() => onNavigate?.('/local-tracks')}
            />
            <SettingsSelectionRow
              icon={Wifi}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Streaming Data Usage"
              description="Save cellular bandwidth while traveling"
              currentValue={dataUsage}
              onClick={() => {
                setDataUsage(dataUsage === 'Adaptive' ? 'Wi-Fi Only' : 'Adaptive');
                toast.success(`Data usage set to ${dataUsage === 'Adaptive' ? 'Wi-Fi Only' : 'Adaptive'}`);
              }}
            />
          </div>
        </div>

        {/* SECTION D: APPEARANCE */}
        <div className="space-y-1">
          <SectionHeading title="Appearance" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsSelectionRow
              icon={Palette}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="Theme"
              description="Color interface styling"
              currentValue={theme}
              onClick={() => setIsThemeSheetOpen(true)}
            />
            <SettingsSelectionRow
              icon={Globe}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="App Language"
              description="Localization for audio metadata and UI"
              currentValue={language}
              onClick={() => {
                setLanguage(language === 'English (US)' ? 'Spanish (ES)' : 'English (US)');
                toast.success('App language preference updated');
              }}
            />
          </div>
        </div>

        {/* SECTION E: WALLET & WEB3 */}
        <div className="space-y-1">
          <SectionHeading title="Wallet & Web3" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsRow
              icon={Wallet}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="TON Wallet"
              description={profile.walletAddress || 'Connect your TON wallet'}
              rightElement={
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E8CEB] bg-[#2E8CEB]/10 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#2E8CEB]" />
                  Connected
                </span>
              }
              onClick={() => onNavigate?.('/wallet')}
            />
            <SettingsRow
              icon={Layers}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="My Music NFTs"
              description="View owned collectible master tracks"
              onClick={() => onNavigate?.('/my-nfts')}
            />
            <SettingsRow
              icon={Coins}
              iconBgColor="bg-[#FFC857]/15"
              iconColor="text-[#FFC857]"
              title="Earn TJ Missions"
              description="Quests, streaks, and reward balances"
              onClick={() => onNavigate?.('/tasks')}
            />
            <SettingsRow
              icon={Trash2}
              iconBgColor="bg-rose-500/15"
              iconColor="text-rose-400"
              title="Disconnect Wallet"
              description="Safely end your Web3 wallet session"
              isDestructive={true}
              onClick={handleDisconnectWallet}
            />
          </div>
        </div>

        {/* SECTION F: STORAGE & DATA */}
        <div className="space-y-1">
          <SectionHeading title="Storage & Data" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsRow
              icon={Database}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Cache Storage"
              description="148 MB audio cache · 32 offline tracks"
              rightElement={
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-300 rounded-lg transition-colors"
                >
                  Clear Cache
                </button>
              }
            />
          </div>
        </div>

        {/* SECTION G: HELP & SUPPORT */}
        <div className="space-y-1">
          <SectionHeading title="Help & Support" />
          <div className="rounded-3xl bg-[#0B1626] p-1.5 space-y-0.5 shadow-sm">
            <SettingsRow
              icon={HelpCircle}
              iconBgColor="bg-[#2DD4BF]/15"
              iconColor="text-[#2DD4BF]"
              title="Help Center"
              description="FAQs, tutorials, and community guides"
              onClick={() => toast.info('Opening TonJam Help Center')}
            />
            <SettingsRow
              icon={Mail}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="Contact Support"
              description="Reach our 24/7 Web3 music support team"
              onClick={() => toast.info('Support chat initiated')}
            />
            <SettingsRow
              icon={FileText}
              iconBgColor="bg-[#9B7CFF]/15"
              iconColor="text-[#9B7CFF]"
              title="Privacy Policy & Terms"
              description="Legal agreements and copyright policies"
              onClick={() => toast.info('Viewing Terms & Privacy')}
            />
            <SettingsRow
              icon={Info}
              iconBgColor="bg-[#2E8CEB]/15"
              iconColor="text-[#2E8CEB]"
              title="About TonJam"
              description="v1.0.0-beta.1 (TON Mainnet Compatible)"
              onClick={() => onNavigate?.('/about')}
            />
            <SettingsRow
              icon={LogOut}
              iconBgColor="bg-rose-500/15"
              iconColor="text-rose-400"
              title="Sign Out"
              description="Sign out from this mobile device"
              isDestructive={true}
              onClick={handleSignOut}
            />
          </div>
        </div>
      </div>

      {/* AUDIO QUALITY BOTTOM SHEET */}
      <BottomSheet
        isOpen={isAudioQualitySheetOpen}
        onClose={() => setIsAudioQualitySheetOpen(false)}
        title="Streaming Audio Quality"
        subtitle="Select your preferred playback stream bitrate"
      >
        <div className="space-y-2 pt-1">
          {[
            {
              id: 'Lossless (FLAC)',
              title: 'Lossless (FLAC 24-bit/96kHz)',
              desc: 'Original studio masters, uncompressed audio streaming',
            },
            {
              id: 'High (320kbps)',
              title: 'High Fidelity (320 kbps AAC)',
              desc: 'High clarity, optimized for headphones & fast Wi-Fi',
            },
            {
              id: 'Normal (160kbps)',
              title: 'Normal (160 kbps MP3)',
              desc: 'Balanced performance, saves mobile bandwidth',
            },
          ].map((item) => {
            const isSelected = audioQuality === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setAudioQuality(item.id);
                  setIsAudioQualitySheetOpen(false);
                  toast.success(`Audio quality set to ${item.id}`);
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#2E8CEB]/15' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? 'text-[#2E8CEB]' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-xs text-[#91A8C5] mt-0.5">
                    {item.desc}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[#2E8CEB] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* THEME SELECTION BOTTOM SHEET */}
      <BottomSheet
        isOpen={isThemeSheetOpen}
        onClose={() => setIsThemeSheetOpen(false)}
        title="Theme Selection"
        subtitle="Choose your preferred visual appearance"
      >
        <div className="space-y-2 pt-1">
          {[
            {
              id: 'Deep Dark (Default)',
              title: 'Deep Dark (TonJam Default)',
              desc: 'Signature deep navy #091326 and blue accents',
            },
            {
              id: 'Midnight Navy',
              title: 'Midnight Navy',
              desc: 'Subtle slate gradients with purple highlights',
            },
            {
              id: 'OLED Pure Black',
              title: 'OLED Pure Black',
              desc: 'Maximum contrast, pure black pixels for battery saving',
            },
          ].map((item) => {
            const isSelected = theme === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setTheme(item.id);
                  setIsThemeSheetOpen(false);
                  toast.success(`Theme updated to ${item.id}`);
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#2E8CEB]/15' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? 'text-[#2E8CEB]' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-xs text-[#91A8C5] mt-0.5">
                    {item.desc}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[#2E8CEB] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
};

export default MobileSettingsScreen;
