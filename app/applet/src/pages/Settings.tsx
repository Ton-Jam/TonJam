import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  UserCircle,
  Eye,
  Key,
  ShieldAlert,
  Database,
  Trash2,
  Plus,
  WifiOff,
  Palette,
  Loader2,
  Upload,
  Twitter,
  Instagram,
  CheckCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  MapPin,
  Settings2,
  LayoutGrid,
  Coins,
  Type,
  Copy,
  Check,
  HelpCircle,
  FileText,
  Lock,
  Volume2,
  Sliders,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/components/theme-provider';
import { useCacheManagement } from '@/hooks/useCacheManagement';
import { useI18n } from '@/contexts/I18nContext';
import { useGramPrice } from '@/contexts/GramPriceContext';
import StorageManagementModal from '@/components/StorageManagementModal';
import { cn, validateFile } from '@/lib/utils';
import { RoyaltySplit, Collaborator } from '@/types';
import VerificationTracker from '@/components/VerificationTracker';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import { db, auth, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadAvatar } from '@/services/storageService';
import RoyaltySplitManager from '@/components/RoyaltySplitManager';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollaboratorManager } from '@/components/CollaboratorManager';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isOffline, toggleOfflineMode, artworkStyle, setArtworkStyle, audioQuality, setAudioQuality } = useAudio() as any;
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { localCurrencyEnabled, setLocalCurrencyEnabled, fiatCurrency, setFiatCurrency } = useGramPrice();

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('tonjam_font_size') || 'standard';
  });

  const { totalSizeMB, cachedCount, clearAllCache, isPurging } = useCacheManagement();
  const tonAddress = useTonAddress();
  
  const { preferences, updatePreferences, requestPushPermission } = useNotification();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [hasCopiedAddress, setHasCopiedAddress] = useState(false);

  // Confirmation Modals State
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [clearCacheModalOpen, setClearCacheModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');

  const handleFontSizeChange = (newSize: string) => {
    localStorage.setItem('tonjam_font_size', newSize);
    setFontSizeState(newSize);
    window.dispatchEvent(new Event('tonjam_font_size_changed'));
    toast.success('Font proportions modified successfully');
  };

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

  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || '',
        coverPhoto: userProfile.coverPhoto || '',
        twitter: userProfile.socials?.x || '',
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
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateFile(file, 'image', 5);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
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
      setProfile(prev => ({ ...prev, avatar: downloadUrl }));
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateFile(file, 'image', 10);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      e.target.value = '';
      return;
    }
    
    if (!user) return;

    try {
      setIsCoverUploading(true);
      const { downloadUrl } = await uploadAvatar(file);
      setProfile(prev => ({ ...prev, coverPhoto: downloadUrl }));
      toast.success('Cover photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload cover.');
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
          prompt: `A professional, cinematic, high-resolution musical artist profile banner for ${profile.name || 'electronic musician'}. Style: modern, vibrant, minimalist, TON blue and dark aesthetic. No text.`,
          aspectRatio: '16:9'
        })
      });

      if (!response.ok) throw new Error('AI generation failed');
      
      const { imageUrl } = await response.json();
      if (imageUrl) {
        setProfile(prev => ({ ...prev, coverPhoto: imageUrl }));
        toast.success('AI Cover generated!');
      }
    } catch (error) {
      toast.error("Failed to generate AI cover.");
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
        body: JSON.stringify({ name: profile.name, username: profile.username })
      });

      if (!response.ok) throw new Error('AI generation failed');
      
      const { bio } = await response.json();
      if (bio) {
        setProfile(prev => ({ ...prev, bio }));
        toast.success('AI Bio generated!');
      }
    } catch (error) {
      toast.error("Failed to generate AI bio.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, cleanUpdateData({
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar,
        coverPhoto: profile.coverPhoto,
        location: profile.location,
        website: profile.website,
        socials: {
          x: profile.twitter,
          instagram: profile.instagram,
          website: profile.website,
        },
        royaltyConfig: {
          streamingSplits: profile.streamingSplits,
          nftSaleSplits: profile.nftSaleSplits,
        },
        collaborators: profile.collaborators
      }));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Sync failed. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      // Clean up Firestore document and auth user
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      await user.delete();
      toast.success('Account deleted successfully');
      signOut();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account. Please re-authenticate.');
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountModalOpen(false);
    }
  };

  const copyAddress = () => {
    if (!tonAddress) return;
    navigator.clipboard.writeText(tonAddress);
    setHasCopiedAddress(true);
    toast.success('Wallet address copied to clipboard');
    setTimeout(() => setHasCopiedAddress(false), 2000);
  };

  const SettingRow = ({ icon: Icon, title, description, children, onClick, iconColor = "text-[#229ED9]", iconBg = "bg-[#229ED9]/10" }: any) => (
    <div 
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={cn(
        "flex items-center justify-between py-4 px-4 sm:px-5 transition-all duration-200 rounded-2xl",
        onClick && "cursor-pointer group hover:bg-white/[0.04] focus:outline-none"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold text-[#F5F7FB] tracking-tight truncate">{title}</span>
          {description && (
            <span className="text-[11px] font-medium text-[#94A3B8] mt-0.5 leading-tight line-clamp-1">{description}</span>
          )}
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center gap-2 shrink-0">
        {children || <ChevronRight className="h-4 w-4 text-[#94A3B8]/40 group-hover:translate-x-0.5 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-[#F5F7FB] pb-36 sm:pb-32 md:pb-24 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7FB]">Settings</h1>
            {!user && (
              <Button 
                onClick={() => navigate('/login')} 
                className="bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-xl px-4 py-2 text-xs font-bold"
              >
                Sign In
              </Button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">Make TonJam yours.</p>
        </div>

        {/* Profile Summary Card */}
        {userProfile ? (
          <div className="relative overflow-hidden bg-[#111C30] rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#229ED9]/15 via-[#9B7CFF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'user'}`}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#229ED9]/30"
                  />
                  {userProfile.isVerifiedArtist && (
                    <div className="absolute -bottom-1 -right-1 bg-[#229ED9] text-white p-1 rounded-full shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#F5F7FB]">{profile.name || "TonJam User"}</h2>
                    <span className="px-2 py-0.5 bg-[#229ED9]/10 text-[#229ED9] rounded-full text-[10px] font-bold">
                      {userProfile.isVerifiedArtist ? 'Verified Artist' : 'Listener'}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] font-semibold">@{profile.username || "node"}</p>
                  <p className="text-xs text-[#94A3B8]/80 line-clamp-1 max-w-sm">{profile.bio || "Exploring Web3 music on TON."}</p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('account')}
                className="bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] rounded-xl px-5 h-10 text-xs font-bold transition-all"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-[#111C30] rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center mx-auto">
              <UserCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#F5F7FB]">Guest Mode</h3>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">Sign in to customize your profile, sync your favorite tracks, manage NFTs, and collect streaming royalties.</p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-xl px-6 h-11 text-xs font-bold"
            >
              Sign In to TonJam
            </Button>
          </div>
        )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="overflow-x-auto pb-1 w-full no-scrollbar">
          <TabsList className="bg-[#111C30] p-1.5 rounded-full inline-flex h-auto gap-1">
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'interface', label: 'Appearance', icon: Palette },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'music', label: 'Music & Playback', icon: Volume2 },
              { id: 'web3', label: 'Wallet & Web3', icon: Wallet },
              { id: 'security', label: 'Security & Privacy', icon: Shield },
              { id: 'storage', label: 'Storage & Data', icon: Database },
              { id: 'support', label: 'Help & Support', icon: HelpCircle },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-full px-4 py-2 text-xs font-bold tracking-tight data-[state=active]:bg-[#229ED9] data-[state=active]:text-white data-[state=inactive]:text-[#94A3B8] hover:text-white transition-all shadow-none flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. ACCOUNT TAB */}
            <TabsContent value="account" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 overflow-hidden relative shadow-xl">
                <div className="aspect-[21/9] sm:aspect-[24/8] w-full bg-zinc-900/80 overflow-hidden relative rounded-2xl">
                  {profile.coverPhoto ? (
                    <img src={profile.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                      <LayoutGrid className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Upload artist cover banner</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm p-4">
                    <button 
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Cover
                    </button>
                    <button 
                      type="button"
                      onClick={generateAICover}
                      disabled={aiLoading}
                      className="px-4 py-2.5 bg-[#229ED9] text-white rounded-xl text-xs font-bold hover:bg-[#229ED9]/90 transition-all flex items-center gap-2"
                    >
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Synthesize AI Cover
                    </button>
                  </div>
                </div>
                <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-[#111C30] rounded-3xl p-6 text-center flex flex-col items-center shadow-xl">
                    <div className="w-28 h-28 rounded-2xl relative group overflow-hidden mb-4">
                      <img 
                        src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'user'}`} 
                        className="w-full h-full object-cover" 
                        alt="Avatar"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#F5F7FB]">{profile.name || "Artist Node"}</h3>
                    <p className="text-xs font-semibold text-[#229ED9] mt-0.5">@{profile.username || "handle"}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl text-[#94A3B8] transition-colors"
                    >
                      Change Photo
                    </button>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-[#111C30] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] ml-1">Display Name</label>
                        <input 
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full bg-[#080D1A] rounded-xl px-4 py-3 text-sm font-semibold text-[#F5F7FB] outline-none transition-all"
                          placeholder="Artist / Creator Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] ml-1">Handle</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold">@</span>
                          <input 
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({...profile, username: e.target.value})}
                            className="w-full bg-[#080D1A] rounded-xl pl-9 pr-4 py-3 text-sm font-semibold text-[#F5F7FB] outline-none transition-all"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-[#94A3B8]">Bio</label>
                        <button 
                          type="button"
                          onClick={generateAIBio}
                          disabled={aiLoading}
                          className="text-xs font-bold text-[#229ED9] hover:underline flex items-center gap-1"
                        >
                          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Optimize with AI
                        </button>
                      </div>
                      <textarea 
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="w-full bg-[#080D1A] rounded-2xl px-4 py-3 text-sm font-medium text-[#F5F7FB] outline-none transition-all min-h-[100px] resize-none"
                        placeholder="Tell the community about your music..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] ml-1">Location</label>
                        <input 
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                          className="w-full bg-[#080D1A] rounded-xl px-4 py-3 text-sm font-semibold text-[#F5F7FB] outline-none"
                          placeholder="e.g. London, UK"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] ml-1">Website</label>
                        <input 
                          type="text"
                          value={profile.website}
                          onChange={(e) => setProfile({...profile, website: e.target.value})}
                          className="w-full bg-[#080D1A] rounded-xl px-4 py-3 text-sm font-semibold text-[#F5F7FB] outline-none"
                          placeholder="https://yourdomain.com"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-xl px-6 h-11 text-xs font-bold"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 2. APPEARANCE TAB */}
            <TabsContent value="interface" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <Palette className="w-5 h-5 text-[#229ED9]" />
                  <h3 className="text-base font-bold text-[#F5F7FB]">Appearance & Display</h3>
                </div>

                <div className="space-y-2">
                  <SettingRow 
                    icon={theme === 'dark' ? Moon : Sun} 
                    title="Theme Mode" 
                    description="Choose your interface visual theme"
                    iconColor="text-[#9B7CFF]"
                    iconBg="bg-[#9B7CFF]/10"
                  >
                    <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                      <SelectTrigger className="w-[130px] h-9 bg-[#080D1A] rounded-xl text-xs font-bold px-3">
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111C30] text-[#F5F7FB] rounded-xl shadow-2xl">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={Coins} 
                    title="Fiat Currency Display" 
                    description="Show estimated fiat equivalents for TON amounts"
                    iconColor="text-[#FFC857]"
                    iconBg="bg-[#FFC857]/10"
                  >
                    <Switch 
                      checked={localCurrencyEnabled} 
                      onCheckedChange={setLocalCurrencyEnabled} 
                      className="data-[state=checked]:bg-[#229ED9]" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={Type} 
                    title="Typography Scaling" 
                    description="Adjust application font size for readability"
                    iconColor="text-[#2DD4BF]"
                    iconBg="bg-[#2DD4BF]/10"
                  >
                    <Select value={fontSize} onValueChange={handleFontSizeChange}>
                      <SelectTrigger className="w-[140px] h-9 bg-[#080D1A] rounded-xl text-xs font-bold px-3">
                        <SelectValue placeholder="Font Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111C30] text-[#F5F7FB] rounded-xl shadow-2xl">
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="large">Enhanced</SelectItem>
                        <SelectItem value="accessible">Accessible</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={Globe} 
                    title="Display Language" 
                    description="Select your localized language"
                    iconColor="text-[#229ED9]"
                    iconBg="bg-[#229ED9]/10"
                  >
                    <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                      <SelectTrigger className="w-[130px] h-9 bg-[#080D1A] rounded-xl text-xs font-bold px-3">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111C30] text-[#F5F7FB] rounded-xl shadow-2xl">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="uk">Українська</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                </div>
              </Card>
            </TabsContent>

            {/* 3. NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <Bell className="w-5 h-5 text-[#229ED9]" />
                  <h3 className="text-base font-bold text-[#F5F7FB]">Notification Preferences</h3>
                </div>

                <div className="space-y-2">
                  <SettingRow 
                    icon={Bell} 
                    title="Transaction & Protocol Alerts" 
                    description="Instant alerts for mints, purchases, and streaming payouts"
                    iconColor="text-[#229ED9]"
                    iconBg="bg-[#229ED9]/10"
                  >
                    <Switch 
                      checked={preferences.directAlerts} 
                      onCheckedChange={(val) => updatePreferences({...preferences, directAlerts: val})} 
                      className="data-[state=checked]:bg-[#229ED9]" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={ShieldAlert} 
                    title="Market Price Movements" 
                    description="Updates when your owned tracks change in floor valuation"
                    iconColor="text-[#FFC857]"
                    iconBg="bg-[#FFC857]/10"
                  >
                    <Switch 
                      checked={preferences.marketActivity} 
                      onCheckedChange={(val) => updatePreferences({...preferences, marketActivity: val})} 
                      className="data-[state=checked]:bg-[#229ED9]" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={Plus} 
                    title="New Drops & Exclusive Releases" 
                    description="Priority notifications for new drops from followed artists"
                    iconColor="text-[#9B7CFF]"
                    iconBg="bg-[#9B7CFF]/10"
                  >
                    <Switch 
                      checked={preferences.dropsAndReleases} 
                      onCheckedChange={(val) => updatePreferences({...preferences, dropsAndReleases: val})} 
                      className="data-[state=checked]:bg-[#229ED9]" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={ShieldCheck} 
                    title="Browser Push Notifications" 
                    description="Request desktop and mobile browser push permissions"
                    iconColor="text-[#34D399]"
                    iconBg="bg-[#34D399]/10"
                    onClick={async () => {
                      const granted = await requestPushPermission();
                      if (granted) toast.success("Browser notifications active");
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#34D399] animate-pulse" />
                  </SettingRow>
                </div>
              </Card>
            </TabsContent>

            {/* 4. MUSIC & PLAYBACK TAB */}
            <TabsContent value="music" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <Volume2 className="w-5 h-5 text-[#229ED9]" />
                  <h3 className="text-base font-bold text-[#F5F7FB]">Music & Playback</h3>
                </div>

                <div className="space-y-2">
                  <SettingRow 
                    icon={Sliders} 
                    title="Audio Quality" 
                    description="Select streaming audio fidelity profile"
                    iconColor="text-[#2DD4BF]"
                    iconBg="bg-[#2DD4BF]/10"
                  >
                    <Select value={audioQuality || 'lossless'} onValueChange={(val: any) => setAudioQuality?.(val)}>
                      <SelectTrigger className="w-[130px] h-9 bg-[#080D1A] rounded-xl text-xs font-bold px-3">
                        <SelectValue placeholder="Quality" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111C30] text-[#F5F7FB] rounded-xl shadow-2xl">
                        <SelectItem value="lossless">Lossless (FLAC)</SelectItem>
                        <SelectItem value="high">High (320kbps)</SelectItem>
                        <SelectItem value="normal">Standard (160kbps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={Sparkles} 
                    title="Player Artwork Presentation" 
                    description="Choose artwork rendering mode in the audio player"
                    iconColor="text-[#9B7CFF]"
                    iconBg="bg-[#9B7CFF]/10"
                  >
                    <Select value={artworkStyle} onValueChange={(val: any) => setArtworkStyle(val)}>
                      <SelectTrigger className="w-[140px] h-9 bg-[#080D1A] rounded-xl text-xs font-bold px-3">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111C30] text-[#F5F7FB] rounded-xl shadow-2xl">
                        <SelectItem value="spotify">Standard Cover</SelectItem>
                        <SelectItem value="vinyl">Analog Vinyl</SelectItem>
                        <SelectItem value="visualizer">Audio Visualizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={WifiOff} 
                    title="Offline Audio Caching" 
                    description="Enable encrypted local track storage for offline listening"
                    iconColor="text-[#FFC857]"
                    iconBg="bg-[#FFC857]/10"
                  >
                    <Switch 
                      checked={isOffline} 
                      onCheckedChange={toggleOfflineMode} 
                      className="data-[state=checked]:bg-[#229ED9]" 
                    />
                  </SettingRow>
                </div>
              </Card>
            </TabsContent>

            {/* 5. WALLET & WEB3 TAB */}
            <TabsContent value="web3" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#111C30] rounded-3xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-[#229ED9]" />
                      <h3 className="text-base font-bold text-[#F5F7FB]">TON Wallet</h3>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold tracking-wide",
                      tonAddress ? "bg-[#34D399]/10 text-[#34D399]" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {tonAddress ? "Connected" : "Not Connected"}
                    </div>
                  </div>
                  
                  <div className="p-5 bg-[#080D1A] rounded-2xl space-y-4">
                    <p className="text-xs font-medium text-[#94A3B8] leading-relaxed">
                      Connect your TON wallet to purchase music NFTs, stream streaming royalties, and participate in governance.
                    </p>
                    {tonAddress && (
                      <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl font-mono text-xs">
                        <span className="text-[#94A3B8]">Address</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#229ED9] font-bold">{tonAddress.slice(0, 6)}...{tonAddress.slice(-6)}</span>
                          <button onClick={copyAddress} className="p-1 text-[#94A3B8] hover:text-white transition-colors">
                            {hasCopiedAddress ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 flex justify-center">
                      <TonConnectButton />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#111C30] rounded-3xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#9B7CFF]" />
                    <h3 className="text-base font-bold text-[#F5F7FB]">Royalty Engine</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#2DD4BF] ml-1">Streaming Revenue Split</h4>
                      <RoyaltySplitManager 
                        splits={profile.streamingSplits}
                        onChange={(splits) => setProfile({ ...profile, streamingSplits: splits })}
                        collaborators={profile.collaborators}
                      />
                    </div>
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-[#9B7CFF] ml-1">Secondary NFT Sale Royalties</h4>
                      <RoyaltySplitManager 
                        splits={profile.nftSaleSplits}
                        onChange={(splits) => setProfile({ ...profile, nftSaleSplits: splits })}
                        collaborators={profile.collaborators}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* 6. SECURITY & PRIVACY TAB */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#111C30] rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-2 px-2">
                    <Shield className="w-5 h-5 text-[#2DD4BF]" />
                    <h3 className="text-base font-bold text-[#F5F7FB]">Security & Privacy</h3>
                  </div>

                  <div className="space-y-2">
                    <SettingRow 
                      icon={Eye} 
                      title="Private Listening Mode" 
                      description="Hide your listening activity from social discovery feeds"
                      iconColor="text-[#2DD4BF]"
                      iconBg="bg-[#2DD4BF]/10"
                    >
                      <Switch defaultChecked className="data-[state=checked]:bg-[#229ED9]" />
                    </SettingRow>

                    <SettingRow 
                      icon={Key} 
                      title="Active Device Sessions" 
                      description="Manage devices authenticated with your account"
                      iconColor="text-[#9B7CFF]"
                      iconBg="bg-[#9B7CFF]/10"
                    >
                      <span className="text-xs font-bold text-[#94A3B8]">1 Active</span>
                    </SettingRow>
                  </div>
                </Card>

                <Card className="bg-[#111C30] rounded-3xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    <h3 className="text-base font-bold text-[#F5F7FB]">Account Actions</h3>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => setSignOutModalOpen(true)}
                      className="w-full h-11 bg-white/5 hover:bg-white/10 text-[#F5F7FB] rounded-xl text-xs font-bold justify-start px-4"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-[#94A3B8]" />
                      Sign Out of TonJam
                    </Button>
                    <Button 
                      onClick={() => setDeleteAccountModalOpen(true)}
                      className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold justify-start px-4"
                    >
                      <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                      Delete Account Permanently
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* 7. STORAGE & DATA TAB */}
            <TabsContent value="storage" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-[#229ED9]" />
                  <h3 className="text-base font-bold text-[#F5F7FB]">Local Storage & Cache</h3>
                </div>

                <div className="p-5 bg-[#080D1A] rounded-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#94A3B8]">Cache Size</span>
                      <h4 className="text-xl font-bold text-[#F5F7FB]">{totalSizeMB} MB</h4>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#94A3B8]">Offline Tracks</span>
                      <h4 className="text-xl font-bold text-[#229ED9]">{cachedCount}</h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => setIsStorageModalOpen(true)}
                      className="w-full h-11 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#F5F7FB]"
                    >
                      Manage Cached Audio
                    </Button>
                    <Button 
                      onClick={() => setClearCacheModalOpen(true)}
                      disabled={isPurging || cachedCount === 0}
                      className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold"
                    >
                      {isPurging ? "Clearing Storage..." : "Clear Audio Cache"}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 8. HELP & SUPPORT TAB */}
            <TabsContent value="support" className="mt-0 space-y-6">
              <Card className="bg-[#111C30] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <HelpCircle className="w-5 h-5 text-[#229ED9]" />
                  <h3 className="text-base font-bold text-[#F5F7FB]">Help & Support</h3>
                </div>

                <div className="space-y-2">
                  <SettingRow icon={HelpCircle} title="Help Center" description="Explore FAQs and platform documentation" onClick={() => window.open('https://ton.org', '_blank')} />
                  <SettingRow icon={FileText} title="Terms of Service" description="Read our terms and protocol conditions" onClick={() => navigate('/about')} />
                  <SettingRow icon={Shield} title="Privacy Policy" description="Learn how we protect your on-chain data" onClick={() => navigate('/about')} />
                </div>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Confirmation Modals */}
      {signOutModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111C30] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FB]">Sign Out</h3>
                <p className="text-xs text-[#94A3B8]">Are you sure you want to sign out of TonJam?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button onClick={() => setSignOutModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">Cancel</Button>
              <Button onClick={() => { signOut(); setSignOutModalOpen(false); }} className="bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold">Sign Out</Button>
            </div>
          </motion.div>
        </div>
      )}

      {clearCacheModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111C30] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#229ED9] flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FB]">Clear Audio Cache</h3>
                <p className="text-xs text-[#94A3B8]">This will remove temporary cached audio files ({totalSizeMB} MB). Your saved playlists and NFTs are unaffected.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button onClick={() => setClearCacheModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">Cancel</Button>
              <Button onClick={() => { clearAllCache(); setClearCacheModalOpen(false); }} className="bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-xl text-xs font-bold">Clear Cache</Button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteAccountModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111C30] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FB]">Delete Account Permanently</h3>
                <p className="text-xs text-[#94A3B8]">This action cannot be undone. All your profile data, likes, and settings will be permanently removed.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button onClick={() => setDeleteAccountModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">Cancel</Button>
              <Button onClick={handleDeleteAccount} disabled={isDeletingAccount} className="bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold">
                {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {isStorageModalOpen && (
        <StorageManagementModal isOpen={isStorageModalOpen} onClose={() => setIsStorageModalOpen(false)} />
      )}

      {isVerifyModalOpen && (
        <VerifyArtistModal onClose={() => setIsVerifyModalOpen(false)} artistName={userProfile?.name || 'New Artist'} />
      )}
      </div>
    </div>
  );
};

export default Settings;
