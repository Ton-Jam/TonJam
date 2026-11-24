import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Bell,
  Shield,
  User,
  Wallet,
  Moon,
  Sun,
  Globe,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Key,
  ShieldAlert,
  Database,
  Plus,
  WifiOff,
  Palette,
  Loader2,
  Upload,
  Twitter,
  Instagram,
  CheckCircle,
  Sparkles,
  MapPin,
  Settings2,
  LayoutGrid,
  Coins,
  Type,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useOptionalWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/components/theme-provider';
import { useCacheManagement } from '@/hooks/useCacheManagement';
import { useI18n } from '@/contexts/I18nContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import StorageManagementModal from '@/components/StorageManagementModal';
import { cn, validateFile, getPlaceholderImage } from '@/lib/utils';
import { RoyaltySplit, Collaborator } from '@/types';
import VerificationTracker from '@/components/VerificationTracker';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import { db, cleanUpdateData, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadAvatar } from '@/services/storageService';
import RoyaltySplitManager from '@/components/RoyaltySplitManager';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollaboratorManager } from '@/components/CollaboratorManager';
import { useTonAddress } from '@tonconnect/ui-react';

// UI components
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'interface', label: 'Preferences', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'web3', label: 'Wallet & Royalties', icon: Wallet },
  { id: 'system', label: 'Privacy & Storage', icon: Shield },
] as const;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isOffline, toggleOfflineMode, artworkStyle, setArtworkStyle } = useAudio();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { localCurrencyEnabled, setLocalCurrencyEnabled, fiatCurrency, setFiatCurrency } = useGramPrice();
  const walletCtx = useOptionalWallet();
  const rawTonAddress = useTonAddress();
  const tonAddress = walletCtx?.address || rawTonAddress;
  const isWalletConnected = Boolean(walletCtx?.isConnected || tonAddress);

  const [fontSize, setFontSizeState] = useState(() => {
    try {
      return localStorage.getItem('tonjam_font_size') || 'standard';
    } catch {
      return 'standard';
    }
  });

  const [cdnRegion, setCdnRegion] = useState(() => {
    try {
      return localStorage.getItem('tonjam_cdn_region') || 'eu-west';
    } catch {
      return 'eu-west';
    }
  });

  const [privateMode, setPrivateMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tonjam_private_mode');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const { totalSizeMB, cachedCount, clearAllCache, isPurging } = useCacheManagement();
  const { preferences, updatePreferences, requestPushPermission } = useNotification();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [hasCopiedAddress, setHasCopiedAddress] = useState(false);
  const [isDisconnectingWallet, setIsDisconnectingWallet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'account';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form State
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    coverPhoto: '',
    twitter: '',
    instagram: '',
    location: '',
    website: '',
    streamingSplits: [] as RoyaltySplit[],
    nftSaleSplits: [] as RoyaltySplit[],
    collaborators: [] as Collaborator[],
  });

  const lastSyncedProfileKeyRef = useRef<string>('');

  useEffect(() => {
    if (userProfile) {
      const nextKey = JSON.stringify({
        uid: userProfile.uid,
        name: userProfile.name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || '',
        coverPhoto: userProfile.coverPhoto || '',
        x: userProfile.socials?.x || userProfile.socials?.twitter || '',
        instagram: userProfile.socials?.instagram || '',
        location: userProfile.location || '',
        website: userProfile.website || userProfile.socials?.website || '',
        streamingSplits: userProfile.royaltyConfig?.streamingSplits || [],
        nftSaleSplits: userProfile.royaltyConfig?.nftSaleSplits || [],
        collaborators: userProfile.collaborators || [],
      });
      if (lastSyncedProfileKeyRef.current === nextKey) return;
      lastSyncedProfileKeyRef.current = nextKey;

      setProfile({
        name: userProfile.name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || '',
        coverPhoto: userProfile.coverPhoto || '',
        twitter: userProfile.socials?.x || userProfile.socials?.twitter || '',
        instagram: userProfile.socials?.instagram || '',
        location: userProfile.location || '',
        website: userProfile.website || userProfile.socials?.website || '',
        streamingSplits: userProfile.royaltyConfig?.streamingSplits || [],
        nftSaleSplits: userProfile.royaltyConfig?.nftSaleSplits || [],
        collaborators: userProfile.collaborators || [],
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && SETTINGS_TABS.some((item) => item.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
  };

  const handleFontSizeChange = (newSize: string) => {
    try {
      localStorage.setItem('tonjam_font_size', newSize);
    } catch {
      // Ignore storage errors
    }
    setFontSizeState(newSize);
    window.dispatchEvent(new Event('tonjam_font_size_changed'));
    toast.success('Typography scaling updated');
  };

  const handleCdnRegionChange = (region: string) => {
    setCdnRegion(region);
    try {
      localStorage.setItem('tonjam_cdn_region', region);
    } catch {
      // Ignore storage errors
    }
    toast.success(`Streaming relay switched to ${region.toUpperCase()}`);
  };

  const handlePrivateModeChange = async (enabled: boolean) => {
    setPrivateMode(enabled);
    try {
      localStorage.setItem('tonjam_private_mode', JSON.stringify(enabled));
    } catch {
      // Ignore storage errors
    }
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, cleanUpdateData({ privateMode: enabled }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    toast.success(enabled ? 'Private listening mode enabled' : 'Listening activity visible in discovery');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, 'image', 5);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      e.target.value = '';
      return;
    }

    if (!user) {
      toast.error('You must be logged in to upload an avatar.');
      return;
    }

    try {
      setUploading(true);
      const { downloadUrl } = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: downloadUrl }));
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, 'image', 10);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      e.target.value = '';
      return;
    }

    if (!user) {
      toast.error('You must be logged in to upload a cover banner.');
      return;
    }

    try {
      setIsCoverUploading(true);
      const { downloadUrl } = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, coverPhoto: downloadUrl }));
      toast.success('Cover photo uploaded');
    } catch {
      toast.error('Failed to upload cover photo');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const generateAICover = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A cinematic, high-resolution music artist profile banner for ${profile.name || 'electronic musician'}. Style: modern, deep navy and TON blue atmospheric lighting, minimalist studio aesthetic. No text.`,
          aspectRatio: '16:9',
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const { imageUrl } = await response.json();
      if (imageUrl) {
        setProfile((prev) => ({ ...prev, coverPhoto: imageUrl }));
        toast.success('Cover banner generated');
      }
    } catch {
      toast.error('Failed to generate cover image');
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIBio = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, username: profile.username }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const { bio } = await response.json();
      if (bio) {
        setProfile((prev) => ({ ...prev, bio }));
        toast.success('Bio updated');
      }
    } catch {
      toast.error('Failed to generate bio');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('Please sign in to save your settings.');
      return;
    }

    const trimmedName = profile.name.trim().slice(0, 200);
    const trimmedUsername = profile.username.trim().replace(/^@+/, '').slice(0, 100);
    const trimmedBio = profile.bio.trim().slice(0, 2000);

    if (!trimmedName) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(
        userRef,
        cleanUpdateData({
          name: trimmedName,
          username: trimmedUsername,
          bio: trimmedBio,
          avatar: profile.avatar.slice(0, 2048),
          coverPhoto: profile.coverPhoto.slice(0, 2048),
          location: profile.location.trim().slice(0, 120),
          website: profile.website.trim().slice(0, 300),
          socials: {
            x: profile.twitter.trim().slice(0, 300),
            instagram: profile.instagram.trim().slice(0, 300),
            website: profile.website.trim().slice(0, 300),
          },
          royaltyConfig: {
            streamingSplits: profile.streamingSplits,
            nftSaleSplits: profile.nftSaleSplits,
          },
          collaborators: profile.collaborators,
        })
      );
      toast.success('Settings saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      toast.error('Sync failed. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProfile = () => {
    setProfile((prev) => ({
      ...prev,
      name: userProfile?.name || '',
      username: userProfile?.username || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      website: userProfile?.website || userProfile?.socials?.website || '',
      twitter: userProfile?.socials?.x || userProfile?.socials?.twitter || '',
      instagram: userProfile?.socials?.instagram || '',
    }));
    toast.info('Changes reverted to saved profile');
  };

  const copyAddress = () => {
    if (!tonAddress) return;
    navigator.clipboard.writeText(tonAddress);
    setHasCopiedAddress(true);
    toast.success('Wallet address copied');
    setTimeout(() => setHasCopiedAddress(false), 2000);
  };

  const handleWalletConnect = () => {
    if (isWalletConnected) {
      toast.info('Your TON wallet is already connected');
      return;
    }
    if (walletCtx?.connectWallet) {
      walletCtx.connectWallet();
    }
  };

  const handleWalletDisconnect = async () => {
    if (!walletCtx?.disconnectWallet) return;
    try {
      setIsDisconnectingWallet(true);
      await walletCtx.disconnectWallet();
      toast.success('TON wallet disconnected');
    } catch {
      toast.error('Unable to disconnect wallet');
    } finally {
      setIsDisconnectingWallet(false);
    }
  };

  const handleClearCache = async () => {
    await clearAllCache();
    toast.success('Local audio cache cleared');
  };

  const deviceSummary = useMemo(() => {
    if (typeof navigator === 'undefined') return 'Current Web Session';
    const ua = navigator.userAgent || '';
    const os = /iPhone|iPad|iPod/i.test(ua)
      ? 'iOS'
      : /Android/i.test(ua)
      ? 'Android'
      : /Mac/i.test(ua)
      ? 'macOS'
      : /Win/i.test(ua)
      ? 'Windows'
      : 'Linux';
    const browser = /Chrome/i.test(ua) && !/Edg/i.test(ua)
      ? 'Chrome'
      : /Safari/i.test(ua) && !/Chrome/i.test(ua)
      ? 'Safari'
      : /Firefox/i.test(ua)
      ? 'Firefox'
      : 'Web Browser';
    return `${browser} · ${os}`;
  }, []);

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    children,
    onClick,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'flex items-center justify-between py-3.5 px-3 sm:px-4 min-h-[56px] transition-colors duration-150 rounded-[var(--tj-radius-md,10px)]',
        onClick &&
          'cursor-pointer group hover:bg-[var(--tj-surface-hover,#17243A)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <div className="w-10 h-10 rounded-[var(--tj-radius-sm,8px)] bg-[#229ED9]/12 flex items-center justify-center text-[#229ED9] shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
            {title}
          </span>
          {description && (
            <span className="text-[11px] font-medium text-[var(--tj-text-secondary,#A8B7CC)] mt-0.5 leading-snug line-clamp-2">
              {description}
            </span>
          )}
        </div>
      </div>
      <div
        onClick={(e) => onClick && e.stopPropagation()}
        className="flex items-center gap-2 shrink-0"
      >
        {children || (
          <ChevronRight className="h-4 w-4 text-[var(--tj-text-muted,#7F91AA)] group-hover:translate-x-0.5 transition-transform" />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen pb-36 sm:pb-28 md:pb-20 animate-in fade-in duration-300">
      <PageHeader title="Settings" showBack={true} />

      <div className="w-full max-w-full px-3 sm:px-6 pt-2 space-y-6">
        {/* Account Overview Strip (No Backdrop) */}
        <section
          aria-label="Account summary"
          className="w-full bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-none"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={profile.avatar || getPlaceholderImage(profile.name || 'user')}
              alt={profile.name || 'Profile avatar'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-[var(--tj-radius-sm,8px)] object-cover shrink-0 bg-[#111C30]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white truncate">
                  {profile.name || userProfile?.name || 'TonJam Member'}
                </span>
                {userProfile?.isVerifiedArtist && (
                  <ShieldCheck className="w-4 h-4 text-[#229ED9] shrink-0" aria-label="Verified Artist" />
                )}
              </div>
              <p className="text-xs text-[var(--tj-text-secondary,#A8B7CC)] truncate">
                @{profile.username || userProfile?.username || 'listener'}
                {user?.email ? ` · ${user.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="min-h-[40px] px-4 py-2 rounded-[var(--tj-radius-sm,8px)] bg-[var(--tj-surface,#111C30)] hover:bg-[var(--tj-surface-hover,#17243A)] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              View Profile
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('web3')}
              className={cn(
                'min-h-[40px] px-4 py-2 rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                isWalletConnected
                  ? 'bg-[#229ED9]/15 text-[#229ED9] hover:bg-[#229ED9]/25'
                  : 'bg-[#229ED9] hover:bg-[#168AC4] text-white'
              )}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {isWalletConnected && tonAddress
                  ? `${tonAddress.slice(0, 4)}...${tonAddress.slice(-4)}`
                  : isWalletConnected
                  ? 'Wallet Connected'
                  : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </section>

        {/* Global Filter-Button Style Tab Bar (2px Subtle Silver Border) */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <div className="-mx-3 px-3 sm:-mx-6 sm:px-6 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
            <TabsList
              aria-label="Settings sections"
              className="bg-transparent p-0 pr-3 sm:pr-6 h-auto inline-flex items-center gap-2 rounded-none"
            >
              {SETTINGS_TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    aria-pressed={isSelected}
                    className={cn(
                      'filter-btn filter-pill filter-silver-border border-silver-2 border-2 min-h-[38px] rounded-full px-4 py-2 text-xs font-semibold tracking-tight transition-all shadow-none flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
                      isSelected
                        ? 'active bg-[#00B4D8] border-[rgba(192,192,192,0.35)] text-white'
                        : 'bg-[#102943] border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white hover:bg-[#132B49] hover:border-[rgba(192,192,192,0.35)]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              {/* 1. ACCOUNT TAB */}
              <TabsContent value="account" className="mt-0 space-y-6">
                {/* Cover Banner Editor */}
                <div className="w-full bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] overflow-hidden relative group backdrop-blur-none">
                  <div className="aspect-[21/9] sm:aspect-[24/7] w-full bg-[#111C30] overflow-hidden relative">
                    {profile.coverPhoto ? (
                      <img
                        src={profile.coverPhoto}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        alt="Profile cover banner"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--tj-text-muted,#7F91AA)] p-4 text-center">
                        <LayoutGrid className="w-8 h-8 mb-2 opacity-60" />
                        <span className="text-xs font-semibold">Upload artist cover banner (16:9 recommended)</span>
                      </div>
                    )}

                    {/* Action Controls — always accessible in bottom-right on touch, subtle overlay on desktop hover */}
                    <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 z-10">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="min-h-[38px] px-3.5 py-2 bg-[#07111F]/90 hover:bg-[#07111F] text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label="Upload custom cover photo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover</span>
                      </button>
                      <button
                        type="button"
                        onClick={generateAICover}
                        disabled={aiLoading}
                        className="min-h-[38px] px-3.5 py-2 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-60 text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label="Generate cover image"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Generate Cover</span>
                      </button>
                    </div>

                    {isCoverUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Avatar & Verification Status */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-6 text-center flex flex-col items-center backdrop-blur-none">
                      <div className="w-28 h-28 rounded-[var(--tj-radius-md,10px)] relative group overflow-hidden mb-4 bg-[#111C30]">
                        <img
                          src={profile.avatar || getPlaceholderImage(profile.name || 'user')}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          alt="Profile avatar"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {profile.name || 'TonJam Creator'}
                      </h3>
                      <p className="text-xs font-semibold text-[#229ED9] mt-0.5">
                        @{profile.username || 'handle'}
                      </p>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 min-h-[40px] px-4 py-2 bg-[var(--tj-surface,#111C30)] hover:bg-[var(--tj-surface-hover,#17243A)] text-xs font-semibold rounded-[var(--tj-radius-sm,8px)] text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                    </div>

                    {/* Artist Verification Card */}
                    <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 space-y-3 backdrop-blur-none">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#229ED9]" />
                        <h4 className="text-sm font-bold text-white">Artist Verification</h4>
                      </div>
                      <p className="text-xs text-[var(--tj-text-secondary,#A8B7CC)] leading-relaxed">
                        Verified artists gain verified status, priority discovery placement, and direct royalty split payouts.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTabChange('web3')}
                        className="w-full min-h-[42px] py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Verification Status
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Profile Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-7 space-y-5 backdrop-blur-none">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="settings-name" className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Display Name
                          </label>
                          <input
                            id="settings-name"
                            type="text"
                            maxLength={200}
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] px-4 py-3 text-sm font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                            placeholder="Artist / Creator Name"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="settings-username" className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Handle
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tj-text-muted,#7F91AA)] font-semibold">
                              @
                            </span>
                            <input
                              id="settings-username"
                              type="text"
                              maxLength={100}
                              value={profile.username}
                              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                              className="w-full bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] pl-9 pr-4 py-3 text-sm font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                              placeholder="username"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="settings-bio" className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Bio
                          </label>
                          <button
                            type="button"
                            onClick={generateAIBio}
                            disabled={aiLoading}
                            className="text-xs font-semibold text-[#229ED9] hover:text-[#33C7E5] flex items-center gap-1 cursor-pointer focus:outline-none"
                          >
                            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span>Draft Bio</span>
                          </button>
                        </div>
                        <textarea
                          id="settings-bio"
                          maxLength={2000}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] px-4 py-3 text-sm font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none focus:ring-2 focus:ring-[#229ED9] min-h-[100px] resize-none"
                          placeholder="Tell listeners about your music and creative journey..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="settings-location" className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tj-text-muted,#7F91AA)]" />
                            <input
                              id="settings-location"
                              type="text"
                              maxLength={120}
                              value={profile.location}
                              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                              className="w-full bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                              placeholder="e.g. Lagos, NG / Remote"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="settings-website" className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Website
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tj-text-muted,#7F91AA)]" />
                            <input
                              id="settings-website"
                              type="url"
                              maxLength={300}
                              value={profile.website}
                              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                              className="w-full bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none focus:ring-2 focus:ring-[#229ED9]"
                              placeholder="https://yourdomain.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)] block">
                          Social Links
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] px-3.5 py-2.5">
                            <Twitter className="w-4 h-4 text-[#229ED9] shrink-0" />
                            <input
                              type="text"
                              aria-label="X / Twitter Profile URL"
                              maxLength={300}
                              value={profile.twitter}
                              onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                              className="flex-1 bg-transparent text-xs font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none"
                              placeholder="X (Twitter) Profile URL"
                            />
                          </div>
                          <div className="flex items-center gap-3 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] px-3.5 py-2.5">
                            <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                            <input
                              type="text"
                              aria-label="Instagram Profile URL"
                              maxLength={300}
                              value={profile.instagram}
                              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                              className="flex-1 bg-transparent text-xs font-medium text-white placeholder:text-[var(--tj-text-muted,#7F91AA)] focus:outline-none"
                              placeholder="Instagram Profile URL"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleResetProfile}
                          className="min-h-[40px] px-3 py-2 text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)] hover:text-white transition-colors cursor-pointer rounded-[var(--tj-radius-sm,8px)]"
                        >
                          Reset Changes
                        </button>
                        <Button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-[var(--tj-radius-sm,8px)] px-6 h-11 text-xs font-semibold cursor-pointer"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 2. PREFERENCES TAB */}
              <TabsContent value="interface" className="mt-0 space-y-6">
                <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-4 sm:p-6 space-y-2 backdrop-blur-none">
                  <div className="flex items-center gap-3 mb-3 px-2">
                    <Palette className="w-5 h-5 text-[#229ED9]" />
                    <h2 className="text-base font-bold text-white">Display & Playback</h2>
                  </div>

                  <div className="space-y-1">
                    <SettingRow
                      icon={theme === 'dark' ? Moon : Sun}
                      title="Theme Mode"
                      description="Switch between dark and light color palettes"
                    >
                      <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                        <SelectTrigger
                          aria-label="Select Interface Palette"
                          className="w-[124px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                        >
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                          <SelectItem value="light" className="text-xs font-semibold">Light</SelectItem>
                          <SelectItem value="dark" className="text-xs font-semibold">Dark</SelectItem>
                          <SelectItem value="system" className="text-xs font-semibold">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>

                    <SettingRow
                      icon={Coins}
                      title="Fiat Currency Display"
                      description="Convert TON and JAM amounts into estimated fiat value"
                    >
                      <Switch
                        checked={localCurrencyEnabled}
                        onCheckedChange={setLocalCurrencyEnabled}
                        aria-label="Toggle Local Currency Display"
                        className="data-[state=checked]:bg-[#229ED9]"
                      />
                    </SettingRow>

                    {localCurrencyEnabled && (
                      <SettingRow
                        icon={Globe}
                        title="Preferred Fiat Currency"
                        description="Choose your localized fiat conversion currency"
                      >
                        <Select value={fiatCurrency} onValueChange={setFiatCurrency}>
                          <SelectTrigger
                            aria-label="Select Preferred Fiat Currency"
                            className="w-[124px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                          >
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                            <SelectItem value="USD" className="text-xs font-semibold">USD ($)</SelectItem>
                            <SelectItem value="EUR" className="text-xs font-semibold">EUR (€)</SelectItem>
                            <SelectItem value="GBP" className="text-xs font-semibold">GBP (£)</SelectItem>
                            <SelectItem value="RUB" className="text-xs font-semibold">RUB (₽)</SelectItem>
                          </SelectContent>
                        </Select>
                      </SettingRow>
                    )}

                    <SettingRow
                      icon={Type}
                      title="Typography Scaling"
                      description="Adjust baseline font size for comfortable reading"
                    >
                      <Select value={fontSize} onValueChange={handleFontSizeChange}>
                        <SelectTrigger
                          aria-label="Select Text Readability Scale"
                          className="w-[140px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                        >
                          <SelectValue placeholder="Font Size" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                          <SelectItem value="compact" className="text-xs font-semibold">Compact (15px)</SelectItem>
                          <SelectItem value="standard" className="text-xs font-semibold">Standard (16px)</SelectItem>
                          <SelectItem value="large" className="text-xs font-semibold">Enhanced (17px)</SelectItem>
                          <SelectItem value="accessible" className="text-xs font-semibold">Accessible (19px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>

                    <SettingRow
                      icon={Globe}
                      title={t('settings.display_language')}
                      description={t('settings.language_desc')}
                    >
                      <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                        <SelectTrigger
                          aria-label="Select Display Language"
                          className="w-[140px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                        >
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                          <SelectItem value="en" className="text-xs font-semibold">English</SelectItem>
                          <SelectItem value="ru" className="text-xs font-semibold">Русский</SelectItem>
                          <SelectItem value="uk" className="text-xs font-semibold">Українська</SelectItem>
                          <SelectItem value="es" className="text-xs font-semibold">Español</SelectItem>
                          <SelectItem value="de" className="text-xs font-semibold">Deutsch</SelectItem>
                          <SelectItem value="fr" className="text-xs font-semibold">Français</SelectItem>
                          <SelectItem value="zh" className="text-xs font-semibold">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>

                    <SettingRow
                      icon={Sparkles}
                      title="Player Artwork Style"
                      description="Select visual rendering mode in the full audio player"
                    >
                      <Select value={artworkStyle} onValueChange={(val: any) => setArtworkStyle(val)}>
                        <SelectTrigger
                          aria-label="Select Artwork Presentation Style"
                          className="w-[140px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                        >
                          <SelectValue placeholder="Style" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                          <SelectItem value="spotify" className="text-xs font-semibold">Standard</SelectItem>
                          <SelectItem value="vinyl" className="text-xs font-semibold">Analog Vinyl</SelectItem>
                          <SelectItem value="visualizer" className="text-xs font-semibold">Visualizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>

                    <SettingRow
                      icon={Globe}
                      title="CDN Gateway Region"
                      description="Target nearest relay node for low-latency audio streaming"
                    >
                      <Select value={cdnRegion} onValueChange={handleCdnRegionChange}>
                        <SelectTrigger
                          aria-label="Select Data Relay Region"
                          className="w-[140px] h-9 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold px-3 border-0 shadow-none"
                        >
                          <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] border-0 shadow-xl">
                          <SelectItem value="eu-west" className="text-xs font-semibold">Europe (EU-1)</SelectItem>
                          <SelectItem value="us-east" className="text-xs font-semibold">America (US-1)</SelectItem>
                          <SelectItem value="asia" className="text-xs font-semibold">Asia-Pacific</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>

                    <SettingRow
                      icon={WifiOff}
                      title="Offline Audio Caching"
                      description="Enable local track caching for offline playback"
                    >
                      <Switch
                        checked={isOffline}
                        onCheckedChange={toggleOfflineMode}
                        aria-label="Toggle Offline Listening"
                        className="data-[state=checked]:bg-[#229ED9]"
                      />
                    </SettingRow>
                  </div>
                </div>
              </TabsContent>

              {/* 3. NOTIFICATIONS TAB */}
              <TabsContent value="notifications" className="mt-0 space-y-6">
                <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-4 sm:p-6 space-y-2 backdrop-blur-none">
                  <div className="flex items-center gap-3 mb-3 px-2">
                    <Bell className="w-5 h-5 text-[#229ED9]" />
                    <h2 className="text-base font-bold text-white">Notification Preferences</h2>
                  </div>

                  <div className="space-y-1">
                    <SettingRow
                      icon={Bell}
                      title="Transaction & Activity Alerts"
                      description="Instant alerts for mints, purchases, and streaming payouts"
                    >
                      <Switch
                        checked={preferences.directAlerts}
                        onCheckedChange={(val) => updatePreferences({ ...preferences, directAlerts: val })}
                        aria-label="Toggle Transaction Alerts"
                        className="data-[state=checked]:bg-[#229ED9]"
                      />
                    </SettingRow>

                    <SettingRow
                      icon={ShieldAlert}
                      title="Market Price Movements"
                      description="Updates when your collected tracks change in floor valuation"
                    >
                      <Switch
                        checked={preferences.marketActivity}
                        onCheckedChange={(val) => updatePreferences({ ...preferences, marketActivity: val })}
                        aria-label="Toggle Market Fluctuations alerts"
                        className="data-[state=checked]:bg-[#229ED9]"
                      />
                    </SettingRow>

                    <SettingRow
                      icon={Plus}
                      title="New Drops & Exclusive Releases"
                      description="Priority notifications for new drops from followed artists"
                    >
                      <Switch
                        checked={preferences.dropsAndReleases}
                        onCheckedChange={(val) => updatePreferences({ ...preferences, dropsAndReleases: val })}
                        aria-label="Toggle New Drops alerts"
                        className="data-[state=checked]:bg-[#229ED9]"
                      />
                    </SettingRow>

                    <SettingRow
                      icon={ShieldCheck}
                      title="Browser Push Notifications"
                      description="Allow real-time desktop and mobile push alerts"
                      onClick={async () => {
                        const granted = await requestPushPermission();
                        setPushStatus(
                          typeof window !== 'undefined' && 'Notification' in window
                            ? Notification.permission
                            : 'unsupported'
                        );
                        if (granted) toast.success('Browser notifications active');
                        else toast.info('Notification permission was not granted');
                      }}
                    >
                      <span
                        className={cn(
                          'text-xs font-semibold px-2.5 py-1 rounded-[var(--tj-radius-sm,8px)]',
                          pushStatus === 'granted'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : pushStatus === 'denied'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-[#229ED9]/15 text-[#229ED9]'
                        )}
                      >
                        {pushStatus === 'granted'
                          ? 'Enabled'
                          : pushStatus === 'denied'
                          ? 'Blocked'
                          : 'Enable'}
                      </span>
                    </SettingRow>

                    <div className="flex items-center justify-between py-3.5 px-3 sm:px-4 rounded-[var(--tj-radius-md,10px)]">
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div className="w-10 h-10 rounded-[var(--tj-radius-sm,8px)] bg-[#229ED9]/12 flex items-center justify-center text-[#229ED9] shrink-0">
                          <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <label htmlFor="revenue-threshold" className="text-xs sm:text-sm font-semibold text-white cursor-pointer">
                            Revenue Alert Threshold (TON)
                          </label>
                          <span className="text-[11px] font-medium text-[var(--tj-text-secondary,#A8B7CC)] mt-0.5">
                            Notify when earnings surpass this TON amount
                          </span>
                        </div>
                      </div>
                      <input
                        id="revenue-threshold"
                        type="number"
                        min={0}
                        aria-label="Revenue Signal Threshold in TON"
                        value={preferences.revenueThreshold ?? 100}
                        onChange={(e) =>
                          updatePreferences({
                            ...preferences,
                            revenueThreshold: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-20 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-sm,8px)] py-2 px-3 text-center text-xs font-bold text-white tabular-nums outline-none focus:ring-2 focus:ring-[#229ED9]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 4. WALLET & ROYALTIES TAB */}
              <TabsContent value="web3" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TON Wallet Card */}
                  <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-6 space-y-5 backdrop-blur-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#229ED9]" />
                        <h2 className="text-base font-bold text-white">TON Wallet</h2>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-[11px] font-semibold',
                          isWalletConnected
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-[#111C30] text-[var(--tj-text-secondary,#A8B7CC)]'
                        )}
                      >
                        {isWalletConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-md,10px)] space-y-4">
                      <p className="text-xs text-[var(--tj-text-secondary,#A8B7CC)] leading-relaxed">
                        Connect your TON wallet (Tonkeeper, MyTonWallet, Telegram Wallet) to mint music NFTs, claim streaming royalties, and vote in governance.
                      </p>

                      {isWalletConnected && tonAddress ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)] font-mono text-xs">
                            <span className="text-[var(--tj-text-muted,#7F91AA)]">Address</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#229ED9] font-semibold">
                                {tonAddress.slice(0, 6)}...{tonAddress.slice(-6)}
                              </span>
                              <button
                                type="button"
                                onClick={copyAddress}
                                className="p-1.5 text-[var(--tj-text-secondary,#A8B7CC)] hover:text-white rounded transition-colors cursor-pointer"
                                aria-label="Copy wallet address"
                              >
                                {hasCopiedAddress ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)]">
                              <span className="text-[11px] text-[var(--tj-text-muted,#7F91AA)] block">
                                TON Balance
                              </span>
                              <span className="text-sm font-bold text-white font-mono tabular-nums">
                                {(walletCtx?.tonBalance ?? 0).toFixed(2)} TON
                              </span>
                            </div>
                            <div className="p-3 bg-[#0B1424] rounded-[var(--tj-radius-sm,8px)]">
                              <span className="text-[11px] text-[var(--tj-text-muted,#7F91AA)] block">
                                Network
                              </span>
                              <span className="text-sm font-bold text-[#229ED9] uppercase">
                                {walletCtx?.network || 'mainnet'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => walletCtx?.refreshBalance?.()}
                              disabled={walletCtx?.isLoadingBalance}
                              className="flex-1 min-h-[40px] px-3 py-2 bg-[#0B1424] hover:bg-[#17243A] text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <RefreshCw
                                className={cn(
                                  'w-3.5 h-3.5',
                                  walletCtx?.isLoadingBalance && 'animate-spin'
                                )}
                              />
                              <span>Refresh</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleWalletDisconnect}
                              disabled={isDisconnectingWallet}
                              className="flex-1 min-h-[40px] px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold cursor-pointer transition-colors"
                            >
                              {isDisconnectingWallet ? 'Disconnecting...' : 'Disconnect Wallet'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleWalletConnect}
                          className="w-full min-h-[44px] py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Connect TON Wallet</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                        Collaborators & Co-creators
                      </h3>
                      <CollaboratorManager
                        collaborators={profile.collaborators}
                        onChange={(collaborators) => setProfile({ ...profile, collaborators })}
                      />
                    </div>
                  </div>

                  {/* Royalty Engine Card */}
                  <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-6 space-y-5 backdrop-blur-none">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#229ED9]" />
                      <h2 className="text-base font-bold text-white">Royalty Splits</h2>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-semibold text-[#229ED9]">
                          Streaming Revenue Split
                        </h3>
                        <RoyaltySplitManager
                          splits={profile.streamingSplits}
                          onChange={(splits) => setProfile({ ...profile, streamingSplits: splits })}
                          collaborators={profile.collaborators}
                        />
                      </div>
                      <div className="space-y-2.5 pt-1">
                        <h3 className="text-xs font-semibold text-[#9B7CFF]">
                          Secondary NFT Sale Royalties
                        </h3>
                        <RoyaltySplitManager
                          splits={profile.nftSaleSplits}
                          onChange={(splits) => setProfile({ ...profile, nftSaleSplits: splits })}
                          collaborators={profile.collaborators}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-[var(--tj-radius-sm,8px)] h-11 text-xs font-semibold cursor-pointer"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Save Royalty Configuration
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Artist Verification Full Section */}
                <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-7 space-y-6 backdrop-blur-none">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[var(--tj-radius-md,10px)] bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9] shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-base font-bold text-white">Artist Verification</h2>
                        <p className="text-xs text-[var(--tj-text-secondary,#A8B7CC)] max-w-lg">
                          Unlock verified creator badge status, NFT marketplace publishing, and featured discovery placement.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {userProfile?.isVerifiedArtist ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 rounded-[var(--tj-radius-sm,8px)] text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified Artist</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => navigate('/artist-verification')}
                          className="bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-[var(--tj-radius-sm,8px)] h-11 px-5 text-xs font-semibold cursor-pointer"
                        >
                          Apply for Verification
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('/artist-verification')}
                        className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[var(--tj-text-secondary,#A8B7CC)] hover:text-white transition-colors rounded-[var(--tj-radius-sm,8px)] cursor-pointer flex items-center gap-1"
                      >
                        <span>Requirements</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <VerificationTracker />
                </div>
              </TabsContent>

              {/* 5. PRIVACY & STORAGE TAB */}
              <TabsContent value="system" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Storage Card */}
                  <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-6 space-y-5 backdrop-blur-none">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-[#229ED9]" />
                      <h2 className="text-base font-bold text-white">Local Storage & Cache</h2>
                    </div>

                    <div className="p-4 sm:p-5 bg-[var(--tj-surface,#111C30)] rounded-[var(--tj-radius-md,10px)] space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Cache Size
                          </span>
                          <p className="text-xl font-bold text-white tabular-nums">{totalSizeMB} MB</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[11px] font-semibold text-[var(--tj-text-secondary,#A8B7CC)]">
                            Offline Tracks
                          </span>
                          <p className="text-xl font-bold text-[#229ED9] tabular-nums">{cachedCount}</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Button
                          type="button"
                          onClick={() => setIsStorageModalOpen(true)}
                          className="w-full h-11 bg-[#0B1424] hover:bg-[#17243A] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold text-white cursor-pointer"
                        >
                          Manage Cached Audio
                        </Button>
                        <Button
                          type="button"
                          onClick={handleClearCache}
                          disabled={isPurging || cachedCount === 0}
                          className="w-full h-11 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-50 text-red-400 rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold cursor-pointer"
                        >
                          {isPurging ? 'Clearing Storage...' : 'Clear Audio Cache'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Account Security */}
                  <div className="bg-[var(--tj-bg-elevated,#0B1424)] rounded-[var(--tj-radius-md,10px)] p-5 sm:p-6 space-y-5 backdrop-blur-none">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-amber-400" />
                      <h2 className="text-base font-bold text-white">Privacy & Security</h2>
                    </div>

                    <div className="space-y-2">
                      <SettingRow
                        icon={ShieldAlert}
                        title="Private Mode"
                        description="Hide your listening activity from social discovery"
                      >
                        <Switch
                          checked={privateMode}
                          onCheckedChange={handlePrivateModeChange}
                          aria-label="Toggle Private Mode"
                          className="data-[state=checked]:bg-[#229ED9]"
                        />
                      </SettingRow>

                      <SettingRow
                        icon={Smartphone}
                        title="Current Device Session"
                        description={deviceSummary}
                      >
                        <span className="text-xs font-semibold text-emerald-400">Active</span>
                      </SettingRow>

                      <div className="pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => signOut()}
                          className="w-full h-11 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold group cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About & Legal Links */}
                <div className="text-center space-y-3 pt-4 pb-2">
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-white/10" />
                    <Settings2 className="w-4 h-4 text-[var(--tj-text-muted,#7F91AA)]" />
                    <span className="h-px w-8 bg-white/10" />
                  </div>
                  <p className="text-xs font-medium text-[var(--tj-text-secondary,#A8B7CC)]">
                    TonJam Web3 Music Platform
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-[var(--tj-text-muted,#7F91AA)]">
                    <Link to="/governance" className="hover:text-white transition-colors">
                      Governance
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {isStorageModalOpen && (
          <StorageManagementModal
            isOpen={isStorageModalOpen}
            onClose={() => setIsStorageModalOpen(false)}
          />
        )}

        {isVerifyModalOpen && (
          <VerifyArtistModal
            onClose={() => setIsVerifyModalOpen(false)}
            artistName={userProfile?.name || 'New Artist'}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
