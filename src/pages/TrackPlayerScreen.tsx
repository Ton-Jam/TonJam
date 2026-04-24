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
  Repeat,
  Shuffle,
  Send
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
    likedTrackIds, 
    toggleLikeTrack,
    addNotification
  } = useAudio();

  const [comment, setComment] = useState("");
  const [showEditions, setShowEditions] = useState(false);

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
      // Find associated NFT if it exists, or create a temporary one for the simulation
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

  if (!track) return null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-24 relative overflow-x-hidden">
      {/* Background Blur */}
      <div 
        className="fixed inset-0 opacity-20 blur-[120px] pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 50%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Now Playing</p>
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Protocol 0.1</p>
        </div>
        <button 
          onClick={handleShare}
          className="p-2 transition-colors text-white/70 hover:text-white bg-white/5 rounded-full"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Cover Section */}
      <div className="p-5 relative z-10">
        <img
          src={track.coverUrl || "/Artist9.png"}
          className="w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          alt={track.title}
        />
      </div>

      {/* Track Info */}
      <div className="px-5 relative z-10 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">
            {track.title}
          </h1>
          <p className="text-gray-400 mt-1 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => navigate(`/artist/${track.artistId}`)}>
            {track.artist}
          </p>
        </div>
        <button 
          onClick={() => toggleLikeTrack(track.id)}
          className={`p-2 transition-all active:scale-90 ${isLiked ? 'text-pink-500' : 'text-white/20 hover:text-white'}`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex justify-center mt-6 relative z-10">
        <button
          onClick={handlePlay}
          className="bg-blue-500 text-black w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(56,189,248,0.3)]"
        >
          {isPlaying && currentTrack?.id === track.id ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>
      </div>

      {/* Track Stats */}
      <div className="flex justify-around mt-6 text-sm text-gray-400 relative z-10">
        <div className="flex items-center gap-2">
          <span>❤️</span> {track.likes || 1200}
        </div>
        <div className="flex items-center gap-2">
          <span>💎</span> 100 Editions
        </div>
        <div className="flex items-center gap-2">
          <span>💰</span> {track.price || '5'} TON
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3 relative z-10">
        <button 
          onClick={handleMint}
          className="w-full bg-purple-500 hover:bg-purple-600 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-current" />
          Mint NFT
        </button>
        <button 
          onClick={handleBuy}
          className="w-full bg-[#121821] hover:bg-[#1a2332] transition-colors py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Coins className="w-4 h-4" />
          Buy Edition
        </button>
        <button 
          onClick={handleShare}
          className="w-full bg-[#121821] hover:bg-[#1a2332] transition-colors py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Track
        </button>
      </div>

      {/* Comments Section */}
      <div className="px-5 pb-20 relative z-10">
        <h2 className="text-lg font-semibold mb-3">
          Comments
        </h2>

        {/* Comment Input */}
        <div className="relative mb-4">
          <input 
            type="text" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-[#121821] border border-white/5 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-blue-600/50 transition-all placeholder:text-white/30"
          />
          <button 
            onClick={handlePostComment}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:scale-110 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-[#121821] p-3 rounded-xl">
            <p className="text-sm text-gray-300">
              🔥 This track is amazing!
            </p>
          </div>
          <div className="bg-[#121821] p-3 rounded-xl">
            <p className="text-sm text-gray-300">
              I’m minting this one 💎
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

