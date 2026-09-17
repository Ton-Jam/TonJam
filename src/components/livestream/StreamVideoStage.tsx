import React, { useRef, useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Users, 
  Sparkles, 
  Coins, 
  Flame, 
  Heart, 
  Zap,
  Settings,
  Tv,
  Check,
  Award
} from 'lucide-react';
import { LiveStreamSession, LiveStreamTip } from '@/types/livestream';
import { motion, AnimatePresence } from 'motion/react';

interface StreamVideoStageProps {
  stream: LiveStreamSession;
  localMediaStream?: MediaStream | null;
  latestTip?: LiveStreamTip | null;
  onSendReaction?: (emoji: string) => void;
  isHost?: boolean;
}

interface FlyingParticle {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export const StreamVideoStage: React.FC<StreamVideoStageProps> = ({
  stream,
  localMediaStream,
  latestTip,
  onSendReaction,
  isHost = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(stream.quality || '1080p60');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [particles, setParticles] = useState<FlyingParticle[]>([]);

  // Attach local media stream to video tag if host is broadcasting webcam
  useEffect(() => {
    if (videoRef.current && localMediaStream) {
      videoRef.current.srcObject = localMediaStream;
      videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
    }
  }, [localMediaStream]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const handleReactionClick = (emoji: string) => {
    const newParticle: FlyingParticle = {
      id: `${Date.now()}_${Math.random()}`,
      emoji,
      x: 70 + Math.random() * 20, // percentage from left
      y: 80
    };
    setParticles(prev => [...prev.slice(-15), newParticle]);
    onSendReaction?.(emoji);

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1800);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group"
    >
      {/* 1. Primary Video Content */}
      {localMediaStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted || isHost}
          className="w-full h-full object-cover"
        />
      ) : stream.streamVideoUrl && stream.videoSourceType !== 'stage_visualizer' ? (
        <video
          ref={videoRef}
          src={stream.streamVideoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Dynamic Live Music Visualizer Stage */
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#060b19] via-[#0d162d] to-[#040813] flex items-center justify-center">
          {/* Background Ambient Glow Lights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-[#00B4D8]/10 to-transparent animate-pulse" />
          
          {/* Visualizer Waves Canvas simulation */}
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-60">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-[#00B4D8] via-purple-500 to-amber-400 rounded-full animate-bounce"
                style={{
                  height: `${Math.max(12, Math.sin(i * 0.4) * 55 + 65)}%`,
                  animationDuration: `${0.6 + (i % 5) * 0.15}s`,
                  animationDelay: `${(i % 8) * 0.08}s`
                }}
              />
            ))}
          </div>

          {/* Center Stage Artist Hologram & Visual Art */}
          <div className="relative z-10 flex flex-col items-center text-center p-6 backdrop-blur-xs">
            <div className="relative mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-[#00B4D8] to-purple-500 animate-spin" style={{ animationDuration: '8s' }}>
                <img
                  src={stream.artistAvatar}
                  alt={stream.artistName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-lg animate-pulse">
                <Radio className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>{stream.artistName}</span>
              {stream.artistVerified && (
                <span className="text-xs bg-[#00B4D8]/20 text-[#00B4D8] px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              )}
            </h2>

            {stream.currentSongPlaying && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-zinc-200">
                  Now Jamming: {stream.currentSongPlaying.title}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Top Header Overlays */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* LIVE Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Viewer Count */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-zinc-200 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>{(stream.viewerCount || 1).toLocaleString()}</span>
          </div>

          {/* Category Chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
            <span>{stream.category}</span>
          </div>
        </div>

        {/* Quality and Controls in Top Right */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quality Picker */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{selectedQuality}</span>
            </button>
            {showQualityMenu && (
              <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-[#0e1628] shadow-2xl py-1 z-30">
                {['4K Ultra', '1080p60', '720p', 'Auto'].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setSelectedQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{q}</span>
                    {selectedQuality === q && <Check className="w-3.5 h-3.5 text-[#00B4D8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Floating Latest Tip Ticker (Top Banner) */}
      <AnimatePresence>
        {latestTip && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 text-black shadow-xl backdrop-blur-md">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-xs font-black leading-none">
                  {latestTip.senderName} tipped {latestTip.amount} {latestTip.currency}!
                </p>
                {latestTip.message && (
                  <p className="text-[11px] font-semibold text-black/80 truncate max-w-xs mt-0.5">
                    &ldquo;{latestTip.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Pinned Announcement Bar (Bottom of Video) */}
      {stream.pinnedAnnouncement && (
        <div className="absolute bottom-16 left-4 right-4 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md max-w-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-xs text-white font-medium truncate">
              <span className="text-amber-400 font-bold">{stream.pinnedAnnouncement.author}: </span>
              {stream.pinnedAnnouncement.text}
            </p>
          </div>
        </div>
      )}

      {/* 5. Interactive Flying Emoji Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 0, opacity: 1, scale: 0.6 }}
            animate={{ y: -220, opacity: 0, scale: 1.6 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{ left: `${p.x}%`, bottom: '20px' }}
            className="absolute text-2xl filter drop-shadow-md select-none"
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* 6. Video Bottom Bar Controls (Hover to reveal / visible) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20">
        {/* Audio Mute/Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00B4D8]" />}
          <span>{isMuted ? 'Unmute' : 'Audio On'}</span>
        </button>

        {/* Quick Reaction Emoji Bar */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl">
          {['🔥', '💎', '🚀', '💖', '⚡'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 active:scale-125 transition-transform flex items-center justify-center text-sm cursor-pointer"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
