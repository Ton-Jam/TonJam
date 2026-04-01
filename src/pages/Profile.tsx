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
  Upload
} from 'lucide-react';

import PostCard from '@/components/PostCard';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS, MOCK_ARTISTS, MOCK_USERS, APP_LOGO, GENRES } from '@/constants';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { uploadToIPFS } from '@/services/pinataService';
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

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0 || amount > walletBalance) {
      addNotification("Invalid stake amount", "error");
      return;
    }
    setWalletBalance(prev => prev - amount);
    setStakedBalance(prev => prev + amount);
    setStakeAmount('');
    addNotification(`Successfully staked ${amount} TJ Coins`, "success");
  };

  const handleUnstake = () => {
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0 || amount > stakedBalance) {
      addNotification("Invalid unstake amount", "error");
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
    addNotification(`Successfully unstaked ${amount} TJ Coins`, "success");
  };

  const handleClaimRewards = () => {
    if (pendingRewards <= 0) {
      addNotification("No rewards to claim", "info");
      return;
    }
    setWalletBalance(prev => prev + pendingRewards);
    setPendingRewards(0);
    addNotification(`Claimed ${pendingRewards} TJ Coins`, "success");
  };

  const ownedNfts = useMemo(() => 
    allNFTs.filter(nft => nft.owner === localUser.walletAddress || nft.owner === userAddress),
    [localUser.walletAddress, userAddress, allNFTs]
  );

  const anthemNft = useMemo(() => 
    allNFTs.find(n => n.id === userProfile.anthemId),
    [userProfile.anthemId, allNFTs]
  );

  const feedPosts = useMemo(() => {
    return posts.filter(p => p.userId === userProfile.id || followedUserIds.includes(p.userId));
  }, [userProfile.id, followedUserIds, posts]);

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
    const streamingRevenue = allTracks.filter(t => t.artistId === localUser.id).reduce((acc, t) => acc + (t.playCount || 0) * 0.001, 0);
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
      addNotification("You must be logged in to save changes", "error");
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
      addNotification("Neural identity committed to chain", "success");
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
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      setIsUploading(true);
      try {
        addNotification(`Uploading ${type} to IPFS...`, 'info');
        const { ipfsUrl } = await uploadToIPFS(file);
        setLocalUser(prev => prev ? ({ ...prev, [type === 'avatar' ? 'avatar' : 'bannerUrl']: ipfsUrl }) : null);
        addNotification(`${type.toUpperCase()} protocol updated via IPFS`, 'success');
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        addNotification(`Failed to upload ${type} to IPFS`, 'error');
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
    <div className="relative group overflow-hidden bg-background p-3 rounded-[12px] transition-all shadow-2xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full -mr-4 -mt-4 group-hover:bg-blue-600/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-4">
          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] leading-none">{label}</span>
          {trend && (
            <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-4">
              <TrendingUp className="h-2 w-2" /> {trend}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center transition-all">
          {icon === 'gem' && <Gem className="h-3.5 w-3.5 text-blue-500" />}
          {icon === 'coins' && <Coins className="h-3.5 w-3.5 text-amber-500" />}
          {icon === 'users' && <Users className="h-3.5 w-3.5 text-purple-500" />}
          {icon === 'zap' && <Zap className="h-3.5 w-3.5 text-blue-400" />}
        </div>
      </div>
      
      <div className="flex items-baseline gap-4 relative z-10">
        <h4 className="text-[26px] font-bold tracking-tighter text-foreground leading-none font-mono">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-none">{subValue}</span>}
      </div>
      
      {/* Micro-grid background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
    </div>
  );

  const SectionHeader = ({ title, onAction, actionLabel }: { title: string, onAction?: () => void, actionLabel?: string }) => (
    <div className="flex items-center justify-between mb-4 px-4 md:px-4">
      <div className="flex items-center gap-4">
        <div className="w-1 h-5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
        <h3 className="text-[9px] font-bold text-foreground uppercase tracking-[0.4em]">
          {title}
        </h3>
      </div>
      {onAction && (
        <button onClick={onAction} className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-500 hover:text-foreground transition-all flex items-center gap-4 group">
          {actionLabel || 'View All'}
          <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform" />
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
    <div className={`animate-in fade-in duration-1000 pb-4 ${themeClass}`}>
        {/* Banner Section */}
      <div className="relative h-[20vh] md:h-[30vh] w-full overflow-hidden bg-background">
        <img src={localUser.bannerUrl || getPlaceholderImage(`banner-${localUser.id}`, 1200, 400)} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {isEditing && (
          <button 
            onClick={() => bannerInputRef.current?.click()} 
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-20"
          >
            <div className="bg-muted p-4 rounded-[10px] flex items-center gap-2">
              {isUploading ? <Loader2 className="text-foreground h-5 w-5 animate-spin" /> : <Camera className="text-foreground h-5 w-5" />}
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{isUploading ? 'Uploading...' : 'Change Banner'}</span>
            </div>
          </button>
        )}
        <input type="file" hidden ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
      </div>

      {/* IDENTITY SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-4 -mt-4 relative z-30 flex flex-col md:flex-row items-center md:items-end w-full gap-4 md:gap-4">
        {/* Left: Round Avatar centerpiece */}
        <div className="relative group md:mb-4 flex-shrink-0">
          <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative p-4 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-blue-400 shadow-[0_0_60px_rgba(37,99,235,0.2)] transition-all duration-700 group-hover:scale-105 group-hover:rotate-3">
            <div className="rounded-full overflow-hidden">
              <img src={localUser.avatar || getPlaceholderImage(`user-${localUser.id}`)} className="w-32 h-32 md:w-44 md:h-44 object-cover" alt={localUser.name} />
            </div>
          </div>
          {isSpotifyVerified && (
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl">
              <Check className="text-foreground h-4 w-4" />
            </div>
          )}
          {isEditing && (
            <div className="flex justify-center mt-4 gap-4">
              <button 
                onClick={() => avatarInputRef.current?.click()} 
                disabled={isUploading}
                className="px-4 py-4 bg-muted rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-muted/80 transition-all flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                Change
              </button>
              <button onClick={() => setLocalUser(prev => prev ? ({...prev, avatar: 'https://picsum.photos/200/200?seed=default'}) : null)} className="px-4 py-4 bg-red-500/10 rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">Remove</button>
            </div>
          )}
          {isEditing && (
            <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-full flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" >
              <Pencil className="text-foreground h-6 w-6" />
            </button>
          )}
          <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept={ALLOWED_IMAGE_TYPES.join(',')} />
        </div>

        {/* Right: Name, Handle, Stats, and Actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4 mb-4">
            {/* Name & Handle */}
            <div className="w-full md:w-auto">
              {isEditing ? (
                <div className="space-y-4 w-full max-w-lg">
                  <input type="text" value={localUser.name} onChange={(e) => setLocalUser({...localUser, name: e.target.value})} className="bg-muted/50 rounded-[12px] px-3 py-3 text-[26px] font-bold tracking-tighter outline-none text-foreground w-full transition-all" placeholder="Display Name" />
                  <input type="text" value={localUser.handle} onChange={(e) => setLocalUser({...localUser, handle: e.target.value})} className="bg-muted/50 rounded-[12px] px-3 py-3 text-sm font-bold tracking-widest outline-none text-blue-500 w-full transition-all" placeholder="@handle" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-center md:justify-start gap-4 flex-wrap">
                    <h1 className="text-[32px] md:text-[68px] font-bold tracking-tighter text-foreground uppercase leading-none drop-shadow-2xl italic font-serif whitespace-nowrap">
                      {localUser.name}
                    </h1>
                    <span className="text-blue-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.4em] bg-blue-500/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                      {localUser.handle}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="flex gap-4">
                      {localUser.socials?.x && (
                        <a href={localUser.socials.x} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-blue-400 transition-all">
                          <Satellite className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {localUser.socials?.spotify && (
                        <a href={localUser.socials.spotify} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-[#1DB954] transition-all">
                          <Disc className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {localUser.socials?.telegram && (
                        <a href={localUser.socials.telegram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-blue-300 transition-all">
                          <Zap className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit/Save Actions */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              {localUser.isVerifiedArtist && (
                <button onClick={() => navigate('/artist-dashboard')} className="px-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-foreground shadow-2xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-4 group" >
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" /> Artist_Dashboard
                </button>
              )}
              {!localUser.isVerifiedArtist && (
                <button onClick={() => navigate('/artist-onboarding')} className="px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-foreground shadow-2xl shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-4 group" >
                  <Star className="h-4 w-4 group-hover:rotate-12 transition-transform" /> Become_Artist
                </button>
              )}
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-3 py-3 bg-muted/50 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-all active:scale-95 flex items-center gap-2 group" >
                  <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" /> Edit_Profile
                </button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-3 bg-neutral-500/10 text-neutral-500 rounded-[12px] text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-500/20 transition-all">Abort</button>
                  <button onClick={handleSave} className="px-4 py-4 bg-foreground text-background rounded-[12px] text-[10px] font-bold uppercase tracking-widest shadow-2xl active:scale-95 hover:bg-blue-500 hover:text-foreground transition-all">Commit_Changes</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cluster */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="flex flex-col items-center md:items-start group cursor-pointer">
              <p className="text-[20px] md:text-[26px] font-bold text-foreground tracking-tighter leading-none font-mono group-hover:text-blue-500 transition-colors">
                {(localUser.followers || 0).toLocaleString()}
              </p>
              <p className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-[0.4em] mt-4">Collectors</p>
            </div>
            <div className="w-px h-8 bg-muted"></div>
            <div className="flex flex-col items-center md:items-start group cursor-pointer">
              <p className="text-[20px] md:text-[26px] font-bold text-foreground tracking-tighter leading-none font-mono group-hover:text-blue-500 transition-colors">
                {(localUser.following || 0).toLocaleString()}
              </p>
              <p className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-[0.4em] mt-4">Following</p>
            </div>
            <div className="w-px h-8 bg-muted"></div>
            <Link to="/settings" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:rotate-90 duration-700" title="Protocol Settings" >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[var(--header-height,64px)] z-40 bg-background/80 backdrop-blur-2xl py-2 mb-2 w-full px-4 md:px-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'inventory', label: 'Vault', icon: Box },
            { id: 'feed', label: 'Relay', icon: Satellite },
            { id: 'releases', label: 'Protocols', icon: Disc, hidden: !userProfile.isVerifiedArtist },
            { id: 'sequences', label: 'Sequences', icon: Layers },
            { id: 'activity', label: 'Signals', icon: Zap },
            { id: 'network', label: 'Nodes', icon: Users },
            { id: 'staking', label: 'Staking', icon: Coins }
          ].filter(t => !t.hidden).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-3 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 flex-shrink-0 ${ activeTab === tab.id ? 'bg-blue-500 text-white shadow-2xl shadow-blue-500/20 active-pill' : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted inactive-pill' }`} >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-blue-500 dark:text-neutral-500'}`} /> {tab.label}
            </button>
          ))}
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
            <div className="relative group overflow-hidden bg-background p-3 rounded-[16px] shadow-2xl">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                  <h3 className="text-[8px] font-bold text-foreground uppercase tracking-[0.5em]">Network_Stats</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatBlock label="Network Value" value={(localUser.earnings || 0).toString()} subValue="TON" icon="gem" trend="+12.4%" />
                <StatBlock label="JAM Balance" value={(userProfile?.jamBalance || 0).toLocaleString()} subValue="JAM" icon="coins" trend="+5.2%" />
              </div>
            </div>

            <div className="relative group overflow-hidden bg-background p-3 rounded-[16px] shadow-2xl">
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-1 h-4 bg-muted/80 rounded-full"></div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">Origin_Narrative</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <textarea value={localUser.bio} onChange={(e) => setLocalUser({...localUser, bio: e.target.value})} className="w-full rounded-[12px] p-3 text-xs text-foreground outline-none h-40 leading-relaxed bg-muted/50 transition-all resize-none" placeholder="Identify your frequency..." />
                  
                  <div className="space-y-4">
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Favorite_Vibes</p>
                    <div className="flex flex-wrap gap-4">
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
                            className={`relative px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all overflow-hidden group ${
                              isSelected 
                                ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                                : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted inactive-pill'
                            }`}
                          >
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-80`}></div>
                            )}
                            {!isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                            )}
                            <span className="relative z-10">{genre.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Social_Relays</p>
                    <div className="grid grid-cols-1 gap-4">
                      {['x', 'instagram', 'telegram', 'spotify'].map(platform => (
                        <div key={`social-${platform}`} className="relative group/input">
                          <input 
                            type="text" 
                            placeholder={`${platform.toUpperCase()} URL`} 
                            value={(localUser.socials as any)?.[platform] || ''} 
                            onChange={(e) => handleSocialChange(platform, e.target.value)}
                            className="w-full bg-muted/50 rounded-[10px] px-3 py-3 text-[10px] text-foreground outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer group/bio relative" >
                  <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors font-medium">
                    {localUser.bio || "No biographical signals detected in the current relay."}
                  </p>
                  <div className="mt-4 pt-4 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Neural ID: {localUser.id.slice(0, 8)}...</span>
                    <Pencil className="h-3 w-3 text-blue-500 opacity-0 group-hover/bio:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
            </div>
            
            {!isSpotifyVerified && (
              <button onClick={() => setIsVerificationModalOpen(true)} className="w-full py-4 bg-[#1DB954]/5 rounded-[16px] text-[#1DB954] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#1DB954] hover:text-foreground transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group" >
                <Disc className="h-5 w-5 group-hover:animate-spin" /> Verify Artist Identity
              </button>
            )}
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Anthem Highlight */}
                {anthemNft && (
                  <div className="relative group overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent p-3 rounded-[20px] shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Star className="h-16 w-16 text-blue-500 fill-blue-500" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                      <div className="w-40 h-40 rounded-[12px] overflow-hidden shadow-2xl flex-shrink-0">
                        <img src={anthemNft.imageUrl || getPlaceholderImage(`nft-${anthemNft.id}`)} className="w-full h-full object-cover" alt={anthemNft.title} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                          <span className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-full text-[8px] font-bold uppercase tracking-[0.3em]">
                            Profile Anthem
                          </span>
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        </div>
                        <h2 className="text-[26px] md:text-[44px] font-bold tracking-tighter text-foreground mb-4 uppercase italic font-serif">
                          {anthemNft.title}
                        </h2>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
                          by @{anthemNft.creator}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                          <button 
                            onClick={() => {
                              const track = allTracks.find(t => t.id === anthemNft.trackId);
                              if (track) playTrack(track);
                            }}
                            className="px-4 py-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-4"
                          >
                            <Zap className="h-4 w-4" /> Play Anthem
                          </button>
                          <button 
                            onClick={() => navigate(`/nft/${anthemNft.id}`)}
                            className="px-4 py-4 bg-muted/50 hover:bg-muted text-foreground rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <SectionHeader title="Followed Artists" onAction={() => setActiveTab('network')} actionLabel="View All" />
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                  {localUser.followedArtists && localUser.followedArtists.length > 0 ? (
                    localUser.followedArtists.slice(0, 5).map(artistId => {
                      const artist = MOCK_ARTISTS.find(a => a.id === artistId);
                      if (!artist) return null;
                      return <div key={artist.id} className="flex-shrink-0 w-40 sm:w-48"><UserCard user={artist} variant="compact" /></div>;
                    })
                  ) : (
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest py-4">No followed artists.</p>
                  )}
                </div>

                <SectionHeader title="Created Playlists" onAction={() => setActiveTab('sequences')} actionLabel="View All" />
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                  {playlists.slice(0, 5).map(pl => (
                    <div key={pl.id} className="flex-shrink-0 w-40 sm:w-48"><PlaylistCard playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} /></div>
                  ))}
                </div>

                <SectionHeader title="Owned/Listed NFTs" onAction={() => setActiveTab('inventory')} actionLabel="View All" />
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                  {ownedNfts.slice(0, 5).map(nft => (
                    <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]"><NFTCard nft={nft} onAction={handleNFTAction} /></div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <SectionHeader title="Neural Feed" />
                <div className="space-y-4">
                  {/* Filtered Feed: Tracks, NFTs, and Posts from followed accounts */}
                  {[
                    ...allTracks.filter(t => followedUserIds.includes(t.artistId) || userProfile.followedArtists?.includes(t.artistId)).map(t => ({ ...t, type: 'track' as const, timestamp: t.releaseDate || 'Just now' })),
                    ...allNFTs.filter(n => followedUserIds.includes(n.artistId || '') || userProfile.followedArtists?.includes(n.artistId || '')).map(n => ({ ...n, type: 'nft' as const, timestamp: 'Just now' })),
                    ...posts.filter(p => followedUserIds.includes(p.userId)).map(p => ({ ...p, type: 'post' as const }))
                  ].sort((a, b) => (b as any).id.localeCompare((a as any).id)).map((item, idx) => {
                    if (item.type === 'post') {
                      return (
                        <div key={item.id} className="mb-4">
                          <PostCard post={item as any} />
                        </div>
                      );
                    }
                    return (
                    <div key={item.id} className="glass p-3 rounded-[10px] flex items-center gap-3 group hover:bg-foreground/[0.02] transition-all mb-3">
                      <div className="w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0">
                        <img src={(item as any).coverUrl || (item as any).imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`text-[7px] px-3 py-2 rounded-full font-bold uppercase tracking-widest ${item.type === 'track' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {item.type === 'track' ? 'New Release' : 'NFT Drop'}
                          </span>
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Just now</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground uppercase truncate">{(item as any).title}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{(item as any).artist || (item as any).creator}</p>
                      </div>
                      <button 
                        onClick={() => item.type === 'track' ? playTrack(item as any) : navigate(`/nft/${item.id}`)}
                        className="px-3 py-2 bg-muted/50 hover:bg-muted rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-foreground transition-all"
                      >
                        {item.type === 'track' ? 'Listen' : 'View'}
                      </button>
                    </div>
                  )})}
                  {followedUserIds.length === 0 && (userProfile.followedArtists?.length || 0) === 0 && (
                    <div className="py-4 text-center flex flex-col items-center justify-center bg-muted/50 rounded-3xl">
                      <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">Your feed is empty. Follow nodes to receive signals.</p>
                      <button onClick={() => navigate('/discover')} className="mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all">Discover Nodes</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'inventory' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Digital Vault" actionLabel="Manage Assets" onAction={() => navigate('/library')} />
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                  {ownedNfts.length > 0 ? (
                    ownedNfts.map(nft => (
                      <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
                        <NFTCard nft={nft} onAction={handleNFTAction} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-4 flex flex-col items-center justify-center rounded-[10px] bg-foreground/[0.02]">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Box className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Zero assets detected.</p>
                      <button onClick={() => navigate('/marketplace')} className="mt-4 px-3 py-2 bg-muted/50 hover:bg-muted rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-blue-400 transition-colors"> Browse Market </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'releases' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <SectionHeader title="Authored Protocols" />
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {allTracks.filter(t => t.artistId === localUser.id).map(track => (
                      <div key={track.id} className="min-w-[280px] sm:min-w-[320px]">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </section>
                <section className="glass backdrop-blur-xl bg-foreground/[0.02] p-3 rounded-[10px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><BarChart3 className="h-10 w-10 text-blue-500" /></div>
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
                  <SectionHeader title="Royalty Distribution Ledger" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 relative z-10">
                    <div>
                      <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-[0.4em] block mb-4">Total Earned</span>
                      <span className="text-[20px] font-bold tracking-tighter text-foreground">{royaltyStats.total} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-[0.4em] block mb-4">Streaming</span>
                      <span className="text-xl font-bold tracking-tighter text-foreground">{royaltyStats.streaming} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-[0.4em] block mb-4">NFT Royalties</span>
                      <span className="text-xl font-bold tracking-tighter text-foreground">{royaltyStats.nft} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-[0.4em] block mb-4">Pending Sync</span>
                      <span className="text-xl font-bold tracking-tighter text-amber-500">{royaltyStats.pending} <span className="text-[10px]">TON</span></span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-4">Recent Distributions</h4>
                    <div className="space-y-4">
                      {[
                        { id: 1, type: 'Streaming', amount: '2.4', date: 'Today, 14:30', track: 'Solar Pulse' },
                        { id: 2, type: 'NFT Resale', amount: '0.9', date: 'Yesterday', track: 'Deep Horizon #042' },
                        { id: 3, type: 'Streaming', amount: '1.1', date: 'Oct 24', track: 'Cyber Drift' }
                      ].map(tx => (
                        <div key={`tx-${tx.id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-[10px] hover:bg-muted transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Streaming' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {tx.type === 'Streaming' ? <Disc className="h-3 w-3" /> : <Gem className="h-3 w-3" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-foreground uppercase">{tx.type} Revenue</p>
                              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{tx.track}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-green-400">+{tx.amount} TON</p>
                            <p className="text-[8px] text-foreground/30 uppercase tracking-widest">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-blue-600/10 rounded-[10px] text-[8px] font-bold text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-foreground transition-all shadow-lg shadow-blue-500/5"> Withdraw to Wallet </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'sequences' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <div>
                  <SectionHeader title="Sync Sequences" onAction={() => navigate('/explore/playlists?title=Sync Sequences&filter=my_playlists')} actionLabel="View All" />
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {playlists.map(pl => (
                      <div key={pl.id} className="flex-shrink-0 w-40 sm:w-48">
                        <PlaylistCard playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
                      </div>
                    ))}
                    <div onClick={() => navigate('/library')} className="min-w-[280px] sm:min-w-[320px] aspect-square rounded-[10px] flex flex-col items-center justify-center group cursor-pointer transition-all bg-foreground/[0.02]" >
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
                        <Plus className="text-muted-foreground/30 group-hover:text-blue-500 transition-colors h-6 w-6" />
                      </div>
                      <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest group-hover:text-muted-foreground transition-colors">New Sequence</span>
                    </div>
                  </div>
                </div>

                {recentlyPlayed.length > 0 && (
                  <div>
                    <SectionHeader title="Recent Frequencies" actionLabel="Clear History" onAction={clearRecentlyPlayed} />
                    <div className="space-y-4">
                      {recentlyPlayed.map(track => (
                        <TrackCard key={`recent-${track.id}`} track={track} variant="row" />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'activity' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Signal History" onAction={() => navigate('/jamspace')} />
                
                {/* Share Track Feature */}
                <div className="glass bg-foreground/[0.02] p-3 rounded-[10px] mb-4">
                  <form onSubmit={handleSharePost}>
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={currentTrack ? `Share your thoughts on ${currentTrack.title}...` : "What's on your mind?"}
                      className="w-full bg-muted/50 rounded-[10px] p-3 text-sm text-foreground outline-none focus:ring-1 ring-neutral-500/50 transition-all resize-none h-24 mb-3"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {currentTrack ? (
                          <div className="flex items-center gap-3 bg-blue-500/10 px-3 py-2 rounded-full">
                            <Disc className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[150px]">
                              {currentTrack.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                            Play a track to share it
                          </span>
                        )}
                      </div>
                      <button 
                        type="submit"
                        disabled={!newPostContent.trim() && !currentTrack}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-foreground rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                      >
                        Broadcast
                      </button>
                    </div>
                  </form>
                </div>

                <SocialFeed posts={feedPosts} onDeletePost={deletePost} emptyMessage="Signal void detected." />
              </section>
            )}

            {activeTab === 'network' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <div>
                  <SectionHeader title="Followed Artists" onAction={() => navigate('/explore/artists?title=Followed Artists&filter=followed')} actionLabel="View All" />
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-4 md:px-4">
                    {localUser.followedArtists && localUser.followedArtists.length > 0 ? (
                      localUser.followedArtists.map(artistId => {
                        const artist = MOCK_ARTISTS.find(a => a.id === artistId);
                        if (!artist) return null;
                        return (
                          <div key={artist.id} className="flex-shrink-0 w-40 sm:w-48">
                            <UserCard user={artist} variant="compact" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="w-full text-[10px] font-bold text-foreground/30 uppercase tracking-widest py-4 text-center bg-foreground/[0.02] rounded-[10px]">
                        Not following any artists yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <SectionHeader title="Friends" onAction={() => navigate('/explore/artists?title=Friends&filter=friends')} actionLabel="View All" />
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-4 md:px-4">
                    {localUser.friends && localUser.friends.length > 0 ? (
                      localUser.friends.map(friendId => {
                        const friend = MOCK_USERS.find(u => u.id === friendId);
                        if (!friend) return null;
                        return (
                          <div key={friend.id} className="flex-shrink-0 w-40 sm:w-48">
                            <UserCard user={friend} variant="compact" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="w-full text-[10px] font-bold text-foreground/30 uppercase tracking-widest py-4 text-center bg-foreground/[0.02] rounded-[10px]">
                        No friends added yet.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'staking' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <div className="relative group overflow-hidden bg-background p-3 rounded-[20px] shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Coins className="h-32 w-32 text-blue-500" /></div>
                  <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Total_Staked</p>
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-[44px] font-bold text-foreground tracking-tighter font-mono">
                          {(stakedBalance || 0).toLocaleString()}
                        </h3>
                        <span className="text-xl font-bold text-blue-500 uppercase tracking-tighter">TJ</span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <TrendingUp className="h-3 w-3" /> +2.4% this week
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Current_APY</p>
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-[44px] font-bold text-emerald-400 tracking-tighter font-mono">
                          12.5
                        </h3>
                        <span className="text-xl font-bold text-emerald-500 uppercase tracking-tighter">%</span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                        <Zap className="h-3 w-3" /> Boosted by Node Rank
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Pending_Rewards</p>
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-[44px] font-bold text-amber-500 tracking-tighter font-mono">
                          {pendingRewards.toFixed(2)}
                        </h3>
                        <span className="text-xl font-bold text-amber-600 uppercase tracking-tighter">TJ</span>
                      </div>
                      <button onClick={handleClaimRewards} disabled={pendingRewards <= 0} className={`mt-4 px-3 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${pendingRewards > 0 ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-background' : 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed'}`} >
                        <Gift className="h-3 w-3" /> Claim_Sync_Rewards
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 p-3 bg-foreground/[0.02] rounded-[12px] flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-600/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Staking Governance Active</p>
                        <p className="text-[8px] text-foreground/30 uppercase tracking-[0.2em]">Your stake grants 1,450 voting power in the next protocol upgrade</p>
                      </div>
                    </div>
                    <button className="px-3 py-2 bg-muted/50 rounded-[10px] text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-all">
                      Governance_Portal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background border border-border p-4 rounded-[16px] shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5em]">Initialize_Stake</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end px-4">
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Amount_to_Commit</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Available: {(walletBalance || 0).toLocaleString()} TJ</span>
                        </div>
                        <div className="relative group/input">
                          <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted/50 rounded-[12px] p-3 text-xl text-foreground font-mono outline-none focus:ring-1 ring-neutral-500/50 transition-all" />
                          <button onClick={() => setStakeAmount(walletBalance.toString())} className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-[8px] text-[8px] font-bold text-blue-500 uppercase tracking-widest transition-all" > MAX </button>
                        </div>
                      </div>
                      
                      <button onClick={handleStake} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all" > 
                        Commit_Stake_Protocol 
                      </button>
                    </div>
                  </div>

                  <div className="bg-background p-3 rounded-[16px] shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5em]">Withdraw_Stake</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end px-4">
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Amount_to_Release</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Staked: {(stakedBalance || 0).toLocaleString()} TJ</span>
                        </div>
                        <div className="relative group/input">
                          <input type="number" value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} placeholder="0.00" className="w-full bg-muted/50 rounded-[12px] p-3 text-xl text-foreground font-mono outline-none focus:ring-1 ring-neutral-500/50 transition-all" />
                          <button onClick={() => setUnstakeAmount(stakedBalance.toString())} className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-[8px] text-[8px] font-bold text-blue-500 uppercase tracking-widest transition-all" > MAX </button>
                        </div>
                      </div>
                      
                      <button onClick={handleUnstake} className="w-full py-3 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] active:scale-95 transition-all" > 
                        Release_Stake_Signal 
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* RECOMMENDATIONS SECTION */}
            <section className="bg-background p-3 rounded-[20px] shadow-2xl relative overflow-hidden mt-4">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Satellite className="h-20 w-20 text-blue-500" /></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
              
              <SectionHeader title="Network Suggestions" />
              
              <div className="space-y-4 relative z-10">
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em] mb-4">Suggested_Nodes</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4">
                    {MOCK_ARTISTS.slice(0, 4).map(artist => (
                      <div key={artist.id} className="flex-shrink-0 w-56">
                        <UserCard user={artist} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em] mb-4">Curated_Frequencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_TRACKS.slice(0, 4).map(track => (
                      <TrackCard key={track.id} track={track} variant="row" />
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
