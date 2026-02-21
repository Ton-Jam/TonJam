import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_NFTS, MOCK_USER, MOCK_TRACKS, TON_LOGO } from '../constants';
import { useAudio } from '../context/AudioContext';
import { NFTItem, Track } from '../types';
import { generateNFTLore } from '../services/geminiService';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import BuyNFTModal from '../components/BuyNFTModal';
import SellNFTModal from '../components/SellNFTModal';
import BidModal from '../components/BidModal';

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, currentTrack, isPlaying, playTrack } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [localNft, setLocalNft] = useState<NFTItem | null>(null);
  const [associatedTrack, setAssociatedTrack] = useState<Track | null>(null);
  const [lore, setLore] = useState<string>('');
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers'>('details');
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    const nft = MOCK_NFTS.find(n => n.id === id);
    if (nft) {
      setLocalNft(nft);
      setAssociatedTrack(MOCK_TRACKS.find(t => t.id === nft.trackId) || null);
    }
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!localNft?.auctionEndTime) return;

    const timer = setInterval(() => {
      const end = new Date(localNft.auctionEndTime!).getTime();
      const now = new Date().getTime();
      const diff = end - now;

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
    return MOCK_NFTS.filter(n => n.creator === localNft.creator && n.id !== localNft.id).slice(0, 4);
  }, [localNft]);

  const relatedNfts = useMemo(() => {
    if (!localNft || !associatedTrack) return [];
    const relatedTrackIds = MOCK_TRACKS
      .filter(t => t.genre === associatedTrack.genre)
      .map(t => t.id);
    
    return MOCK_NFTS.filter(n => relatedTrackIds.includes(n.trackId) && n.id !== localNft.id).slice(0, 4);
  }, [localNft, associatedTrack]);

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

  const handleAcceptOffer = (offerer: string, price: string) => {
    addNotification(`Accepting offer: ${price} TON from ${offerer}`, "info");
    setTimeout(() => {
        addNotification("Asset ownership transfer protocol complete.", "success");
        navigate('/profile');
    }, 2000);
  };

  const handleDeclineOffer = (offerer: string) => {
    addNotification(`Offer from ${offerer} rejected.`, "info");
  };

  const handleGenerateLore = async () => {
    setIsGeneratingLore(true);
    addNotification("Syncing digital archives...", "info");
    try {
      const result = await generateNFTLore(localNft);
      setLore(result);
      addNotification("Origin retrieved.", "success");
    } catch (e: any) {
      addNotification("Archive retrieval failed.", "error");
    } finally {
      setIsGeneratingLore(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500 bg-black">
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-blue-400 mb-6 transition-all group"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> BACK
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Artwork */}
          <div className="space-y-6">
            <div className="relative group cursor-pointer" onClick={handlePlayClick}>
              <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-xl bg-[#0a0a0a]">
                <img src={localNft.imageUrl} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-105" alt={localNft.title} />
                <div className={`absolute inset-0 flex items-center justify-center bg-blue-600/5 backdrop-blur-[1px] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="w-14 h-14 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl border-2 border-white/20 active:scale-90 transition-all">
                    <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-lg`}></i>
                  </div>
                </div>
                <div className="absolute top-6 left-6">
                   <div className="px-4 py-2 glass rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/80">
                     {localNft.edition} Edition
                   </div>
                </div>
                {isAuction && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex justify-between items-center shadow-2xl backdrop-blur-2xl">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        Live Auction
                      </span>
                      <span className="text-sm font-black text-white tracking-tighter">{timeLeft}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               {[
                 { label: 'BPM', val: associatedTrack?.bpm || '128' },
                 { label: 'KEY', val: associatedTrack?.key || 'C#m' },
                 { label: 'BIT', val: associatedTrack?.bitrate || 'FLAC' }
               ].map((stat, i) => (
                 <div key={i} className="glass py-4 rounded-2xl border border-white/5 text-center shadow-inner">
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1.5">{stat.label}</p>
                    <p className="text-sm font-black text-white tracking-tighter">{stat.val}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Column: Info & Action */}
          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <img src={`https://picsum.photos/100/100?seed=${localNft.creator}`} className="w-8 h-8 rounded-full border border-blue-500/30" alt="" />
                <p className="text-blue-500 font-black text-xs uppercase tracking-widest">{localNft.creator}</p>
                <i className="fas fa-check-circle text-[10px] text-blue-500"></i>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none mb-3">{localNft.title}</h1>
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">UID: {localNft.id.toUpperCase()}</p>
            </header>

            {/* DEDICATED BIDDING SECTION */}
            {isAuction ? (
              <div className="glass p-10 rounded-[3rem] border-amber-500/20 border-2 mb-10 bg-amber-500/[0.02] shadow-[0_0_80px_rgba(245,158,11,0.05)] animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_#f59e0b]"></div>
                  <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">Auction Protocol Active</h3>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-10">
                  <div className="space-y-2 border-r border-white/10">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Highest Bid</p>
                    <div className="flex items-center gap-3">
                      <img src={TON_LOGO} className="w-6 h-6" alt="" />
                      <span className="text-4xl font-black text-white tracking-tighter">{localNft.price}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Min Step</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-2xl font-black text-amber-500 tracking-tighter">+{minNextBid}</span>
                      <span className="text-[9px] font-black text-white/20">TON</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAction}
                  className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl shadow-amber-500/20"
                >
                  {isOwner ? 'MANAGE AUCTION' : 'PLACE BID NOW'}
                </button>
              </div>
            ) : (
              <div className="glass p-10 rounded-[3rem] border-blue-500/20 border-2 mb-10 bg-[#0a0a0a] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Fixed Valuation</p>
                    <div className="flex items-center gap-3">
                      <img src={TON_LOGO} className="w-7 h-7" alt="" />
                      <span className="text-5xl font-black text-white tracking-tighter">{localNft.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Instant Sync</p>
                    <div className="mt-2 w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 ml-auto">
                        <i className="fas fa-bolt text-blue-500 text-sm"></i>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAction}
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl ${isOwner ? 'bg-white/5 border border-white/10 text-white/60 hover:text-white' : 'electric-blue-bg text-white shadow-blue-500/30'}`}
                >
                  {isOwner ? 'MANAGE LISTING' : 'PURCHASE ASSET'}
                </button>
              </div>
            )}

            {/* AI Lore Section */}
            <div className="mb-10 glass p-8 rounded-[2.5rem] border-white/5 border relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                  <i className="fas fa-scroll text-5xl"></i>
               </div>
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Origin Narrative</h3>
                  {!lore && (
                    <button onClick={handleGenerateLore} disabled={isGeneratingLore} className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white flex items-center gap-2 transition-colors">
                      {isGeneratingLore ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-sparkles"></i>}
                      RECONSTRUCT
                    </button>
                  )}
               </div>
               <p className="text-sm text-white/60 leading-relaxed font-medium relative z-10 border-l border-blue-500/30 pl-6">
                  {lore || "Manual reconstruction required to reveal this asset's digital lineage and temporal origin."}
               </p>
            </div>

            {/* Information Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 mb-8">
              {['details', 'history', 'offers'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-blue-400' : 'text-white/30 hover:text-white'}`}>
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 electric-blue-bg rounded-full"></div>}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left duration-500">
                  {localNft.traits?.map((trait, i) => (
                    <div key={i} className="p-5 glass rounded-2xl border border-white/5 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40">{trait.trait_type}</span>
                      <span className="text-[11px] font-black text-white tracking-tight">{trait.value}</span>
                    </div>
                  ))}
                  <div className="p-5 glass rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Asset Class</span>
                    <span className="text-[11px] font-black text-white tracking-tight">{localNft.edition}</span>
                  </div>
                  <div className="p-5 glass rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Royalties</span>
                    <span className="text-[11px] font-black text-blue-500 tracking-tight">{localNft.royalty}%</span>
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right duration-500">
                  {localNft.history?.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-5 glass rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                           <i className={`fas ${h.event === 'Minted' ? 'fa-magic' : 'fa-handshake'} text-white/30 text-xs`}></i>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white uppercase tracking-tight">{h.event}</span>
                          <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">{h.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-blue-500 group-hover:text-white transition-colors">@{h.to}</span>
                        {h.price && <p className="text-[11px] text-white font-black mt-1">{h.price} TON</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'offers' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
                  {localNft.offers && localNft.offers.length > 0 ? (
                    localNft.offers.map((o, i) => (
                      <div 
                        key={i} 
                        className={`group p-6 glass rounded-[2.5rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isAuction ? 'border-amber-500/10 hover:border-amber-500/30' : 'border-white/5 hover:border-blue-500/30'}`}
                      >
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-[#080808] border border-white/10 flex items-center justify-center overflow-hidden">
                               <img src={`https://picsum.photos/100/100?seed=${o.offerer}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-black">
                               <i className="fas fa-check text-[7px] text-white"></i>
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-white uppercase tracking-tight truncate w-32 md:w-40">
                              {o.offerer}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                               <i className="far fa-clock text-[8px] text-white/30"></i>
                               <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Expires in {o.duration}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-2xl font-black tracking-tighter ${isAuction ? 'text-amber-500' : 'text-blue-500'}`}>
                                {o.price}
                              </span>
                              <img src={TON_LOGO} className="w-5 h-5 opacity-80" alt="" />
                            </div>
                            <p className="text-[7px] font-black text-white/10 uppercase tracking-widest mt-0.5">Valuation Protocol</p>
                          </div>

                          {isOwner ? (
                            <div className="flex gap-2">
                               <button 
                                onClick={() => handleAcceptOffer(o.offerer, o.price)}
                                className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl shadow-blue-500/20"
                                title="Accept Protocol"
                               >
                                  <i className="fas fa-check"></i>
                               </button>
                               <button 
                                onClick={() => handleDeclineOffer(o.offerer)}
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                                title="Reject Protocol"
                               >
                                  <i className="fas fa-times"></i>
                               </button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/10">
                               <i className="fas fa-arrow-right-to-bracket text-xs"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center glass rounded-[3.5rem] border-2 border-dashed border-white/5 text-center px-12">
                      <div className="w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-8">
                        <i className="fas fa-satellite-dish text-white/10 text-3xl animate-pulse"></i>
                      </div>
                      <h4 className="text-lg font-black text-white/40 uppercase tracking-tighter mb-2">Signal Mismatch</h4>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] leading-loose max-w-xs mx-auto">Zero active valuation signals detected from the neural relay network.</p>
                      <button onClick={handleAction} className="mt-8 px-10 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">Initiate Broadcast</button>
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
                <h2 className="text-2xl font-black tracking-tighter uppercase text-white">More from {localNft.creator}</h2>
              </div>
              <button 
                onClick={() => navigate(`/artist/${localNft.creator}`)}
                className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-blue-400 transition-colors"
              >
                VIEW ALL <i className="fas fa-chevron-right ml-2 text-[8px]"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {moreFromCreator.map((nft) => (
                <div 
                  key={nft.id} 
                  onClick={() => navigate(`/nft/${nft.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a] mb-4">
                    <img src={nft.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={nft.title} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <i className="fas fa-eye text-white text-xs"></i>
                       </div>
                    </div>
                    <div className="absolute top-3 right-3">
                       <div className="px-2 py-1 glass rounded-lg text-[7px] font-black uppercase tracking-widest text-white/80">
                         {nft.price} TON
                       </div>
                    </div>
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">{nft.title}</h3>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{nft.edition} Edition</p>
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
                <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Related {associatedTrack?.genre} Vibes</h2>
              </div>
              <button 
                onClick={() => navigate('/marketplace')}
                className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-amber-400 transition-colors"
              >
                EXPLORE GENRE <i className="fas fa-chevron-right ml-2 text-[8px]"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedNfts.map((nft) => (
                <div 
                  key={nft.id} 
                  onClick={() => navigate(`/nft/${nft.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a] mb-4">
                    <img src={nft.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={nft.title} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <i className="fas fa-search text-white text-xs"></i>
                       </div>
                    </div>
                    <div className="absolute top-3 right-3">
                       <div className="px-2 py-1 glass rounded-lg text-[7px] font-black uppercase tracking-widest text-white/80">
                         {nft.price} TON
                       </div>
                    </div>
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-amber-400 transition-colors">{nft.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{nft.creator}</span>
                    <i className="fas fa-check-circle text-[7px] text-blue-500/50"></i>
                  </div>
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
    </div>
  );
};

export default NFTDetail;