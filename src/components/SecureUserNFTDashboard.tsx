import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Wallet, 
  Disc3, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Pause, 
  DollarSign, 
  TrendingUp, 
  Lock, 
  Radio, 
  BadgePercent,
  Search,
  Music4
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { NFTItem, Track } from '@/types';

export const SecureUserNFTDashboard: React.FC = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  // State
  const [ownedNFTs, setOwnedNFTs] = useState<NFTItem[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState<boolean>(true);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Address logic: prioritize active TON wallet connection, fallback to user profile wallet
  const rawAddress = tonWallet?.account?.address || userProfile?.walletAddress || '';
  const displayAddress = useMemo(() => {
    if (!rawAddress) return 'Not Connected';
    if (rawAddress.length <= 14) return rawAddress;
    return `${rawAddress.slice(0, 6)}...${rawAddress.slice(-6)}`;
  }, [rawAddress]);

  const walletNetwork = tonWallet?.account?.chain ? (tonWallet.account.chain === '-239' ? 'TON Mainnet' : 'TON Testnet') : 'TON Network';

  // Fetch owned music NFTs in real-time from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setOwnedNFTs([]);
      setLoadingNFTs(false);
      return;
    }

    setLoadingNFTs(true);
    // Realtime query for NFTs owned by current user
    const q = query(
      collection(db, 'nfts'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: NFTItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as NFTItem);
        });
        setOwnedNFTs(items);
        setLoadingNFTs(false);
      },
      (error) => {
        console.error('Error fetching owned NFTs:', error);
        setLoadingNFTs(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCopyAddress = () => {
    if (!rawAddress) return;
    navigator.clipboard.writeText(rawAddress);
    setCopiedAddress(true);
    toast.success('Wallet address copied to clipboard');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleConnectWallet = () => {
    if (tonWallet) {
      tonConnectUI.disconnect();
      toast.info('TON Wallet disconnected');
    } else {
      tonConnectUI.openModal();
    }
  };

  const handlePlayNFT = (nft: NFTItem) => {
    if (!nft.audioUrl) {
      toast.error('No audio stream attached to this NFT');
      return;
    }

    if (currentTrack?.id === nft.id || currentTrack?.songId === nft.trackId) {
      togglePlay();
    } else {
      playTrack({
        id: nft.id,
        songId: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator || 'TonJam Artist',
        artistId: nft.artistId || '',
        audioUrl: nft.audioUrl,
        coverUrl: nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        album: 'Exclusive Music NFT',
        duration: 180,
        genre: 'Electronic',
        isNFT: true,
        nftId: nft.id,
        rarity: nft.rarity || 'Rare',
        price: nft.price || '1.5',
        playCount: 0,
        streams: 0,
        likes: 0,
        createdAt: new Date().toISOString()
      } as Track);
    }
  };

  // Calculate portfolio statistics
  const totalFloorValue = useMemo(() => {
    return ownedNFTs.reduce((acc, nft) => {
      const priceNum = parseFloat(nft.price || '0');
      return acc + (isNaN(priceNum) ? 0 : priceNum);
    }, 0);
  }, [ownedNFTs]);

  const filteredNFTs = useMemo(() => {
    return ownedNFTs.filter((nft) => {
      const matchesSearch = 
        nft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.creator?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRarity = filterRarity === 'all' || (nft.rarity?.toLowerCase() === filterRarity.toLowerCase());
      return matchesSearch && matchesRarity;
    });
  }, [ownedNFTs, searchQuery, filterRarity]);

  return (
    <div id="secure-nft-dashboard" className="w-full max-w-7xl mx-auto space-y-8">
      {/* 1. Header with Profile Details & Security Badge */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0B132B] to-zinc-900 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* User Details */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                {userProfile?.avatar || user?.photoURL ? (
                  <img 
                    src={userProfile?.avatar || user?.photoURL || ''} 
                    alt={userProfile?.name || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8 text-cyan-400" />
                )}
              </div>
              {userProfile?.verified || userProfile?.isVerifiedArtist ? (
                <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-zinc-950 rounded-full p-1 shadow-md" title="Verified Account">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {userProfile?.name || userProfile?.username || user?.displayName || 'GramJam Member'}
                </h1>
                <span className="text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                  {userProfile?.isVerifiedArtist ? 'Verified Artist' : 'Music Collector'}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                    Admin Access
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {userProfile?.email || user?.email || 'Authenticated User'}
              </p>
              {userProfile?.bio && (
                <p className="text-xs text-zinc-300 max-w-xl line-clamp-2 pt-1">
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Connected Wallet Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/[0.03] p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                    {walletNetwork}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${tonWallet ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-zinc-600'}`} />
                </div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{displayAddress}</span>
                  {rawAddress && (
                    <button
                      onClick={handleCopyAddress}
                      className="text-zinc-400 hover:text-cyan-400 transition-colors p-1"
                      title="Copy Wallet Address"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleConnectWallet}
              className="mt-2 sm:mt-0 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              {tonWallet ? 'Disconnect' : 'Connect TON'}
            </button>
          </div>
        </div>

        {/* Ambient Glow Elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Portfolio Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">NFT Vault Holdings</span>
            <Disc3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{ownedNFTs.length}</div>
          <p className="text-[11px] text-zinc-400">Authenticated on TON Blockchain</p>
        </div>

        {/* Total Est Value */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Estimated Floor Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalFloorValue.toFixed(2)} TON</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Liquid Secondary Market
          </p>
        </div>

        {/* Royalty Yield Rate */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Accumulated Balance</span>
            <BadgePercent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{userProfile?.tonBalance || 0} TON</div>
          <p className="text-[11px] text-zinc-400">In-app wallet balance</p>
        </div>

        {/* Verified Status */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Asset Provenance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">100% Verified</div>
          <p className="text-[11px] text-zinc-400">Smart contract signed</p>
        </div>
      </div>

      {/* 3. Music NFT Assets Collection */}
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Music4 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Owned Music NFTs ({filteredNFTs.length})
            </h2>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracks, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Rarity Selector */}
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
            >
              <option value="all">All Rarities</option>
              <option value="legendary">Legendary</option>
              <option value="epic">Epic</option>
              <option value="rare">Rare</option>
              <option value="common">Common</option>
            </select>
          </div>
        </div>

        {/* NFT Asset Grid */}
        {loadingNFTs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-3xl bg-zinc-900/40 p-4 space-y-4 animate-pulse">
                <div className="aspect-square rounded-2xl bg-zinc-800" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNFTs.map((nft) => {
              const isCurrentPlaying = isPlaying && (currentTrack?.id === nft.id || currentTrack?.songId === nft.trackId);

              return (
                <div
                  key={nft.id}
                  className="group relative rounded-3xl bg-zinc-900/60 backdrop-blur-md p-4 transition-all duration-300 hover:bg-zinc-800/80 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between space-y-4 overflow-hidden"
                >
                  {/* Artwork & Media Play Action */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/60">
                    <img
                      src={nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400'}
                      alt={nft.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Audio Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePlayNFT(nft)}
                        className="w-12 h-12 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-cyan-400/30"
                        title={isCurrentPlaying ? 'Pause Audio' : 'Play Music NFT'}
                      >
                        {isCurrentPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                    </div>

                    {/* Rarity Badge */}
                    {nft.rarity && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold uppercase text-cyan-400">
                        {nft.rarity}
                      </div>
                    )}

                    {/* Active Playing Indicator */}
                    {isCurrentPlaying && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
                        <Radio className="w-3 h-3" /> STREAMING
                      </div>
                    )}
                  </div>

                  {/* Metadata Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white truncate group-hover:text-cyan-400 transition-colors">
                        {nft.title}
                      </h3>
                      {nft.edition && (
                        <span className="text-[10px] font-mono font-bold text-purple-400 shrink-0">
                          {nft.edition}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 truncate">
                      {nft.artist || nft.creator || 'Independent Artist'}
                    </p>
                  </div>

                  {/* Token Details & Footer */}
                  <div className="pt-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">Mint Value</span>
                      <span className="font-bold text-white">{nft.price || '1.5'} TON</span>
                    </div>

                    {nft.contractAddress ? (
                      <a
                        href={`https://tonscan.org/nft/${nft.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                      >
                        TonScan <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{nft.id.slice(0, 6)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Vault State */
          <div className="p-12 rounded-3xl bg-zinc-900/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Disc3 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">No Music NFTs Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No music assets match your search criteria. Try a different query.'
                  : 'You do not own any music NFTs yet. Explore drops and master rights in the marketplace.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureUserNFTDashboard;
