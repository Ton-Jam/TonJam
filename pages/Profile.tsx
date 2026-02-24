import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_NFTS, TON_LOGO, TJ_COIN_ICON, MOCK_POSTS, MOCK_ARTISTS } from '../constants';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
import PlaylistCard from '../components/PlaylistCard';
import SocialFeed from '../components/SocialFeed';
import UserCard from '../components/UserCard';
import MintModal from '../components/MintModal';
import SellNFTModal from '../components/SellNFTModal';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { NFTItem, UserProfile } from '../types';
import { useTonAddress } from '@tonconnect/ui-react';
import { getArtistSonicDNA } from '../services/geminiService';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const { addNotification, playlists, userProfile, setUserProfile, userTracks, userNFTs } = useAudio();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<UserProfile>(userProfile);
  const [activeTab, setActiveTab] = useState<'inventory' | 'releases' | 'sequences' | 'activity' | 'staking'>('inventory');
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedNftForListing, setSelectedNftForListing] = useState<NFTItem | null>(null);
  const [isDNASyncing, setIsDNASyncing] = useState(false);
  const [sonicDNA, setSonicDNA] = useState<{ signature: string; vibes: string[] } | null>(null);
  const [deletedPostIds, setDeletedPostIds] = useState<string[]>([]);

  // Check for Spotify verification
  const isSpotifyVerified = useMemo(() => {
    return !!user?.user_metadata?.spotify || localUser.isVerifiedArtist;
  }, [user, localUser.isVerifiedArtist]);
  
  // Staking State - Persisted
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

  const allNFTs = useMemo(() => [...MOCK_NFTS, ...userNFTs], [userNFTs]);
  const allTracks = useMemo(() => [...MOCK_TRACKS, ...userTracks], [userTracks]);

  const ownedNfts = useMemo(() => 
    allNFTs.filter(nft => nft.owner === localUser.walletAddress || nft.owner === userAddress), 
    [localUser.walletAddress, userAddress, allNFTs]
  );

  const userPosts = useMemo(() => 
    MOCK_POSTS.filter(p => p.userId === userProfile.id && !deletedPostIds.includes(p.id)), 
    [userProfile.id, deletedPostIds]
  );

  const royaltyStats = useMemo(() => {
    // Simulate royalty calculations
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
      // Use user's tracks or fallback to mock tracks if none
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

  const StatBlock = ({ label, value, icon, subValue }: { label: string, value: string, icon?: string, subValue?: string }) => (
    <div className="glass backdrop-blur-2xl bg-white/[0.02] border border-white/10 p-6 rounded-2xl group hover:border-blue-500/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] leading-none">{label}</span>
        {icon && <i className={`fas ${icon} text-[10px] text-blue-500/50 group-hover:text-blue-400 transition-colors`}></i>}
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <h4 className="text-2xl font-black tracking-tighter text-white leading-none group-hover:text-blue-400 transition-colors">{value}</h4>
        {subValue && <span className="text-[10px] font-black text-blue-500 uppercase leading-none">{subValue}</span>}
      </div>
    </div>
  );

  const SectionHeader = ({ title, onAction, actionLabel }: { title: string, onAction?: () => void, actionLabel?: string }) => (
    <div className="flex items-center justify-between mb-6 px-4 md:px-0">
      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
        {title}
      </h3>
      {onAction && (
        <button onClick={onAction} className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-all border-b border-blue-500/20 pb-0.5">{actionLabel || 'View All'}</button>
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
          <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity z-20">
             <div className="bg-white/10 border border-white/20 p-4 rounded-lg"><i className="fas fa-camera text-white text-xl"></i></div>
          </button>
        )}
        <input type="file" hidden ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
      </div>

      {/* IDENTITY SECTION: Avatar Round on the left, Stats on the right */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 -mt-16 md:-mt-20 relative z-30 flex flex-col md:flex-row items-center md:items-end w-full gap-6 md:gap-10">
        
        {/* Left: Round Avatar centerpiece */}
        <div className="relative group md:mb-2 flex-shrink-0">
          <div className={`p-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-transform duration-500 group-hover:scale-105`}>
            <img 
              src={localUser.avatar} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black object-cover" 
              alt={localUser.name} 
            />
          </div>
          {isSpotifyVerified && (
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-black shadow-xl">
              <i className="fas fa-check text-white text-[8px]"></i>
            </div>
          )}
          {isEditing && (
            <button 
              onClick={() => avatarInputRef.current?.click()} 
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-pencil text-white"></i>
            </button>
          )}
          <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
        </div>

        {/* Right: Name, Handle, Stats, and Actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4 mb-6">
            {/* Name & Handle */}
            <div className="w-full md:w-auto">
              {isEditing ? (
                <input 
                  type="text" 
                  value={localUser.name} 
                  onChange={(e) => setLocalUser({...localUser, name: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-2xl md:text-3xl font-black tracking-tighter outline-none focus:border-blue-500 text-white w-full max-w-lg md:text-left"
                />
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 
                    onClick={() => setIsEditing(true)}
                    className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] cursor-pointer hover:text-blue-400 transition-colors group/name relative"
                  >
                    {localUser.name}
                  </h1>
                  {isSpotifyVerified && <i className="fas fa-check-circle text-blue-500 text-xl md:text-2xl"></i>}
                </div>
              )}
              <p className="text-blue-500 font-black text-xs md:text-sm uppercase tracking-[0.6em] drop-shadow-md">
                {localUser.handle}
              </p>
            </div>

            {/* Edit/Save Actions */}
            <div className="flex gap-3 justify-center md:justify-end">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-pencil"></i> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Abort</button>
                  <button onClick={handleSave} className="px-5 py-2 electric-blue-bg text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">Save</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cluster (Followers/Collectors, Settings, Following) */}
          <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 mb-4">
            <div className="flex items-center gap-3 group">
              <div className="text-center md:text-left cursor-pointer">
                <p className="text-lg md:text-xl font-black text-white leading-none group-hover:text-blue-400 transition-colors">
                  {localUser.followers.toLocaleString()}
                </p>
                <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Collectors</p>
              </div>
              <Link 
                to="/settings" 
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-500"
                title="Protocol Settings"
              >
                <i className="fas fa-cog text-[10px] md:text-xs"></i>
              </Link>
            </div>

            <div className="text-center md:text-left group cursor-pointer">
              <p className="text-lg md:text-xl font-black text-white leading-none group-hover:text-blue-400 transition-colors">
                {localUser.following.toLocaleString()}
              </p>
              <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl py-4 border-y border-white/5 mb-8 w-full px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: 'fa-box-open' },
            { id: 'releases', label: 'Releases', icon: 'fa-compact-disc', hidden: !userProfile.isVerifiedArtist },
            { id: 'sequences', label: 'Sequences', icon: 'fa-layer-group' },
            { id: 'activity', label: 'Activity', icon: 'fa-bolt' },
            { id: 'staking', label: 'Staking', icon: 'fa-coins' }
          ].filter(t => !t.hidden).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 flex-shrink-0 border ${
                activeTab === tab.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-white' : 'text-white/30'}`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Collectibles Section (Always Visible) */}
      {ownedNfts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
          <SectionHeader title="Featured Collectibles" onAction={() => setActiveTab('inventory')} actionLabel="View Vault" />
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
          
          {/* Left Sidebar: Network Ledger */}
          <div className="lg:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Network Value" value={localUser.earnings} subValue="TON" icon="fa-gem" />
              <StatBlock label="Reward Credits" value="1,450" subValue="TJ" icon="fa-coins" />
            </div>

            <div className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-dna text-4xl text-blue-500"></i></div>
               <div className="absolute -left-20 -top-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
               <h3 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 relative z-10">Neural Signature</h3>
               
               {isDNASyncing ? (
                 <div className="py-6 flex flex-col items-center gap-4 relative z-10">
                   <i className="fas fa-circle-notch animate-spin text-blue-500"></i>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Resonating frequencies...</p>
                 </div>
               ) : (
                 <div className="space-y-6 relative z-10">
                    <p className="text-xs text-white/60 leading-relaxed border-l-2 border-blue-500/40 pl-6 py-2">
                      {sonicDNA?.signature || "Primary resonance: Deep House & Synthwave. Collector profile indicates a preference for high-bitrate genesis protocols and atmospheric textures."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {(sonicDNA?.vibes || ['Atmospheric', 'Synth-Heavy', 'Collector', 'Curator']).map(tag => (
                         <span key={tag} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[7px] font-black text-blue-400 uppercase tracking-widest">#{tag}</span>
                       ))}
                    </div>
                    <button onClick={handleSyncDNA} className="w-full py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[8px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/5">Re-Sync DNA</button>
                 </div>
               )}
            </div>

            <div className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden">
               <h3 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Origin Narrative</h3>
               {isEditing ? (
                 <textarea 
                   value={localUser.bio}
                   onChange={(e) => setLocalUser({...localUser, bio: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500 h-32 leading-relaxed backdrop-blur-md"
                   placeholder="Identify your frequency..."
                 />
               ) : (
                 <div 
                   onClick={() => setIsEditing(true)}
                   className="cursor-pointer group/bio relative"
                 >
                   <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                     {localUser.bio || "No biographical signals detected."}
                   </p>
                   <i className="fas fa-pencil text-[8px] text-blue-500 absolute -top-4 right-0 opacity-0 group-hover/bio:opacity-100 transition-opacity"></i>
                 </div>
               )}
            </div>

            {/* Verification Link */}
            {!isSpotifyVerified && (
              <button 
                onClick={() => navigate('/settings')}
                className="w-full py-5 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg text-[#1DB954] text-[9px] font-black uppercase tracking-widest hover:bg-[#1DB954] hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <i className="fab fa-spotify text-sm"></i>
                Verify Artist Identity
              </button>
            )}
          </div>

          {/* Right Content: Inventories */}
          <div className="lg:col-span-8 space-y-8">

            {/* INVENTORY SECTION */}
            {activeTab === 'inventory' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Digital Vault" actionLabel="Manage Assets" onAction={() => navigate('/library')} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ownedNfts.length > 0 ? (
                    ownedNfts.map(nft => (
                      <div key={nft.id} className="w-full">
                        <NFTCard nft={nft} onAction={handleNFTAction} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <i className="fas fa-box-open text-white/20 text-2xl"></i>
                      </div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Zero assets detected.</p>
                      <button onClick={() => navigate('/marketplace')} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-400 transition-colors">
                        Browse Market
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* RELEASES SECTION */}
            {activeTab === 'releases' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <SectionHeader 
                    title="Authored Protocols" 
                    actionLabel={userProfile.isVerifiedArtist ? "Mint New" : undefined} 
                    onAction={userProfile.isVerifiedArtist ? () => setShowMintModal(true) : undefined} 
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allTracks.filter(t => t.artistId === localUser.id).map(track => (
                      <div key={track.id} className="w-full">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* ROYALTIES SECTION */}
                <section className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-chart-line text-4xl text-blue-500"></i></div>
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
                  <SectionHeader title="Royalty Distribution Ledger" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block mb-1">Total Earned</span>
                      <span className="text-2xl font-black tracking-tighter text-white">{royaltyStats.total} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block mb-1">Streaming</span>
                      <span className="text-xl font-black tracking-tighter text-white">{royaltyStats.streaming} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block mb-1">NFT Royalties</span>
                      <span className="text-xl font-black tracking-tighter text-white">{royaltyStats.nft} <span className="text-[10px] text-blue-500">TON</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.4em] block mb-1">Pending Sync</span>
                      <span className="text-xl font-black tracking-tighter text-amber-500">{royaltyStats.pending} <span className="text-[10px]">TON</span></span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Recent Distributions</h4>
                    <div className="space-y-2">
                      {[
                        { id: 1, type: 'Streaming', amount: '2.4', date: 'Today, 14:30', track: 'Solar Pulse' },
                        { id: 2, type: 'NFT Resale', amount: '0.9', date: 'Yesterday', track: 'Deep Horizon #042' },
                        { id: 3, type: 'Streaming', amount: '1.1', date: 'Oct 24', track: 'Cyber Drift' }
                      ].map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Streaming' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              <i className={`fas ${tx.type === 'Streaming' ? 'fa-play' : 'fa-gem'} text-[10px]`}></i>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white uppercase">{tx.type} Revenue</p>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">{tx.track}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-green-400">+{tx.amount} TON</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[8px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/5">
                      Withdraw to Wallet
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* SEQUENCES SECTION */}
            {activeTab === 'sequences' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Sync Sequences" onAction={() => navigate('/library')} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {playlists.map(pl => (
                    <div key={pl.id} className="w-full">
                      <PlaylistCard playlist={pl} onClick={() => navigate('/library')} />
                    </div>
                  ))}
                  <div 
                    onClick={() => navigate('/library')}
                    className="w-full aspect-square border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/20 transition-all bg-white/[0.02]"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
                      <i className="fas fa-plus text-white/10 group-hover:text-blue-500 transition-colors"></i>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">New Sequence</span>
                  </div>
                </div>
              </section>
            )}

            {/* FEED SECTION */}
            {activeTab === 'activity' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader title="Signal History" onAction={() => navigate('/jamspace')} />
                <SocialFeed 
                  posts={userPosts} 
                  onDeletePost={(id) => setDeletedPostIds(prev => [...prev, id])} 
                  emptyMessage="Signal void detected." 
                />
              </section>
            )}

            {/* STAKING SECTION */}
            {activeTab === 'staking' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="glass backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><i className="fas fa-coins text-6xl text-blue-500"></i></div>
                  <div className="absolute -left-20 -top-20 w-60 h-60 bg-blue-600/20 blur-[100px] rounded-full"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Staked</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-2">
                        {stakedBalance.toLocaleString()} <span className="text-lg text-blue-500">TJ</span>
                      </h3>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Current APY</p>
                      <h3 className="text-4xl font-black text-green-400 tracking-tighter flex items-center gap-2">
                        12.5% <i className="fas fa-arrow-trend-up text-sm"></i>
                      </h3>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Pending Rewards</p>
                      <h3 className="text-4xl font-black text-amber-500 tracking-tighter flex items-center gap-2">
                        {pendingRewards.toFixed(2)} <span className="text-lg">TJ</span>
                      </h3>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={handleClaimRewards}
                      disabled={pendingRewards <= 0}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${pendingRewards > 0 ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                    >
                      <i className="fas fa-gift"></i> Claim Rewards
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deposit Card */}
                  <div className="glass bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <i className="fas fa-arrow-down text-green-500"></i> Stake (Deposit)
                    </h4>
                    
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount</span>
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Available: {walletBalance.toLocaleString()} TJ</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                          onClick={() => setStakeAmount(walletBalance.toString())}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest transition-colors"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleStake}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      Confirm Stake
                    </button>
                  </div>

                  {/* Withdraw Card */}
                  <div className="glass bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <i className="fas fa-arrow-up text-red-500"></i> Unstake (Withdraw)
                    </h4>
                    
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount</span>
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Staked: {stakedBalance.toLocaleString()} TJ</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                          onClick={() => setUnstakeAmount(stakedBalance.toString())}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest transition-colors"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleUnstake}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all"
                    >
                      Confirm Unstake
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* RECOMMENDATIONS SECTION - Always visible at bottom */}
            <section className="glass backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden mt-12">
              <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-satellite-dish text-4xl text-blue-500"></i></div>
              <SectionHeader title="Network Suggestions" />
              
              <div className="space-y-8 relative z-10">
                <div>
                  <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Suggested Nodes</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                    {MOCK_ARTISTS.slice(0, 4).map(artist => (
                      <div key={artist.id} className="flex-shrink-0 w-48">
                        <UserCard user={artist} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Curated Frequencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
        <SellNFTModal 
          nft={selectedNftForListing} 
          onClose={() => setSelectedNftForListing(null)} 
        />
      )}
    </div>
  );
};

export default Profile;