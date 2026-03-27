import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
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
  Share2,
  Send,
  Coins
} from 'lucide-react';

import { MOCK_NFTS, MOCK_USER, MOCK_TRACKS, TON_LOGO, MOCK_ARTISTS, APP_LOGO, TJ_COIN_ICON } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem, Track, NFTOffer } from '@/types';
import { fetchNFTMetadata } from '@/services/nftService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import BuyNFTModal from '@/components/BuyNFTModal';
import SellNFTModal from '@/components/SellNFTModal';
import BidModal from '@/components/BidModal';
import BidAcceptanceModal from '@/components/BidAcceptanceModal';
import NFTCard from '@/components/NFTCard';
import SendNFTModal from '@/components/SendNFTModal';
import confetti from 'canvas-confetti';
import { getPlaceholderImage } from '@/lib/utils';

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, currentTrack, isPlaying, playTrack, allNFTs, updateNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isTipping, setIsTipping] = useState(false);
  
  const localNft = useMemo(() => {
    return allNFTs.find(n => n.id === id) || null;
  }, [id, allNFTs]);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers' | 'exclusive'>('details');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  /* Modal states */
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
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

  const handleTip = (amount: number) => {
    setIsTipping(false);
    
    // Simulate transaction
    addNotification({
      title: 'Processing Tip',
      message: `Sending ${amount} TON to ${localNft?.creator}...`,
      type: 'info'
    });

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffffff', '#60a5fa']
      });

      addNotification({
        title: 'Tip Successful',
        message: `You sent ${amount} TON to ${localNft?.creator}. Thank you for supporting the artist!`,
        type: 'success'
      });
    }, 1500);
  };

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

  if (allNFTs.length === 0) return <div className="min-h-screen flex items-center justify-center text-foreground">Loading assets...</div>;
  if (!localNft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <h2 className="text-[20px] font-bold mb-4">Asset Not Found</h2>
          <p className="text-muted-foreground/80">The requested NFT could not be located.</p>
          <BackButton 
            className="mt-4 text-blue-500 hover:underline p-0"
            ariaLabel="Go Back"
          >
            Go Back
          </BackButton>
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
    } catch (err: any) {
      // Don't log or show an error if the user just cancelled the share dialog
      const isCancel = err.name === 'AbortError' || 
                      err.message?.toLowerCase().includes('canceled') ||
                      err.message?.toLowerCase().includes('aborted');
      
      if (!isCancel) {
        console.error('Error sharing:', err);
        addNotification('Failed to share.', 'error');
      }
    }
  };

  return (
    <div className="relative min-h-screen pb-4 animate-in fade-in duration-500 bg-gradient-to-br from-background via-background to-blue-900/10">
      {/* Immersive background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {isFetchingMetadata && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          </div>
          <p className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em] animate-pulse">Syncing Neural Relay...</p>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-4 pt-4">
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 px-4 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-widest">On-Chain Verified</span>
            </div>
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-muted-foreground hover:text-blue-400 hover:border-blue-400/50 transition-all" title="Share Protocol">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4 items-start">
          {/* Left Column: Artwork & Technical Specs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative group" onClick={handlePlayClick}>
              <div className="relative aspect-square rounded-[24px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] bg-black/40 border border-white/10">
                <img src={localNft.imageUrl || getPlaceholderImage(`nft-${localNft.id}`)} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt={localNft.title} />
                
                {/* Play Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[4px] transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] border border-white/20"
                  >
                    {isActive && isPlaying ? (
                      <Pause className="h-10 w-10 text-white fill-current" />
                    ) : (
                      <Play className="h-10 w-10 text-white fill-current ml-4" />
                    )}
                  </motion.div>
                </div>

                {/* Edition Badge */}
                <div className="absolute top-6 left-6">
                  <div className="px-4 py-4 bg-background/60 backdrop-blur-xl border border-border rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {localNft.edition} <span className="text-muted-foreground ml-4">Edition</span>
                  </div>
                </div>

                {/* Live Auction Badge */}
                {isAuction && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/60 backdrop-blur-2xl border border-border px-4 py-4 rounded-[12px] flex justify-between items-center shadow-2xl">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4">Time Remaining</span>
                        <span className="text-xl font-bold text-foreground tracking-tighter font-mono">{timeLeft}</span>
                      </div>
                      <div className="flex items-center gap-4 px-4 py-4 bg-amber-500/10 rounded-full border border-neutral-500/20">
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
                <div key={i} className="bg-white/5 backdrop-blur-md p-4 rounded-[16px] border border-white/5 relative overflow-hidden group transition-all hover:border-white/20">
                  <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')} opacity-40`}></div>
                  <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em] mb-4">{stat.label}</p>
                  <p className="text-base font-bold text-foreground tracking-tighter font-mono">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Identity & Action */}
          <div className="lg:col-span-7 flex flex-col">
            <header className="mb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-4 cursor-pointer group/creator" onClick={() => {
                  const artist = MOCK_ARTISTS.find(a => a.name === localNft.creator);
                  if (artist) navigate(`/artist/${artist.id}`);
                }} >
                  <div className="relative w-10 h-10">
                    <img src={MOCK_ARTISTS.find(a => a.name === localNft.creator)?.avatarUrl || getPlaceholderImage(`artist-${localNft.creator}`)} className="w-full h-full rounded-full object-cover" alt="" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Creator</span>
                    <span className="text-xs font-bold text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors">{localNft.creator}</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-muted"></div>

                <div className="flex items-center gap-4 cursor-pointer group/owner" onClick={() => {
                  if (localNft.owner === userProfile.walletAddress) {
                    navigate('/profile');
                  } else {
                    const artist = MOCK_ARTISTS.find(a => a.name === localNft.owner);
                    if (artist) navigate(`/artist/${artist.id}`);
                  }
                }} >
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center transition-all">
                    <User className="h-5 w-5 text-muted-foreground group-hover/owner:text-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Current Owner</span>
                    <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-tight group-hover:text-foreground transition-colors">
                      {isOwner ? 'You (Vault)' : `${localNft.owner.slice(0, 6)}...${localNft.owner.slice(-4)}`}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-[44px] md:text-[68px] font-bold tracking-tighter uppercase text-foreground leading-[0.85] mb-4">{localNft.title}</h1>
              
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Protocol ID</span>
                  <span className="text-[10px] font-mono text-blue-500/60 uppercase tracking-widest">{localNft.id.toUpperCase()}</span>
                </div>
                {localNft.contractAddress && (
                  <a href={`https://tonviewer.com/${localNft.contractAddress}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest hover:text-blue-400 transition-colors" >
                    Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </header>

            {/* Pricing Section - Hardware Style */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[24px] p-4 mb-4 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] rotate-12 pointer-events-none"><Zap className="h-48 w-48 text-blue-500" /></div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${isAuction ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em]">
                      {isAuction ? 'Current High Signal' : 'Fixed Valuation Protocol'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[68px] font-bold text-foreground tracking-tighter leading-none">{localNft.price}</span>
                    <span className="text-[20px] font-bold text-blue-500 uppercase tracking-tighter">TON</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    ≈ ${(parseFloat(localNft.price) * 5.2).toLocaleString()} USD at current relay rate
                  </p>
                </div>

                {isAuction && (
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-[16px] border border-white/5 text-right min-w-[220px]">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">Minimum Next Step</p>
                    <p className="text-[20px] font-bold text-amber-500 tracking-tighter">+{minNextBid} <span className="text-xs">TON</span></p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 relative z-10">
                {isOwner ? (
                  <>
                    <button onClick={() => setShowListModal(true)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all border border-blue-400/20" >
                      {localNft.listingType ? 'Manage Listing' : 'List for Sale'}
                    </button>
                    <button onClick={() => setShowSendModal(true)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-foreground rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/10" >
                      <Send className="h-4 w-4" /> Send Asset
                    </button>
                    {localNft.listingType && (
                      <button onClick={handleCancelListing} className="flex-1 py-4 bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-white/10 hover:border-red-500/20" >
                        Cancel Listing
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleAction} className={`flex-[2] py-4 rounded-[12px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl border ${isAuction ? 'bg-amber-500 hover:bg-amber-400 text-background shadow-amber-500/20 border-amber-400/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 border-blue-400/30'}`} >
                      {isAuction ? 'Place Bid Signal' : 'Acquire Asset Now'}
                    </button>
                    {!isAuction && (
                      <button onClick={() => setShowBidModal(true)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-foreground rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-white/10" >
                        Make Offer
                      </button>
                    )}
                    <button 
                      onClick={() => setIsTipping(true)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-foreground rounded-[12px] font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/10"
                    >
                      <Coins className="h-4 w-4 text-blue-400" /> Tip Creator
                    </button>
                  </>
                )}
              </div>

              {/* Tip Selection Modal */}
              <AnimatePresence>
                {isTipping && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsTipping(false)}
                      className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-sm bg-card rounded-[24px] p-4 overflow-hidden"
                    >
                      {/* Hardware style scanline */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Coins className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Tip Creator</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support {localNft.creator}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {[0.1, 0.5, 1, 5].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleTip(amount)}
                              className="group relative py-4 bg-muted/50 hover:bg-muted rounded-[12px] transition-all active:scale-95"
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-foreground group-hover:text-blue-400 transition-colors">{amount}</span>
                                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">TON</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => setIsTipping(false)}
                          className="w-full py-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Lore / Origin Narrative - Removed */}

            {/* Information Tabs */}
            <div className="flex items-center gap-4 mb-4">
              {['details', 'history', 'offers', ...(isOwner && localNft.exclusiveContent?.length ? ['exclusive'] : [])].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-muted-foreground/50 hover:text-foreground'}`}>
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
                      <div className="col-span-1 md:col-span-2 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-[16px] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">Sync Error Detected</p>
                            <p className="text-xs text-red-400/80 font-medium">{metadataError}</p>
                          </div>
                        </div>
                        <button onClick={loadMetadata} className="px-4 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                          Retry Sync
                        </button>
                      </div>
                    )}
                    
                    {associatedTrack && (
                      <div className="col-span-1 md:col-span-2 p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[20px]">
                        <h4 className="text-[5px] font-bold text-muted-foreground/60 uppercase tracking-[0.5em] mb-4 flex items-center gap-4">
                          <div className="w-1 h-3 bg-blue-500 rounded-full" />
                          Technical Signal Data
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'BPM', val: associatedTrack.bpm || 'N/A' },
                            { label: 'KEY', val: associatedTrack.key || 'N/A' },
                            { label: 'BITRATE', val: associatedTrack.bitrate || 'N/A' },
                            { label: 'DURATION', val: `${Math.floor(associatedTrack.duration / 60)}:${String(associatedTrack.duration % 60).padStart(2, '0')}` }
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-4">
                              <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{item.label}</span>
                              <span className="text-lg font-bold text-foreground tracking-tight font-mono">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
  
                    {localNft.traits?.map((trait, i) => (
                      <div key={i} className="p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[16px] flex justify-between items-center group transition-all hover:bg-white/10 hover:border-white/20">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest group-hover:text-muted-foreground transition-colors">{trait.trait_type}</span>
                        <span className="text-sm font-bold text-foreground tracking-tight">{trait.value}</span>
                      </div>
                    ))}
                    <div className="p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[16px] flex justify-between items-center">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Asset Class</span>
                      <span className="text-sm font-bold text-blue-500 tracking-tight">{localNft.edition}</span>
                    </div>
                    <div className="p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[16px] flex justify-between items-center">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Royalties</span>
                      <span className="text-sm font-bold text-emerald-500 tracking-tight">{localNft.royalty}%</span>
                    </div>
                  </motion.div>
                )}
  
                {activeTab === 'history' && (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {localNft.history?.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-[12px] hover:bg-foreground/[0.02] transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-muted/50 flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500/50 transition-all">
                            {h.event === 'Minted' ? (
                              <Wand2 className="h-5 w-5 text-blue-500/40" />
                            ) : (
                              <Handshake className="h-5 w-5 text-emerald-500/40" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground uppercase tracking-tight">{h.event}</span>
                            <span className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-4">{h.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">@{h.to}</span>
                          {h.price && <p className="text-sm text-foreground font-bold mt-4 font-mono">{h.price} TON</p>}
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
                          <div key={i} className={`group p-4 bg-card border rounded-[16px] transition-all flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-2xl ${isTopBid ? (isAuction ? 'border-border bg-amber-500/[0.02]' : 'border-border bg-blue-500/[0.02]') : 'border-border opacity-70 hover:opacity-100'}`} >
                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="relative">
                                <div className={`w-16 h-16 rounded-full bg-background border border-blue-500/30 flex items-center justify-center overflow-hidden`}>
                                  <img src={`https://picsum.photos/100/100?seed=${o.offerer}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                </div>
                                {isTopBid && (
                                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black ${isAuction ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                    <Crown className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-4 mb-4">
                                  <span className="text-sm font-bold text-foreground uppercase tracking-tight truncate max-w-[150px]">
                                    {o.offerer}
                                  </span>
                                  {isTopBid && (
                                    <span className={`text-[8px] px-4 py-4 rounded-full font-bold uppercase tracking-widest ${isAuction ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>Top Signal</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <Clock className="h-3 w-3 text-muted-foreground/50" />
                                  <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{o.timestamp} • Expires in {o.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <div className="flex items-center gap-4">
                                  <span className={`text-[26px] font-bold tracking-tighter font-mono ${isTopBid ? (isAuction ? 'text-amber-500' : 'text-blue-500') : 'text-muted-foreground'}`}>
                                    {o.price}
                                  </span>
                                  <img src={TON_LOGO} className={`w-6 h-6 ${isTopBid ? 'opacity-100' : 'opacity-30 grayscale'}`} alt="" />
                                </div>
                                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-4">Valuation Protocol</p>
                              </div>
                              {isOwner ? (
                                <div className="flex gap-4">
                                  {o.offerer !== localNft.owner && (
                                    <button onClick={() => handleAcceptOffer(o)} className={`px-4 py-4 text-foreground rounded-[10px] font-bold text-[9px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4 ${isAuction ? 'bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`} >
                                      <Check className="h-4 w-4" /> Accept
                                    </button>
                                  )}
                                  <button onClick={() => handleDeclineOffer(o.offerer)} className="px-4 py-4 bg-muted/50 text-muted-foreground rounded-[10px] font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-4" >
                                    <X className="h-4 w-4" /> Decline
                                  </button>
                                </div>
                              ) : (
                                <div className={`w-14 h-14 rounded-[12px] flex items-center justify-center border border-blue-500/30 ${isTopBid ? (isAuction ? 'bg-amber-500/10 text-amber-500 border-neutral-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/30') : 'bg-muted/50 text-muted-foreground/30'}`}>
                                  {isTopBid ? <Zap className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 flex flex-col items-center justify-center bg-card border border-border rounded-[16px] text-center px-4">
                        <div className="w-24 h-24 rounded-full bg-foreground/[0.02] border border-blue-500/30 flex items-center justify-center mb-4">
                          <Satellite className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
                        </div>
                        <h4 className="text-base font-bold text-muted-foreground uppercase tracking-tighter mb-4">No Active Signals</h4>
                        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em] leading-loose max-w-xs mx-auto">Zero valuation signals detected from the neural relay network.</p>
                        <button onClick={handleAction} className="mt-4 px-4 py-4 bg-blue-600/10 border border-neutral-500/20 rounded-[10px] text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 hover:bg-blue-600 hover:text-white transition-all ">Initiate Broadcast</button>
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
                    className="space-y-4"
                  >
                    <div className="p-4 bg-purple-500/[0.03] border border-blue-500/30 rounded-[16px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.05]"><Crown className="h-24 w-24 text-purple-500" /></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-[12px] bg-purple-500/10 flex items-center justify-center">
                          <Crown className="h-6 w-6 text-purple-500" />
                        </div>
                        <h1 className="text-sm font-bold text-foreground uppercase tracking-widest">Holder-Only Archives</h1>
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4 relative z-10 max-w-2xl">
                        As the verified owner of this NFT protocol, you have unlocked access to the following exclusive sonic and visual artifacts. These are stored in your private vault.
                      </p>
                      <div className="grid grid-cols-1 gap-4 relative z-10">
                        {localNft.exclusiveContent?.map((item) => (
                          <a 
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-4 bg-background/40 hover:bg-background/60 rounded-[12px] border border-border/50 hover:border-neutral-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[10px] bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                {item.type === 'video' && <Video className="h-6 w-6" />}
                                {item.type === 'track' && <MusicIcon className="h-6 w-6" />}
                                {item.type === 'image' && <ImageIcon className="h-6 w-6" />}
                                {item.type === 'document' && <FileText className="h-6 w-6" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-tight">{item.title}</p>
                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">{item.type} artifact</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Access Protocol</span>
                              <ExternalLink className="h-5 w-5 text-muted-foreground/50 group-hover:text-purple-500 transition-colors" />
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
          <div className="mt-4 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                <div>
                  <h2 className="text-base font-bold tracking-tighter uppercase text-foreground">More from {localNft.creator}</h2>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mt-4">Extended Discography</p>
                </div>
              </div>
              <button onClick={() => navigate(`/artist/${localNft.creator}`)} className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-foreground uppercase tracking-[0.3em] transition-all flex items-center group" >
                VIEW ALL <ChevronRight className="ml-4 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreFromCreator.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}
  
        {/* Related NFTs Section */}
        {relatedNfts.length > 0 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]"></div>
                <div>
                  <h2 className="text-base font-bold tracking-tighter uppercase text-foreground">Related {associatedTrack?.genre} Vibes</h2>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mt-4">Sonic Affinities</p>
                </div>
              </div>
              <button onClick={() => navigate('/explore/nfts?title=Related Vibes')} className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-foreground uppercase tracking-[0.3em] transition-all flex items-center group" >
                EXPLORE GENRE <ChevronRight className="ml-4 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      {showSendModal && <SendNFTModal nft={localNft} isOpen={showSendModal} onClose={() => setShowSendModal(false)} />}
      {selectedOffer && (
        <BidAcceptanceModal nft={localNft} offer={selectedOffer} onClose={() => setSelectedOffer(null)} onAccept={onConfirmAcceptance} />
      )}
    </div>
  );
};

export default NFTDetail;
