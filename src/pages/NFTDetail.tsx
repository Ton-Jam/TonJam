import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
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
  Coins,
  TrendingUp,
  Activity,
  Award,
  ArrowUpDown,
  Users
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { MOCK_NFTS, MOCK_USER, MOCK_TRACKS, TON_LOGO, MOCK_ARTISTS, APP_LOGO, TJ_COIN_ICON } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem, Track, NFTOffer } from '@/types';
import { fetchNFTMetadata } from '@/services/nftService';
import { cancelListing, getActiveListingForNFT } from '@/services/marketplaceService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'motion/react';
import * as RechartsPrimitive from 'recharts';
const { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} = RechartsPrimitive as any;
import BuyNFTModal from '@/components/BuyNFTModal';
import SellNFTModal from '@/components/SellNFTModal';
import BidModal from '@/components/BidModal';
import PlaceOfferModal from '@/components/PlaceOfferModal';
import BidAcceptanceModal from '@/components/BidAcceptanceModal';
import ManageNFTModal from '@/components/ManageNFTModal';
import NFTCard from '@/components/NFTCard';
import SendNFTModal from '@/components/SendNFTModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import CommentsSection from '@/components/CommentsSection';
import ReactionsSection from '@/components/ReactionsSection';
import confetti from 'canvas-confetti';
import { getPlaceholderImage, cn } from '@/lib/utils';

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, currentTrack, isPlaying, playTrack, allNFTs, updateNFT, setFullPlayerOpen, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isTipping, setIsTipping] = useState(false);
  const [inlineBidAmount, setInlineBidAmount] = useState<string>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  
  const localNft = useMemo(() => {
    return allNFTs.find(n => n.id === id) || null;
  }, [id, allNFTs]);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers' | 'comments' | 'exclusive'>('details');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [dynamicMetadata, setDynamicMetadata] = useState<NFTItem | null>(null);

  /* Modal states */
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isOwner = useMemo(() => {
    if (!localNft) return false;
    const currentWallet = userAddress || userProfile.walletAddress;
    return localNft.owner === currentWallet;
  }, [localNft, userAddress, userProfile.walletAddress]);

  useEffect(() => {
    if (searchParams.get('action') === 'sell' && isOwner && !localNft?.listingType) {
      setShowListModal(true);
      // Clean up the URL
      setSearchParams({});
    }
  }, [searchParams, isOwner, localNft, setSearchParams]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NFTOffer | null>(null);
  const [relatedSort, setRelatedSort] = useState<'default' | 'bids'>('default');
  const [isCancelListingConfirmOpen, setIsCancelListingConfirmOpen] = useState(false);
  const [offerToDecline, setOfferToDecline] = useState<string | null>(null);
  const [offerToAccept, setOfferToAccept] = useState<NFTOffer | null>(null);
  const [isCancelBidConfirmOpen, setIsCancelBidConfirmOpen] = useState(false);

  const loadMetadata = () => {
    if (localNft?.contractAddress) {
      setIsFetchingMetadata(true);
      setMetadataError(null);
      fetchNFTMetadata(localNft.contractAddress)
        .then(metadata => {
          if (!metadata) return;
          setDynamicMetadata(metadata);
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
  }, [id, localNft?.id]);

  const isActive = useMemo(() => currentTrack?.id === localNft?.trackId, [currentTrack, localNft]);

  const isAuction = useMemo(() => {
    return localNft?.listingType === 'auction';
  }, [localNft]);

  const isAuctionEnded = useMemo(() => {
    if (!isAuction || !localNft?.auctionEndTime) return false;
    return new Date(localNft.auctionEndTime).getTime() <= Date.now();
  }, [isAuction, localNft?.auctionEndTime]);

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  useEffect(() => {
    if (!isAuction || !localNft?.auctionEndTime) return;
    
    const calculateTimeRemaining = () => {
      const end = new Date(localNft.auctionEndTime!).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining('Auction Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [isAuction, localNft?.auctionEndTime]);

  const minNextBid = useMemo(() => {
    if (!localNft?.price) return '0';
    return (parseFloat(localNft.price) * 1.05).toFixed(2);
  }, [localNft]);

  const userOffer = useMemo(() => {
    if (!localNft || !userAddress) return null;
    return localNft.offers?.find(o => o.offerer === userAddress) || null;
  }, [localNft, userAddress]);

  const highestOfferPrice = useMemo(() => {
    if (!localNft?.offers || localNft.offers.length === 0) return 0;
    return localNft.offers.reduce((max, o) => Math.max(max, parseFloat(o.price)), 0);
  }, [localNft]);

  const handleTip = (amount: number) => {
    setIsTipping(false);
    
    // Simulate transaction
    addNotification(`Sending ${amount} TON to ${localNft?.creator}...`, 'info');

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffffff', '#60a5fa']
      });

      addNotification(`You sent ${amount} TON to ${localNft?.creator}. Thank you for supporting the artist!`, 'success');
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
    
    let filtered = allNFTs.filter(n => relatedTrackIds.includes(n.trackId) && n.id !== localNft.id);

    if (relatedSort === 'bids') {
      filtered = [...filtered].sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0));
    }

    return filtered.slice(0, 4);
  }, [localNft, associatedTrack, allNFTs, relatedSort]);

  const priceHistoryData = useMemo(() => {
    if (!localNft) return [];
    const basePrice = parseFloat(localNft.price) || 0.5;
    return [
      { name: 'Jan', price: basePrice * 0.4 },
      { name: 'Feb', price: basePrice * 0.6 },
      { name: 'Mar', price: basePrice * 0.5 },
      { name: 'Apr', price: basePrice * 0.9 },
      { name: 'May', price: basePrice * 0.8 },
      { name: 'Jun', price: basePrice },
    ];
  }, [localNft?.price]);

  if (allNFTs.length === 0) return <div className="min-h-screen flex items-center justify-center text-foreground">Loading assets...</div>;
  if (!localNft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <h2 className="text-[20px] font-bold mb-4">Asset Not Found</h2>
          <p className="text-muted-foreground/80">The requested NFT could not be located.</p>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (isOwner) {
      if (localNft.listingType) {
        setShowManageModal(true);
      } else {
        setShowListModal(true);
      }
    } else if (isAuction) {
      setShowBidModal(true);
    } else {
      setShowBuyModal(true);
    }
  };

  const handleInlineBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to place bid.", "warning");
      tonConnectUI.openModal();
      return;
    }
    
    const bidValue = parseFloat(inlineBidAmount);
    const minBidValue = parseFloat(minNextBid);
    
    if (isAuctionEnded) {
      addNotification("Auction session expired. Signal rejection.", "error");
      return;
    }

    if (isNaN(bidValue) || bidValue < minBidValue) {
      addNotification(`Minimum bid is ${minNextBid} TON`, "warning");
      return;
    }

    setIsPlacingBid(true);
    addNotification("Broadcasting bid to neural relay...", "info");
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOffer = {
        id: `offer-${Date.now()}`,
        offerer: userAddress,
        price: bidValue.toString(),
        timestamp: 'Just now',
        duration: '24h'
      };
      
      updateNFT(localNft.id, { 
        price: bidValue.toString(), 
        offers: [newOffer, ...(localNft.offers || [])] 
      });
      
      addNotification(`Bid of ${bidValue} TON placed!`, "success");
      setInlineBidAmount('');
    } catch (e) {
      console.error(e);
      addNotification("Bid broadcast failed.", "error");
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handlePlayClick = () => {
    if (associatedTrack) {
      playTrack(associatedTrack);
      setFullPlayerOpen(true);
    }
  };

  const handleAcceptOffer = (offer: NFTOffer) => {
    setSelectedOffer(offer);
  };

  const onConfirmAcceptance = () => {
    if (selectedOffer) {
      setOfferToAccept(selectedOffer);
      setSelectedOffer(null);
    }
  };

  const confirmAcceptOffer = async () => {
    if (!offerToAccept || !localNft) return;
    
    addNotification(`Accepting offer from ${offerToAccept.offerer}...`, "info");
    
    // Simulate blockchain delay
    setTimeout(() => {
      // Update NFT owner and clear listing
      updateNFT(localNft.id, { 
        owner: offerToAccept.offerer,
        listingType: undefined,
        price: offerToAccept.price,
        offers: [] // Clear offers after sale
      });
      
      addNotification("Asset ownership transfer protocol complete.", "success");
      setOfferToAccept(null);
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    }, 1500);
  };

  const handleDeclineOffer = (offerer: string) => {
    setOfferToDecline(offerer);
  };

  const confirmDeclineOffer = () => {
    if (!localNft || !offerToDecline) return;
    /* Remove the offer */
    const newOffers = localNft.offers?.filter(o => o.offerer !== offerToDecline) || [];
    updateNFT(localNft.id, { offers: newOffers });
    addNotification(`Offer from ${offerToDecline} rejected.`, "info");
    setOfferToDecline(null);
  };

  const handleCancelListing = () => {
    setIsCancelListingConfirmOpen(true);
  };

  const confirmCancelListing = async () => {
    if (!localNft) return;
    
    addNotification("Initiating listing cancellation protocol...", "info");
    
    try {
      const listing = await getActiveListingForNFT(localNft.id);
      if (!listing) {
        // Optimistic UI update if listing was already gone
        updateNFT(localNft.id, { listingType: undefined });
        addNotification("Listing not found, metadata synced.", "success");
        return;
      }

      await cancelListing(tonConnectUI, listing, localNft);
      
      updateNFT(localNft.id, { listingType: undefined });
      addNotification("Listing cancelled. Asset returned to vault.", "success");
    } catch (e) {
      console.error(e);
      addNotification("Cancellation protocol aborted.", "error");
    } finally {
      setIsCancelListingConfirmOpen(false);
    }
  };

  const handleCancelBid = () => {
    setIsCancelBidConfirmOpen(true);
  };

  const confirmCancelBid = () => {
    if (!localNft || !userAddress) return;
    
    addNotification("Initiating bid withdrawal protocol...", "info");
    
    setTimeout(() => {
      const newOffers = localNft.offers?.filter(o => o.offerer !== userAddress) || [];
      updateNFT(localNft.id, { offers: newOffers });
      addNotification("Bid signal withdrawn from the relay.", "success");
      setIsCancelBidConfirmOpen(false);
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
              <div className="relative aspect-square rounded-[2px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] bg-black/40 border border-white/10">
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
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="px-4 py-4 bg-background/60 backdrop-blur-xl border border-border rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {localNft.edition} <span className="text-muted-foreground ml-4">Edition</span>
                  </div>
                  <div className="px-4 py-4 bg-background/60 backdrop-blur-xl border border-border rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {localNft.minted || 0} <span className="text-muted-foreground ml-2">Minted / {localNft.supply || 0} Total</span>
                  </div>
                  <div className="px-4 py-4 bg-background/60 backdrop-blur-xl border border-border rounded-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {(localNft.supply || 0) - (localNft.minted || 0)} <span className="text-muted-foreground ml-2">Remaining</span>
                  </div>
                </div>

                {/* Live Auction Badge */}
                {isAuction && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/60 backdrop-blur-2xl border border-border px-4 py-4 rounded-[12px] flex items-center justify-between shadow-2xl flex-wrap gap-4">
                      <div className="flex items-center gap-4 px-4 py-4 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Live Auction Bidding Active</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Time Remaining</span>
                        <span className="text-[12px] font-black text-amber-500 uppercase tracking-widest">{timeRemaining || 'Loading...'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware-style Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'BPM', val: associatedTrack?.bpm || '128', icon: Activity, color: 'text-blue-500' },
                { label: 'KEY', val: associatedTrack?.key || 'C#m', icon: MusicIcon, color: 'text-purple-500' },
                { label: 'BIT', val: associatedTrack?.bitrate || 'FLAC', icon: Zap, color: 'text-emerald-500' },
                { label: 'RANK', val: '#12', icon: Award, color: 'text-amber-500' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-md p-4 rounded-[2px] border border-white/5 relative overflow-hidden group transition-all hover:border-white/20 hover:bg-white/10">
                  <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')} opacity-40`}></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{stat.label}</p>
                    <stat.icon className={`h-3 w-3 ${stat.color} opacity-40`} />
                  </div>
                  <p className="text-base font-bold text-foreground tracking-tighter font-mono">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Price Analysis Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2px] p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Protocol Value Analysis</h3>
                </div>
                <div className="flex items-center gap-4 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Market Floor
                  </span>
                </div>
              </div>

              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistoryData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0a0a0a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">All Time High</p>
                  <p className="text-sm font-bold text-foreground font-mono">{(parseFloat(localNft.price) * 2.4).toFixed(2)} TON</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Protocol Velocity</p>
                  <p className="text-sm font-bold text-emerald-500 font-mono">+12.4%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Identity & Action */}
          <div className="lg:col-span-7 flex flex-col">
            <header className="mb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-4 cursor-pointer group/creator" onClick={() => {
                  const artist = MOCK_ARTISTS.find(a => a.name === localNft.creator);
                  if (artist) navigate(`/artist/${artist.uid}`);
                }} >
                  <div className="relative w-10 h-10">
                    <img src={MOCK_ARTISTS.find(a => a.name === localNft.creator)?.avatarUrl || getPlaceholderImage(`artist-${localNft.creator}`)} className="w-full h-full rounded-full object-cover" alt="" />
                    {MOCK_ARTISTS.find(a => a.name === localNft.creator)?.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    )}
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
                    const artist = MOCK_ARTISTS.find(a => a.walletAddress === localNft.owner || a.name === localNft.owner);
                    if (artist) navigate(`/artist/${artist.uid}`);
                  }
                }} >
                  <div className="relative w-10 h-10">
                    <div className="w-full h-full rounded-full bg-muted/50 flex items-center justify-center transition-all group-hover/owner:bg-muted">
                      {MOCK_ARTISTS.find(a => a.walletAddress === localNft.owner || a.name === localNft.owner) ? (
                        <img 
                          src={MOCK_ARTISTS.find(a => a.walletAddress === localNft.owner || a.name === localNft.owner)?.avatarUrl} 
                          className="w-full h-full rounded-full object-cover" 
                          alt="" 
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground group-hover/owner:text-foreground" />
                      )}
                    </div>
                    {(MOCK_ARTISTS.find(a => a.walletAddress === localNft.owner || a.name === localNft.owner)?.verified || (localNft.owner === userProfile.walletAddress && userProfile.isVerified)) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Current Owner</span>
                    <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-tight group-hover:text-foreground transition-colors">
                      {isOwner ? 'You (Vault)' : localNft.owner ? `${localNft.owner.slice(0, 6)}...${localNft.owner.slice(-4)}` : 'Unknown'}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 text-[8px] uppercase tracking-widest">Holders</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["Wallet 1", "Wallet 2", "Wallet 3"].map(h => <DropdownMenuItem key={h} className="text-[8px] uppercase">{h}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h1 className="text-[24px] md:text-[36px] font-bold tracking-tighter uppercase text-foreground leading-[1] mb-2">{localNft.title}</h1>
              
              <ReactionsSection targetId={localNft.id} targetType="nft" />

              <div className="flex items-center justify-between py-4 mt-2">
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
            <div className="bg-white/5 backdrop-blur-xl rounded-[2px] p-8 mb-4 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12 pointer-events-none group-hover:rotate-[30deg] transition-transform duration-1000"><Zap className="h-64 w-64 text-blue-500" /></div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAuction ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                      {isAuction ? 'Current Highest Bid' : 'Valuation Protocol'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[48px] md:text-[64px] font-black text-foreground tracking-tighter leading-none">
                      {isAuction ? (highestOfferPrice > 0 ? highestOfferPrice : (localNft.startingBid || localNft.price)) : localNft.price}
                    </span>
                    <span className="text-[18px] font-black text-blue-500 uppercase tracking-tighter">TON</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                      ≈ ${(parseFloat(localNft.price) * 5.2).toLocaleString()} USD
                    </p>
                    <div className="h-px w-8 bg-white/10"></div>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">+12.4% Vol</p>
                  </div>
                </div>

                {isAuction && (
                  <div className="flex flex-col gap-1.5 bg-white/5 backdrop-blur-md p-3 rounded-[2px] border border-white/10 text-right min-w-[200px] shadow-lg">
                    <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-widest text-muted-foreground/60">
                       <span>Highest Bid</span>
                       <span className="flex items-center gap-0.5"><Clock className="h-2 w-2" /> Time Remaining</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-black tracking-tighter">
                       <span className="text-foreground">{highestOfferPrice} <span className="text-[8px] font-bold text-muted-foreground">TON</span></span>
                       <span className="text-amber-500 tabular-nums">{timeRemaining || '00:00:00'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 relative z-10">
                {isOwner ? (
                  <>
                    <button onClick={() => localNft.listingType ? setShowManageModal(true) : setShowListModal(true)} className="flex-1 py-3 bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all border border-blue-400/20" >
                      {localNft.listingType ? 'Manage' : 'Sell'}
                    </button>
                    <button onClick={() => setShowSendModal(true)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10" >
                      <Send className="h-3.5 w-3.5" /> Send
                    </button>
                    {localNft.listingType && (
                      <button onClick={handleCancelListing} className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-white/10 hover:border-red-500/20" >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {isAuction ? (
                      <div className="flex-[2] flex gap-2">
                        <input
                          type="number"
                          value={inlineBidAmount}
                          onChange={(e) => setInlineBidAmount(e.target.value)}
                          placeholder={`${minNextBid}+`}
                          className="w-1/4 bg-white/5 border border-white/10 rounded-[2px] px-3 text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-amber-500 transition-all text-xs"
                        />
                        <button 
                          onClick={handleInlineBid} 
                          disabled={isPlacingBid || isAuctionEnded}
                          className={cn(
                            "flex-1 py-3 rounded-[2px] font-bold text-[9px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl border flex items-center justify-center gap-2",
                            isAuctionEnded 
                              ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed" 
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10 border-orange-400/20"
                          )}
                        >
                          {isPlacingBid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isAuctionEnded ? 'EXPIRED' : 'Place Bid'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={handleAction} className="flex-[2] py-3 rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl border bg-[linear-gradient(90deg,#007AFF_0%,#00C6FF_100%)] hover:opacity-90 text-white shadow-blue-600/20 border-blue-400/20" >
                        {isAuction ? 'Place Bid' : 'Acquire Asset'}
                      </button>
                    )}
                    {!isAuction && (
                      <button onClick={() => setShowOfferModal(true)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-white/10" >
                        Offer
                      </button>
                    )}
                    {userOffer && (
                      <button onClick={handleCancelBid} className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-red-500/20" >
                        Retract
                      </button>
                    )}
                    <button 
                      onClick={() => setIsTipping(true)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[2px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                      <Coins className="h-3.5 w-3.5 text-blue-400" /> Support
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
              {['details', 'history', 'offers', 'comments', ...(isOwner && localNft.exclusiveContent?.length ? ['exclusive'] : [])].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-muted-foreground/50 hover:text-foreground'}`}>
                  {tab === 'exclusive' ? 'Holder Perks' : tab}
                  {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></motion.div>}
                </button>
              ))}
            </div>
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                   >
                    {metadataError && (
                      <div className="col-span-full p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-[16px] flex items-center justify-between">
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
                    
                    {dynamicMetadata && dynamicMetadata.traits && (
                      <div className="col-span-full space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20"></div>
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">On-Chain DNA Attributes</h4>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {dynamicMetadata.traits.map((trait) => (
                            <div key={trait.trait_type} className="bg-white/[0.03] border border-white/5 p-6 rounded-[20px] hover:border-blue-500/30 transition-all group">
                              <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-4">{trait.trait_type}</span>
                              <span className="text-sm font-black text-foreground tracking-tight uppercase">{trait.value}</span>
                              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-2/3 group-hover:w-full transition-all duration-1000"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="col-span-full md:col-span-2 space-y-4">
                      <div className="p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[24px]">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                          Protocol Distribution
                        </h4>
                        <div className="space-y-6">
                          {localNft.royaltySplits && localNft.royaltySplits.length > 0 ? (
                            localNft.royaltySplits.map((split, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-foreground uppercase tracking-widest">{split.label || 'Collaborator'}</span>
                                  <span className="text-sm font-black text-emerald-500">{(split.percentage * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${split.percentage * 100}%` }}
                                    className="h-full bg-emerald-500"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Standard 100% Creator Share Protocol Active</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full md:col-span-1 space-y-4">
                       <div className="p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[24px] h-full flex flex-col justify-center">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                            Provenance
                          </h4>
                          <div className="space-y-6">
                             <div className="flex flex-col gap-2">
                               <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Minted Date</span>
                               <span className="text-sm font-black text-foreground uppercase tracking-tight">OCT 14, 2023</span>
                             </div>
                             <div className="flex flex-col gap-2">
                               <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Standard</span>
                               <span className="text-sm font-black text-purple-500 uppercase tracking-tight">TON NFT-v2</span>
                             </div>
                             <div className="flex flex-col gap-2">
                               <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Relay Layer</span>
                               <span className="text-sm font-black text-foreground uppercase tracking-tight">Global Consensus</span>
                             </div>
                          </div>
                       </div>
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
                    {[...(localNft.history || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                      <div key={`history-${i}`} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[24px] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
                        {/* Hardware scanline effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        
                        <div className="flex items-center gap-6 relative z-10">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                            h.event === 'Minted' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            {h.event === 'Minted' ? <Wand2 className="h-6 w-6" /> : <Handshake className="h-6 w-6" />}
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                              {h.event}
                              <div className={cn("w-1.5 h-1.5 rounded-full", h.event === 'Minted' ? "bg-blue-500" : "bg-emerald-500")}></div>
                            </span>
                            <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              <span>Layer_Protocol: {h.event === 'Minted' ? 'MINT' : 'TRANSFER'}</span>
                              <div className="h-px w-4 bg-white/10"></div>
                              <span>{h.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-12 relative z-10">
                          <div className="text-right hidden md:block">
                            <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-2">Sync_Origin</p>
                            <span className="text-[11px] font-mono text-primary font-black uppercase tracking-widest">
                               {h.from === 'Vault' ? 'GENESIS_VAULT' : `@${(h.from || '').slice(0, 8)}`}
                            </span>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-2">Recipient_Node</p>
                             <span className="text-[11px] font-mono text-primary font-black uppercase tracking-widest">@{(h.to || '').slice(0, 8)}</span>
                             {h.price && (
                               <div className="flex items-center justify-end gap-2 mt-2">
                                  <span className="text-xl font-black text-foreground tracking-tighter">{h.price}</span>
                                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">TON</span>
                               </div>
                             )}
                          </div>
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
                      localNft.offers.map((o) => {
                        const isTopBid = parseFloat(o.price) === highestOfferPrice;
                        return (
                          <div key={o.id} className={`group p-6 bg-white/[0.02] border transition-all rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.04] ${isTopBid ? (isAuction ? 'border-amber-500/50 bg-amber-500/[0.05]' : 'border-blue-500/50 bg-blue-500/[0.05]') : 'border-white/5 opacity-80 hover:opacity-100'}`} >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className="relative">
                                <div className={`w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl`}>
                                  <img src={`https://picsum.photos/100/100?seed=${o.offerer}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                </div>
                                {isTopBid && (
                                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-black ${isAuction ? 'bg-amber-500' : 'bg-blue-500'} shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
                                    <Crown className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 min-w-0">
                                <div className="flex items-center gap-4">
                                  <span className="text-base font-black text-foreground uppercase tracking-tight truncate max-w-[200px]">
                                    @{(o.offerer || '').slice(0, 8)}...
                                  </span>
                                  {isTopBid && (
                                    <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${isAuction ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`}>Top Signal</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{o.timestamp}</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Exp: {o.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                              <div className="text-right">
                                <div className="flex items-center gap-4">
                                  <span className={`text-[32px] font-black tracking-tighter ${isTopBid ? (isAuction ? 'text-amber-500' : 'text-blue-500') : 'text-muted-foreground/80'}`}>
                                    {o.price}
                                  </span>
                                  <div className="flex flex-col items-center">
                                    <img src={TON_LOGO} className={`w-8 h-8 ${isTopBid ? 'opacity-100 shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'opacity-20 grayscale'}`} alt="" />
                                    <span className="text-[8px] font-black text-muted-foreground/30 uppercase mt-1">TON</span>
                                  </div>
                                </div>
                              </div>
                              {isOwner ? (
                                <div className="flex gap-2">
                                  {o.offerer !== localNft.owner && (
                                    <button onClick={() => handleAcceptOffer(o)} className={`h-14 px-6 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 ${isAuction ? 'bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`} >
                                      <Check className="h-4 w-4" /> ACCEPT
                                    </button>
                                  )}
                                  <button onClick={() => handleDeclineOffer(o.offerer)} className="w-14 h-14 bg-white/5 text-muted-foreground rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5" >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isTopBid ? (isAuction ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(0,122,255,0.2)]') : 'bg-white/5 text-muted-foreground/20 border-white/5'}`}>
                                  {isTopBid ? <Zap className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
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
  
                {activeTab === 'comments' && (
                  <motion.div 
                    key="comments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <CommentsSection targetId={localNft.id} targetType="nft" />
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
              <div className="flex items-center gap-2">
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 gap-2">
                  <button 
                    onClick={() => setRelatedSort('default')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border-2",
                      relatedSort === 'default' 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-400/50" 
                        : "text-muted-foreground hover:text-foreground bg-white/5 border-blue-500/30 hover:bg-white/10"
                    )}
                  >
                    Default
                  </button>
                  <button 
                    onClick={() => setRelatedSort('bids')}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-2",
                      relatedSort === 'bids' 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-400/50" 
                        : "text-muted-foreground hover:text-foreground bg-white/5 border-blue-500/30 hover:bg-white/10"
                    )}
                  >
                    <ArrowUpDown className="h-3 w-3" /> Most Bids
                  </button>
                </div>
                <button onClick={() => navigate('/explore/nfts?title=Related Vibes')} className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-foreground uppercase tracking-[0.3em] transition-all flex items-center group" >
                  EXPLORE GENRE <ChevronRight className="ml-4 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
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
      {showOfferModal && <PlaceOfferModal nft={localNft} onClose={() => setShowOfferModal(false)} />}
      {showListModal && <SellNFTModal nft={localNft} onClose={() => setShowListModal(false)} />}
      {showBidModal && <BidModal nft={localNft} onClose={() => setShowBidModal(false)} />}
      {showSendModal && <SendNFTModal nft={localNft} isOpen={showSendModal} onClose={() => setShowSendModal(false)} />}
      {showManageModal && <ManageNFTModal nft={localNft} isOpen={showManageModal} onClose={() => setShowManageModal(false)} />}
      {selectedOffer && (
        <BidAcceptanceModal nft={localNft} offer={selectedOffer} onClose={() => setSelectedOffer(null)} onAccept={onConfirmAcceptance} />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isCancelListingConfirmOpen}
        onClose={() => setIsCancelListingConfirmOpen(false)}
        onConfirm={confirmCancelListing}
        title="Cancel Listing?"
        description="Are you sure you want to cancel this listing? The asset will be returned to your vault."
        confirmText="Cancel Listing"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToDecline}
        onClose={() => setOfferToDecline(null)}
        onConfirm={confirmDeclineOffer}
        title="Decline Offer?"
        description={`Are you sure you want to decline the offer from ${offerToDecline}?`}
        confirmText="Decline Offer"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!offerToAccept}
        onClose={() => setOfferToAccept(null)}
        onConfirm={confirmAcceptOffer}
        title="Accept Offer?"
        description={`Are you sure you want to accept the offer of ${offerToAccept?.price} TON from ${offerToAccept?.offerer}? This will transfer ownership of the NFT.`}
        confirmText="Accept Offer"
      />

      <ConfirmationModal
        isOpen={isCancelBidConfirmOpen}
        onClose={() => setIsCancelBidConfirmOpen(false)}
        onConfirm={confirmCancelBid}
        title="Withdraw Bid?"
        description={`Are you sure you want to withdraw your bid for "${localNft?.title}"? This will remove your signal from the relay network.`}
        confirmText="Withdraw Bid"
        variant="destructive"
      />
    </div>
  );
};

export default NFTDetail;
