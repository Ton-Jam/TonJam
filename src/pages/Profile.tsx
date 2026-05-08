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
 Send
} from 'lucide-react';
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
 const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
 const [localUser, setLocalUser] = useState<UserProfile>(userProfile);
 const [isUploading, setIsUploading] = useState(false);
 const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'releases' | 'sequences' | 'activity' | 'network' | 'staking' | 'feed'>('overview');
 const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
 const [selectedNftForManaging, setSelectedNftForManaging] = useState<NFTItem | null>(null);
 const [newPostContent, setNewPostContent] = useState('');
 const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);

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
 <div className="relative h-[15vh] sm:h-[25vh] md:h-[40vh] w-full overflow-hidden bg-blue-950">
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
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-2 -mt-10 sm:-mt-12 relative z-30 flex flex-col md:flex-row-reverse items-center md:items-end w-full gap-4 sm:gap-8 text-neutral-900 dark:text-white font-sans">
    {/* Profile Picture */}
    <div className="relative group flex-shrink-0 md:mr-[-48px]">
      <div 
        className="relative overflow-hidden border-4 border-background shadow-2xl bg-muted w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36"
        style={{ borderRadius: '40px' }}
      >
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={localUser.avatar || getPlaceholderImage(`user-${localUser.uid}`)} className="object-cover" alt={localUser.name} />
          <AvatarFallback className="text-3xl font-black">{localUser.name.charAt(0)}</AvatarFallback>
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
        <div className="absolute bottom-1.5 right-1.5 z-10 bg-[#0A0A0A] rounded-full p-1 shadow-xl flex gap-1 border border-white/5">
          <CheckCircle className="w-4 h-4 md:w-5 h-5 text-blue-500 fill-current"/>
          {isVercelVerified && <Globe className="w-4 h-4 md:w-5 h-5 text-blue-500"/>}
        </div>
      )}
      <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
    </div>

    {/* Name, Handle, Stats, and Actions */}
    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full pb-1 sm:pb-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4 sm:gap-6 mb-4 sm:mb-8">
        {/* Name & Handle */}
        <div className="w-full md:w-auto">
          {isEditing ? (
            <div className="space-y-4 w-full max-w-lg">
              <input 
                type="text" 
                value={localUser.name} 
                onChange={(e) => setLocalUser({...localUser, name: e.target.value})} 
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black outline-none text-white w-full focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                placeholder="Display Name"
              />
              <input 
                type="text" 
                value={localUser.username} 
                onChange={(e) => setLocalUser({...localUser, username: e.target.value})} 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold outline-none text-blue-400 w-full focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-blue-400/20"
                placeholder="@username"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl md:text-3xl font-black tracking-tighter text-neutral-900 dark:text-white drop-shadow-sm uppercase leading-none">
                  {localUser.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] md:text-xs tracking-widest uppercase">
                  {localUser.username?.replace('@', '') || 'user'}
                </span>
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] backdrop-blur-md border",
                  localUser.role === 'admin' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  localUser.role === 'artist' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                  "bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-white/60 border-neutral-200 dark:border-white/10"
                )}>
                  {localUser.role || 'collector'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {isEditing && (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-6 py-2.5 bg-white/5 text-white rounded-full font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2 sm:pt-3 border-t border-neutral-100 dark:border-white/5">
        <div className="flex flex-col items-center md:items-start group cursor-pointer">
          <span className="text-sm sm:text-base font-black text-neutral-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
            {(localUser.followers || 0).toLocaleString()}
          </span>
          <span className="text-[6px] sm:text-[7px] uppercase tracking-[0.2em] text-neutral-400 dark:text-white/30 font-bold mt-0.5 sm:mt-1">Followers</span>
        </div>
        <div className="flex flex-col items-center md:items-start pl-4 sm:pl-6 border-l border-neutral-100 dark:border-white/10 group cursor-pointer">
          <span className="text-sm sm:text-base font-black text-neutral-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
            {(localUser.following || 0).toLocaleString()}
          </span>
          <span className="text-[6px] sm:text-[7px] uppercase tracking-[0.2em] text-neutral-400 dark:text-white/30 font-bold mt-0.5 sm:mt-1">Following</span>
        </div>
        <Link 
          to="/settings" 
          className="p-2 sm:p-3 bg-white/5 rounded-full hover:bg-blue-600 transition-all ml-2 sm:ml-4 border border-white/10 group active:scale-90"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white group-hover:rotate-90 transition-transform" />
        </Link>
      </div>
    </div>
 </div>

 {/* Tab Navigation */}
 <div className="sticky top-[var(--header-height,64px)] z-40 bg-background/95 backdrop-blur-xl mb-3 sm:mb-8 mt-3 sm:mt-6">
 <div className="max-w-7xl mx-auto px-4 md:px-8">
 <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
 {[
 { id: 'overview', label: 'Overview' },
 { id: 'inventory', label: 'Collection' },
 { id: 'feed', label: 'Feed' },
 { id: 'releases', label: 'Tracks', hidden: !userProfile.isVerifiedArtist },
 { id: 'sequences', label: 'Playlists' },
 { id: 'activity', label: 'Activity' },
 { id: 'network', label: 'Network' },
 { id: 'staking', label: 'Staking' }
 ].filter(t => !t.hidden).map(tab => (
 <button 
 key={tab.id} 
 onClick={() => setActiveTab(tab.id as any)} 
 className={cn(
"py-3 sm:py-4 text-[11px] sm:text-sm font-bold transition-all relative whitespace-nowrap",
 activeTab === tab.id ?"text-blue-500":"text-muted-foreground hover:text-foreground"
 )} 
 >
 {tab.label}
 {activeTab === tab.id && (
 <motion.div 
 layoutId="activeTabProfile"
 className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"
 />
 )}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Featured Collectibles Section */}
 {ownedNfts.length > 0 && (
 <NFTVaultSection nfts={ownedNfts} />
 )}

 {/* Main Dashboard Layout */}
 <div className="max-w-7xl mx-auto px-4 md:px-4">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 {/* Left Sidebar */}
 <div className="lg:col-span-4 space-y-4">
<div className="bg-background p-5 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/5">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
 <h3 className="text-xs font-bold text-zinc-800 dark:text-foreground uppercase tracking-wider">Stats</h3>
 </div>
 <div className="grid grid-cols-2 gap-6">
 <StatBlock label="Earnings"value={(localUser.earnings || 0).toString()} subValue="TON"icon="gem"/>
 <StatBlock label="JAM Balance"value={(userProfile?.jamBalance || 0).toLocaleString()} subValue="JAM"icon="coins"/>
 </div>
 </div>

 <div className="bg-background p-6 rounded-2xl shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
 <h3 className="text-[10px] font-bold text-neutral-800 dark:text-foreground uppercase tracking-widest">Bio</h3>
 </div>
 
 {isEditing ? (
 <div className="space-y-6">
 <textarea value={localUser.bio} onChange={(e) => setLocalUser({...localUser, bio: e.target.value})} className="w-full rounded-xl p-4 text-sm text-foreground outline-none h-40 leading-relaxed bg-muted/50 focus:-blue-500 transition-all resize-none"placeholder="Tell us about yourself..."/>
 
 <div className="space-y-4">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Favorite Genres</p>
 <div className="flex flex-wrap gap-2">
 {GENRES.map(genre => {
 const isSelected = localUser.favoriteGenres?.includes(genre.name);
 return (
 <button
 key={genre.id}
 onClick={() => {
 const current = localUser.favoriteGenres || [];
 const updated = isSelected 
 ? current.filter(g => g !== genre.name)
 : [...current, genre.name];
 setLocalUser({...localUser, favoriteGenres: updated});
 }}
 className={cn(
 "relative p-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider transition-all group",
 isSelected ? "text-white" : "text-muted-foreground"
 )}
 >
 <div className={cn(
  "absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-opacity",
  isSelected ? "opacity-100 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "opacity-20 group-hover:opacity-100"
 )}></div>
 <div className={cn(
  "relative px-3 py-1.5 rounded-full transition-colors font-bold",
  isSelected ? "bg-blue-600/80 group-hover:bg-transparent" : "bg-muted dark:bg-[#0A0A0A] group-hover:bg-transparent"
 )}>
 {genre.name}
 </div>
 </button>
 );
 })}
 </div>
 </div>

 <div className="space-y-4">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Social Links</p>
 <div className="grid grid-cols-1 gap-3">
 {['x', 'instagram', 'telegram', 'spotify', 'website'].map(platform => (
 <input 
 key={`social-${platform}`}
 type="text"
 placeholder={`${platform.toUpperCase()} URL`} 
 value={(localUser.socials as any)?.[platform] || ''} 
 onChange={(e) => handleSocialChange(platform, e.target.value)}
 className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:-blue-500 transition-all"
 />
 ))}
 </div>
 </div>
 </div>
 ) : (
   <div className="space-y-6">
  <div onClick={() => setIsEditing(true)} className="cursor-pointer group/bio">
   <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors whitespace-pre-wrap">
 {localUser.bio ||"No bio yet."}
 </p>
  <div className="mt-4 flex items-center justify-between">
  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-[#5773ff]">ID: {localUser?.uid?.slice(0, 8) || '...'}</span>
  <Pencil className="h-3 w-3 text-[#5773ff] opacity-0 group-hover/bio:opacity-100 transition-opacity"/>
  </div>
  </div>

  {(localUser.socials?.x || localUser.socials?.instagram || localUser.socials?.website || localUser.socials?.telegram) && (
  <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-700">
  {localUser.socials?.x && (
  <a 
  href={localUser.socials.x} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="p-2.5 bg-white/5 hover:bg-[#1DA1F2]/20 text-muted-foreground hover:text-[#1DA1F2] rounded-xl transition-all group scale-100 hover:scale-110 active:scale-95"
  title="Twitter / X"
  >
  <Twitter className="h-4 w-4" />
  </a>
  )}
  {localUser.socials?.instagram && (
  <a 
  href={localUser.socials.instagram} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="p-2.5 bg-white/5 hover:bg-pink-500/20 text-muted-foreground hover:text-pink-500 rounded-xl transition-all group scale-100 hover:scale-110 active:scale-95"
  title="Instagram"
  >
  <Instagram className="h-4 w-4" />
  </a>
  )}
  {localUser.socials?.website && (
  <a 
  href={localUser.socials.website} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="p-2.5 bg-white/5 hover:bg-blue-400/20 text-muted-foreground hover:text-blue-400 rounded-xl transition-all group scale-100 hover:scale-110 active:scale-95"
  title="Website"
  >
  <Globe className="h-4 w-4" />
  </a>
  )}
  {localUser.socials?.telegram && (
  <a 
  href={localUser.socials.telegram} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="p-2.5 bg-white/5 hover:bg-sky-500/20 text-muted-foreground hover:text-sky-500 rounded-xl transition-all group scale-100 hover:scale-110 active:scale-95"
  title="Telegram"
  >
  <Send className="h-4 w-4" />
  </a>
  )}
  </div>
  )}
 </div>
 )}
 </div>
 
 {!isSpotifyVerified && localUser.role === 'collector' && (
 <button onClick={() => setIsVerificationModalOpen(true)} className="w-full py-4 bg-blue-500/10 rounded-2xl text-blue-500 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm">
 <CheckCircle className="h-5 w-5"/> Become an Artist
 </button>
 )}
 
 {localUser.role === 'artist' && (
 <button onClick={() => handleSwitchRole('collector')} className="w-full py-4 bg-blue-500/10 rounded-2xl text-blue-500 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm">
 <User className="h-5 w-5"/> Switch to Collector
 </button>
 )}
 </div>

 {/* Right Content */}
 <div className="lg:col-span-8 space-y-4">
 {activeTab === 'overview' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Anthem Highlight */}
 {anthemNft && (
 <div className="bg-background p-6 rounded-2xl shadow-sm overflow-hidden relative group">
 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
 <Star className="h-24 w-24 text-blue-500 fill-blue-500"/>
 </div>
 <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
 <div className="w-48 h-48 rounded-xl overflow-hidden shadow-xl flex-shrink-0">
 <img src={anthemNft.imageUrl || getPlaceholderImage(`nft-${anthemNft.id}`)} className="w-full h-full object-cover"alt={anthemNft.title} />
 </div>
 <div className="flex-1 text-center md:text-left">
 <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
 <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
 Profile Anthem
 </span>
 </div>
 <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-foreground mb-1">
{anthemNft.title}
</h2>
<p className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-muted-foreground mb-4">
by {anthemNft.creator}
</p>
 <div className="flex flex-wrap justify-center md:justify-start gap-3">
 <button 
 onClick={() => {
 const track = allTracks.find(t => t.id === anthemNft.trackId);
 if (track) playTrack(track);
 }}
 className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
 >
 <Zap className="h-4 w-4"/> Play Anthem
 </button>
 <button 
 onClick={() => navigate(`/nft/${anthemNft.id}`)}
 className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-full text-xs font-bold transition-all"
 >
 View Details
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <SectionHeader title="Followed Artists"onAction={() => setActiveTab('network')} actionLabel="View All"/>
 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
 {localUser.followedArtists && localUser.followedArtists.length > 0 ? (
 localUser.followedArtists.slice(0, 5).map(artistId => {
 const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
 if (!artist) return null;
 return <div key={artist.uid} className="flex-shrink-0 w-40 sm:w-48"><UserCard user={artist} variant="compact"/></div>;
 })
 ) : (
 <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest py-4">No followed artists.</p>
 )}
 </div>

 <SectionHeader title="Created Playlists"onAction={() => setActiveTab('sequences')} actionLabel="View All"/>
 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
 {(playlists || []).slice(0, 5).map(pl => (
 <div key={pl.id} className="flex-shrink-0 w-40 sm:w-48"><PlaylistCard playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} /></div>
 ))}
 </div>

 <SectionHeader title="Owned/Listed NFTs"onAction={() => setActiveTab('inventory')} actionLabel="View All"/>
 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
 {(ownedNfts || []).slice(0, 5).map(nft => (
 <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]"><NFTCard nft={nft} onAction={handleNFTAction} /></div>
 ))}
 </div>

 <SectionHeader title="My Activity"onAction={() => setActiveTab('activity')} actionLabel="View All"/>
 <div className="space-y-4">
 {userPosts.slice(0, 3).map(post => (
 <PostCard key={post.id} post={post as any} />
 ))}
 {userPosts.length === 0 && (
 <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest py-4">No recent activity.</p>
 )}
 </div>
 </div>
 )}

 {activeTab === 'feed' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
 <SectionHeader title="Activity Feed"/>
 <div className="space-y-4">
 {/* Filtered Feed: Tracks, NFTs, and Posts from followed accounts */}
 {[
 ...allTracks.filter(t => followedUserIds.includes(t.artistId) || userProfile.followedArtists?.includes(t.artistId)).map(t => ({ ...t, type: 'track' as const, timestamp: t.releaseDate || 'Just now' })),
 ...allNFTs.filter(n => followedUserIds.includes(n.artistId || '') || userProfile.followedArtists?.includes(n.artistId || '')).map(n => ({ ...n, type: 'nft' as const, timestamp: 'Just now' })),
 ...posts.filter(p => followedUserIds.includes(p.userId)).map(p => ({ ...p, type: 'post' as const }))
 ].sort((a, b) => (b as any).id.localeCompare((a as any).id)).map((item, idx) => {
 if (item.type === 'post') {
 return (
 <div key={`feed-post-${item.id}`} className="mb-4">
 <PostCard post={item as any} />
 </div>
 );
 }
 return (
 <div key={`feed-${item.type}-${item.id}`} className="bg-background p-4 rounded-2xl flex items-center gap-4 group hover:bg-muted/30 transition-all mb-4 shadow-sm">
 <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
 <img src={(item as any).coverUrl || (item as any).imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"alt=""/>
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <span className={cn(
"text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
 item.type === 'track' ?"bg-blue-500/10 text-blue-500":"bg-purple-500/10 text-purple-500"
 )}>
 {item.type === 'track' ? 'New Release' : 'NFT Drop'}
 </span>
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Just now</span>
 </div>
 <h4 className="text-base font-bold text-foreground truncate">{(item as any).title}</h4>
 <p className="text-xs font-medium text-muted-foreground">{(item as any).artist || (item as any).creator}</p>
 </div>
 <button 
 onClick={() => item.type === 'track' ? playTrack(item as any) : navigate(`/nft/${item.id}`)}
 className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-xs font-bold text-white transition-all shadow-sm"
 >
 {item.type === 'track' ? 'Listen' : 'View'}
 </button>
 </div>
 )})}
 {followedUserIds.length === 0 && (userProfile.followedArtists?.length || 0) === 0 && (
 <div className="py-12 text-center flex flex-col items-center justify-center bg-muted/30 rounded-3xl">
 <p className="text-muted-foreground font-medium text-sm max-w-xs">Your feed is empty. Follow artists to see their latest releases and updates.</p>
 <button onClick={() => navigate('/discover')} className="mt-6 px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20">Find Artists</button>
 </div>
 )}
 </div>
 </section>
 )}

 {activeTab === 'inventory' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
 <SectionHeader title="Digital Collection"actionLabel="Manage"onAction={() => navigate('/library')} />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {ownedNfts.length > 0 ? (
 ownedNfts.map(nft => (
 <NFTCard key={nft.id} nft={nft} onAction={handleNFTAction} />
 ))
 ) : (
 <div className="col-span-full py-12 flex flex-col items-center justify-center rounded-3xl bg-muted/30">
 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
 <Box className="h-8 w-8 text-muted-foreground/40"/>
 </div>
 <p className="text-muted-foreground font-medium">No items in your collection yet.</p>
 <button onClick={() => navigate('/marketplace')} className="mt-6 px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20"> Browse Marketplace </button>
 </div>
 )}
 </div>
 </section>
 )}

 {activeTab === 'releases' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <section>
 <SectionHeader title="My Releases"/>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {allTracks.filter(t => t.artistId === localUser.uid).map(track => (
 <TrackCard key={track.id} track={track} variant="row"/>
 ))}
 </div>
 </section>
 <section className="bg-background p-6 rounded-2xl shadow-sm relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 className="h-16 w-16 text-blue-500"/></div>
 <SectionHeader title="Earnings Dashboard"/>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 relative z-10">
 <div>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Total Earned</span>
 <span className="text-2xl font-black text-foreground">{royaltyStats.total} <span className="text-xs text-blue-500">TON</span></span>
 </div>
 <div>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Streaming</span>
 <span className="text-2xl font-black text-foreground">{royaltyStats.streaming} <span className="text-xs text-blue-500">TON</span></span>
 </div>
 <div>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">NFT Royalties</span>
 <span className="text-2xl font-black text-foreground">{royaltyStats.nft} <span className="text-xs text-blue-500">TON</span></span>
 </div>
 <div>
 <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest block mb-2">Pending</span>
 <span className="text-2xl font-black text-blue-500">{royaltyStats.pending} <span className="text-xs">TON</span></span>
 </div>
 </div>
 <div className="relative z-10">
 <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Transactions</h4>
 <div className="space-y-3">
 {[
 { id: 1, type: 'Streaming', amount: '2.4', date: 'Today, 14:30', track: 'Solar Pulse' },
 { id: 2, type: 'NFT Resale', amount: '0.9', date: 'Yesterday', track: 'Deep Horizon #042' },
 { id: 3, type: 'Streaming', amount: '1.1', date: 'Oct 24', track: 'Cyber Drift' }
 ].map(tx => (
 <div key={`tx-${tx.id}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors /50">
 <div className="flex items-center gap-4">
 <div className={cn(
"w-10 h-10 rounded-full flex items-center justify-center",
 tx.type === 'Streaming' ?"bg-blue-500/10 text-blue-500":"bg-purple-500/10 text-purple-500"
 )}>
 {tx.type === 'Streaming' ? <Disc className="h-5 w-5"/> : <Gem className="h-5 w-5"/>}
 </div>
 <div>
 <p className="text-xs font-bold text-foreground">{tx.type} Revenue</p>
 <p className="text-[10px] text-muted-foreground font-medium">{tx.track}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-emerald-500">+{tx.amount} TON</p>
 <p className="text-[10px] text-muted-foreground font-medium">{tx.date}</p>
 </div>
 </div>
 ))}
 </div>
 <button className="w-full mt-6 py-3 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-500/20"> Withdraw to Wallet </button>
 </div>
 </section>
 </div>
 )}

 {activeTab === 'sequences' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
 <div>
 <SectionHeader title="My Playlists"onAction={() => navigate('/library')} actionLabel="Manage"/>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
 {playlists.map(pl => (
 <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
 ))}
 <button onClick={() => navigate('/library')} className="aspect-square rounded-2xl flex flex-col items-center justify-center group cursor-pointer transition-all bg-muted/30 hover:">
 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
 <Plus className="text-muted-foreground/40 group-hover:text-blue-500 transition-colors h-6 w-6"/>
 </div>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">New Playlist</span>
 </button>
 </div>
 </div>

 {recentlyPlayed.length > 0 && (
 <div>
 <SectionHeader title="Recently Played"actionLabel="Clear"onAction={clearRecentlyPlayed} />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {recentlyPlayed.map(track => (
 <TrackCard key={`recent-${track.id}`} track={track} variant="row"/>
 ))}
 </div>
 </div>
 )}
 </section>
 )}

 {activeTab === 'activity' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
 <SectionHeader title="My Activity"onAction={() => navigate('/jamspace')} />
 
 {/* Share Track Feature */}
 <div className="bg-background p-6 rounded-2xl shadow-sm mb-6">
 <form onSubmit={handleSharePost}>
 <textarea 
 value={newPostContent}
 onChange={(e) => setNewPostContent(e.target.value)}
 placeholder={currentTrack ? `Share your thoughts on ${currentTrack.title}...` :"What's on your mind?"}
 className="w-full bg-muted/30 rounded-xl p-4 text-sm text-foreground outline-none focus:-blue-500 transition-all resize-none h-32 mb-4"
 />
 <div className="flex justify-between items-center">
 <div className="flex items-center gap-3">
 {currentTrack ? (
 <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full">
 <Disc className="h-4 w-4 text-blue-500"/>
 <span className="text-xs font-bold text-blue-500 truncate max-w-[200px]">
 {currentTrack.title}
 </span>
 </div>
 ) : (
 <span className="text-xs font-medium text-muted-foreground">
 Play a track to share it
 </span>
 )}
 </div>
 <button 
 type="submit"
 disabled={!newPostContent.trim() && !currentTrack}
 className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
 >
 Post
 </button>
 </div>
 </form>
 </div>

 <SocialFeed posts={feedPosts} onDeletePost={deletePost} emptyMessage="No activity signals detected."/>
 </section>
 )}

 {activeTab === 'network' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
 <div>
 <SectionHeader title="Following"onAction={() => navigate('/explore/artists')} actionLabel="Find More"/>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
 {localUser.followedArtists && localUser.followedArtists.length > 0 ? (
 localUser.followedArtists.map(artistId => {
 const artist = MOCK_ARTISTS.find(a => a.uid === artistId);
 if (!artist) return null;
 return (
 <UserCard key={artist.uid} user={artist} variant="compact"/>
 );
 })
 ) : (
 <div className="col-span-full py-12 text-center bg-muted/30 rounded-3xl">
 <p className="text-muted-foreground font-medium">Not following anyone yet.</p>
 </div>
 )}
 </div>
 </div>

 <div>
 <SectionHeader title="Friends"onAction={() => navigate('/explore/artists')} />
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
 {localUser.friends && localUser.friends.length > 0 ? (
 localUser.friends.map(friendId => {
 const friend = MOCK_USERS.find(u => u.uid === friendId);
 if (!friend) return null;
 return (
 <UserCard key={friend.uid} user={friend} variant="compact"/>
 );
 })
 ) : (
 <div className="col-span-full py-12 text-center bg-muted/30 rounded-3xl">
 <p className="text-muted-foreground font-medium">No friends added yet.</p>
 </div>
 )}
 </div>
 </div>
 </section>
 )}

 {activeTab === 'staking' && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
 <div className="bg-background p-8 rounded-3xl shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5"><Coins className="h-40 w-40 text-blue-500"/></div>
 
 <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Staked</p>
 <div className="flex items-baseline gap-2">
 <h3 className="text-4xl font-black text-foreground">
 {(stakedBalance || 0).toLocaleString()}
 </h3>
 <span className="text-sm font-bold text-blue-500">TJ</span>
 </div>
 <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
 <TrendingUp className="h-3 w-3"/> +2.4%
 </div>
 </div>
 
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current APY</p>
 <div className="flex items-baseline gap-2">
 <h3 className="text-4xl font-black text-emerald-500">
 12.5
 </h3>
 <span className="text-sm font-bold text-emerald-500">%</span>
 </div>
 <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60">
 <Zap className="h-3 w-3"/> Boosted
 </div>
 </div>
 
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rewards</p>
 <div className="flex items-baseline gap-2">
 <h3 className="text-4xl font-black text-blue-500">
 {pendingRewards.toFixed(2)}
 </h3>
 <span className="text-sm font-bold text-blue-500">TJ</span>
 </div>
 <button onClick={handleClaimRewards} disabled={pendingRewards <= 0} className={cn(
"mt-4 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
 pendingRewards > 0 ?"bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] text-white hover:opacity-90 shadow-lg shadow-blue-500/20":"bg-muted text-muted-foreground cursor-not-allowed"
 )} >
 <Gift className="h-4 w-4"/> Claim
 </button>
 </div>
 </div>

 <div className="relative z-10 p-4 bg-muted/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 /50">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
 <BarChart3 className="h-6 w-6 text-blue-500"/>
 </div>
 <div>
 <p className="text-sm font-bold text-foreground">Governance Active</p>
 <p className="text-xs text-muted-foreground">Your stake grants voting power in protocol upgrades</p>
 </div>
 </div>
 <button className="px-6 py-2 bg-background rounded-full text-xs font-bold text-foreground hover:bg-muted transition-all">
 Governance Portal
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-background p-6 rounded-3xl shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
 <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Stake TJ</h4>
 </div>
 
 <div className="space-y-6">
 <div className="space-y-2">
 <div className="flex justify-between items-center px-1">
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</span>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance: {(walletBalance || 0).toLocaleString()} TJ</span>
 </div>
 <div className="relative">
 <input type="number"value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00"className="w-full bg-muted/30 rounded-2xl p-4 text-2xl font-black text-foreground outline-none focus:-blue-500 transition-all"/>
 <button onClick={() => setStakeAmount(walletBalance.toString())} className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest transition-all"> MAX </button>
 </div>
 </div>
 
 <button onClick={handleStake} className="w-full py-4 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"> 
 Stake Now 
 </button>
 </div>
 </div>

 <div className="bg-background p-6 rounded-3xl shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1 h-4 bg-red-500 rounded-full"></div>
 <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Unstake TJ</h4>
 </div>
 
 <div className="space-y-6">
 <div className="space-y-2">
 <div className="flex justify-between items-center px-1">
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</span>
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staked: {(stakedBalance || 0).toLocaleString()} TJ</span>
 </div>
 <div className="relative">
 <input type="number"value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} placeholder="0.00"className="w-full bg-muted/30 rounded-2xl p-4 text-2xl font-black text-foreground outline-none focus:-red-500 transition-all"/>
 <button onClick={() => setUnstakeAmount(stakedBalance.toString())} className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-full text-[10px] font-bold text-red-500 uppercase tracking-widest transition-all"> MAX </button>
 </div>
 </div>
 
 <button onClick={handleUnstake} className="w-full py-4 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all active:scale-95"> 
 Unstake 
 </button>
 </div>
 </div>
 </div>
 </section>
 )}

 {/* RECOMMENDATIONS SECTION */}
 <section className="bg-background p-8 rounded-3xl shadow-sm relative overflow-hidden mt-8">
 <div className="absolute top-0 right-0 p-8 opacity-5"><Satellite className="h-32 w-32 text-blue-500"/></div>
 
 <SectionHeader title="Suggestions"/>
 
 <div className="space-y-8 relative z-10">
 <div>
 <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Artists to Follow</h4>
 <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4">
 {MOCK_ARTISTS.slice(0, 4).map(artist => (
 <div key={artist.uid} className="flex-shrink-0 w-56">
 <UserCard user={artist} variant="compact"/>
 </div>
 ))}
 </div>
 </div>
 
 <div>
 <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Recommended Tracks</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {MOCK_TRACKS.slice(0, 4).map(track => (
 <TrackCard key={track.id} track={track} variant="row"/>
 ))}
 </div>
 </div>
 </div>
 </section>
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
