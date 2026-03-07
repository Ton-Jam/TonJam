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
  Users
} from 'lucide-react';

import PostCard from '@/components/PostCard';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS, MOCK_ARTISTS, MOCK_USERS, APP_LOGO } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import SocialFeed from '@/components/SocialFeed';
import UserCard from '@/components/UserCard';
import MintModal from '@/components/MintModal';
import SellNFTModal from '@/components/SellNFTModal';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { NFTItem, UserProfile } from '@/types';
import { useTonAddress } from '@tonconnect/ui-react';
import { getArtistSonicDNA } from '@/services/geminiService';

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
  const [localUser, setLocalUser] = useState<UserProfile>(userProfile);
  const [activeTab, setActiveTab] = useState<'inventory' | 'releases' | 'sequences' | 'activity' | 'network' | 'staking' | 'feed'>('inventory');
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
  const [isDNASyncing, setIsDNASyncing] = useState(false);
  const [sonicDNA, setSonicDNA] = useState<{ signature: string; vibes: string[] } | null>(null);
  const [newPostContent, setNewPostContent] = useState('');

  /* Check for Spotify verification */
  const isSpotifyVerified = useMemo(() => {
    return !!user?.user_metadata?.spotify || localUser.isVerifiedArtist;
  }, [user, localUser.isVerifiedArtist]);

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
    setStakedBalance(prev => prev - amount);
    setWalletBalance(prev => prev + amount);
    setUnstakeAmount('');
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

  const userPosts = useMemo(() => {
    return posts.filter(p => p.userId === userProfile.id);
  }, [userProfile.id, posts]);

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

  const handleSave = () => {
    setUserProfile(localUser);
    setIsEditing(false);
    addNotification("Neural identity committed to chain", "success");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalUser(prev => ({ ...prev, [type === 'avatar' ? 'avatar' : 'bannerUrl']: url }));
      addNotification(`${type.toUpperCase()} protocol updated`, 'success');
    }
  };

  const handleSyncDNA = async () => {
    setIsDNASyncing(true);
    addNotification("Analyzing sonic frequencies...", "info");
    try {
      /* Use user's tracks or fallback to mock tracks if none */
      const tracksToAnalyze = allTracks.filter(t => t.artistId === localUser.id);
      const analysisTracks = tracksToAnalyze.length > 0 ? tracksToAnalyze : MOCK_TRACKS.slice(0, 5);
      const dna = await getArtistSonicDNA({
        id: localUser.id,
        name: localUser.name,
        bio: localUser.bio,
        avatarUrl: localUser.avatar,
        verified: localUser.isVerifiedArtist,
        followers: localUser.followers,
        monthlyListeners: 0,
        bannerUrl: localUser.bannerUrl
      }, analysisTracks);
      setSonicDNA(dna);
      addNotification("Neural DNA sync complete", "success");
    } catch (e) {
      console.error(e);
      addNotification("DNA Sync failed. Retrying with cached protocols.", "warning");
    } finally {
      setIsDNASyncing(false);
    }
  };

  const handleNFTAction = (nft: NFTItem) => {
    setSelectedNftForListing(nft);
  };

  const StatBlock = ({ label, value, icon, subValue, trend }: { label: string, value: string, icon?: string, subValue?: string, trend?: string }) => (
    <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/5 p-6 rounded-[12px] transition-all hover:border-blue-500/30 shadow-2xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] leading-none">{label}</span>
          {trend && (
            <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="h-2 w-2" /> {trend}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-blue-500/30 transition-all">
          {icon === 'gem' && <Gem className="h-3.5 w-3.5 text-blue-500" />}
          {icon === 'coins' && <Coins className="h-3.5 w-3.5 text-amber-500" />}
          {icon === 'users' && <Users className="h-3.5 w-3.5 text-purple-500" />}
          {icon === 'zap' && <Zap className="h-3.5 w-3.5 text-blue-400" />}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 relative z-10">
        <h4 className="text-3xl font-bold tracking-tighter text-white leading-none font-mono">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">{subValue}</span>}
      </div>
      
      {/* Micro-grid background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
    </div>
  );

  const SectionHeader = ({ title, onAction, actionLabel }: { title: string, onAction?: () => void, actionLabel?: string }) => (
    <div className="flex items-center justify-between mb-8 px-4 md:px-0">
      <div className="flex items-center gap-4">
        <div className="w-1 h-5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em]">
          {title}
        </h3>
      </div>
      {onAction && (
        <button onClick={onAction} className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-500 hover:text-white transition-all flex items-center gap-2 group">
          {actionLabel || 'View All'}
          <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform" />
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-32">
      {/* Banner Section */}
      <div className="relative h-[20vh] md:h-[30vh] w-full overflow-hidden bg-black">
        <img src={localUser.bannerUrl} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        {isEditing && (
          <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-20">
            <div className="bg-white/10 p-4 rounded-[10px]"><Camera className="text-white h-5 w-5" /></div>
          </button>
        )}
        <input type="file" hidden ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
      </div>

      {/* IDENTITY SECTION */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20 relative z-30 flex flex-col md:flex-row items-center md:items-end w-full gap-8 md:gap-12">
        {/* Left: Round Avatar centerpiece */}
        <div className="relative group md:mb-2 flex-shrink-0">
          <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-blue-400 shadow-[0_0_60px_rgba(37,99,235,0.2)] transition-all duration-700 group-hover:scale-105 group-hover:rotate-3">
            <div className="rounded-full overflow-hidden border-4 border-black">
              <img src={localUser.avatar} className="w-32 h-32 md:w-44 md:h-44 object-cover" alt={localUser.name} />
            </div>
          </div>
          {isSpotifyVerified && (
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 border-4 border-black rounded-full flex items-center justify-center shadow-2xl">
              <Check className="text-white h-4 w-4" />
            </div>
          )}
          {isEditing && (
            <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" >
              <Pencil className="text-white h-6 w-6" />
            </button>
          )}
          <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
        </div>

        {/* Right: Name, Handle, Stats, and Actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full pb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6 mb-8">
            {/* Name & Handle */}
            <div className="w-full md:w-auto">
              {isEditing ? (
                <div className="space-y-4 w-full max-w-lg">
                  <input type="text" value={localUser.name} onChange={(e) => setLocalUser({...localUser, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-3xl font-bold tracking-tighter outline-none text-white w-full focus:border-blue-500/50 transition-all" placeholder="Display Name" />
                  <input type="text" value={localUser.handle} onChange={(e) => setLocalUser({...localUser, handle: e.target.value})} className="bg-white/5 border border-white/10 rounded-[12px] px-6 py-3 text-sm font-bold tracking-widest outline-none text-blue-500 w-full focus:border-blue-500/50 transition-all" placeholder="@handle" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none drop-shadow-2xl italic font-serif">
                      {localUser.name}
                    </h1>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="text-blue-500 font-bold text-xs md:text-sm uppercase tracking-[0.6em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {localUser.handle}
                    </span>
                    <div className="flex gap-3">
                      {localUser.socials?.x && (
                        <a href={localUser.socials.x} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-400/30 transition-all">
                          <Satellite className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {localUser.socials?.telegram && (
                        <a href={localUser.socials.telegram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-blue-300 hover:border-blue-300/30 transition-all">
                          <Zap className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit/Save Actions */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {localUser.isVerifiedArtist && (
                <button onClick={() => navigate('/artist-dashboard')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3 group" >
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" /> Artist_Dashboard
                </button>
              )}
              {!localUser.isVerifiedArtist && (
                <button onClick={() => navigate('/artist-onboarding')} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-3 group" >
                  <Star className="h-4 w-4 group-hover:rotate-12 transition-transform" /> Become_Artist
                </button>
              )}
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-3 group" >
                  <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" /> Edit_Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[12px] text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all">Abort</button>
                  <button onClick={handleSave} className="px-10 py-4 bg-white text-black rounded-[12px] text-[10px] font-bold uppercase tracking-widest shadow-2xl active:scale-95 hover:bg-blue-500 hover:text-white transition-all">Commit_Changes</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cluster */}
          <div className="flex items-center justify-center md:justify-start gap-10">
            <div className="flex flex-col items-center md:items-start group cursor-pointer">
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tighter leading-none font-mono group-hover:text-blue-500 transition-colors">
                {(localUser.followers || 0).toLocaleString()}
              </p>
              <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.4em] mt-2">Collectors</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center md:items-start group cursor-pointer">
              <p className="text-2xl md:text-3xl font-bold text-white tracking-tighter leading-none font-mono group-hover:text-blue-500 transition-colors">
                {(localUser.following || 0).toLocaleString()}
              </p>
              <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.4em] mt-2">Following</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <Link to="/settings" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:rotate-90 duration-700" title="Protocol Settings" >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/5 py-6 mb-12 w-full px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'Vault', icon: Box },
            { id: 'feed', label: 'Relay', icon: Satellite },
            { id: 'releases', label: 'Protocols', icon: Disc, hidden: !userProfile.isVerifiedArtist },
            { id: 'sequences', label: 'Sequences', icon: Layers },
            { id: 'activity', label: 'Signals', icon: Zap },
            { id: 'network', label: 'Nodes', icon: Users },
            { id: 'staking', label: 'Staking', icon: Coins }
          ].filter(t => !t.hidden).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-3 rounded-[10px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 flex-shrink-0 border ${ activeTab === tab.id ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10' }`} >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-white/30'}`} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Collectibles Section */}
      {ownedNfts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
          <SectionHeader title="Featured Collectibles" onAction={() => navigate('/explore/nfts?title=Featured Collectibles&filter=owned')} actionLabel="View Vault" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {ownedNfts.slice(0, 5).map(nft => (
              <div key={nft.id} className="flex-shrink-0 w-48 md:w-56">
                <NFTCard nft={nft} onAction={handleNFTAction} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <StatBlock label="Network Value" value={localUser.earnings} subValue="TON" icon="gem" trend="+12.4%" />
              <StatBlock label="Reward Credits" value="1,450" subValue="TJ" icon="coins" trend="+5.2%" />
            </div>
            
            <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/5 p-8 rounded-[16px] shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Dna className="h-12 w-12 text-blue-500" /></div>
              <div className="absolute -left-20 -top-20 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Neural_Signature</h3>
              </div>
              
              {isDNASyncing ? (
                <div className="py-10 flex flex-col items-center gap-6 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                    <img src={APP_LOGO} className="w-10 h-10 object-contain animate-[spin_4s_linear_infinite] relative z-10" alt="Loading..." />
                  </div>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] animate-pulse">Resonating frequencies...</p>
                </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-transparent opacity-30"></div>
                    <p className="text-[11px] text-white/60 leading-relaxed font-medium italic">
                      "{sonicDNA?.signature || "Primary resonance: Deep House & Synthwave. Collector profile indicates a preference for high-bitrate genesis protocols and atmospheric textures."}"
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(sonicDNA?.vibes || ['Atmospheric', 'Synth-Heavy', 'Collector', 'Curator']).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[8px] font-bold text-blue-400 uppercase tracking-widest hover:border-blue-500/30 transition-all cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <button onClick={handleSyncDNA} className="w-full py-4 bg-white/5 border border-white/5 rounded-[12px] text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-xl active:scale-95">
                    RE_SYNC_DNA
                  </button>
                </div>
              )}
            </div>

            <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/5 p-8 rounded-[16px] shadow-2xl">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-1 h-4 bg-white/20 rounded-full"></div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em]">Origin_Narrative</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-6">
                  <textarea value={localUser.bio} onChange={(e) => setLocalUser({...localUser, bio: e.target.value})} className="w-full rounded-[12px] p-5 text-xs text-white outline-none h-40 leading-relaxed bg-white/5 border border-white/10 focus:border-blue-500/50 transition-all resize-none" placeholder="Identify your frequency..." />
                  
                  <div className="space-y-4">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Social_Relays</p>
                    <div className="grid grid-cols-1 gap-3">
                      {['x', 'instagram', 'telegram'].map(platform => (
                        <div key={platform} className="relative group/input">
                          <input 
                            type="text" 
                            placeholder={`${platform.toUpperCase()} URL`} 
                            value={(localUser.socials as any)?.[platform] || ''} 
                            onChange={(e) => handleSocialChange(platform, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[10px] px-5 py-3 text-[10px] text-white outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer group/bio relative" >
                  <p className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors font-medium">
                    {localUser.bio || "No biographical signals detected in the current relay."}
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Neural ID: {localUser.id.slice(0, 8)}...</span>
                    <Pencil className="h-3 w-3 text-blue-500 opacity-0 group-hover/bio:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
            </div>
            
            {!isSpotifyVerified && (
              <button onClick={() => navigate('/settings')} className="w-full py-5 bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-[16px] text-[#1DB954] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#1DB954] hover:text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group" >
                <Disc className="h-5 w-5 group-hover:animate-spin" /> Verify Artist Identity
              </button>
            )}
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'feed' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <SectionHeader title="Neural Feed" />
                <div className="space-y-6">
                  {/* Filtered Feed: Tracks, NFTs, and Posts from followed accounts */}
                  {[
                    ...allTracks.filter(t => followedUserIds.includes(t.artistId) || userProfile.followedArtists?.includes(t.artistId)).map(t => ({ ...t, type: 'track' as const, timestamp: t.releaseDate || 'Just now' })),
                    ...allNFTs.filter(n => followedUserIds.includes(n.artistId || '') || userProfile.followedArtists?.includes(n.artistId || '')).map(n => ({ ...n, type: 'nft' as const, timestamp: 'Just now' })),
                    ...posts.filter(p => followedUserIds.includes(p.userId)).map(p => ({ ...p, type: 'post' as const }))
                  ].sort((a, b) => (b as any).id.localeCompare((a as any).id)).map((item, idx) => {
                    if (item.type === 'post') {
                      return (
                        <div key={item.id} className="mb-6">
                          <PostCard post={item as any} />
                        </div>
                      );
                    }
                    return (
                    <div key={item.id} className="glass border border-blue-500/10 p-6 rounded-[10px] flex items-center gap-6 group hover:bg-white/[0.02] transition-all mb-6">
                      <div className="w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0">
                        <img src={(item as any).coverUrl || (item as any).imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${item.type === 'track' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {item.type === 'track' ? 'New Release' : 'NFT Drop'}
                          </span>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Just now</span>
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase truncate">{(item as any).title}</h4>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{(item as any).artist || (item as any).creator}</p>
                      </div>
                      <button 
                        onClick={() => item.type === 'track' ? playTrack(item as any) : navigate(`/nft/${item.id}`)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-white transition-all"
                      >
                        {item.type === 'track' ? 'Listen' : 'View'}
                      </button>
                    </div>
                  )})}
                  {followedUserIds.length === 0 && (userProfile.followedArtists?.length || 0) === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl">
                      <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Your feed is empty. Follow nodes to receive signals.</p>
                      <button onClick={() => navigate('/discover')} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all">Discover Nodes</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'inventory' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Digital Vault" actionLabel="Manage Assets" onAction={() => navigate('/library')} />
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                  {ownedNfts.length > 0 ? (
                    ownedNfts.map(nft => (
                      <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
                        <NFTCard nft={nft} onAction={handleNFTAction} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-16 flex flex-col items-center justify-center rounded-[10px] bg-white/[0.02]">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Box className="h-6 w-6 text-white/20" />
                      </div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Zero assets detected.</p>
                      <button onClick={() => navigate('/marketplace')} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-[10px] text-[8px] font-bold uppercase tracking-widest text-blue-400 transition-colors"> Browse Market </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'releases' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <SectionHeader title="Authored Protocols" actionLabel={userProfile.isVerifiedArtist ? "Mint New" : undefined} onAction={userProfile.isVerifiedArtist ? () => setShowMintModal(true) : undefined} />
                  <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                    {allTracks.filter(t => t.artistId === localUser.id).map(track => (
                      <div key={track.id} className="min-w-[280px] sm:min-w-[320px]">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </section>
                <section className="glass border border-blue-500/10 backdrop-blur-xl bg-white/[0.02] p-8 rounded-[10px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><BarChart3 className="h-10 w-10 text-blue-500" /></div>
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
                  <SectionHeader title="Royalty Distribution Ledger" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                    <div>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em] block mb-1">Total Earned</span>
                      <span className="text-2xl font-bold tracking-tighter text-white">{royaltyStats.total} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em] block mb-1">Streaming</span>
                      <span className="text-xl font-bold tracking-tighter text-white">{royaltyStats.streaming} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em] block mb-1">NFT Royalties</span>
                      <span className="text-xl font-bold tracking-tighter text-white">{royaltyStats.nft} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-[0.4em] block mb-1">Pending Sync</span>
                      <span className="text-xl font-bold tracking-tighter text-amber-500">{royaltyStats.pending} <span className="text-[10px]">TON</span></span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.4em] mb-4">Recent Distributions</h4>
                    <div className="space-y-2">
                      {[
                        { id: 1, type: 'Streaming', amount: '2.4', date: 'Today, 14:30', track: 'Solar Pulse' },
                        { id: 2, type: 'NFT Resale', amount: '0.9', date: 'Yesterday', track: 'Deep Horizon #042' },
                        { id: 3, type: 'Streaming', amount: '1.1', date: 'Oct 24', track: 'Cyber Drift' }
                      ].map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-[10px] hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Streaming' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {tx.type === 'Streaming' ? <Disc className="h-3 w-3" /> : <Gem className="h-3 w-3" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white uppercase">{tx.type} Revenue</p>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">{tx.track}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-green-400">+{tx.amount} TON</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-blue-600/10 rounded-[10px] text-[8px] font-bold text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/5"> Withdraw to Wallet </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'sequences' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <div>
                  <SectionHeader title="Sync Sequences" onAction={() => navigate('/explore/playlists?title=Sync Sequences&filter=my_playlists')} actionLabel="View All" />
                  <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                    {playlists.map(pl => (
                      <div key={pl.id} className="min-w-[280px] sm:min-w-[320px]">
                        <PlaylistCard playlist={pl} onClick={() => navigate('/library')} />
                      </div>
                    ))}
                    <div onClick={() => navigate('/library')} className="min-w-[280px] sm:min-w-[320px] aspect-square rounded-[10px] flex flex-col items-center justify-center group cursor-pointer transition-all bg-white/[0.02]" >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
                        <Plus className="text-white/10 group-hover:text-blue-500 transition-colors h-6 w-6" />
                      </div>
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">New Sequence</span>
                    </div>
                  </div>
                </div>

                {recentlyPlayed.length > 0 && (
                  <div>
                    <SectionHeader title="Recent Frequencies" actionLabel="Clear History" onAction={clearRecentlyPlayed} />
                    <div className="space-y-1">
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
                <div className="glass border border-blue-500/10 bg-white/[0.02] p-6 rounded-[10px] mb-8">
                  <form onSubmit={handleSharePost}>
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={currentTrack ? `Share your thoughts on ${currentTrack.title}...` : "What's on your mind?"}
                      className="w-full bg-white/5 rounded-[10px] p-4 text-sm text-white outline-none focus:ring-1 ring-blue-500/50 transition-all resize-none h-24 mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {currentTrack ? (
                          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full">
                            <Disc className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[150px]">
                              {currentTrack.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            Play a track to share it
                          </span>
                        )}
                      </div>
                      <button 
                        type="submit"
                        disabled={!newPostContent.trim() && !currentTrack}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                      >
                        Broadcast
                      </button>
                    </div>
                  </form>
                </div>

                <SocialFeed posts={userPosts} onDeletePost={deletePost} emptyMessage="Signal void detected." />
              </section>
            )}

            {activeTab === 'network' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div>
                  <SectionHeader title="Followed Artists" onAction={() => navigate('/explore/artists?title=Followed Artists&filter=followed')} actionLabel="View All" />
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
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
                      <p className="w-full text-[10px] font-bold text-white/30 uppercase tracking-widest py-8 text-center bg-white/[0.02] rounded-[10px]">
                        Not following any artists yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <SectionHeader title="Friends" onAction={() => navigate('/explore/artists?title=Friends&filter=friends')} actionLabel="View All" />
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
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
                      <p className="w-full text-[10px] font-bold text-white/30 uppercase tracking-widest py-8 text-center bg-white/[0.02] rounded-[10px]">
                        No friends added yet.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'staking' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/5 p-10 rounded-[20px] shadow-2xl">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Coins className="h-32 w-32 text-blue-500" /></div>
                  <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Total_Staked</p>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-5xl font-bold text-white tracking-tighter font-mono">
                          {(stakedBalance || 0).toLocaleString()}
                        </h3>
                        <span className="text-xl font-bold text-blue-500 uppercase tracking-tighter">TJ</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <TrendingUp className="h-3 w-3" /> +2.4% this week
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Current_APY</p>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-5xl font-bold text-emerald-400 tracking-tighter font-mono">
                          12.5
                        </h3>
                        <span className="text-xl font-bold text-emerald-500 uppercase tracking-tighter">%</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        <Zap className="h-3 w-3" /> Boosted by Node Rank
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Pending_Rewards</p>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-5xl font-bold text-amber-500 tracking-tighter font-mono">
                          {pendingRewards.toFixed(2)}
                        </h3>
                        <span className="text-xl font-bold text-amber-600 uppercase tracking-tighter">TJ</span>
                      </div>
                      <button onClick={handleClaimRewards} disabled={pendingRewards <= 0} className={`mt-4 px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${pendingRewards > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black' : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'}`} >
                        <Gift className="h-3 w-3" /> Claim_Sync_Rewards
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 p-6 bg-white/[0.02] border border-white/5 rounded-[12px] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Staking Governance Active</p>
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Your stake grants 1,450 voting power in the next protocol upgrade</p>
                      </div>
                    </div>
                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-[10px] text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all">
                      Governance_Portal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[16px] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Initialize_Stake</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Amount_to_Commit</span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Available: {(walletBalance || 0).toLocaleString()} TJ</span>
                        </div>
                        <div className="relative group/input">
                          <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-[12px] p-5 text-xl text-white font-mono outline-none focus:border-blue-500/50 transition-all" />
                          <button onClick={() => setStakeAmount(walletBalance.toString())} className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[8px] text-[8px] font-bold text-blue-500 uppercase tracking-widest transition-all" > MAX </button>
                        </div>
                      </div>
                      
                      <button onClick={handleStake} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all" > 
                        Commit_Stake_Protocol 
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[16px] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Withdraw_Stake</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Amount_to_Release</span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Staked: {(stakedBalance || 0).toLocaleString()} TJ</span>
                        </div>
                        <div className="relative group/input">
                          <input type="number" value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-[12px] p-5 text-xl text-white font-mono outline-none focus:border-blue-500/50 transition-all" />
                          <button onClick={() => setUnstakeAmount(stakedBalance.toString())} className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[8px] text-[8px] font-bold text-blue-500 uppercase tracking-widest transition-all" > MAX </button>
                        </div>
                      </div>
                      
                      <button onClick={handleUnstake} className="w-full py-5 bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] active:scale-95 transition-all" > 
                        Release_Stake_Signal 
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* RECOMMENDATIONS SECTION */}
            <section className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[20px] shadow-2xl relative overflow-hidden mt-16">
              <div className="absolute top-0 right-0 p-10 opacity-5"><Satellite className="h-20 w-20 text-blue-500" /></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
              
              <SectionHeader title="Network Suggestions" />
              
              <div className="space-y-12 relative z-10">
                <div>
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] mb-6">Suggested_Nodes</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4 -mx-4 px-4">
                    {MOCK_ARTISTS.slice(0, 4).map(artist => (
                      <div key={artist.id} className="flex-shrink-0 w-56">
                        <UserCard user={artist} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] mb-6">Curated_Frequencies</h4>
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
      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} />}
      {selectedNftForListing && (
        <SellNFTModal nft={selectedNftForListing} onClose={() => setSelectedNftForListing(null)} />
      )}
    </div>
  );
};

export default Profile;
