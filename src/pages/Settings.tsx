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
  LayoutGrid
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/components/theme-provider';
import { useCacheManagement } from '@/hooks/useCacheManagement';
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

// shadcn/ui components
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { totalSizeMB, cachedCount, clearAllCache, isPurging } = useCacheManagement();
  const tonAddress = useTonAddress();
  
  const { preferences, updatePreferences, requestPushPermission } = useNotification();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
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
      const { downloadUrl } = await uploadAvatar(file); // Reusing uploadAvatar for cover
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
          prompt: `A professional, cinematic, high-resolution musical artist profile banner for ${profile.name}. Style: modern, vibrant, minimalist. No text.`,
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
      toast.success('Profile parameters updated on-chain');
    } catch (error) {
      toast.error('Sync failed. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const SettingRow = ({ icon: Icon, title, description, children, onClick }: any) => (
    <div 
      className={cn(
        "flex items-center justify-between py-4 px-5 transition-all duration-300 rounded-[24px] border border-transparent",
        onClick && "cursor-pointer group hover:bg-white/[0.04] hover:border-white/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-tight">{title}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 leading-tight">{description}</span>
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center gap-3 ml-2 shrink-0">
        {children || <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full px-4 sm:px-6 md:px-8 pb-24 pt-6 animate-in fade-in duration-700">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">System Deck</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Architectural Node & Identity Matrix</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3">
               <ShieldCheck className="w-4 h-4 text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stable Protocol</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] font-mono text-zinc-500 font-bold pr-3">v2.4.1</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/5 inline-flex h-auto gap-1">
            {[
              { id: 'account', label: 'Identity', icon: User },
              { id: 'web3', label: 'On-Chain', icon: Wallet },
              { id: 'interface', label: 'Deck', icon: Palette },
              { id: 'notifications', label: 'Signal', icon: Bell },
              { id: 'system', label: 'Engine', icon: Database },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-500 hover:text-zinc-300 transition-all shadow-none border-none flex items-center gap-2"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* IDENTITY TAB */}
            <TabsContent value="account" className="mt-0 space-y-6">
              {/* Cover Photo Matrix */}
              <Card className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden relative group">
                <div className="aspect-[21/9] w-full bg-zinc-900 overflow-hidden">
                  {profile.coverPhoto ? (
                    <img 
                      src={profile.coverPhoto} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 opacity-40">
                      <LayoutGrid className="w-12 h-12 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Visual Uplink</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button 
                      onClick={() => coverInputRef.current?.click()}
                      className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Ingest Cover
                    </button>
                    <button 
                      onClick={generateAICover}
                      disabled={aiLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Synthesize with AI
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                   <Card className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
                      <div className="aspect-square relative group">
                        <img 
                          src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          alt="Avatar"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                           >
                             <Upload className="w-5 h-5" />
                           </button>
                        </div>
                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 text-center">
                         <h3 className="text-lg font-black uppercase tracking-tight">{profile.name || "Unnamed Node"}</h3>
                         <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">@{profile.username || "handle"}</p>
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileChange} 
                           className="hidden" 
                           accept="image/*" 
                         />
                      </CardContent>
                   </Card>

                   <Card className="bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-6 space-y-4">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="w-5 h-5 text-blue-500" />
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Trust Protocol</h3>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">
                        Your identity is anchored to the TON protocol. Verified status grants access to advanced governance and royalty modules.
                      </p>
                      <button 
                        onClick={() => setActiveTab('web3')}
                        className="w-full py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors"
                      >
                        Verification Portal
                      </button>
                   </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Display Label</label>
                              <input 
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                placeholder="Your artist name"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Node Handle</label>
                              <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black">@</span>
                                <input 
                                  type="text"
                                  value={profile.username}
                                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                  placeholder="username"
                                />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center justify-between ml-4">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Identity Bio</label>
                              <button 
                                onClick={generateAIBio}
                                disabled={aiLoading}
                                className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1"
                              >
                                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Optimize with AI
                              </button>
                           </div>
                           <textarea 
                             value={profile.bio}
                             onChange={(e) => setProfile({...profile, bio: e.target.value})}
                             className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[120px] resize-none"
                             placeholder="Write your artistic manifesto..."
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Geospatial Node</label>
                              <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input 
                                  type="text"
                                  value={profile.location}
                                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                  placeholder="Global / Tokyo / Mars"
                                />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Web Matrix</label>
                              <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input 
                                  type="text"
                                  value={profile.website}
                                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                  placeholder="https://..."
                                />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Social Uplinks</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                 <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Twitter className="w-4 h-4" />
                                 </div>
                                 <input 
                                   type="text"
                                   value={profile.twitter}
                                   onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                                   className="flex-1 bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
                                   placeholder="X/Twitter Profile URL"
                                 />
                              </div>
                              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                 <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                                    <Instagram className="w-4 h-4" />
                                 </div>
                                 <input 
                                   type="text"
                                   value={profile.instagram}
                                   onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                                   className="flex-1 bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
                                   placeholder="Instagram URL"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <button 
                          onClick={() => setProfile({
                             ...profile,
                             name: userProfile?.name || '',
                             username: userProfile?.username || '',
                             bio: userProfile?.bio || '',
                          })}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
                        >
                          Discard Edits
                        </button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-white text-black hover:bg-zinc-200 rounded-2xl px-10 h-14 text-xs font-black uppercase tracking-widest border-none"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                          Synchronize Identity
                        </Button>
                     </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ON-CHAIN TAB */}
            <TabsContent value="web3" className="mt-0 space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Wallet className="w-6 h-6 text-blue-500" />
                           <h3 className="text-lg font-black uppercase tracking-tight">Mainnet Bridge</h3>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5",
                          tonAddress ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                           {tonAddress ? "Active Node" : "Disconnected"}
                        </div>
                     </div>
                     
                     <div className="p-6 bg-black/20 rounded-[24px] border border-white/5 space-y-4">
                        <p className="text-xs font-bold text-zinc-400 leading-relaxed">
                          Your TON wallet is the central nexus for all protocol interactions, including NFT minting, royalty distribution, and governance staking.
                        </p>
                        {tonAddress && (
                           <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-xs">
                              <span className="text-zinc-500">Address</span>
                              <span className="text-blue-400 font-bold">{tonAddress.slice(0, 8)}...{tonAddress.slice(-8)}</span>
                           </div>
                        )}
                        <div className="pt-2 flex justify-center">
                           <TonConnectButton />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Protocol Collaborators</h4>
                        <CollaboratorManager 
                           collaborators={profile.collaborators}
                           onChange={(collaborators) => setProfile({ ...profile, collaborators })}
                        />
                     </div>
                  </Card>

                  <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                     <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight">Royalty Engine</h3>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 ml-4">Global Streaming Split</h4>
                           <RoyaltySplitManager 
                              splits={profile.streamingSplits}
                              onChange={(splits) => setProfile({ ...profile, streamingSplits: splits })}
                              collaborators={profile.collaborators}
                           />
                        </div>
                        <div className="space-y-4 pt-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 ml-4">Secondary NFT Royalties</h4>
                           <RoyaltySplitManager 
                              splits={profile.nftSaleSplits}
                              onChange={(splits) => setProfile({ ...profile, nftSaleSplits: splits })}
                              collaborators={profile.collaborators}
                           />
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="w-full bg-white text-black hover:bg-zinc-200 rounded-[20px] h-14 text-[10px] font-black uppercase tracking-[0.2em] border-none"
                        >
                           Commit Protocol Splits
                        </Button>
                     </div>
                  </Card>
               </div>

               <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <ShieldCheck className="w-10 h-10" />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight uppercase">Artist Verification Protocol</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-md">Unlock blue-chip artist status, secondary market access, and algorithmic priority in the global discovery feed.</p>
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                         {userProfile?.isVerifiedArtist ? (
                            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                               <CheckCircle className="w-4 h-4" /> Node Verified
                            </div>
                         ) : (
                            <Button 
                              onClick={() => setIsVerifyModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest border-none"
                            >
                               Initiate Analysis
                            </Button>
                         )}
                         <button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                            Documentation
                         </button>
                      </div>
                   </div>
                   <div className="mt-12">
                      <VerificationTracker />
                   </div>
               </Card>
            </TabsContent>

            {/* DECK TAB */}
            <TabsContent value="interface" className="mt-0 space-y-6">
               <Card className="bg-white/5 border border-white/5 rounded-[32px] p-4 sm:p-8 space-y-4">
                  <div className="flex items-center gap-4 mb-6 ml-4">
                     <Palette className="w-6 h-6 text-blue-500" />
                     <h3 className="text-lg font-black uppercase tracking-tight">Visual Environment</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <SettingRow 
                        icon={theme === 'dark' ? Moon : Sun} 
                        title="Interface Palette" 
                        description="Switch between high-contrast dark and day modes"
                    >
                        <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                        <SelectTrigger className="w-[120px] h-10 bg-black/30 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 shadow-none">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl">
                            <SelectItem value="light" className="text-[10px] font-black uppercase tracking-widest">Light</SelectItem>
                            <SelectItem value="dark" className="text-[10px] font-black uppercase tracking-widest">Dark</SelectItem>
                            <SelectItem value="system" className="text-[10px] font-black uppercase tracking-widest">System</SelectItem>
                        </SelectContent>
                        </Select>
                    </SettingRow>

                    <SettingRow 
                        icon={Sparkles} 
                        title="Artwork Presentation" 
                        description="Choose how track visuals are rendered in the player"
                    >
                        <Select value={artworkStyle} onValueChange={(val: any) => setArtworkStyle(val)}>
                          <SelectTrigger className="w-[140px] h-10 bg-black/30 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 shadow-none">
                              <SelectValue placeholder="Style" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl">
                              <SelectItem value="spotify" className="text-[10px] font-black uppercase tracking-widest">Spotify Standard</SelectItem>
                              <SelectItem value="vinyl" className="text-[10px] font-black uppercase tracking-widest">Analog Vinyl</SelectItem>
                              <SelectItem value="visualizer" className="text-[10px] font-black uppercase tracking-widest">Digital Visualizer</SelectItem>
                          </SelectContent>
                        </Select>
                    </SettingRow>

                    <SettingRow 
                        icon={Globe} 
                        title="Data Relay Region" 
                        description="Optimize ingestion latency for your geospatial node"
                    >
                        <Select defaultValue="eu-west">
                        <SelectTrigger className="w-[120px] h-10 bg-black/30 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 shadow-none">
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl">
                            <SelectItem value="eu-west" className="text-[10px] font-black uppercase tracking-widest">EUROPE-1</SelectItem>
                            <SelectItem value="us-east" className="text-[10px] font-black uppercase tracking-widest">AMERICA-1</SelectItem>
                            <SelectItem value="asia" className="text-[10px] font-black uppercase tracking-widest">ASIA-PACIFIC</SelectItem>
                        </SelectContent>
                        </Select>
                    </SettingRow>

                    <SettingRow 
                        icon={WifiOff} 
                        title="Offline Listening" 
                        description="Enable local track persistent caching for disconnected playback"
                    >
                      <Switch checked={isOffline} onCheckedChange={toggleOfflineMode} className="data-[state=checked]:bg-blue-600" />
                    </SettingRow>
                  </div>
               </Card>
            </TabsContent>

            {/* SIGNAL TAB */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
               <Card className="bg-white/5 border border-white/5 rounded-[32px] p-4 sm:p-8 space-y-4">
                  <div className="flex items-center gap-4 mb-6 ml-4">
                     <Bell className="w-6 h-6 text-blue-500" />
                     <h3 className="text-lg font-black uppercase tracking-tight">Signal Matrix</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <SettingRow 
                        icon={Bell} 
                        title="Protocol Comms" 
                        description="Alerts for transactional events and security signals"
                    >
                        <Switch checked={preferences.directAlerts} onCheckedChange={(val) => updatePreferences({...preferences, directAlerts: val})} className="data-[state=checked]:bg-blue-600" />
                    </SettingRow>

                    <SettingRow 
                        icon={ShieldAlert} 
                        title="Market Fluctuations" 
                        description="Push notifications for active asset value variance"
                    >
                        <Switch checked={preferences.marketActivity} onCheckedChange={(val) => updatePreferences({...preferences, marketActivity: val})} className="data-[state=checked]:bg-blue-600" />
                    </SettingRow>

                    <SettingRow 
                        icon={Plus} 
                        title="New Protocol Drops" 
                        description="Early-access signals for new minting opportunities"
                    >
                        <Switch checked={preferences.dropsAndReleases} onCheckedChange={(val) => updatePreferences({...preferences, dropsAndReleases: val})} className="data-[state=checked]:bg-blue-600" />
                    </SettingRow>

                    <SettingRow 
                        icon={ShieldCheck} 
                        title="Web Push Relay" 
                        description="Request system-level browser notification permissions"
                        onClick={async () => {
                           const granted = await requestPushPermission();
                           if (granted) toast.success("Relay permissions established.");
                        }}
                    >
                       <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
                    </SettingRow>

                    <div className="flex items-center justify-between py-4 px-5 rounded-[24px] hover:bg-white/[0.04] transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight">Revenue Signal Threshold</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">Alert when TON accrual exceeds value</span>
                        </div>
                      </div>
                      <input 
                        type="number" 
                        value={preferences.revenueThreshold || 100}
                        onChange={(e) => updatePreferences({...preferences, revenueThreshold: Number(e.target.value)})}
                        className="w-20 bg-black/40 border border-white/5 rounded-xl p-3 text-center text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
               </Card>
            </TabsContent>

            {/* ENGINE TAB */}
            <TabsContent value="system" className="mt-0 space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-6">
                     <div className="flex items-center gap-4">
                        <Database className="w-6 h-6 text-blue-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight">Storage Core</h3>
                     </div>

                     <div className="p-6 bg-black/20 rounded-[24px] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Capacity</span>
                              <h4 className="text-2xl font-black tracking-tighter">{totalSizeMB} MB</h4>
                           </div>
                           <div className="text-right space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cached Tracks</span>
                              <h4 className="text-2xl font-black tracking-tighter text-blue-500">{cachedCount}</h4>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Button 
                             onClick={() => setIsStorageModalOpen(true)}
                             className="w-full h-14 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5"
                           >
                             Manage Asset Cluster
                           </Button>
                           <Button 
                             onClick={clearAllCache}
                             disabled={isPurging || cachedCount === 0}
                             className="w-full h-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10"
                           >
                             {isPurging ? "Purging Nodes..." : "Purge Static Cache"}
                           </Button>
                        </div>
                     </div>
                  </Card>

                  <Card className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                     <div className="flex items-center gap-4">
                        <Key className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight">Access Control</h3>
                     </div>

                     <div className="space-y-4">
                        <SettingRow 
                           icon={ShieldAlert} 
                           title="Ghost Protocol" 
                           description="Obfuscate your node from public discovery searches"
                        >
                           <Switch defaultChecked className="data-[state=checked]:bg-orange-600" />
                        </SettingRow>

                        <SettingRow 
                           icon={Key} 
                           title="Device Auths" 
                           description="Active cryptographic sessions linked to this node"
                        >
                           <span className="text-[10px] font-black text-zinc-500 uppercase">1 Active</span>
                        </SettingRow>

                        <div className="pt-4">
                           <Button 
                             variant="ghost" 
                             onClick={() => signOut()}
                             className="w-full h-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] group"
                           >
                             <LogOut className="w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1" />
                             Terminate Session
                           </Button>
                        </div>
                     </div>
                  </Card>
               </div>

               <div className="text-center space-y-4 pt-12">
                  <div className="flex items-center justify-center gap-4">
                     <span className="h-px w-12 bg-white/10" />
                     <Settings2 className="w-5 h-5 text-zinc-700" />
                     <span className="h-px w-12 bg-white/10" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Stable Protocol Release 2.4.1</p>
                  <div className="flex items-center justify-center gap-6">
                     <a href="#" className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Whitepaper</a>
                     <a href="#" className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Security Audit</a>
                     <a href="#" className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Terminus Protocol</a>
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
  );
};

export default Settings;
