import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Disc, Music, Play, Pause, Share2, Check, Copy, 
  BadgeCheck, ArrowLeft, Search, AlertCircle
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/layout/ToastProvider';
import { NFTItem, Track } from '@/types';
import { getCollectionDetails } from '@/services/collectionService';
import { TON_LOGO } from '@/constants';
import { PRIMARY_COLLECTIONS, DetailedCollection } from '@/data/collectionsData';

export const CollectionDetails: React.FC = () => {
  const { collectionId, id } = useParams<{ collectionId?: string; id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { userProfile } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { nfts: contextNFTs } = useNFT();

  const [isLoading, setIsLoading] = useState(false);
  const [firestoreCollection, setFirestoreCollection] = useState<DetailedCollection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const activeId = collectionId || id || 'genesis-pass';

  // Load from Firestore if available, otherwise use built-in collection dataset
  useEffect(() => {
    let isMounted = true;
    const loadCollection = async () => {
      const targetId = collectionId || id;
      if (!targetId) return;

      const foundPreset = PRIMARY_COLLECTIONS.find(c => c.id === targetId);
      if (!foundPreset) {
        setIsLoading(true);
        try {
          const remoteDoc = await getCollectionDetails(targetId);
          if (remoteDoc && isMounted) {
            const formatted: DetailedCollection = {
              ...remoteDoc,
              volume: '10,000',
              floorPrice: '10.0',
              ownersCount: 45,
              totalSupply: 100,
              creatorName: remoteDoc.artistId || 'Artist',
              verified: true,
              contractAddress: `EQ_${remoteDoc.id}_TON`,
              royaltyFee: '5.0%',
              bannerUrl: remoteDoc.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
              items: []
            };
            setFirestoreCollection(formatted);
          }
        } catch (e) {
          console.warn("Could not fetch remote collection:", e);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };

    loadCollection();
    return () => { isMounted = false; };
  }, [collectionId, id]);

  // Find active collection
  const activeCollection: DetailedCollection | null = useMemo(() => {
    if (firestoreCollection && firestoreCollection.id === activeId) {
      return firestoreCollection;
    }
    const match = PRIMARY_COLLECTIONS.find(c => c.id === activeId);
    if (match) return match;

    // Fallback: match by partial name
    const fallbackMatch = PRIMARY_COLLECTIONS.find(c => c.name.toLowerCase().includes(activeId.toLowerCase()));
    if (fallbackMatch) return fallbackMatch;

    return null;
  }, [activeId, firestoreCollection]);

  // Collect all NFT tracks belonging to this collection
  const collectionTracks = useMemo(() => {
    if (!activeCollection) return [];

    let items = [...(activeCollection.items || [])];

    // Include any NFTs in NFTContext or user collection that match
    const matchingContextNFTs = contextNFTs.filter(nft => 
      (nft as any).collectionId === activeCollection.id || 
      (nft as any).nftCollection?.toLowerCase() === activeCollection.name.toLowerCase() ||
      activeCollection.nftIds?.includes(nft.id)
    );

    matchingContextNFTs.forEach(cnft => {
      if (!items.some(it => it.id === cnft.id)) {
        items.push(cnft);
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(it => 
        it.title.toLowerCase().includes(q) || 
        (it.artist && it.artist.toLowerCase().includes(q))
      );
    }

    return items;
  }, [activeCollection, contextNFTs, searchQuery]);

  // Copy smart contract address
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCollection?.contractAddress) return;
    navigator.clipboard.writeText(activeCollection.contractAddress);
    setCopied(true);
    toast.success('Contract address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  // Share Collection
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCollection) return;
    if (navigator.share) {
      navigator.share({
        title: activeCollection.name,
        text: activeCollection.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Collection link copied to clipboard');
    }
  };

  // Play NFT Track
  const handlePlayTrack = (item: NFTItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const trackObj: Track = {
      id: item.id,
      songId: item.trackId || item.id,
      title: item.title,
      artist: item.artist || item.creator || activeCollection?.creatorName || 'Artist',
      artistId: activeCollection?.artistId || 'artist',
      coverUrl: item.imageUrl || item.coverUrl || activeCollection?.coverUrl || '',
      audioUrl: item.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 210,
      genre: 'Music NFT',
      isNFT: true,
      nftPrice: item.price,
      createdAt: Date.now()
    };

    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      playTrack(trackObj);
      toast.success(`Playing ${item.title}`);
    }
  };

  // Navigate to NFT Details screen
  const handleNavigateToNFT = (nftId: string) => {
    navigate(`/nft/${nftId}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B18] text-white p-4 sm:p-6 space-y-6 animate-pulse pb-32">
        <div className="h-12 w-full rounded-[10px] bg-slate-900/60" />
        <div className="h-48 sm:h-64 rounded-[10px] bg-slate-900/60" />
        <div className="h-8 w-48 rounded-[8px] bg-slate-900/60" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-[10px] bg-slate-900/40" />
          ))}
        </div>
      </div>
    );
  }

  // Not Found State
  if (!activeCollection) {
    return (
      <div className="min-h-screen bg-[#070B18] text-white pb-32 flex flex-col">
        {/* Clean Screen Header */}
        <div className="sticky top-0 z-30 bg-[#070B18]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between border-none">
          <button
            onClick={() => navigate('/collections')}
            className="min-h-[44px] min-w-[44px] px-3 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all border-none cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Collections</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-500" />
          <h2 className="text-lg font-black">Collection Not Found</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            The collection you are looking for does not exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all border-none cursor-pointer"
          >
            Browse Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B18] text-white pb-32 overflow-x-hidden selection:bg-blue-600/30">
      
      {/* Clean Screen Header: [Back] Collection Name [Share] */}
      <div className="sticky top-0 z-30 bg-[#070B18]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-none">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] px-3 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all border-none cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="min-w-0 flex-1 text-center px-2">
          <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md mx-auto">
            {activeCollection.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            aria-label="Share Collection"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white transition-all border-none cursor-pointer flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collection Hero Section */}
      <div className="relative w-full overflow-hidden bg-[#0A113A]">
        {/* Banner Artwork */}
        <div className="h-44 sm:h-60 md:h-72 w-full relative">
          <img
            src={activeCollection.bannerUrl || activeCollection.coverUrl}
            alt={activeCollection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-[#070B18]/70 to-transparent" />
        </div>

        {/* Collection Identity Header Info */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-6 -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            
            {/* Collection Cover Artwork (Sharp 10px Radius) */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[10px] overflow-hidden bg-slate-900 shadow-2xl shrink-0">
              <img
                src={activeCollection.coverUrl}
                alt={activeCollection.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Collection Titles & Creator */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-[4px]">
                  TON NFT Collection
                </span>
                {activeCollection.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-[4px]">
                    <BadgeCheck className="w-3.5 h-3.5 fill-current text-cyan-300" />
                    Verified Creator
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeCollection.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <span>By <strong className="text-white">{activeCollection.creatorName}</strong></span>
                <span>•</span>
                <span className="text-slate-400 font-mono">{activeCollection.items?.length || activeCollection.totalSupply} Tracks</span>
              </div>
            </div>
          </div>

          {/* Smart Contract Quick Copy Button */}
          {activeCollection.contractAddress && (
            <button
              onClick={handleCopyAddress}
              className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all border-none cursor-pointer self-start md:self-end"
              title="Copy Contract Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{activeCollection.contractAddress.slice(0, 8)}...{activeCollection.contractAddress.slice(-4)}</span>
            </button>
          )}
        </div>

        {/* Collection Description */}
        {activeCollection.description && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {activeCollection.description}
            </p>
          </div>
        )}

        {/* Collection Metadata Stats Row */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-[#0B112C] p-3 rounded-[10px] shadow-lg shadow-black/20">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Floor Price</span>
            <p className="text-base sm:text-lg font-black font-mono text-cyan-400 flex items-center gap-1">
              <img src={TON_LOGO} className="w-3.5 h-3.5 inline" alt="TON" />
              {activeCollection.floorPrice} <span className="text-[10px] font-sans text-slate-400">TON</span>
            </p>
          </div>

          <div className="bg-[#0B112C] p-3 rounded-[10px] shadow-lg shadow-black/20">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Volume</span>
            <p className="text-base sm:text-lg font-black font-mono text-white flex items-center gap-1">
              <img src={TON_LOGO} className="w-3.5 h-3.5 inline" alt="TON" />
              {activeCollection.volume} <span className="text-[10px] font-sans text-slate-400">TON</span>
            </p>
          </div>

          <div className="bg-[#0B112C] p-3 rounded-[10px] shadow-lg shadow-black/20">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">NFT Tracks</span>
            <p className="text-base sm:text-lg font-black font-mono text-white">
              {collectionTracks.length} <span className="text-[10px] font-normal text-slate-400">/ {activeCollection.totalSupply}</span>
            </p>
          </div>

          <div className="bg-[#0B112C] p-3 rounded-[10px] shadow-lg shadow-black/20">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Owners</span>
            <p className="text-base sm:text-lg font-black font-mono text-purple-400">
              {activeCollection.ownersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Track / NFT Collection List Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-4">
        
        {/* Track List Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-blue-400" />
              Collection NFT Tracks ({collectionTracks.length})
            </h2>
            <p className="text-xs text-slate-400">
              Official music NFT items available on the TON Blockchain
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracks in collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[38px] bg-[#0B112C] text-xs text-white placeholder-slate-500 rounded-[8px] pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 border-none"
            />
          </div>
        </div>

        {/* Compact NFT Track Rows */}
        <div className="space-y-2">
          {collectionTracks.map((item, idx) => {
            const isCurrentPlaying = currentTrack?.id === item.id && isPlaying;
            const isUserOwner = item.owner === userProfile?.walletAddress || item.owner === userProfile?.email;
            const formattedPrice = item.price || activeCollection.floorPrice || '10.0';

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.005 }}
                onClick={() => handleNavigateToNFT(item.id)}
                className="group p-3 bg-[#0B112C] hover:bg-[#0E1638] rounded-[10px] flex items-center justify-between gap-3 cursor-pointer shadow-md shadow-black/20 transition-all border-none"
              >
                {/* Left Side: Number, Artwork Thumbnail & Metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5 text-center shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Artwork with Interactive Play Button */}
                  <div className="relative w-12 h-12 rounded-[8px] overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={item.imageUrl || item.coverUrl || activeCollection.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => handlePlayTrack(item, e)}
                      aria-label={isCurrentPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer border-none ${
                        isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 text-cyan-400 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Track Title & Artist */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                      <span>{item.artist || activeCollection.creatorName}</span>
                      <span>•</span>
                      <span className="text-slate-500">{item.edition || `#${idx + 1}`}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Price & Action Button (Buy / Owned / Bid) */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-mono font-black text-cyan-400 flex items-center gap-1">
                      <img src={TON_LOGO} className="w-3 h-3 object-contain inline" alt="TON" />
                      {formattedPrice} TON
                    </span>
                  </div>

                  {/* Buy / Availability Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToNFT(item.id);
                    }}
                    aria-label={`Buy ${item.title} for ${formattedPrice} TON`}
                    className={`min-h-[38px] px-4 py-1.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center select-none ${
                      isUserOwner
                        ? 'bg-white/[0.08] hover:bg-white/[0.12] text-slate-300'
                        : item.listingType === 'auction'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                        : 'bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {isUserOwner ? 'Owned' : item.listingType === 'auction' ? 'Bid' : 'Buy'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Collection State */}
        {collectionTracks.length === 0 && (
          <div className="py-16 text-center bg-[#0B112C] rounded-[10px] space-y-3">
            <Disc className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              No NFT Tracks Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No NFT tracks in this collection yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetails;
