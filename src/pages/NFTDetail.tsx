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
  ChevronRight 
} from 'lucide-react';

import { MOCK_NFTS, MOCK_USER, MOCK_TRACKS, TON_LOGO, MOCK_ARTISTS, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { NFTItem, Track, NFTOffer } from '@/types';
import { generateNFTLore } from '@/services/geminiService';
import { fetchNFTMetadata } from '@/services/nftService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import BuyNFTModal from '@/components/BuyNFTModal';
import SellNFTModal from '@/components/SellNFTModal';
import BidModal from '@/components/BidModal';
import BidAcceptanceModal from '@/components/BidAcceptanceModal';
import NFTCard from '@/components/NFTCard';

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, currentTrack, isPlaying, playTrack, allNFTs, updateNFT } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const localNft = useMemo(() => {
    return allNFTs.find(n => n.id === id) || null;
  }, [id, allNFTs]);

  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [lore, setLore] = useState<string>('');
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers'>('details');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  /* Modal states */
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<NFTOffer | null>(null);

  useEffect(() => {
    if (localNft) {
      setAssociatedTrack(MOCK_TRACKS.find(t => t.id === localNft.trackId) || null);
      /* Fetch dynamic metadata */
      if (localNft.contractAddress) {
        setIsFetchingMetadata(true);
        fetchNFTMetadata(localNft.contractAddress)
          .then(metadata => {
            if (!metadata) return;
            // Note: We don't update state here directly because localNft is derived from allNFTs
            // In a real app, we'd trigger an updateNFT call if metadata changed significantly
          })
          .catch(err => console.error("Failed to fetch metadata", err))
          .finally(() => setIsFetchingMetadata(false));
      }
    }
    window.scrollTo(0, 0);
  }, [id, localNft]);

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
    const currentWallet = userAddress || MOCK_USER.walletAddress;
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

  if (!localNft) return null;

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

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-blue-400 mb-6 transition-all group" >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> BACK
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Artwork */}
          <div className="space-y-6">
            <div className="relative group cursor-pointer" onClick={handlePlayClick}>
              <div className="relative aspect-square rounded-[10px] overflow-hidden shadow-xl bg-[#0a0a0a]">
                <img src={localNft.imageUrl} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-105" alt={localNft.title} />
                <div className={`absolute inset-0 flex items-center justify-center bg-blue-600/5 backdrop-blur-[1px] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="w-14 h-14 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                    {isActive && isPlaying ? (
                      <Pause className="h-6 w-6 text-white fill-current" />
                    ) : (
                      <Play className="h-6 w-6 text-white fill-current ml-1" />
                    )}
                  </div>
                </div>
                <div className="absolute top-6 left-6">
                  <div className="px-4 py-2 glass rounded-[10px] text-[9px] font-bold uppercase tracking-widest text-white/80">
                    {localNft.edition} Edition
                  </div>
                </div>
                {isAuction && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass px-6 py-4 rounded-[10px] flex justify-between items-center shadow-2xl backdrop-blur-2xl">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Live Auction
                      </span>
                      <span className="text-sm font-bold text-white tracking-tighter">{timeLeft}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'BPM', val: associatedTrack?.bpm || '128' },
                { label: 'KEY', val: associatedTrack?.key || 'C#m' },
                { label: 'BIT', val: associatedTrack?.bitrate || 'FLAC' },
                { label: 'RELEASE', val: associatedTrack?.releaseDate || '2023-10-01' }
              ].map((stat, i) => (
                <div key={i} className="glass py-4 rounded-[10px] text-center shadow-inner">
                  <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5">{stat.label}</p>
                  <p className="text-sm font-bold text-white tracking-tighter">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info & Action */}
          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 cursor-pointer group/creator" onClick={() => {
                  const artist = MOCK_ARTISTS.find(a => a.name === localNft.creator);
                  if (artist) navigate(`/artist/${artist.id}`);
                }} >
                  <div className="relative">
                    <img src={`https://picsum.photos/100/100?seed=${localNft.creator}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-blue-500 font-bold text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">{localNft.creator}</p>
                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                </div>
                {!isOwner && (
                  <div className="flex items-center gap-2 cursor-pointer group/owner pl-4" onClick={() => {
                    const artist = MOCK_ARTISTS.find(a => a.name === localNft.owner);
                    if (artist) {
                      navigate(`/artist/${artist.id}`);
                    } else if (localNft.owner === MOCK_USER.walletAddress) {
                      navigate('/profile');
                    }
                  }} >
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center transition-all">
                      <User className="h-3 w-3 text-white/40 group-hover/owner:text-blue-400" />
                    </div>
                    <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">Owner: {localNft.owner.slice(0, 6)}...{localNft.owner.slice(-4)}</p>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white leading-none mb-3">{localNft.title}</h1>
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em]">UID: {localNft.id.toUpperCase()}</p>
                {localNft.contractAddress && (
                  <a href={`https://tonviewer.com/${localNft.contractAddress}`} target="_blank" rel="noreferrer" className="text-[8px] font-bold text-blue-500/40 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1.5" >
                    <ExternalLink className="h-3 w-3" /> View on Explorer
                  </a>
                )}
              </div>
            </header>

            {/* BIDDING SECTION */}
            {isAuction ? (
              <div className="glass p-10 rounded-[10px] mb-10 bg-amber-500/[0.02] shadow-[0_0_80px_rgba(245,158,11,0.05)] animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_#f59e0b]"></div>
                  <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.5em]">Auction Protocol Active</h3>
                </div>
                <div className="grid grid-cols-2 gap-10 mb-10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Highest Bid</p>
                    <div className="flex items-center gap-3">
                      <img src={TON_LOGO} className="w-6 h-6" alt="" />
                      <span className="text-4xl font-bold text-white tracking-tighter">{localNft.price}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Min Step</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-2xl font-bold text-amber-500 tracking-tighter">+{minNextBid}</span>
                      <span className="text-[9px] font-bold text-white/20">TON</span>
                    </div>
                  </div>
                </div>
                {isOwner ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setShowListModal(true)} className={`flex-1 py-5 rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl ${localNft.listingType ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10' : 'electric-blue-bg text-white shadow-blue-500/20'}`} >
                      {localNft.listingType ? 'MANAGE AUCTION' : 'LIST'}
                    </button>
                    <button onClick={handleCancelListing} className="flex-1 py-5 bg-white/5 text-white/60 hover:text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all" >
                      CANCEL LISTING
                    </button>
                  </div>
                ) : (
                  <button onClick={handleAction} className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-black rounded-[10px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-amber-500/20" >
                    PLACE BID NOW
                  </button>
                )}
              </div>
            ) : (
              <div className="glass p-10 rounded-[10px] mb-10 bg-[#0a0a0a] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Fixed Valuation</p>
                    <div className="flex items-center gap-3">
                      <img src={TON_LOGO} className="w-7 h-7" alt="" />
                      <span className="text-5xl font-bold text-white tracking-tighter">{localNft.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Instant Sync</p>
                    <div className="mt-2 w-10 h-10 bg-blue-500/10 rounded-[10px] flex items-center justify-center ml-auto">
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </div>
                {isOwner ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setShowListModal(true)} className={`flex-1 py-5 rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl electric-blue-bg text-white shadow-blue-500/20`} >
                      {localNft.listingType ? 'MANAGE LISTING' : 'LIST'}
                    </button>
                    <button onClick={handleCancelListing} className="flex-1 py-5 bg-white/5 text-white/60 hover:text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all" >
                      CANCEL LISTING
                    </button>
                  </div>
                ) : (
                  <button onClick={handleAction} className="w-full py-6 electric-blue-bg text-white rounded-[10px] font-bold text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-blue-500/30" >
                    BUY ASSET
                  </button>
                )}
              </div>
            )}

            {/* AI Lore Section */}
            <div className="mb-10 glass p-8 rounded-[10px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <ScrollText className="h-12 w-12" />
              </div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Origin Narrative</h3>
                {!lore && (
                  <button onClick={handleGenerateLore} disabled={isGeneratingLore} className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-white flex items-center gap-2 transition-colors">
                    {isGeneratingLore ? <img src={APP_LOGO} className="w-3 h-3 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." /> : <Sparkles className="h-3 w-3" />} RECONSTRUCT
                  </button>
                )}
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-medium relative z-10 pl-6">
                {lore || "Manual reconstruction required to reveal this asset's digital lineage and temporal origin."}
              </p>
            </div>

            {/* Information Tabs */}
            <div className="flex items-center gap-8 mb-8">
              {['details', 'history', 'offers'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-blue-400' : 'text-white/30 hover:text-white'}`}>
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 electric-blue-bg rounded-full"></div>}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left duration-500">
                  {localNft.traits?.map((trait, i) => (
                    <div key={i} className="p-5 glass rounded-[10px] flex justify-between items-center group transition-all">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">{trait.trait_type}</span>
                      <span className="text-[11px] font-bold text-white tracking-tight">{trait.value}</span>
                    </div>
                  ))}
                  <div className="p-5 glass rounded-[10px] flex justify-between items-center">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Asset Class</span>
                    <span className="text-[11px] font-bold text-white tracking-tight">{localNft.edition}</span>
                  </div>
                  <div className="p-5 glass rounded-[10px] flex justify-between items-center">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Royalties</span>
                    <span className="text-[11px] font-bold text-blue-500 tracking-tight">{localNft.royalty}%</span>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right duration-500">
                  {localNft.history?.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-5 glass rounded-[10px] hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center">
                          {h.event === 'Minted' ? (
                            <Wand2 className="h-4 w-4 text-white/30" />
                          ) : (
                            <Handshake className="h-4 w-4 text-white/30" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white uppercase tracking-tight">{h.event}</span>
                          <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{h.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-blue-500 group-hover:text-white transition-colors">@{h.to}</span>
                        {h.price && <p className="text-[11px] text-white font-bold mt-1">{h.price} TON</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'offers' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
                  {localNft.offers && localNft.offers.length > 0 ? (
                    localNft.offers.map((o, i) => {
                      const isTopBid = parseFloat(o.price) === highestOfferPrice;
                      return (
                        <div key={i} className={`group p-6 glass rounded-[10px] transition-all flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isTopBid ? (isAuction ? 'bg-amber-500/[0.02]' : 'bg-blue-500/[0.02]') : 'opacity-60 hover:opacity-100'}`} >
                          <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className="relative">
                              <div className={`w-14 h-14 rounded-full bg-[#080808] flex items-center justify-center overflow-hidden`}>
                                <img src={`https://picsum.photos/100/100?seed=${o.offerer}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="" />
                              </div>
                              {isTopBid ? (
                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center ${isAuction ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                  <Crown className="h-2 w-2 text-white" />
                                </div>
                              ) : (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-silver-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[120px] md:max-w-[160px]">
                                  {o.offerer}
                                </span>
                                {isTopBid ? (
                                  <span className={`text-[7px] px-1.5 py-0.5 rounded-[10px] font-bold uppercase tracking-widest ${isAuction ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>Top Bid</span>
                                ) : (
                                  <span className="text-[7px] px-1.5 py-0.5 rounded-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/40">Outbid</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-2 w-2 text-white/30" />
                                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{o.timestamp} • Expires in {o.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <div className="flex items-center gap-2.5">
                                <span className={`text-2xl font-bold tracking-tighter ${isTopBid ? (isAuction ? 'text-amber-500' : 'text-blue-500') : 'text-white/40'}`}>
                                  {o.price}
                                </span>
                                <img src={TON_LOGO} className={`w-5 h-5 ${isTopBid ? 'opacity-100' : 'opacity-40 grayscale'}`} alt="" />
                              </div>
                              <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Valuation Protocol</p>
                            </div>
                            {isOwner ? (
                              <div className="flex gap-2">
                                {o.offerer !== localNft.owner && (
                                  <button onClick={() => handleAcceptOffer(o)} className={`px-4 py-2 text-white rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 ${isAuction ? 'bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`} title="Accept Protocol" >
                                    <Check className="h-3 w-3" /> Accept Offer
                                  </button>
                                )}
                                <button onClick={() => handleDeclineOffer(o.offerer)} className="px-4 py-2 bg-white/5 text-white/40 rounded-[10px] font-bold text-[8px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2" title="Reject Protocol" >
                                  <X className="h-3 w-3" /> DECLINE
                                </button>
                              </div>
                            ) : (
                              <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center ${isTopBid ? (isAuction ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500') : 'bg-white/5 text-white/10'}`}>
                                {isTopBid ? (
                                  <Zap className="h-4 w-4" />
                                ) : (
                                  <LogIn className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center glass rounded-[10px] text-center px-12">
                      <div className="w-20 h-20 rounded-[10px] bg-white/[0.02] flex items-center justify-center mb-8">
                        <Satellite className="h-8 w-8 text-white/10 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold text-white/40 uppercase tracking-tighter mb-2">Signal Mismatch</h4>
                      <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] leading-loose max-w-xs mx-auto">Zero active valuation signals detected from the neural relay network.</p>
                      <button onClick={handleAction} className="mt-8 px-10 py-4 bg-white/5 rounded-[10px] text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all ">Initiate Broadcast</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More from Creator Section */}
        {moreFromCreator.length > 0 && (
          <div className="mt-32 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 electric-blue-bg rounded-full"></div>
                <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">More from {localNft.creator}</h2>
              </div>
              <button onClick={() => navigate(`/artist/${localNft.creator}`)} className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center" >
                VIEW ALL <ChevronRight className="ml-2 h-2 w-2" />
              </button>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
              {moreFromCreator.map((nft) => (
                <div key={nft.id} className="min-w-[240px] sm:min-w-[280px]">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related NFTs Section */}
        {relatedNfts.length > 0 && (
          <div className="mt-32 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-amber-500 rounded-full"></div>
                <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">Related {associatedTrack?.genre} Vibes</h2>
              </div>
              <button onClick={() => navigate('/marketplace')} className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center" >
                EXPLORE GENRE <ChevronRight className="ml-2 h-2 w-2" />
              </button>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
              {relatedNfts.map((nft) => (
                <div key={nft.id} className="min-w-[240px] sm:min-w-[280px]">
                  <NFTCard nft={nft} />
                </div>
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
