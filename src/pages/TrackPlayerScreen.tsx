import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  Diamond, 
  Coins,
  MessageSquare,
  Zap,
  User,
  Music,
  ListMusic,
  ThumbsUp,
  MoreVertical,
  SkipBack,
  SkipForward,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
  Send,
  ChevronDown,
  Volume2,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import { processNFTSaleRoyalty } from "@/services/royaltyService";
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS } from "@/constants";
import { getPlaceholderImage } from "@/lib/utils";

export default function TrackPlayerScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack,
    prevTrack,
    progress,
    seek,
    likedTrackIds, 
    toggleLikeTrack,
    addNotification,
    setFullPlayerOpen,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume
  } = useAudio();

  const [comment, setComment] = useState("");
  const [showQueue, setShowQueue] = useState(false);

  // Find track by ID or use current playing track or default to first mock track
  const track = useMemo(() => {
    if (id) return MOCK_TRACKS.find(t => t.id === id);
    if (currentTrack) return currentTrack;
    return MOCK_TRACKS[0];
  }, [id, currentTrack]);

  const artist = useMemo(() => 
    MOCK_ARTISTS.find(a => a.uid === track?.artistId) || MOCK_ARTISTS[0]
  , [track]);

  const isLiked = track ? likedTrackIds.includes(track.id) : false;

  const handlePlay = () => {
    if (track) {
      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(track);
      }
    }
  };

  const handleShare = () => {
    const shareData = {
      title: track?.title,
      text: `Check out ${track?.title} by ${track?.artist} on TonJam!`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification("Link copied to clipboard", "success");
    }
  };

  const handleMint = () => {
    navigate(`/mint?trackId=${track?.id}`, { state: { track } });
  };

  const handleBuy = async () => {
    if (!track) return;
    addNotification(`Purchase of ${track.title} initiated...`, "info");
    
    try {
      const nft = MOCK_NFTS.find(n => n.trackId === track.id) || {
        id: `nft-${track.id}`,
        trackId: track.id,
        title: track.title,
        creator: track.artist,
        artistId: track.artistId,
        price: track.price || '5',
        imageUrl: track.coverUrl,
        owner: 'EQ_MARKETPLACE',
        edition: 'Limited',
        royaltySplits: track.royaltySplits || []
      } as any;

      const price = parseFloat(track.price || '5');
      await processNFTSaleRoyalty(nft, price);
      
      addNotification(`Successfully purchased edition of ${track.title}!`, "success");
    } catch (error) {
      console.error("Purchase failed:", error);
      addNotification("Purchase failed. Please try again.", "error");
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    addNotification("Comment posted successfully", "success");
    setComment("");
  };

  // Generate random waveform heights
  const waveformHeights = useMemo(() => {
    return Array.from({ length: 60 }, () => Math.random() * 80 + 20);
  }, []);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = (x / rect.width) * 100;
    seek(clickedProgress);
  };

  if (!track) return null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-32 relative overflow-x-hidden">
      {/* Background Blur */}
      <div 
        className="fixed inset-0 opacity-10 blur-[150px] pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, #3b82f6 0%, #8b5cf6 50%, transparent 100%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 transition-all hover:bg-white/5 rounded-full"
        >
          <ChevronDown className="w-6 h-6 text-white/70" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">TON Network Signal</p>
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Live Feedback v1.0.4</p>
        </div>
        <button 
          className="p-2 transition-all hover:bg-white/5 rounded-full"
        >
          <MoreVertical className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto relative z-10 px-6">
        
        {/* Cover Artwork */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative aspect-square mb-10"
        >
          <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
          <img
            src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)}
            className="w-full h-full object-cover rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-white/10"
            alt={track.title}
          />
        </motion.div>

        {/* Track Metadata */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl font-black uppercase tracking-tight truncate mb-1">
              {track.title}
            </h1>
            <div 
              onClick={() => navigate(`/artist/${track.artistId}`)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <img 
                src={artist?.avatarUrl || getPlaceholderImage('artist')} 
                className="w-5 h-5 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                alt=""
              />
              <span className="text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                {track.artist}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleLikeTrack(track.id)}
              className={`p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 transition-all active:scale-90 ${isLiked ? 'text-pink-500' : 'text-white/40 hover:text-white'}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Waveform Progress Profile */}
        <div className="mb-10">
          <div 
            className="h-16 flex items-end gap-[2px] cursor-pointer relative"
            onClick={handleWaveformClick}
          >
            {waveformHeights.map((height, i) => {
              const barProgress = (i / waveformHeights.length) * 100;
              const isActive = barProgress <= progress;
              return (
                <div 
                  key={i}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: isActive ? '#3b82f6' : 'rgba(255,255,255,0.8)'
                  }}
                ></div>
              );
            })}
            
            {/* Hover Tooltip / Seeker can go here if needed */}
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30 mt-3 px-1">
            <span>0:45</span>
            <span className="text-blue-500">{Math.round(progress)}% Transmission</span>
            <span>3:12</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={toggleShuffle}
            className={`p-2 transition-all ${isShuffle ? 'text-blue-500' : 'text-white/30 hover:text-white'}`}
          >
            <ShuffleIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={prevTrack}
              className="p-2 transition-all text-white/70 hover:text-white hover:scale-110 active:scale-90"
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </button>
            
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] border-none"
            >
              {isPlaying && currentTrack?.id === track.id ? (
                <Pause className="w-8 h-8 text-white fill-white" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              )}
            </button>

            <button 
              onClick={nextTrack}
              className="p-2 transition-all text-white/70 hover:text-white hover:scale-110 active:scale-90"
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </button>
          </div>

          <button 
            onClick={toggleRepeat}
            className={`p-2 transition-all relative ${repeatMode !== 'off' ? 'text-blue-500' : 'text-white/30 hover:text-white'}`}
          >
            <RepeatIcon className="w-5 h-5" />
            {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>}
          </button>
        </div>

        {/* Volume & Utility */}
        <div className="flex items-center gap-4 mb-12 bg-white/5 p-4 rounded-3xl border border-white/5">
          <Volume2 className="w-4 h-4 text-white/30" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 transition-all ${showQueue ? 'text-blue-500' : 'text-white/30 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Network Actions */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button 
            onClick={handleBuy}
            className="flex flex-col items-center gap-2 p-5 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Buy Edition</span>
          </button>
          <button 
            onClick={handleMint}
            className="flex flex-col items-center gap-2 p-5 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Forge NFT</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-12">
          <div className="p-4 bg-white/5 rounded-3xl text-center">
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Plays</p>
            <p className="text-sm font-black italic">{(track.playCount || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-3xl text-center">
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Rarity</p>
            <p className="text-sm font-black italic text-blue-500 uppercase">Limited</p>
          </div>
          <div className="p-4 bg-white/5 rounded-3xl text-center">
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Price</p>
            <p className="text-sm font-black italic">{track.price || '5'} TON</p>
          </div>
        </div>

        {/* Engagement Tab Section (Comments/Details) */}
        <div className="pb-10">
          <div className="flex gap-6 mb-6">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-blue-500 pb-1 text-white">Signal Feed</button>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] pb-1 text-white/30 hover:text-white/50 transition-colors">Relay Data</button>
          </div>

          <div className="relative mb-6">
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Inject neural comment..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-14 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
            />
            <button 
              onClick={handlePostComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-blue-500">Node_{i}92</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">2h ago</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {i === 1 ? "The sonic texture on this transmission is unparalleled. Minting immediately." : "Relaying this to the network. Exceptional work."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


