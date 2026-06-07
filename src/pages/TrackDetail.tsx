import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Zap, 
  Verified, 
  Share2, 
  Heart, 
  MoreHorizontal, 
  ShoppingCart, 
  Music2, 
  Disc, 
  Clock, 
  Activity,
  ExternalLink,
  Users,
  Coins,
  PlusCircle,
  Sparkles,
  Lock,
  Unlock,
  Volume2,
  Video,
  Image as ImageIcon,
  DownloadCloud,
  FileText,
  Loader2
} from 'lucide-react';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, TJ_COIN_ICON } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import TokenGate from '@/components/TokenGate';
import { useTokenGating } from '@/hooks/useTokenGating';
import CommentsSection from '@/components/CommentsSection';
import ReactionsSection from '@/components/ReactionsSection';

const TrackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    playTrack, currentTrack, isPlaying, jamTrack, purchaseTrack, mintNFT, 
    allTracks, allNFTs, likedTrackIds, toggleLikeTrack, addNotification, 
    setTrackToAddToPlaylist, setOptionsTrack, setFullPlayerOpen, userProfile,
    isTrackCached, downloadTrackForOffline, deleteCachedTrack
  } = useAudio();
  const [isTipping, setIsTipping] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const track = useMemo(() => allTracks.find(t => t.id === id), [id, allTracks]);
  const artist = useMemo(() => MOCK_ARTISTS.find(a => a.uid === track?.artistId), [track]);
  const associatedNFTs = useMemo(() => allNFTs.filter(n => n.trackId === id), [id, allNFTs]);
  
  const isOwner = useMemo(() => {
    if (!track) return false;
    const currentWallet = userAddress || userProfile?.walletAddress;
    return (
      track.artistId === userProfile?.uid ||
      associatedNFTs.some(n => n.owner === currentWallet || n.owner === userProfile?.uid)
    );
  }, [track, associatedNFTs, userAddress, userProfile]);

  const gatingConfig = useMemo(() => {
    if (track?.tokenGating?.enabled) {
      return track.tokenGating;
    }
    const assocNFT = associatedNFTs[0];
    if (assocNFT) {
      return {
        enabled: true,
        tokenAddress: assocNFT.contractAddress || assocNFT.id,
        minAmount: "1",
        tokenSymbol: "NFT",
        tokenType: "nft" as const
      };
    }
    return undefined;
  }, [track?.tokenGating, associatedNFTs]);

  const { hasAccess } = useTokenGating(gatingConfig);

  const [activeTab, setActiveTab] = useState<'lyrics' | 'details' | 'history' | 'nfts' | 'exclusive'>('lyrics');

  const [isCached, setIsCached] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  React.useEffect(() => {
    let active = true;
    const checkCache = async () => {
      if (track) {
        const cached = await isTrackCached(track.id);
        if (active) {
          setIsCached(cached);
        }
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [track?.id, isTrackCached]);

  const handleToggleCache = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!track) return;
    
    if (isCached) {
      try {
        await deleteCachedTrack(track.id);
        setIsCached(false);
        addNotification("Removed track from offline cache", "info");
      } catch (err) {
        addNotification("Failed to remove track from offline cache", "error");
      }
    } else {
      setIsCaching(true);
      try {
        await downloadTrackForOffline(track);
        setIsCached(true);
        addNotification("Track successfully cached for offline", "success");
      } catch (err) {
        addNotification("Failed to download track for offline", "error");
      } finally {
        setIsCaching(false);
      }
    }
  };
  
  const isActive = currentTrack?.id === track?.id;
  const isLiked = track ? likedTrackIds.includes(track.id) : false;

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Disc className="h-12 w-12 text-muted-foreground/30 mb-4 animate-spin-slow" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Frequency Not Found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 font-bold text-[10px] uppercase tracking-widest">Return to Network</button>
      </div>
    );
  }

  const handlePlay = () => {
    if (track.tokenGating?.enabled && !hasAccess) {
      addNotification(`This track is exclusive to ${track.tokenGating.tokenSymbol} holders.`, 'warning');
      return;
    }
    playTrack(track);
    setFullPlayerOpen(true);
  };

  const handleTip = async (amount: number) => {
    setIsTipping(false);
    
    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: artist?.walletAddress || "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
            amount: (amount * 1000000000).toString(), // Convert TON to nanoton
          }
        ]
      };
      
      await tonConnectUI.sendTransaction(transaction);
      
      addNotification(`Successfully tipped ${amount} TON to ${track.artist}!`, 'success');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.8 },
        colors: ['#0088cc', '#ffffff', '#3b82f6'],
        ticks: 200,
        gravity: 1.5,
        scalar: 0.8,
        shapes: ['circle']
      });
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("User rejected")) {
        addNotification("Transaction rejected by user.", "warning");
      } else {
        addNotification("Tipping transaction failed. Ensure you have sufficient TON balance.", "error");
      }
    }
  };

  const handleJam = () => {
    jamTrack(track.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.7,
      shapes: ['circle']
    });
  };

  const handlePurchase = async () => {
    setIsProcessingPurchase(true);
    try {
      await purchaseTrack(track.id);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#ffffff', '#10b981']
      });
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-4 overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 20% 30%, #3b82f6 0%, transparent 50%), 
                         radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 50%)`
          }}
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-4 pt-4">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate(`/artist/${track.artistId}`)}
          >
            <div className="relative">
              <img src={artist?.avatarUrl || getPlaceholderImage(`artist-${track.artistId}`, 100, 100)} className="w-10 h-10 rounded-full object-cover" alt="" />
              {track.artistVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 border border-background">
                  <Verified className="h-4 w-4 text-blue-500 fill-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-500 font-bold text-[11px] uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">{track.artist}</p>
              <p className="text-[9px] text-foreground/30 uppercase font-medium tracking-widest">Verified Node</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                const shareData = {
                  title: track.title,
                  text: `Check out ${track.title} by ${track.artist} on TonJam!`,
                  url: window.location.href
                };
                if (navigator.share) {
                  navigator.share(shareData).catch((err) => {
                    if (err.name !== 'AbortError') {
                      console.error('Error sharing:', err);
                    }
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  addNotification('Track link copied to neural buffer', 'success');
                }
              }}
              className="p-4 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Share track"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setOptionsTrack(track)}
              className="p-4 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all" 
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Cover & Primary Actions */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl group"
            >
              <img 
                src={track.coverUrl} 
                alt={track.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {track.isNFT && (
                <div className="absolute top-4 right-4 px-4 py-4 bg-neutral-600/90 backdrop-blur-md rounded-full flex items-center gap-4">
                  <Zap className="h-3 w-3 text-foreground fill-white" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">NFT Protocol</span>
                </div>
              )}

              {track.tokenGating?.enabled && !hasAccess && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/40">
                    <Lock className="w-8 h-8 text-foreground" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-foreground mb-2">Exclusive Content</h3>
                  <p className="text-xs text-foreground/70 uppercase tracking-widest font-bold">
                    Hold {track.tokenGating.minAmount} {track.tokenGating.tokenSymbol} to unlock
                  </p>
                </div>
              )}
            </motion.div>

            <div className="flex gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay} 
                className="p-4 bg-blue-600 hover:bg-blue-500 text-foreground rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
                aria-label={isActive && isPlaying ? 'Pause Frequency' : 'Initialize Playback'}
              >
                {isActive && isPlaying ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}><Pause className="h-5 w-5 fill-current" /></motion.div>
                ) : (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}><Play className="h-5 w-5 fill-current" /></motion.div>
                )}
              </motion.button>
              <button 
                onClick={() => setFullPlayerOpen(true)}
                className="p-4 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                aria-label="Open in Player"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button 
                onClick={() => toggleLikeTrack(track.id)}
                className={`p-4 rounded-xl transition-all active:scale-95 ${isLiked ? 'bg-neutral-500/10 text-neutral-500' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={handleToggleCache}
                disabled={isCaching}
                className={`p-4 rounded-xl transition-all active:scale-95 flex items-center justify-center ${isCached ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                title={isCached ? "Remove from Offline Cache" : "Download for Offline Listening"}
              >
                {isCaching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <DownloadCloud className={`h-5 w-5 ${isCached ? 'fill-blue-500/20 text-blue-400' : ''}`} />
                )}
              </button>

              <button 
                onClick={() => setTrackToAddToPlaylist(track)}
                className="p-4 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                aria-label="Add to playlist"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsTipping(!isTipping)}
                  className={`p-4 rounded-xl transition-all active:scale-95 ${isTipping ? 'bg-neutral-600 text-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                  aria-label="Tip artist"
                >
                  <Coins className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {isTipping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-background/90 backdrop-blur-2xl rounded-2xl shadow-2xl z-50 flex flex-col gap-4 min-w-[120px]"
                    >
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-4 py-4 mb-4">Select Tip Amount</p>
                      {[0.1, 0.5, 1, 5].map((amount) => (
                        <button
                          key={`tip-${amount}`}
                          onClick={() => handleTip(amount)}
                          className="px-4 py-4 hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-between group/tip"
                        >
                          <div className="flex items-center gap-4">
                            <img src={TJ_COIN_ICON} className="w-4 h-4 group-hover/tip:scale-110 transition-transform" alt="" />
                            {amount}
                          </div>
                          <span className="text-[8px] text-muted-foreground/50 uppercase tracking-widest">TON</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Purchase / Mint Card */}
            {track.isNFT ? (
              <div className="p-4 rounded-2xl bg-muted/50 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">Current Protocol Price</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-[20px] font-black tracking-tighter text-foreground">{track.price || '2.5'} TON</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">≈ $12.50</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">Available Supply</p>
                    <p className="text-sm font-bold text-blue-500 tracking-tighter">{track.minted || 0} / {track.editions || '∞'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => mintNFT(track.id, tonConnectUI)}
                    className="py-4 bg-foreground text-background rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all flex items-center justify-center gap-4"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy NFT
                  </button>
                  <button onClick={handleJam} className="py-4 bg-neutral-600/10 text-neutral-500 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-600/20 transition-all flex items-center justify-center gap-4">
                    <Zap className="h-4 w-4 fill-current" />
                    Jam Signal
                  </button>
                </div>
                
                <p className="text-[8px] text-center text-muted-foreground/50 uppercase tracking-[0.2em] font-medium">
                  Secured by TON Blockchain • Instant Settlement
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {track.price && parseFloat(track.price) > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest mb-4">Track Acquisition Price</p>
                        <div className="flex items-baseline gap-4">
                          <span className="text-[20px] font-black tracking-tighter text-emerald-500">{track.price} TON</span>
                        </div>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-emerald-500/20" />
                    </div>
                    <button
                      onClick={handlePurchase}
                      disabled={isProcessingPurchase || userProfile.ownedTrackIds?.includes(track.id) || userProfile.uid === track.artistId}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {isProcessingPurchase 
                        ? "Processing Neural Link..." 
                        : userProfile.ownedTrackIds?.includes(track.id) 
                          ? "Artifact Owned" 
                          : userProfile.uid === track.artistId
                            ? "Your Artifact"
                            : "Purchase Track Access"}
                    </button>
                  </div>
                )}

                {userProfile.uid === track.artistId && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Mint as NFT</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Turn this track into a digital artifact</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/mint', { state: { track } })}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-foreground rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20"
                    >
                      Mint NFT
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Content */}
          <div className="lg:col-span-7 space-y-4">
            <header>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-[32px] md:text-[56px] font-black tracking-tighter uppercase text-foreground leading-[0.9]">
                  {track.title}
                </h1>
                {track.isExplicit && (
                  <span className="inline-block bg-red-500/15 text-red-500 border border-red-500/30 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em] select-none shadow-lg shadow-red-500/5">
                    EXPLICIT
                  </span>
                )}
                {isCached && (
                  <span className="inline-flex bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em] select-none items-center gap-1.5 shadow-lg shadow-blue-500/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    OFFLINE READY
                  </span>
                )}
              </div>
              
              <ReactionsSection targetId={track.id} targetType="track" />

              <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <Activity className="h-3 w-3 text-cyan-500" />
                  <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">{track.playCount?.toLocaleString() || '0'} Streams</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <Music2 className="h-3 w-3 text-pink-500" />
                  <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">{track.genre}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">BPM: <span className="text-cyan-400 font-extrabold">{track.bpm || '120'}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">Key: <span className="text-purple-400 font-extrabold">{track.key || 'C# min'}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">Bitrate: {track.bitrate || 'FLAC'}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-foreground/90">
                    Rating: <span className={track.isExplicit ? 'text-red-500 font-extrabold' : 'text-green-500 font-extrabold'}>{track.isExplicit ? 'EXPLICIT (18+)' : 'CLEAN'}</span>
                  </span>
                </div>
                {track.mood && (
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/10">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-[9px] font-extrabold text-foreground/90 uppercase tracking-widest">{track.mood}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Content Tabs */}
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 overflow-x-auto no-scrollbar">
                {(['lyrics', 'details', 'history', 'nfts', 'exclusive'] as const).map((tab) => {
                  const hasPerks = associatedNFTs.some(n => n.exclusiveContent && n.exclusiveContent.length > 0) || track.isExclusive;
                  if (tab === 'exclusive' && !hasPerks) return null;
                  
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[11px] font-bold uppercase tracking-[0.22em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                    >
                      {tab === 'exclusive' ? 'exclusive perks' : tab}
                      {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[300px]">
                <TokenGate gating={track.tokenGating}>
                  {activeTab === 'lyrics' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {track.lyrics ? (
                        <div className="whitespace-pre-line text-lg md:text-xl font-medium text-muted-foreground/80 leading-relaxed font-serif">
                          {track.lyrics}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground/50">
                          <Music2 className="h-10 w-10 mb-4 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Lyrics not available for this frequency</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'details' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="technical">
                          <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Technical Specs</AccordionTrigger>
                          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="BPM" value={track.bpm?.toString() || '128'} />
                            <DetailItem label="Key" value={track.key || 'C# Minor'} />
                            <DetailItem label="Bitrate" value={track.bitrate || 'FLAC'} />
                            <DetailItem label="Mood" value={track.mood || 'Not Specified'} />
                            <DetailItem label="Content Rating" value={track.isExplicit ? 'Explicit (18+)' : 'Clean Version'} />
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="metadata">
                          <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metadata</AccordionTrigger>
                          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Release Date" value={track.releaseDate || '2023-10-15'} />
                            <DetailItem label="CID" value={track.cid || 'Not Available'} isMono />
                            <DetailItem label="Genre" value={track.genre} />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </motion.div>
                  )}
                </TokenGate>

                {activeTab === 'history' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {associatedNFTs.some(n => n.history && n.history.length > 0) ? (
                      associatedNFTs.flatMap(n => n.history || []).map((event, idx) => (
                        <div key={`history-${idx}`} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{event.event}</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">From {event.from} to {event.to}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{event.price ? `${event.price} TON` : '--'}</p>
                            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">{event.date}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-muted-foreground/50">
                        <Activity className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No protocol history recorded</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'nfts' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {associatedNFTs.length > 0 ? (
                      associatedNFTs.map((nft) => (
                        <motion.div 
                          key={nft.id} 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-blue-500/50 transition-all cursor-pointer group/nft"
                          onClick={() => navigate(`/nft/${nft.id}`)}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <img src={nft.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-tight truncate">{nft.title}</p>
                              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{nft.edition}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img src={TJ_COIN_ICON} className="w-3 h-3" alt="" />
                              <span className="text-xs font-bold text-foreground">{nft.price} TON</span>
                            </div>
                            <button className="px-4 py-4 bg-blue-600 text-foreground rounded-lg text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/nft:opacity-100 transition-opacity">
                              View NFT
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-4 text-muted-foreground/50">
                        <Zap className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No associated artifacts found</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'exclusive' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {associatedNFTs.some(n => n.exclusiveContent && n.exclusiveContent.length > 0) || track.isExclusive ? (
                      (() => {
                        // Gather items
                        let allExclusives: any[] = associatedNFTs.flatMap(n => n.exclusiveContent || []);
                        
                        // Fallback if none defined but track shows isExclusive
                        if (allExclusives.length === 0 && track.isExclusive) {
                          allExclusives = [
                            {
                              id: 'default-bts-1',
                              title: 'Behind-The-Scenes Studio Vlog',
                              type: 'video',
                              url: 'https://www.youtube.com',
                              description: 'Studio creation diary of the sonic frequencies.'
                            },
                            {
                              id: 'default-stems-2',
                              title: 'Lossless Master Audio Stems',
                              type: 'track',
                              url: track.audioUrl,
                              description: 'Individual channels: Drums, Bass, Melodies, Vocals.'
                            }
                          ];
                        }
                        
                        if (hasAccess || isOwner) {
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-2">
                                <Unlock className="w-5 h-5 text-emerald-400" />
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider text-emerald-400">Holder Perks Unlocked</p>
                                  <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest mt-0.5">Verified Access Granted to Digital Perks</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-4">
                                {allExclusives.map((item) => {
                                  let IconComponent = FileText;
                                  if (item.type === 'video') IconComponent = Video;
                                  if (item.type === 'track') IconComponent = Volume2;
                                  if (item.type === 'image') IconComponent = ImageIcon;
                                  
                                  return (
                                    <div key={item.id} className="p-5 rounded-2xl bg-muted/60 border border-border/40 hover:border-blue-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                          <IconComponent className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                            {item.type}
                                          </span>
                                          <h4 className="text-sm font-black uppercase tracking-tight text-foreground pt-1">{item.title}</h4>
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground font-bold">{item.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 h-10 bg-blue-600 hover:bg-blue-500 text-foreground font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 flex-shrink-0"
                                      >
                                        <DownloadCloud className="w-3.5 h-3.5" />
                                        Access Perk
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        } else {
                          // Locked view
                          return (
                            <div className="space-y-6">
                              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/50 rounded-2xl bg-muted/30 text-center">
                                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                  <Lock className="w-6 h-6 text-red-100" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-1">Gated Holder Perks</h3>
                                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-6 max-w-sm leading-relaxed">
                                  This frequency features exclusive content. Connect your wallet and verify NFT ownership to unlock:
                                </p>
                                <div className="grid grid-cols-1 gap-2.5 w-full max-w-sm text-left mb-6">
                                  {allExclusives.map((item, idx) => {
                                    let IconComponent = FileText;
                                    if (item.type === 'video') IconComponent = Video;
                                    if (item.type === 'track') IconComponent = Volume2;
                                    if (item.type === 'image') IconComponent = ImageIcon;
                                    
                                    return (
                                      <div key={`locked-${idx}`} className="flex items-center gap-3 px-4 py-3 bg-background/40 rounded-xl border border-border/20 opacity-60">
                                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground filter blur-[2px]">
                                          {item.title}
                                        </span>
                                        <span className="ml-auto text-[8px] text-red-400 font-bold uppercase tracking-widest">LOCKED</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                  <button 
                                    onClick={() => navigate('/limited-editions')} 
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-foreground text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                  >
                                    Acquire NFT
                                  </button>
                                  <button 
                                    onClick={() => window.location.reload()} 
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all"
                                  >
                                    Retry Verification
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 border border-dashed border-border/20 rounded-2xl bg-muted/10">
                        <Sparkles className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No exclusive perks defined for this frequency</p>
                        <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mt-1">Collectors will receive standard access</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Artist Mini Bio */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative group/artist" onClick={() => navigate(`/artist/${track.artistId}`)}>
                    <img src={artist?.avatarUrl || getPlaceholderImage(`artist-${track.artistId}`, 200, 200)} className="w-16 h-16 rounded-full object-cover cursor-pointer transition-transform group-hover/artist:scale-105" alt="" />
                    {track.artistVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 border border-background shadow-lg">
                        <Verified className="h-4.5 w-4.5 text-blue-500 fill-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-foreground tracking-tight cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate(`/artist/${track.artistId}`)}>{track.artist}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{artist?.followers.toLocaleString() || '12.4K'} Followers</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{artist?.monthlyListeners?.toLocaleString() || '84.2K'} Monthly</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (artist?.uid) {
                      useAudio().toggleFollowUser(artist.uid);
                    }
                  }}
                  className="p-4 rounded-lg bg-muted/50 text-muted-foreground hover:bg-foreground hover:text-background transition-all"
                >
                  <Users className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-foreground/50 leading-relaxed max-w-2xl mb-4">
                {artist?.bio || "Neon Voyager is a pioneer in the decentralized electronic scene, blending high-fidelity soundscapes with blockchain-native experiences. Based in the digital ether, they continue to push the boundaries of what's possible in the TonJam ecosystem."}
              </p>
              <button 
                onClick={() => navigate(`/artist/${track.artistId}`)}
                className="flex items-center gap-4 text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all"
              >
                View Full Artist Profile <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-4 border-t border-border/50">
              <CommentsSection targetId={track.id} targetType="track" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
  <div className="p-4 rounded-xl bg-muted/50">
    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">{label}</p>
    <p className={`text-sm font-bold text-foreground tracking-tight ${isMono ? 'font-mono text-xs break-all opacity-60' : ''}`}>{value}</p>
  </div>
);

export default TrackDetail;
