import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Zap, 
  CheckCircle2, 
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
  Coins
} from 'lucide-react';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, TJ_COIN_ICON } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { useTonConnectUI } from '@tonconnect/ui-react';

const TrackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, jamTrack, likedTrackIds, toggleLikeTrack, addNotification } = useAudio();
  const [isTipping, setIsTipping] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  
  const track = useMemo(() => MOCK_TRACKS.find(t => t.id === id), [id]);
  const artist = useMemo(() => MOCK_ARTISTS.find(a => a.id === track?.artistId), [track]);
  const nft = useMemo(() => MOCK_NFTS.find(n => n.trackId === id), [id]);
  
  const isActive = currentTrack?.id === track?.id;
  const isLiked = track ? likedTrackIds.includes(track.id) : false;

  const [activeTab, setActiveTab] = useState<'lyrics' | 'details' | 'history'>('lyrics');

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Disc className="h-12 w-12 text-muted-foreground/30 mb-4 animate-spin-slow" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Frequency Not Found</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-blue-500 font-bold text-[10px] uppercase tracking-widest">Return to Network</button>
      </div>
    );
  }

  const handlePlay = () => playTrack(track);

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

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 20% 30%, #3b82f6 0%, transparent 50%), 
                         radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 50%)`
          }}
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(`/artist/${track.artistId}`)}
          >
            <div className="relative">
              <img src={artist?.avatarUrl || `https://picsum.photos/100/100?seed=${track.artistId}`} className="w-10 h-10 rounded-full object-cover" alt="" />
              {track.artistVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border-2 border-black">
                  <CheckCircle2 className="h-2.5 w-2.5 text-foreground" />
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-500 font-bold text-[11px] uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">{track.artist}</p>
              <p className="text-[9px] text-foreground/30 uppercase font-medium tracking-widest">Verified Node</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              className="p-2.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Share track"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground transition-all" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Cover & Primary Actions */}
          <div className="lg:col-span-5 space-y-8">
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
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-neutral-600/90 backdrop-blur-md rounded-full flex items-center gap-2 border border-neutral-400/30">
                  <Zap className="h-3 w-3 text-foreground fill-white" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">NFT Protocol</span>
                </div>
              )}
            </motion.div>

            <div className="flex gap-4">
              <button 
                onClick={handlePlay} 
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-foreground rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
              >
                {isActive && isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                {isActive && isPlaying ? 'Pause Frequency' : 'Initialize Playback'}
              </button>
              <button 
                onClick={() => toggleLikeTrack(track.id)}
                className={`p-4 rounded-xl transition-all active:scale-95 ${isLiked ? 'bg-neutral-500/10 text-neutral-500' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
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
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-2 bg-background/90 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1 min-w-[120px]"
                    >
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 py-2 border-b border-border/50 mb-1">Select Tip Amount</p>
                      {[0.1, 0.5, 1, 5].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleTip(amount)}
                          className="px-4 py-3 hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-between group/tip"
                        >
                          <div className="flex items-center gap-2">
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
            {track.isNFT && (
              <div className="p-6 rounded-2xl bg-muted/50 border border-border backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Current Protocol Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tighter text-foreground">{track.price || '2.5'} TON</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">≈ $12.50</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Available Supply</p>
                    <p className="text-sm font-bold text-blue-500 tracking-tighter">1 / 100</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3.5 bg-foreground text-background rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy NFT
                  </button>
                  <button onClick={handleJam} className="py-3.5 bg-neutral-600/10 border border-neutral-500/30 text-neutral-500 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-600/20 transition-all flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 fill-current" />
                    Jam Signal
                  </button>
                </div>
                
                <p className="text-[8px] text-center text-muted-foreground/50 uppercase tracking-[0.2em] font-medium">
                  Secured by TON Blockchain • Instant Settlement
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Content */}
          <div className="lg:col-span-7 space-y-10">
            <header>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground leading-[0.9] mb-6">
                {track.title}
              </h1>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{track.playCount?.toLocaleString() || '0'} Streams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{track.genre}</span>
                </div>
              </div>
            </header>

            {/* Content Tabs */}
            <div className="space-y-6">
              <div className="flex gap-8 border-b border-border/50 pb-4">
                {(['lyrics', 'details', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === 'lyrics' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {track.lyrics ? (
                      <div className="whitespace-pre-line text-lg md:text-xl font-medium text-muted-foreground/80 leading-relaxed font-serif italic">
                        {track.lyrics}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <DetailItem label="BPM" value={track.bpm?.toString() || '128'} />
                    <DetailItem label="Key" value={track.key || 'C# Minor'} />
                    <DetailItem label="Bitrate" value={track.bitrate || 'FLAC'} />
                    <DetailItem label="Release Date" value={track.releaseDate || '2023-10-15'} />
                    <DetailItem label="CID" value={track.cid || 'Not Available'} isMono />
                    <DetailItem label="Genre" value={track.genre} />
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {nft?.history ? (
                      nft.history.map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
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
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
                        <Activity className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No protocol history recorded</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Artist Mini Bio */}
            <div className="pt-10 border-t border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img src={artist?.avatarUrl || `https://picsum.photos/200/200?seed=${track.artistId}`} className="w-16 h-16 rounded-2xl object-cover border border-border" alt="" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight mb-1">{track.artist}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{artist?.followers.toLocaleString() || '12.4K'} Followers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{artist?.monthlyListeners?.toLocaleString() || '84.2K'} Monthly</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-2.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                  <Users className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-foreground/50 leading-relaxed max-w-2xl mb-6">
                {artist?.bio || "Neon Voyager is a pioneer in the decentralized electronic scene, blending high-fidelity soundscapes with blockchain-native experiences. Based in the digital ether, they continue to push the boundaries of what's possible in the TonJam ecosystem."}
              </p>
              <button 
                onClick={() => navigate(`/artist/${track.artistId}`)}
                className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:gap-3 transition-all"
              >
                View Full Artist Profile <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* User Reviews */}
            <div className="pt-10 border-t border-border/50">
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-6">User Reviews</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                      U1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">CryptoPunk99</p>
                      <div className="flex text-yellow-500 text-[10px]">
                        ★★★★★
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70">Absolute banger! The bassline is incredible and the drop is out of this world.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                      U2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">NeonRider</p>
                      <div className="flex text-yellow-500 text-[10px]">
                        ★★★★☆
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70">Great track, really fits the cyberpunk vibe. Wish it was a bit longer though.</p>
                </div>
              </div>
              <div className="mt-6">
                <textarea 
                  placeholder="Write a review..." 
                  className="w-full bg-muted/50 border border-border rounded-xl p-4 text-sm text-foreground placeholder-white/30 focus:outline-none focus:border-neutral-500/50 transition-colors resize-none h-24"
                ></textarea>
                <button className="mt-3 px-6 py-2.5 bg-blue-600 text-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">
                  Submit Review
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1.5">{label}</p>
    <p className={`text-sm font-bold text-foreground tracking-tight ${isMono ? 'font-mono text-xs break-all opacity-60' : ''}`}>{value}</p>
  </div>
);

export default TrackDetail;
