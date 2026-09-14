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
  Check
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
import { NotificationPreferences, RoyaltySplit, Collaborator } from '@/types';
import VerificationTracker from '@/components/VerificationTracker';
import VerifyArtistModal from '@/components/VerifyArtistModal';
import { db, auth, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadAvatar } from '@/services/storageService';
import RoyaltySplitManager from '@/components/RoyaltySplitManager';
import { CollaboratorManager } from '@/components/CollaboratorManager';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

// UI components
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
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isOffline, toggleOfflineMode, artworkStyle, setArtworkStyle } = useAudio();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { localCurrencyEnabled, setLocalCurrencyEnabled, fiatCurrency, setFiatCurrency } = useGramPrice();

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('tonjam_font_size') || 'standard';
  });

  const handleFontSizeChange = (newSize: string) => {
    localStorage.setItem('tonjam_font_size', newSize);
    setFontSizeState(newSize);
    window.dispatchEvent(new Event('tonjam_font_size_changed'));
    toast.success('Font proportions modified successfully');
  };

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');

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

  const copyAddress = () => {
    if (!tonAddress) return;
    navigator.clipboard.writeText(tonAddress);
    setHasCopiedAddress(true);
    toast.success('Wallet address copied to clipboard');
    setTimeout(() => setHasCopiedAddress(false), 2000);
  };

  const SettingRow = ({ icon: Icon, title, description, children, onClick }: any) => (
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
        "flex items-center justify-between py-4 px-4 sm:px-5 transition-all duration-200 rounded-2xl border border-transparent",
        onClick && "cursor-pointer group hover:bg-white/[0.04] hover:border-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">{title}</span>
          {description && (
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5 opacity-70 leading-tight line-clamp-1">{description}</span>
          )}
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center gap-2 shrink-0">
        {children || <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-36 sm:pb-32 md:pb-24 pt-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Settings</h1>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Manage your profile, audio preferences, wallet, and security</p>
        </div>

        {/* Quick User Summary Badge */}
        {userProfile && (
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-2xl backdrop-blur-md self-start sm:self-auto">
            <img 
              src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'user'}`}
              alt="Profile"
              className="w-8 h-8 rounded-xl object-cover"
            />
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground leading-none">{profile.name || "TonJam User"}</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-0.5">@{profile.username || "node"}</span>
            </div>
            {userProfile.isVerifiedArtist && (
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="overflow-x-auto pb-1 w-full no-scrollbar">
          <TabsList className="bg-[#0B132B]/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 inline-flex h-auto gap-1">
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'interface', label: 'Preferences', icon: Palette },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'web3', label: 'Wallet', icon: Wallet },
              { id: 'system', label: 'Security & Storage', icon: Shield },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-xl px-3.5 py-2.5 text-xs font-bold tracking-tight data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-400 hover:text-zinc-200 transition-all shadow-none border-none flex items-center gap-2 whitespace-nowrap"
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
            {/* ACCOUNT TAB */}
            <TabsContent value="account" className="mt-0 space-y-6">
              {/* Cover Photo Customizer */}
              <Card className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden relative group">
                <div className="aspect-[21/9] sm:aspect-[24/8] w-full bg-zinc-900/80 overflow-hidden relative">
                  {profile.coverPhoto ? (
                    <img 
                      src={profile.coverPhoto} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 text-zinc-500">
                      <LayoutGrid className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Upload artist cover banner</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-3 backdrop-blur-sm p-4">
                    <button 
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label="Upload custom cover photo"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Cover
                    </button>
                    <button 
                      type="button"
                      onClick={generateAICover}
                      disabled={aiLoading}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label="Generate cover image with AI"
                    >
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Synthesize AI Cover
                    </button>
                  </div>
                  {isCoverUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
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
              </Card>

              {/* Profile Details Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Profile Avatar Card */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 text-center flex flex-col items-center">
                    <div className="w-28 h-28 rounded-2xl relative group overflow-hidden mb-4 border border-white/10">
                      <img 
                        src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'user'}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt="Avatar"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label="Upload profile avatar"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{profile.name || "Artist Node"}</h3>
                    <p className="text-xs font-semibold text-blue-400 mt-0.5">@{profile.username || "handle"}</p>

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
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl text-zinc-300 transition-colors border border-white/5"
                    >
                      Change Photo
                    </button>
                  </Card>

                  {/* Verification Banner */}
                  <Card className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <h4 className="text-xs font-bold text-white">Artist Verification</h4>
                    </div>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                      Verified artists gain verified badges, priority algorithmic discovery, and direct royalty payout streaming.
                    </p>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('web3')}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      View Verification Status
                    </button>
                  </Card>
                </div>

                {/* Right Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="settings-name" className="text-xs font-bold text-zinc-400 ml-1">Display Name</label>
                        <input 
                          id="settings-name"
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                          placeholder="Artist / Creator Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="settings-username" className="text-xs font-bold text-zinc-400 ml-1">Handle</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
                          <input 
                            id="settings-username"
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({...profile, username: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <label htmlFor="settings-bio" className="text-xs font-bold text-zinc-400">Bio</label>
                        <button 
                          type="button"
                          onClick={generateAIBio}
                          disabled={aiLoading}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
                        >
                          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Optimize with AI
                        </button>
                      </div>
                      <textarea 
                        id="settings-bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="w-full bg-white/[0.04] border border-white/5 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] resize-none"
                        placeholder="Tell the community about your music and creative journey..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="settings-location" className="text-xs font-bold text-zinc-400 ml-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            id="settings-location"
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({...profile, location: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            placeholder="e.g. London, UK / Remote"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="settings-website" className="text-xs font-bold text-zinc-400 ml-1">Website</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            id="settings-website"
                            type="text"
                            value={profile.website}
                            onChange={(e) => setProfile({...profile, website: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            placeholder="https://yourdomain.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-zinc-400 ml-1 block">Social Accounts</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <Twitter className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
                          <input 
                            type="text"
                            aria-label="X / Twitter Profile URL"
                            value={profile.twitter}
                            onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                            className="flex-1 bg-transparent border-none text-xs font-semibold focus:ring-0 outline-none text-foreground placeholder:text-zinc-600"
                            placeholder="X (Twitter) Profile URL"
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                          <Instagram className="w-4 h-4 text-pink-400 shrink-0 ml-1" />
                          <input 
                            type="text"
                            aria-label="Instagram Profile URL"
                            value={profile.instagram}
                            onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                            className="flex-1 bg-transparent border-none text-xs font-semibold focus:ring-0 outline-none text-foreground placeholder:text-zinc-600"
                            placeholder="Instagram Profile URL"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                      <button 
                        type="button"
                        onClick={() => setProfile({
                          ...profile,
                          name: userProfile?.name || '',
                          username: userProfile?.username || '',
                          bio: userProfile?.bio || '',
                          location: userProfile?.location || '',
                          website: userProfile?.website || '',
                          twitter: userProfile?.socials?.x || '',
                          instagram: userProfile?.socials?.instagram || '',
                        })}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg px-2 py-1"
                      >
                        Reset Changes
                      </button>
                      <Button 
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 h-11 text-xs font-bold border-none"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* PREFERENCES TAB */}
            <TabsContent value="interface" className="mt-0 space-y-6">
              <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 sm:p-6 space-y-2">
                <div className="flex items-center gap-3 mb-4 px-2 pt-2">
                  <Palette className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-foreground">Display & Interface</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-1">
                  <SettingRow 
                    icon={theme === 'dark' ? Moon : Sun} 
                    title="Theme Mode" 
                    description="Switch between dark and light color palettes"
                  >
                    <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                      <SelectTrigger aria-label="Select Interface Palette" className="w-[120px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="light" className="text-xs font-semibold">Light</SelectItem>
                        <SelectItem value="dark" className="text-xs font-semibold">Dark</SelectItem>
                        <SelectItem value="system" className="text-xs font-semibold">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={Coins} 
                    title="Fiat Currency Display" 
                    description="Convert TON / GRAM amounts into estimated fiat value"
                  >
                    <Switch 
                      checked={localCurrencyEnabled} 
                      onCheckedChange={setLocalCurrencyEnabled} 
                      aria-label="Toggle Local Currency Display" 
                      className="data-[state=checked]:bg-blue-600" 
                    />
                  </SettingRow>

                  {localCurrencyEnabled && (
                    <SettingRow 
                      icon={Globe} 
                      title="Preferred Fiat Currency" 
                      description="Choose your localized fiat conversion currency"
                    >
                      <Select value={fiatCurrency} onValueChange={setFiatCurrency}>
                        <SelectTrigger aria-label="Select Preferred Fiat Currency" className="w-[120px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
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
                    description="Adjust application baseline font size for comfortable reading"
                  >
                    <Select value={fontSize} onValueChange={handleFontSizeChange}>
                      <SelectTrigger aria-label="Select Text Readability Scale" className="w-[130px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                        <SelectValue placeholder="Font Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
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
                      <SelectTrigger aria-label="Select Display Language" className="w-[130px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
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
                    description="Select visual rendering mode in audio player"
                  >
                    <Select value={artworkStyle} onValueChange={(val: any) => setArtworkStyle(val)}>
                      <SelectTrigger aria-label="Select Artwork Presentation Style" className="w-[140px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="spotify" className="text-xs font-semibold">Standard</SelectItem>
                        <SelectItem value="vinyl" className="text-xs font-semibold">Analog Vinyl</SelectItem>
                        <SelectItem value="visualizer" className="text-xs font-semibold">Visualizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={Globe} 
                    title="CDN Gateway Region" 
                    description="Target nearest CDN relay node for low-latency streaming"
                  >
                    <Select defaultValue="eu-west">
                      <SelectTrigger aria-label="Select Data Relay Region" className="w-[130px] h-9 bg-black/30 border border-white/10 rounded-xl text-xs font-bold px-3 shadow-none">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="eu-west" className="text-xs font-semibold">Europe (EU-1)</SelectItem>
                        <SelectItem value="us-east" className="text-xs font-semibold">America (US-1)</SelectItem>
                        <SelectItem value="asia" className="text-xs font-semibold">Asia-Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>

                  <SettingRow 
                    icon={WifiOff} 
                    title="Offline Audio Caching" 
                    description="Enable local encrypted track caching for offline playback"
                  >
                    <Switch 
                      checked={isOffline} 
                      onCheckedChange={toggleOfflineMode} 
                      aria-label="Toggle Offline Listening" 
                      className="data-[state=checked]:bg-blue-600" 
                    />
                  </SettingRow>
                </div>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 sm:p-6 space-y-2">
                <div className="flex items-center gap-3 mb-4 px-2 pt-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-foreground">Notification Preferences</h3>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <SettingRow 
                    icon={Bell} 
                    title="Transaction & Protocol Alerts" 
                    description="Instant alerts for mints, purchases, and streaming payouts"
                  >
                    <Switch 
                      checked={preferences.directAlerts} 
                      onCheckedChange={(val) => updatePreferences({...preferences, directAlerts: val})} 
                      aria-label="Toggle Protocol Comms alerts" 
                      className="data-[state=checked]:bg-blue-600" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={ShieldAlert} 
                    title="Market Price Movements" 
                    description="Updates when your owned tracks change in floor valuation"
                  >
                    <Switch 
                      checked={preferences.marketActivity} 
                      onCheckedChange={(val) => updatePreferences({...preferences, marketActivity: val})} 
                      aria-label="Toggle Market Fluctuations alerts" 
                      className="data-[state=checked]:bg-blue-600" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={Plus} 
                    title="New Drops & Exclusive Releases" 
                    description="Priority notifications for new drops from followed artists"
                  >
                    <Switch 
                      checked={preferences.dropsAndReleases} 
                      onCheckedChange={(val) => updatePreferences({...preferences, dropsAndReleases: val})} 
                      aria-label="Toggle New Protocol Drops alerts" 
                      className="data-[state=checked]:bg-blue-600" 
                    />
                  </SettingRow>

                  <SettingRow 
                    icon={ShieldCheck} 
                    title="Browser Push Notifications" 
                    description="Request desktop and mobile browser push permissions"
                    onClick={async () => {
                      const granted = await requestPushPermission();
                      if (granted) toast.success("Browser notifications active");
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  </SettingRow>

                  <div className="flex items-center justify-between py-4 px-4 sm:px-5 rounded-2xl hover:bg-white/[0.04] transition-all duration-200">
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label htmlFor="revenue-threshold" className="text-xs sm:text-sm font-bold text-foreground cursor-pointer">Revenue Alert Threshold (TON)</label>
                        <span className="text-[11px] font-medium text-muted-foreground mt-0.5 opacity-70">Trigger notification when balance surpasses threshold</span>
                      </div>
                    </div>
                    <input 
                      id="revenue-threshold"
                      type="number" 
                      aria-label="Revenue Signal Threshold in TON"
                      value={preferences.revenueThreshold || 100}
                      onChange={(e) => updatePreferences({...preferences, revenueThreshold: Number(e.target.value)})}
                      className="w-20 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-center text-xs font-bold text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* WALLET & ON-CHAIN TAB */}
            <TabsContent value="web3" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mainnet Bridge Card */}
                <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <h3 className="text-base font-bold text-foreground">TON Wallet</h3>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border",
                      tonAddress ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {tonAddress ? "Connected" : "Not Connected"}
                    </div>
                  </div>
                  
                  <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                      Connect your TON wallet (Tonkeeper, MyTonWallet, OpenMask) to buy music NFTs, stream royalties, and participate in artist governance.
                    </p>
                    {tonAddress && (
                      <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 font-mono text-xs">
                        <span className="text-zinc-500">Address</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-bold">{tonAddress.slice(0, 6)}...{tonAddress.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={copyAddress}
                            className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
                            aria-label="Copy wallet address"
                          >
                            {hasCopiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 flex justify-center">
                      <TonConnectButton />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 ml-1">Collaborators & Co-creators</h4>
                    <CollaboratorManager 
                      collaborators={profile.collaborators}
                      onChange={(collaborators) => setProfile({ ...profile, collaborators })}
                    />
                  </div>
                </Card>

                {/* Royalty Engine Card */}
                <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-foreground">Royalty Engine</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-cyan-400 ml-1">Streaming Revenue Split</h4>
                      <RoyaltySplitManager 
                        splits={profile.streamingSplits}
                        onChange={(splits) => setProfile({ ...profile, streamingSplits: splits })}
                        collaborators={profile.collaborators}
                      />
                    </div>
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-purple-400 ml-1">Secondary NFT Sale Royalties</h4>
                      <RoyaltySplitManager 
                        splits={profile.nftSaleSplits}
                        onChange={(splits) => setProfile({ ...profile, nftSaleSplits: splits })}
                        collaborators={profile.collaborators}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Button 
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 text-xs font-bold border-none"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Save Royalty Configuration
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Artist Verification Card */}
              <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">Artist Verification</h3>
                      <p className="text-xs font-medium text-zinc-400 max-w-lg">Unlock verified blue badge status, secondary marketplace publishing, and featured playlist placement.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
                    {userProfile?.isVerifiedArtist ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Verified Artist
                      </div>
                    ) : (
                      <Button 
                        type="button"
                        onClick={() => setIsVerifyModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-6 text-xs font-bold border-none"
                      >
                        Apply for Verification
                      </Button>
                    )}
                    <button 
                      type="button"
                      className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-xl"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <VerificationTracker />
                </div>
              </Card>
            </TabsContent>

            {/* SECURITY & STORAGE TAB */}
            <TabsContent value="system" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storage Card */}
                <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base font-bold text-foreground">Local Storage & Cache</h3>
                  </div>

                  <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-zinc-400">Cache Size</span>
                        <h4 className="text-xl font-bold text-foreground">{totalSizeMB} MB</h4>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[11px] font-semibold text-zinc-400">Offline Tracks</span>
                        <h4 className="text-xl font-bold text-blue-400">{cachedCount}</h4>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Button 
                        type="button"
                        onClick={() => setIsStorageModalOpen(true)}
                        className="w-full h-11 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/5 text-foreground"
                      >
                        Manage Cached Audio
                      </Button>
                      <Button 
                        type="button"
                        onClick={clearAllCache}
                        disabled={isPurging || cachedCount === 0}
                        className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/10"
                      >
                        {isPurging ? "Clearing Storage..." : "Clear Audio Cache"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Privacy & Account Security */}
                <Card className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-foreground">Privacy & Security</h3>
                  </div>

                  <div className="space-y-3">
                    <SettingRow 
                      icon={ShieldAlert} 
                      title="Private Mode" 
                      description="Hide your listening activity from social discovery"
                    >
                      <Switch defaultChecked aria-label="Toggle Ghost Protocol" className="data-[state=checked]:bg-blue-600" />
                    </SettingRow>

                    <SettingRow 
                      icon={Key} 
                      title="Active Device Sessions" 
                      description="Devices authenticated with your current session"
                    >
                      <span className="text-xs font-bold text-zinc-400">1 Active</span>
                    </SettingRow>

                    <div className="pt-4 border-t border-white/5">
                      <Button 
                        type="button"
                        variant="ghost" 
                        onClick={() => signOut()}
                        className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold group"
                      >
                        <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
                        Log Out / Disconnect
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* About & Protocol Info */}
              <div className="text-center space-y-3 pt-6 pb-2">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-white/10" />
                  <Settings2 className="w-4 h-4 text-zinc-600" />
                  <span className="h-px w-8 bg-white/10" />
                </div>
                <p className="text-xs font-medium text-zinc-500">TonJam Web3 Music Protocol • v2.4.1</p>
                <div className="flex items-center justify-center gap-5 text-xs text-zinc-500">
                  <a href="#" className="hover:text-zinc-300 transition-colors">Whitepaper</a>
                  <span>•</span>
                  <a href="#" className="hover:text-zinc-300 transition-colors">Security Audit</a>
                  <span>•</span>
                  <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Storage Management Modal */}
      {isStorageModalOpen && (
        <StorageManagementModal 
          isOpen={isStorageModalOpen} 
          onClose={() => setIsStorageModalOpen(false)} 
        />
      )}

      {/* Artist Verification Modal */}
      {isVerifyModalOpen && (
        <VerifyArtistModal 
          onClose={() => setIsVerifyModalOpen(false)} 
          artistName={userProfile?.name || 'New Artist'} 
        />
      )}
    </div>
  );
};

export default Settings;
