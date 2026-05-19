// Updated Profile Styling
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
 Camera, 
 Check, 
 Pencil, 
 CheckCircle, 
 BarChart3, 
 Star, 
 Settings, 
 Box, 
 Disc, 
 Layers, 
 Zap, 
 Coins, 
 Gem, 
 Dna, 
 Loader2, 
 Plus, 
 Gift, 
 ArrowDown, 
 ArrowUp, 
 TrendingUp,
 Satellite,
 Users,
 User,
 Upload,
 Globe,
 Twitter,
 Instagram,
 Send,
 Search,
 SlidersHorizontal,
 Clock3,
 Music2
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Avatar, AvatarImage, AvatarFallback } from"@/components/ui/avatar";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import PostCard from '@/components/PostCard';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS, MOCK_ARTISTS, MOCK_USERS, APP_LOGO, GENRES } from '@/constants';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, cn } from '@/lib/utils';
import { uploadFile } from '@/services/storageService';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import NFTVaultSection from '@/components/NFTVaultSection';
import PlaylistCard from '@/components/PlaylistCard';
import SocialFeed from '@/components/SocialFeed';
import UserCard from '@/components/UserCard';
import SellNFTModal from '@/components/SellNFTModal';
import ManageNFTModal from '@/components/ManageNFTModal';
import UserArtistVerificationModal from '@/components/UserArtistVerificationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import VerificationTracker from '@/components/VerificationTracker';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { NFTItem, UserProfile } from '@/types';
import { useTonAddress } from '@tonconnect/ui-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { db, auth, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const Profile: React.FC = () => {
 const navigate = useNavigate();
 const userAddress = useTonAddress();
 const { 
 addNotification, 
 playlists, 
 userProfile, 
 setUserProfile, 
 userTracks, 
 userNFTs, 
 allNFTs, 
 allTracks, 
 currentTrack,
 followedUserIds,
 playTrack,
 recentlyPlayed,
 clearRecentlyPlayed,
 posts,
 createPost,
 deletePost
 } = useAudio();
 const { user } = useAuth();
 const [isEditing, setIsEditing] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
 const [localUser, setLocalUser] = useState<UserProfile>(userProfile);
 const [isUploading, setIsUploading] = useState(false);
 const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'releases' | 'sequences' | 'activity' | 'network' | 'staking' | 'feed'>('overview');
 const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
 const [selectedNftForManaging, setSelectedNftForManaging] = useState<NFTItem | null>(null);
 const [newPostContent, setNewPostContent] = useState('');
 const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'price-low' | 'price-high'>('newest');
 const [showFilters, setShowFilters] = useState(false);

 /* Check for Spotify verification */
 const isSpotifyVerified = useMemo(() => {
 return !!localUser.socials?.spotify || localUser.isVerifiedArtist;
 }, [localUser.socials?.spotify, localUser.isVerifiedArtist]);

 const isVercelVerified = useMemo(() => {
 return !!(localUser.socials as any)?.vercel;
 }, [localUser.socials]);

 /* Staking State - Persisted */
 const [stakeAmount, setStakeAmount] = useState('');
 const [unstakeAmount, setUnstakeAmount] = useState('');
 const [stakedBalance, setStakedBalance] = useState(() => {
 const saved = localStorage.getItem('tonjam_staked_balance');
 return saved ? parseFloat(saved) : 500;
 });
 const [walletBalance, setWalletBalance] = useState(() => {
 const saved = localStorage.getItem('tonjam_wallet_balance');
 return saved ? parseFloat(saved) : 1250;
 });
 const [pendingRewards, setPendingRewards] = useState(4.2);
 const [recentLimit, setRecentLimit] = useState(5);
 const recentSentinelRef = useInfiniteScroll(() => setRecentLimit(prev => prev + 5));

 const avatarInputRef = useRef<HTMLInputElement>(null);
 const bannerInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (!isEditing) setLocalUser(userProfile);
 }, [userProfile, isEditing]);

 useEffect(() => {
 localStorage.setItem('tonjam_staked_balance', stakedBalance.toString());
 }, [stakedBalance]);

 useEffect(() => {
 localStorage.setItem('tonjam_wallet_balance', walletBalance.toString());
 }, [walletBalance]);

 const userPosts = useMemo(() => {
 return posts.filter(p => p.userId === localUser.uid || p.authorId === localUser.uid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
 }, [posts, localUser.uid]);

 const handleStake = () => {
 const amount = parseFloat(stakeAmount);
 if (isNaN(amount) || amount <= 0 || amount > walletBalance) {
 addNotification("Invalid stake amount","error");
 return;
 }
 setWalletBalance(prev => prev - amount);
 setStakedBalance(prev => prev + amount);
 setStakeAmount('');
 addNotification(`Successfully staked ${amount} TJ Coins`,"success");
 };

 const handleUnstake = () => {
 const amount = parseFloat(unstakeAmount);
 if (isNaN(amount) || amount <= 0 || amount > stakedBalance) {
 addNotification("Invalid unstake amount","error");
 return;
 }
 setIsUnstakeModalOpen(true);
 };

 const confirmUnstake = () => {
 const amount = parseFloat(unstakeAmount);
 setStakedBalance(prev => prev - amount);
 setWalletBalance(prev => prev + amount);
 setUnstakeAmount('');
 setIsUnstakeModalOpen(false);
 addNotification(`Successfully unstaked ${amount} TJ Coins`,"success");
 };

 const handleClaimRewards = () => {
 if (pendingRewards <= 0) {
 addNotification("No rewards to claim","info");
 return;
 }
 setWalletBalance(prev => prev + pendingRewards);
 setPendingRewards(0);
 addNotification(`Claimed ${pendingRewards} TJ Coins`,"success");
 };

 const ownedNfts = useMemo(() => 
 allNFTs.filter(nft => nft.owner === localUser.walletAddress || nft.owner === userAddress),
 [localUser.walletAddress, userAddress, allNFTs]
 );

 const anthemNft = useMemo(() => 
 allNFTs.find(n => n.id === userProfile.anthemId),
 [userProfile.anthemId, allNFTs]
 );

 const handleSwitchRole = async (newRole: 'artist' | 'collector') => {
 if (!user) return;
 try {
 setIsUploading(true);
 const userRef = doc(db, 'users', user.uid);
 await updateDoc(userRef, { role: newRole, isVerifiedArtist: newRole === 'artist' });
 setUserProfile({ ...userProfile, role: newRole, isVerifiedArtist: newRole === 'artist' });
 addNotification(`Switched to ${newRole} role`, 'success');
 } catch (error) {
 handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
 } finally {
 setIsUploading(false);
 }
 };

 const userReleases = useMemo(() => {
  let tracks = allTracks.filter(t => t.artistId === localUser.uid);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    tracks = tracks.filter(t => t.title.toLowerCase().includes(q) || t.artist?.toLowerCase().includes(q));
  }
  if (sortOption === 'popular') tracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  return tracks;
 }, [allTracks, localUser.uid, searchQuery, sortOption]);

 const feedPosts = useMemo(() => {
 return posts.filter(p => p.userId === userProfile.uid || followedUserIds.includes(p.userId));
 }, [userProfile.uid, followedUserIds, posts]);

 const handleSharePost = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newPostContent.trim() && !currentTrack) return;

 createPost({
 content: newPostContent || `Listening to ${currentTrack?.title}`,
 trackId: currentTrack?.id,
 });

 setNewPostContent('');
 addNotification('Signal broadcasted successfully', 'success');
 };

 const royaltyStats = useMemo(() => {
 /* Simulate royalty calculations */
 const streamingRevenue = allTracks.filter(t => t.artistId === localUser.uid).reduce((acc, t) => acc + (t.playCount || 0) * 0.001, 0);
 const nftRevenue = allNFTs.filter(n => n.creator === localUser.name).reduce((acc, n) => acc + parseFloat(n.price) * (n.royalty || 0) / 100, 0);
 return {
 total: (streamingRevenue + nftRevenue).toFixed(2),
 streaming: streamingRevenue.toFixed(2),
 nft: nftRevenue.toFixed(2),
 pending: (Math.random() * 10).toFixed(2)
 };
 }, [localUser, allTracks, allNFTs]);

 const handleSave = async () => {
 const user = auth.currentUser;
 if (!user) {
 addNotification("You must be logged in to save changes","error");
 return;
 }

 try {
 setIsUploading(true);
 const userRef = doc(db, 'users', user.uid);
 await updateDoc(userRef, cleanUpdateData({
 name: localUser.name,
 bio: localUser.bio,
 avatar: localUser.avatar,
 bannerUrl: localUser.bannerUrl,
 socials: localUser.socials || {}
 }));

 setUserProfile(localUser);
 setIsEditing(false);
 addNotification("Profile updated successfully","success");
 } catch (error) {
 handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
 } finally {
 setIsUploading(false);
 }
 };

 const handleSocialChange = (platform: string, value: string) => {
 setLocalUser(prev => ({
 ...prev,
 socials: {
 ...(prev.socials || {}),
 [platform]: value
 }
 }));
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
 const file = e.target.files?.[0];
 if (file) {
 const validation = validateFile(file, 'image', 5);
 if (!validation.isValid) {
 addNotification(validation.error ||"Invalid file","error");
 e.target.value = '';
 return;
 }
 
 setIsUploading(true);
 try {
 addNotification(`Adding ${type === 'avatar' ? 'profile' : 'banner'} image...`, 'info');
 const storagePath = `profiles/${user?.uid}/${type === 'avatar' ? 'avatar' : 'banner'}.png`;
 const { downloadUrl } = await uploadFile(file, storagePath);
 setLocalUser(prev => prev ? ({ ...prev, [type === 'avatar' ? 'avatar' : 'bannerUrl']: downloadUrl }) : null);
 addNotification(`${type === 'avatar' ? 'Profile' : 'Banner'} image added successfully`, 'success');
 } catch (error) {
 console.error(`Error uploading ${type}:`, error);
 addNotification(`Failed to upload ${type} to storage`, 'error');
 } finally {
 setIsUploading(false);
 }
 }
 };

 const handleNFTAction = (nft: NFTItem) => {
 if (nft.listingType) {
 setSelectedNftForManaging(nft);
 } else {
 setSelectedNftForListing(nft);
 }
 };

 const StatBlock = ({ label, value, icon, subValue, trend }: { label: string, value: string, icon?: string, subValue?: string, trend?: string }) => (
 <div className="relative group overflow-hidden bg-background p-3 rounded-[2px] transition-all shadow-2xl">
 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full -mr-4 -mt-4 group-hover:bg-blue-600/10 transition-colors"></div>
 
 <div className="flex justify-between items-start mb-4 relative z-10">
 <div className="flex flex-col gap-4">
 <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] leading-none">{label}</span>
 {trend && (
 <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-4">
 <TrendingUp className="h-2 w-2"/> {trend}
 </span>
 )}
 </div>
 <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center transition-all">
 {icon === 'gem' && <Gem className="h-3.5 w-3.5 text-blue-500"/>}
 {icon === 'coins' && <Coins className="h-3.5 w-3.5 text-amber-500"/>}
 {icon === 'users' && <Users className="h-3.5 w-3.5 text-purple-500"/>}
 {icon === 'zap' && <Zap className="h-3.5 w-3.5 text-blue-400"/>}
 </div>
 </div>
 
 <div className="flex items-baseline gap-4 relative z-10">
 <h4 className="text-xl sm:text-2xl font-bold tracking-tighter text-neutral-900 dark:text-foreground leading-none font-mono">{value}</h4>
{subValue && <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 dark:text-foreground/30 uppercase tracking-widest leading-none">{subValue}</span>}
 </div>
 
 {/* Micro-grid background */}
 <div className="absolute inset-0 opacity-[0.02] pointer-events-none"style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
 </div>
 );

 const SectionHeader = ({ title, onAction, actionLabel }: { title: string, onAction?: () => void, actionLabel?: string }) => (
 <div className="flex items-center justify-between mb-4 px-4 md:px-4">
 <div className="flex items-center gap-4">
 <div className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
 <h3 className="text-[10px] font-bold text-zinc-800 dark:text-foreground uppercase tracking-[0.2em]">
 {title}
 </h3>
 </div>
 {onAction && (
 <button onClick={onAction} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:text-blue-500 transition-all flex items-center gap-2 group">
 {actionLabel || 'View All'}
 <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform"/>
 </button>
 )}
 </div>
 );

 const themeClass = localUser.profileTheme
 ? localUser.profileTheme === 'dark' || localUser.profileTheme === 'light' 
 ? localUser.profileTheme 
 : `theme-${localUser.profileTheme}`
 : '';

 return (
 <div className={`animate-in fade-in duration-1000 pb-24 min-h-screen font-sans ${themeClass} bg-background text-foreground`}>
 {/* Banner Section */}
 <div className="relative h-[25vh] sm:h-[40vh] md:h-[50vh] w-full overflow-hidden bg-blue-950">
 <BackButton className="absolute top-4 left-4 z-50 bg-black/50 text-white hover:bg-black/70" />
 <img src={localUser.bannerUrl || getPlaceholderImage(`banner-${localUser.uid}`, 1200, 400)} className="w-full h-full object-cover opacity-80" alt="" />
 <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-background/60 to-background"></div>
 
 {isEditing && (
 <button 
 onClick={() => bannerInputRef.current?.click()} 
 disabled={isUploading}
 className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all z-20"
 >
 {isUploading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Camera className="h-5 w-5"/>}
 </button>
 )}
 <input type="file"hidden ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
 </div>

  {/* IDENTITY SECTION */}
  <div className="w-full max-w-7xl mx-auto px-4 relative z-30 flex flex-col items-start text-neutral-900 dark:text-white font-sans">
    <div className="flex justify-between items-end w-full mb-4">
      {/* Profile Picture */}
      <div className="relative group -mt-12 sm:-mt-16 md:-mt-24">
        <div 
          className="relative overflow-hidden border-[4px] border-background bg-muted w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full"
        >
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage src={localUser.avatar || getPlaceholderImage(`user-${localUser.uid}`)} className="object-cover" alt={localUser.name} />
            <AvatarFallback className="text-3xl font-black">{(localUser.name || '?').charAt(0)}</AvatarFallback>
          </Avatar>
          
          {isEditing && (
            <button 
              onClick={() => avatarInputRef.current?.click()} 
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="text-white h-8 w-8"/>
            </button>
          )}
        </div>
        {isSpotifyVerified && (
          <div className="absolute bottom-2 right-2 z-10 bg-background rounded-full p-0.5 border-2 border-background">
            <CheckCircle className="w-5 h-5 md:w-6 h-6 text-blue-500 fill-current"/>
          </div>
        )}
        <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
      </div>

      {/* Action Button (Extreme Right) */}
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-5 py-2 bg-white/5 text-white rounded-full font-black text-[11px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-5 py-2 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl"
            >
              Save
            </button>
          </>
        ) : (
          <button 
            onClick={() => navigate('/edit-profile')}
            className="px-6 py-2 bg-background text-foreground rounded-full font-black text-[11px] uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-all shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>

    {/* Name, Handle, Bio */}
    <div className="space-y-1 mt-2">
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
          {localUser.name}
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium text-sm md:text-base">
            {localUser.username || `@${(localUser.uid || '').slice(0, 8)}`}
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wider",
            localUser.role === 'admin' ? "bg-red-500/10 text-red-600" :
            localUser.role === 'artist' ? "bg-blue-500/10 text-blue-500" :
            "bg-white/5 text-white/40"
          )}>
            {localUser.role || 'collector'}
          </span>
        </div>
        
        {/* Bio */}
        <p className="text-sm text-foreground/90 max-w-xl leading-relaxed whitespace-pre-wrap">
          {localUser.bio || "Digital architect of frequencies. Constructing reality through sound."}
        </p>

        {/* Info Icons (Location/Join Date/Website) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs md:text-sm font-medium">
          {localUser.socials?.website && (
            <a href={localUser.socials.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline">
              <Globe className="w-4 h-4" />
              {localUser.socials.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <div className="flex items-center gap-1.5 grayscale opacity-60">
            <Plus className="w-4 h-4 rotate-45" />
            Joined May 2026
          </div>
        </div>

        {/* Stats (Following/Followers) */}
        <div className="flex items-center gap-5 pt-2">
          <button className="flex items-center gap-1 text-sm hover:underline group">
            <span className="font-black text-foreground">{(localUser.following || 0).toLocaleString()}</span>
            <span className="text-muted-foreground font-medium">Following</span>
          </button>
          <button className="flex items-center gap-1 text-sm hover:underline group">
            <span className="font-black text-foreground">{(localUser.followers || 0).toLocaleString()}</span>
            <span className="text-muted-foreground font-medium">Followers</span>
          </button>
        </div>
      </div>
    </div>
  </div>



  {/* Tab Navigation */}
  <div className="w-full sticky top-[0px] z-40 bg-background/95 backdrop-blur-md border-b border-border/10 mb-2">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'feed', label: 'Activity' },
            { id: 'overview', label: 'Overview' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'releases', label: 'Releases', hidden: !userProfile.isVerifiedArtist },
            { id: 'sequences', label: 'Playlists' },
            { id: 'staking', label: 'Staking' }
          ].filter(t => !t.hidden).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-full whitespace-nowrap",
                activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profile-tab-blob"
                  className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-lg shadow-blue-600/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-full transition-all border",
            showFilters ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-4 border-t border-white/5 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search inside content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { id: 'newest', label: 'Newest', icon: Clock3 },
                  { id: 'popular', label: 'Popular', icon: Zap },
                  { id: 'price-low', label: 'Price: Low', icon: ArrowDown, hidden: activeTab !== 'inventory' },
                  { id: 'price-high', label: 'Price: High', icon: ArrowUp, hidden: activeTab !== 'inventory' }
                ].filter(o => !o.hidden).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortOption(opt.id as any)}
                    className={cn(
                      "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border whitespace-nowrap",
                      sortOption === opt.id 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-transparent border-white/5 text-white/40 hover:border-white/10"
                    )}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>

  {/* Main Dashboard Layout */}
  <div className="max-w-7xl mx-auto px-0 md:px-4">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
      {/* Main Column (Feed/Content) */}
      <div className="lg:col-span-8 border-x border-white/5 bg-background/50 min-h-screen">
        {activeTab === 'feed' && (
          <div className="animate-in fade-in duration-500">
            {/* Quick Share (X style) */}
            <div className="px-5 py-4 border-b border-white/5 bg-background/40 backdrop-blur-md">
              <form onSubmit={handleSharePost} className="flex gap-4">
                <Avatar className="w-12 h-12 border border-white/5">
                  <AvatarImage src={localUser.avatar || getPlaceholderImage(`user-${localUser.uid}`)} />
                </Avatar>
                <div className="flex-1 space-y-3">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What is happening?!"
                    className="w-full bg-transparent text-xl text-white outline-none resize-none pt-2 placeholder:text-muted-foreground/30 min-h-[50px]"
                  />
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                       {currentTrack && (
                         <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                           <Disc className="h-3 w-3 text-blue-500 animate-spin-slow" />
                           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{currentTrack.title}</span>
                         </div>
                       )}
                    </div>
                    <button 
                      type="submit"
                      disabled={!newPostContent.trim() && !currentTrack}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <SocialFeed posts={feedPosts} onDeletePost={deletePost} emptyMessage="No activity posts found." />
          </div>
        )}

        {/* Network Tab (New) */}
        {activeTab === 'network' && (
          <div className="p-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Followers</p>
                <h3 className="text-3xl font-black">{(localUser.followers || 0).toLocaleString()}</h3>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Following</p>
                <h3 className="text-3xl font-black">{(localUser.following || 0).toLocaleString()}</h3>
              </div>
            </div>
          </div>
        )}

        {/* ... remaining tabs content ... */}
        {activeTab === 'overview' && (
          <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 last:border-b-0">
            {/* Anthem Highlight */}
            {anthemNft && (
              <div className="bg-background p-6 border-b border-white/5 relative group">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
                    <img src={anthemNft.imageUrl || getPlaceholderImage(`nft-${anthemNft.id}`)} className="w-full h-full object-cover" alt={anthemNft.title} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Profile Anthem
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-tighter">
                      {anthemNft.title}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground mb-6 uppercase tracking-widest">
                      by {anthemNft.creator}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button 
                        onClick={() => {
                          const track = allTracks.find(t => t.id === anthemNft.trackId);
                          if (track) playTrack(track);
                        }}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
                      >
                        Listen Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-8">
              <SectionHeader title="Followed Artists" onAction={() => setActiveTab('staking')} />
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {localUser.followedArtists && localUser.followedArtists.length > 0 ? (
                  localUser.followedArtists.slice(0, 5).map(artistId => {
                    const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
                    return artist ? <div key={artist.uid} className="flex-shrink-0 w-48"><UserCard user={artist} variant="compact" /></div> : null;
                  })
                ) : (
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">No artists tracked.</p>
                )}
              </div>

              <SectionHeader title="Recently Collected" onAction={() => setActiveTab('inventory')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(ownedNfts || []).slice(0, 2).map(nft => (
                  <NFTCard key={nft.id} nft={nft} onAction={handleNFTAction} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab (standard posts feed) */}
        {activeTab === 'feed' && (
          <div className="animate-in fade-in duration-500">
            {/* Quick Share (X style) */}
            <div className="px-5 py-4 border-b border-white/5 bg-background/40 backdrop-blur-md">
              <form onSubmit={handleSharePost} className="flex gap-4">
                <Avatar className="w-12 h-12 border border-white/5">
                  <AvatarImage src={localUser.avatar || getPlaceholderImage(`user-${localUser.uid}`)} />
                </Avatar>
                <div className="flex-1 space-y-3">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What is happening?!"
                    className="w-full bg-transparent text-xl text-white outline-none resize-none pt-2 placeholder:text-muted-foreground/30 min-h-[50px]"
                  />
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                       {currentTrack && (
                         <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                           <Disc className="h-3 w-3 text-blue-500 animate-spin-slow" />
                           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{currentTrack.title}</span>
                         </div>
                       )}
                    </div>
                    <button 
                      type="submit"
                      disabled={!newPostContent.trim() && !currentTrack}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <SocialFeed posts={feedPosts} onDeletePost={deletePost} emptyMessage="No activity posts found." />
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'inventory' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
            {ownedNfts.length > 0 ? (
              ownedNfts.map(nft => (
                <NFTCard key={nft.id} nft={nft} onAction={handleNFTAction} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white/5 rounded-3xl">
                <Box className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No collectibles found.</p>
              </div>
            )}
          </div>
        )}

        {/* Releases Tab */}
        {activeTab === 'releases' && (
          <div className="p-4 space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userReleases.map(track => (
                <TrackCard key={track.id} track={track} variant="row" />
              ))}
            </div>
            {userReleases.length === 0 && (
               <div className="py-20 text-center flex flex-col items-center justify-center bg-white/5 rounded-3xl">
                <Music2 className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No releases found.</p>
              </div>
            )}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'sequences' && (
          <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            {playlists.map(pl => (
              <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
            ))}
          </div>
        )}

        {/* Staking/Governance Tab */}
        {activeTab === 'staking' && (
          <div className="p-4 animate-in fade-in duration-500">
            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Staked Capital</p>
                  <h3 className="text-4xl font-black text-white">{(stakedBalance || 0).toLocaleString()} <span className="text-sm text-blue-500">TJ</span></h3>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Rewards</p>
                  <h3 className="text-4xl font-black text-emerald-500">{pendingRewards.toFixed(2)} <span className="text-sm">TJ</span></h3>
                </div>
                <button onClick={handleClaimRewards} className="bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-widest px-8 h-12 self-end">Claim</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar (X style) */}
      <div className="lg:col-span-4 space-y-4 px-4 py-4 hidden lg:block sticky top-[var(--header-height,64px)] self-start h-fit">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Asset Registry</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab('staking')}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Earnings</span>
              <span className="text-lg font-black text-white group-hover:text-blue-500 transition-colors">
                {(localUser.earnings || 0).toLocaleString()} <span className="text-[10px] text-blue-500">TON</span>
              </span>
            </div>
            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab('staking')}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">JAM Balance</span>
              <span className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">
                {(userProfile?.jamBalance || 0).toLocaleString()} <span className="text-[10px] text-amber-500">JAM</span>
              </span>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Identity Protocols</h4>
            {localUser.isVerifiedArtist ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Architect</span>
              </div>
            ) : localUser.verificationStatus && localUser.verificationStatus !== 'unverified' ? (
              <div className="space-y-4">
                 <VerificationTracker />
                 {localUser.verificationStatus === 'rejected' && (
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full py-3 bg-white/5 text-white hover:bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
                    >
                      Resubmit in Settings
                    </button>
                 )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/settings')}
                className="w-full py-4 bg-blue-500 text-white hover:bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Apply for Verification
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mt-4">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Who to Follow</h4>
          <div className="space-y-6">
            {MOCK_ARTISTS.slice(0, 3).map(artist => (
              <div key={artist.uid} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/artist/${artist.uid}`)}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white/5">
                    <AvatarImage src={artist.avatarUrl} />
                  </Avatar>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase leading-none group-hover:underline">{artist.name}</p>
                    <p className="text-[9px] font-medium text-muted-foreground mt-1">@architect_id</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-white text-black rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/90 transition-all">
                  Follow
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/explore')}
            className="w-full mt-8 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline text-left"
          >
            Show more
          </button>
        </div>

        <p className="px-4 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest leading-relaxed">
          Terms of Service Privacy Policy Cookie Policy Accessibility Ads info © 2026 TonJam.
        </p>
      </div>
    </div>
  </div>

 {/* Modals */}
 {selectedNftForListing && (
 <SellNFTModal nft={selectedNftForListing} onClose={() => setSelectedNftForListing(null)} />
 )}
 {selectedNftForManaging && (
 <ManageNFTModal nft={selectedNftForManaging} isOpen={true} onClose={() => setSelectedNftForManaging(null)} />
 )}
 {isVerificationModalOpen && (
 <UserArtistVerificationModal onClose={() => setIsVerificationModalOpen(false)} />
 )}
 {/* Unstake Confirmation */}
 <ConfirmationModal
 isOpen={isUnstakeModalOpen}
 onClose={() => setIsUnstakeModalOpen(false)}
 onConfirm={confirmUnstake}
 title="Unstake TJ Coins?"
 description={`Are you sure you want to unstake ${unstakeAmount} TJ Coins? This will return them to your wallet balance.`}
 confirmText="Unstake Now"
 />
 </div>
 );
};

export default Profile;
