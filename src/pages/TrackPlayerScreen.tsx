import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  ArrowLeft, 
  Diamond, 
  Coins,
  MessageSquare,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

export default function TrackPlayerScreen() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = {
    title: "Afro Night",
    artist: "DJ Ton",
    cover: "https://picsum.photos/seed/afro/800/800",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    price: "5 TON",
    editions: "100",
    likes: 1200
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white pb-4">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-4 transition-colors text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div /> {/* Spacer */}
        <button className="p-4 transition-colors text-white/70 hover:text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Cover Section */}
      <div className="px-4 py-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
        >
          <img
            src={track.cover}
            className="w-full h-full object-cover"
            alt={track.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
      </div>

      {/* Track Info */}
      <div className="px-4 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-[20px] font-black tracking-tighter uppercase italic">
            {track.title}
          </h1>
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-4">
            {track.artist}
          </p>
        </div>
        <button className="p-4 text-pink-500 hover:scale-110 transition-transform">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center mt-4 px-4">
        {/* Progress Bar (Mock) */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-cyan-400" />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/40 hover:text-white transition-colors">
            <Zap className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlay}
            className="text-cyan-400 w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-4" />
            )}
          </button>

          <button className="text-white/40 hover:text-white transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={track.audio}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Track Stats */}
      <div className="grid grid-cols-3 gap-4 px-4 mt-4">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-bold">{track.likes}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Likes</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Diamond className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold">{track.editions}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Editions</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-bold">{track.price}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Price</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-4 mt-4">
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-purple-600/20 hover:opacity-90 transition-all">
          Mint NFT Protocol
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-neutral-500/20 transition-all">
            Buy Edition
          </button>
          <button className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-neutral-500/20 transition-all">
            Share Track
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-4">
            <MessageSquare className="w-4 h-4 text-cyan-400" /> Comments
          </h2>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">24 Comments</span>
        </div>

        <div className="space-y-4">
          <div className="border-l-2 border-neutral-500/20 pl-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-500/20" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">CryptoKrupy</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              🔥 This track is amazing! The bassline is pure energy.
            </p>
          </div>

          <div className="border-l-2 border-neutral-500/20 pl-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-5 h-5 rounded-full bg-purple-500/20" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">NeonRider</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              I’m minting this one 💎 absolute protocol classic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
