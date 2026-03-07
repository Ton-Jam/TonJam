import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  CheckCircle2, 
  User, 
  ExternalLink, 
  Zap, 
  ScrollText, 
  Loader2, 
  Sparkles, 
  Wand2, 
  Handshake, 
  Crown, 
  Clock, 
  Check, 
  X, 
  LogIn, 
  Satellite, 
  ChevronRight,
  Video,
  Music as MusicIcon,
  Image as ImageIcon,
  FileText,
  Lock,
  Share2
} from 'lucide-react';

import { MOCK_NFTS, MOCK_USER, MOCK_TRACKS, TON_LOGO, MOCK_ARTISTS, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem, Track, NFTOffer } from '@/types';
import { generateNFTLore } from '@/services/geminiService';
import { fetchNFTMetadata } from '@/services/nftService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import BuyNFTModal from '@/components/BuyNFTModal';
import SellNFTModal from '@/components/SellNFTModal';
import BidModal from '@/components/BidModal';
import BidAcceptanceModal from '@/components/BidAcceptanceModal';
import NFTCard from '@/components/NFTCard';

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, currentTrack, isPlaying, playTrack, allNFTs, updateNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const localNft = useMemo(() => {
    return allNFTs.find(n => n.id === id) || null;
  }, [id, allNFTs]);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [lore, setLore] = useState<string>('');
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers' | 'exclusive'>('details');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  /* Modal states */
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NFTOffer | null>(null);

  const loadMetadata = () => {
    if (localNft?.contractAddress) {
      setIsFetchingMetadata(true);
      setMetadataError(null);
      fetchNFTMetadata(localNft.contractAddress)
        .then(metadata => {
          if (!metadata) return;
          // Note: We don't update state here directly because localNft is derived from allNFTs
          // In a real app, we'd trigger an updateNFT call if metadata changed significantly
        })
        .catch(err => {
          console.error("Failed to fetch metadata", err);
          setMetadataError("Failed to sync on-chain data.");
          addNotification("Failed to fetch on-chain metadata.", "error");
        })
        .finally(() => setIsFetchingMetadata(false));
    }
  };

  useEffect(() => {
    if (localNft) {
      setAssociatedTrack(MOCK_TRACKS.find(t => t.id === localNft.trackId) || null);
      /* Fetch dynamic metadata */
      loadMetadata();
    }
    window.scrollTo(0, 0);
  }, [id, localNft?.id]);

  useEffect(() => {
    if (!localNft?.auctionEndTime) {
      setTimeLeft('00:00:00');
      return;
    }
    const timer = setInterval(() => {
      const endTime = new Date(localNft.auctionEndTime!).getTime();
      if (isNaN(endTime)) {
        setTimeLeft('INVALID');
        clearInterval(timer);
        return;
      }
      const now = new Date().getTime();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft('ENDED');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [localNft]);

  const isActive = useMemo(() => currentTrack?.id === localNft?.trackId, [currentTrack, localNft]);
  const isOwner = useMemo(() => {
    if (!localNft) return false;
    const currentWallet = userAddress || userProfile.walletAddress;
    return localNft.owner === currentWallet;
  }, [localNft, userAddress]);

  const isAuction = useMemo(() => {
    return localNft?.listingType === 'auction';
  }, [localNft]);

  const minNextBid = useMemo(() => {
    if (!localNft?.price) return '0';
    return (parseFloat(localNft.price) * 1.05).toFixed(2);
  }, [localNft]);

  const moreFromCreator = useMemo(() => {
    if (!localNft) return [];
    return allNFTs.filter(n => n.creator === localNft.creator && n.id !== localNft.id).slice(0, 4);
  }, [localNft, allNFTs]);

  const relatedNfts = useMemo(() => {
    if (!localNft || !associatedTrack) return [];
    const relatedTrackIds = MOCK_TRACKS
      .filter(t => t.genre === associatedTrack.genre)
      .map(t => t.id);
    return allNFTs.filter(n => relatedTrackIds.includes(n.trackId) && n.id !== localNft.id).slice(0, 4);
  }, [localNft, associatedTrack, allNFTs]);

  const highestOfferPrice = useMemo(() => {
    if (!localNft?.offers || localNft.offers.length === 0) return 0;
    return Math.max(...localNft.offers.map(o => parseFloat(o.price)));
  }, [localNft]);

  if (allNFTs.length === 0) return <div className="min-h-screen flex items-center justify-center text-white">Loading assets...</div>;
  if (!localNft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
          <p className="text-white/60">The requested NFT could not be located.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (isOwner) {
      setShowListModal(true);
    } else if (isAuction) {
      setShowBidModal(true);
    } else {
      setShowBuyModal(true);
    }
  };

  const handlePlayClick = () => {
    if (associatedTrack) playTrack(associatedTrack);
  };

  const handleAcceptOffer = (offer: NFTOffer) => {
    setSelectedOffer(offer);
  };

  const onConfirmAcceptance = () => {
    if (!selectedOffer || !localNft) return;
    /* Update NFT ownership and clear listing */
    updateNFT(localNft.id, {
      owner: selectedOffer.offerer,
      listingType: undefined,
      price: selectedOffer.price,
      offers: []
    });
    addNotification("Asset ownership transfer protocol complete.", "success");
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
  };

  const handleDeclineOffer = (offerer: string) => {
    if (!localNft) return;
    /* Remove the offer */
    const newOffers = localNft.offers?.filter(o => o.offerer !== offerer) || [];
    updateNFT(localNft.id, { offers: newOffers });
    addNotification(`Offer from ${offerer} rejected.`, "info");
  };

  const handleGenerateLore = async () => {
    setIsGeneratingLore(true);
    addNotification("Syncing digital archives...", "info");
    try {
      const result = await generateNFTLore(localNft.title, associatedTrack?.genre || 'Electronic', localNft.description || '');
      setLore(result);
      addNotification("Origin retrieved.", "success");
    } catch (e: any) {
      addNotification("Archive retrieval failed.", "error");
    } finally {
      setIsGeneratingLore(false);
    }
  };

  const handleCancelListing = () => {
    addNotification("Initiating listing cancellation protocol...", "info");
    setTimeout(() => {
      updateNFT(localNft.id, { listingType: undefined });
      addNotification("Listing cancelled. Asset returned to vault.", "success");
    }, 1500);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/nft/${localNft.id}`;
    const shareData = {
      title: `${localNft.title} by ${localNft.creator}`,
      text: `Check out this NFT on TonJam: ${localNft.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addNotification('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addNotification('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      // Don't log or show an error if the user just cancelled the share dialog
      const isCancel = (err as Error).name === 'AbortError' || 
                      (err as Error).message?.toLowerCase().includes('canceled') ||
                      (err as Error).message?.toLowerCase().includes('aborted');
      
      if (!isCancel) {
        console.error('Error sharing:', err);
        addNotification('Failed to share.', 'error');
      }
    }
  };

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500">
      {isFetchingMetadata && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-xs font-bold text-white uppercase tracking-[0.3em] animate-pulse">Syncing Asset Data...</p>
        </div>
      )}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex justify-end items-center mb-10">
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">On-Chain Verified</span>
            </div>
            <button onClick={handleShare} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-blue-500 transition-all" >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Artwork & Technical Specs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative group" onClick={handlePlayClick}>
              <div className="relative aspect-square rounded-[12px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#050505] border border-white/10">
                <img src={localNft.imageUrl} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={localNft.title} />
                
                {/* Play Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                  >
                    {isActive && isPlaying ? (
                      <Pause className="h-8 w-8 text-white fill-current" />
                    ) : (
                      <Play className="h-8 w-8 text-white fill-current ml-1" />
                    )}
                  </motion.div>
                </div>

                {/* Edition Badge */}
                <div className="absolute top-6 left-6">
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {localNft.edition} <span className="text-white/40 ml-1">Edition</span>
                  </div>
                </div>

                {/* Live Auction Badge */}
                {isAuction && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/60 backdrop-blur-2xl border border-amber-500/30 px-6 py-5 rounded-[12px] flex justify-between items-center shadow-2xl">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-1">Time Remaining</span>
                        <span className="text-xl font-bold text-white tracking-tighter font-mono">{timeLeft}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Active Bid</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware-style Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'BPM', val: associatedTrack?.bpm || '128', color: 'text-blue-500' },
                { label: 'KEY', val: associatedTrack?.key || 'C#m', color: 'text-purple-500' },
                { label: 'BIT', val: associatedTrack?.bitrate || 'FLAC', color: 'text-emerald-500' },
                { label: 'REL', val: associatedTrack?.releaseDate?.split('-')[0] || '2024', color: 'text-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[10px] relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')} opacity-20`}></div>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                  <p className="text-sm font-bold text-white tracking-tighter font-mono">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Identity & Action */}
          <div className="lg:col-span-7 flex flex-col">
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-3 cursor-pointer group/creator" onClick={() => {
                  const artist = MOCK_ARTISTS.find(a => a.name === localNft.creator);
                  if (artist) navigate(`/artist/${artist.id}`);
                }} >
                  <div className="relative w-10 h-10">
                    <img src={`https://picsum.photos/100/100?seed=${localNft.creator}`} className="w-full h-full rounded-full object-cover border border-white/10" alt="" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Creator</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{localNft.creator}</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10"></div>

                <div className="flex items-center gap-3 cursor-pointer group/owner" onClick={() => {
                  if (localNft.owner === userProfile.walletAddress) {
                    navigate('/profile');
                  } else {
                    const artist = MOCK_ARTISTS.find(a => a.name === localNft.owner);
                    if (artist) navigate(`/artist/${artist.id}`);
                  }
                }} >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/owner:border-white/30 transition-all">
                    <User className="h-5 w-5 text-white/40 group-hover/owner:text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Current Owner</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-tight group-hover:text-white transition-colors">
                      {isOwner ? 'You (Vault)' : `${localNft.owner.slice(0, 6)}...${localNft.owner.slice(-4)}`}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-white leading-[0.85] mb-6">{localNft.title}</h1>
              
              <div className="flex items-center justify-between py-4 border-y border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Protocol ID</span>
                  <span className="text-[10px] font-mono text-blue-500/60 uppercase tracking-widest">{localNft.id.toUpperCase()}</span>
                </div>
                {localNft.contractAddress && (
                  <a href={`https://tonviewer.com/${localNft.contractAddress}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest hover:text-blue-400 transition-colors" >
                    Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </header>

            {/* Pricing Section - Hardware Style */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[16px] p-10 mb-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12"><Zap className="h-32 w-32" /></div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAuction ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}></div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em]">
                      {isAuction ? 'Current High Signal' : 'Fixed Valuation Protocol'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-7xl font-bold text-white tracking-tighter leading-none">{localNft.price}</span>
                    <span className="text-2xl font-bold text-blue-500 uppercase tracking-tighter">TON</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    ≈ ${(parseFloat(localNft.price) * 5.2).toLocaleString()} USD at current relay rate
                  </p>
                </div>

                {isAuction && (
                  <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[12px] text-right min-w-[200px]">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-2">Minimum Next Step</p>
                    <p className="text-2xl font-bold text-amber-500 tracking-tighter">+{minNextBid} <span className="text-xs">TON</span></p>
                  </div>
                )}
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                {isOwner ? (
                  <>
                    <button onClick={() => setShowListModal(true)} className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all" >
                      {localNft.listingType ? 'Manage Listing' : 'List for Sale'}
                    </button>
                    {localNft.listingType && (
                      <button onClick={handleCancelListing} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all" >
                        Cancel Listing
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleAction} className={`flex-[2] py-6 rounded-[10px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl ${isAuction ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'}`} >
                      {isAuction ? 'Place Bid Signal' : 'Acquire Asset Now'}
                    </button>
                    {!isAuction && (
                      <button onClick={() => setShowBidModal(true)} className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[10px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all" >
                        Make Offer
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* AI Lore / Origin Narrative */}
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[12px] relative overflow-hidden group mb-10">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><ScrollText className="h-16 w-16" /></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">Origin Narrative</h3>
                </div>
                {!lore && (
                  <button onClick={handleGenerateLore} disabled={isGeneratingLore} className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                    {isGeneratingLore ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} 
                    <span>Reconstruct History</span>
                  </button>
                )}
              </div>
              <div className="relative z-10">
                <p className="text-sm text-white/70 leading-relaxed font-medium italic border-l-2 border-blue-500/30 pl-6">
                  {lore || "Digital archives are currently locked. Initiate manual reconstruction to reveal this asset's temporal origin and neural lineage."}
                </p>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="flex items-center gap-10 mb-10 border-b border-white/5">
              {['details', 'history', 'offers', ...(isOwner && localNft.exclusiveContent?.length ? ['exclusive'] : [])].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-5 text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-white/20 hover:text-white'}`}>
                  {tab === 'exclusive' ? 'Holder Perks' : tab}
                  {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></motion.div>}
                </button>
              ))}
            </div>            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {metadataError && (
                      <div className="col-span-1 md:col-span-2 p-5 bg-red-500/5 border border-red-500/20 rounded-[12px] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <X className="h-5 w-5 text-red-500" />
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{metadataError}</span>
                        </div>
                        <button onClick={loadMetadata} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-[8px] text-[9px] font-bold uppercase tracking-widest transition-colors">
                          Retry Sync
                        </button>
                      </div>
                    )}
                    
                    {associatedTrack && (
                      <div className="col-span-1 md:col-span-2 p-6 bg-[#0a0a0a] border border-white/5 rounded-[12px]">
                        <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">Technical Signal Data</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          {[
                            { label: 'BPM', val: associatedTrack.bpm || 'N/A' },
                            { label: 'KEY', val: associatedTrack.key || 'N/A' },
                            { label: 'BITRATE', val: associatedTrack.bitrate || 'N/A' },
                            { label: 'DURATION', val: `${Math.floor(associatedTrack.duration / 60)}:${String(associatedTrack.duration % 60).padStart(2, '0')}` }
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-2">
                              <span className="text-[7px] font-bold text-white/10 uppercase tracking-widest">{item.label}</span>
                              <span className="text-sm font-bold text-white tracking-tight font-mono">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
  
                    {localNft.traits?.map((trait, i) => (
                      <div key={i} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-[12px] flex justify-between items-center group hover:border-white/20 transition-all">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">{trait.trait_type}</span>
                        <span className="text-xs font-bold text-white tracking-tight">{trait.value}</span>
                      </div>
                    ))}
                    <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-[12px] flex justify-between items-center">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Asset Class</span>
                      <span className="text-xs font-bold text-blue-500 tracking-tight">{localNft.edition}</span>
                    </div>
                    <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-[12px] flex justify-between items-center">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Royalties</span>
                      <span className="text-xs font-bold text-emerald-500 tracking-tight">{localNft.royalty}%</span>
                    </div>
                  </motion.div>
                )}
  
                {activeTab === 'history' && (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {localNft.history?.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-white/5 rounded-[12px] hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-[10px] bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                            {h.event === 'Minted' ? (
                              <Wand2 className="h-5 w-5 text-blue-500/40" />
                            ) : (
                              <Handshake className="h-5 w-5 text-emerald-500/40" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{h.event}</span>
                            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-1">{h.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">@{h.to}</span>
                          {h.price && <p className="text-sm text-white font-bold mt-1 font-mono">{h.price} TON</p>}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
  
                {activeTab === 'offers' && (
                  <motion.div 
                    key="offers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {localNft.offers && localNft.offers.length > 0 ? (
                      localNft.offers.map((o, i) => {
                        const isTopBid = parseFloat(o.price) === highestOfferPrice;
                        return (
                          <div key={i} className={`group p-6 bg-[#0a0a0a] border rounded-[16px] transition-all flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl ${isTopBid ? (isAuction ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-blue-500/30 bg-blue-500/[0.02]') : 'border-white/5 opacity-70 hover:opacity-100'}`} >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className="relative">
                                <div className={`w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden`}>
                                  <img src={`https://picsum.photos/100/100?seed=${o.offerer}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                </div>
                                {isTopBid && (
                                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black ${isAuction ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                    <Crown className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[150px]">
                                    {o.offerer}
                                  </span>
                                  {isTopBid && (
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${isAuction ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>Top Signal</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-white/20" />
                                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{o.timestamp} • Expires in {o.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <div className="flex items-center gap-3">
                                  <span className={`text-3xl font-bold tracking-tighter font-mono ${isTopBid ? (isAuction ? 'text-amber-500' : 'text-blue-500') : 'text-white/40'}`}>
                                    {o.price}
                                  </span>
                                  <img src={TON_LOGO} className={`w-6 h-6 ${isTopBid ? 'opacity-100' : 'opacity-30 grayscale'}`} alt="" />
                                </div>
                                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1">Valuation Protocol</p>
                              </div>
                              {isOwner ? (
                                <div className="flex gap-3">
                                  {o.offerer !== localNft.owner && (
                                    <button onClick={() => handleAcceptOffer(o)} className={`px-6 py-3 text-white rounded-[10px] font-bold text-[9px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 ${isAuction ? 'bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`} >
                                      <Check className="h-4 w-4" /> Accept
                                    </button>
                                  )}
                                  <button onClick={() => handleDeclineOffer(o.offerer)} className="px-6 py-3 bg-white/5 text-white/40 rounded-[10px] font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2" >
                                    <X className="h-4 w-4" /> Decline
                                  </button>
                                </div>
                              ) : (
                                <div className={`w-14 h-14 rounded-[12px] flex items-center justify-center border border-white/5 ${isTopBid ? (isAuction ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20') : 'bg-white/5 text-white/10'}`}>
                                  {isTopBid ? <Zap className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-32 flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/5 rounded-[16px] text-center px-12">
                        <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                          <Satellite className="h-10 w-10 text-white/10 animate-pulse" />
                        </div>
                        <h4 className="text-xl font-bold text-white/40 uppercase tracking-tighter mb-3">No Active Signals</h4>
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] leading-loose max-w-xs mx-auto">Zero valuation signals detected from the neural relay network.</p>
                        <button onClick={handleAction} className="mt-10 px-12 py-4 bg-blue-600/10 border border-blue-600/20 rounded-[10px] text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 hover:bg-blue-600 hover:text-white transition-all ">Initiate Broadcast</button>
                      </div>
                    )}
                  </motion.div>
                )}
  
                {activeTab === 'exclusive' && isOwner && (
                  <motion.div 
                    key="exclusive"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="p-8 bg-purple-500/[0.03] border border-purple-500/20 rounded-[16px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05]"><Crown className="h-24 w-24 text-purple-500" /></div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-[12px] bg-purple-500/10 flex items-center justify-center">
                          <Crown className="h-6 w-6 text-purple-500" />
                        </div>
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest">Holder-Only Archives</h4>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed mb-10 relative z-10 max-w-2xl">
                        As the verified owner of this NFT protocol, you have unlocked access to the following exclusive sonic and visual artifacts. These are stored in your private vault.
                      </p>
                      <div className="grid grid-cols-1 gap-4 relative z-10">
                        {localNft.exclusiveContent?.map((item) => (
                          <a 
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-5 bg-black/40 hover:bg-black/60 rounded-[12px] border border-white/5 hover:border-purple-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[10px] bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                {item.type === 'video' && <Video className="h-6 w-6" />}
                                {item.type === 'track' && <MusicIcon className="h-6 w-6" />}
                                {item.type === 'image' && <ImageIcon className="h-6 w-6" />}
                                {item.type === 'document' && <FileText className="h-6 w-6" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white uppercase tracking-tight">{item.title}</p>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.type} artifact</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Access Protocol</span>
                              <ExternalLink className="h-5 w-5 text-white/20 group-hover:text-purple-500 transition-colors" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
  
        {/* More from Creator Section */}
        {moreFromCreator.length > 0 && (
          <div className="mt-40 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-white">More from {localNft.creator}</h2>
              </div>
              <button onClick={() => navigate(`/artist/${localNft.creator}`)} className="text-[10px] font-bold text-white/30 hover:text-blue-500 uppercase tracking-[0.3em] transition-all flex items-center group" >
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {moreFromCreator.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}
  
        {/* Related NFTs Section */}
        {relatedNfts.length > 0 && (
          <div className="mt-40 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-white">Related {associatedTrack?.genre} Vibes</h2>
              </div>
              <button onClick={() => navigate('/explore/nfts?title=Related Vibes')} className="text-[10px] font-bold text-white/30 hover:text-amber-500 uppercase tracking-[0.3em] transition-all flex items-center group" >
                EXPLORE GENRE <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedNfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conditional Modals */}
      {showBuyModal && <BuyNFTModal nft={localNft} onClose={() => setShowBuyModal(false)} />}
      {showListModal && <SellNFTModal nft={localNft} onClose={() => setShowListModal(false)} />}
      {showBidModal && <BidModal nft={localNft} onClose={() => setShowBidModal(false)} />}
      {selectedOffer && (
        <BidAcceptanceModal nft={localNft} offer={selectedOffer} onClose={() => setSelectedOffer(null)} onAccept={onConfirmAcceptance} />
      )}
    </div>
  );
};

export default NFTDetail;
