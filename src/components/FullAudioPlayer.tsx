import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Heart, PlusCircle, Gem, Share2, VolumeX, Volume1, Volume2, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Zap, Users, Disc, AlignLeft } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { MOCK_ARTISTS, APP_LOGO, TJ_COIN_ICON } from "@/constants";
import { motion, AnimatePresence } from "motion/react";
import confetti from 'canvas-confetti';

const AudioVisualizer: React.FC<{ isPlaying: boolean; isHighFidelity?: boolean }> = ({ isPlaying, isHighFidelity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { analyser, currentTrack } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 64; // Increased for better resolution on wider screens
    const heights = Array(bars).fill(2);
    const targets = Array(bars).fill(2);
    let phase = 0;
    let pulsePhase = 0;

    const dataArray = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const draw = () => {
      const displayWidth = container.clientWidth;
      const displayHeight = container.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gap = 2;
      const width = (canvas.width - (bars - 1) * gap) / bars;
      
      phase += 0.05;
      pulsePhase += 0.02;

      if (analyser && isPlaying && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < bars; i++) {
        if (isPlaying) {
          if (analyser && dataArray) {
            // Map frequency data to bars with a slight logarithmic bias
            const dataIndex = Math.floor(Math.pow(i / bars, 1.3) * (dataArray.length * 0.5));
            const value = dataArray[dataIndex] || 0;
            targets[i] = 2 + (value / 255) * (canvas.height * 0.9);
          } else {
            // Fallback animation
            const wave = Math.sin(phase + i * 0.1) * 0.5 + 0.5;
            targets[i] = 2 + wave * (canvas.height * 0.5) + Math.random() * 3;
          }
        } else {
          // Subtle pulse when paused
          const pulse = Math.sin(pulsePhase + i * 0.15) * 1.5 + 2;
          targets[i] = pulse;
        }

        const lerpSpeed = isPlaying ? 0.2 : 0.1;
        heights[i] += (targets[i] - heights[i]) * lerpSpeed;
        
        const h = Math.max(2, heights[i]);
        const x = i * (width + gap);
        const y = (canvas.height - h) / 2; // Center vertically

        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        if (isHighFidelity) {
          gradient.addColorStop(0, "#c084fc");
          gradient.addColorStop(0.5, "#a855f7");
          gradient.addColorStop(1, "#9333ea");
        } else {
          gradient.addColorStop(0, "#60a5fa");
          gradient.addColorStop(0.5, "#3b82f6");
          gradient.addColorStop(1, "#2563eb");
        }

        ctx.fillStyle = gradient;
        ctx.shadowBlur = isPlaying ? (isHighFidelity ? 15 : 10) : 4;
        ctx.shadowColor = isHighFidelity ? "rgba(168, 85, 247, 0.4)" : "rgba(59, 130, 246, 0.4)";
        
        const radius = width / 2;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, width, h, radius);
        } else {
          ctx.rect(x, y, width, h);
        }
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser, currentTrack?.id, isHighFidelity]);

  return (
    <div ref={containerRef} className="w-full h-16 md:h-24 px-4 opacity-90 mix-blend-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

const FullAudioPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    nextTrack,
    prevTrack,
    setFullPlayerOpen,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    addNotification,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    likedTrackIds,
    toggleLikeTrack,
    userProfile,
    setTrackToAddToPlaylist,
    jamTrack,
    activeJamRoom,
    leaveJamRoom,
    isHighFidelity,
    exclusiveContent,
  } = useAudio();
  const [view, setView] = useState<"cover" | "lyrics">("cover");
  const [showVolume, setShowVolume] = useState(false);

  const initialVolumeRef = useRef(volume);

  useEffect(() => {
    if (volume !== initialVolumeRef.current) {
      setShowVolume(true);
      initialVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (showVolume) {
      const timer = setTimeout(() => {
        setShowVolume(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showVolume]);

  const handleJam = () => {
    if (currentTrack) {
      jamTrack(currentTrack.id);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.7,
        shapes: ['circle']
      });
    }
  };

  const isLiked = currentTrack
    ? likedTrackIds.includes(currentTrack.id)
    : false;
  const artistData = MOCK_ARTISTS.find((a) => a.uid === currentTrack?.artistId);

  if (!currentTrack) return null;

  const handleArtistClick = () => {
    setFullPlayerOpen(false);
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      toggleLikeTrack(currentTrack.id);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const shareData = {
      title: currentTrack.title,
      text: `Check out ${currentTrack.title} by ${currentTrack.artist} on TonJam!`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        });
    } else {
      addNotification(
        "Sharing protocol initiated. Link copied to clipboard.",
        "success",
      );
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleAddToPlaylist = () => {
    if (currentTrack) {
      setTrackToAddToPlaylist(currentTrack);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 overflow-y-auto overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={currentTrack.coverUrl}
          className="w-full h-full object-cover blur-[150px] opacity-10 scale-150 transition-all duration-[3s]"
          alt=""
        />
        <div className="absolute inset-0 "></div>
      </div>

      <div className="relative z-10 min-h-full flex flex-col p-2 md:p-2 max-w-xl mx-auto w-full pb-2">
        <header className="flex items-center justify-between mb-2 flex-shrink-0">
          <button
            onClick={() => setFullPlayerOpen(false)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground/80 hover:text-foreground transition-all hover:bg-muted/50"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setView("cover")}
              className={`p-2 transition-all ${view === "cover" ? "text-blue-500" : "text-muted-foreground/80 hover:text-foreground"}`}
            >
              <Disc className="h-6 w-6" />
            </button>
            <button
              onClick={() => setView("lyrics")}
              className={`p-2 transition-all ${view === "lyrics" ? "text-blue-500" : "text-muted-foreground/80 hover:text-foreground"}`}
            >
              <AlignLeft className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {activeJamRoom && (
              <button 
                onClick={leaveJamRoom}
                className="flex items-center gap-2 px-2 py-2 bg-neutral-500/10 border border-neutral-500/20 rounded-full text-[10px] font-bold text-neutral-500 uppercase tracking-widest animate-pulse"
              >
                <Users className="h-3 w-3" />
                Live Jam
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikeToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${isLiked ? "text-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <Heart className={`h-6 w-6 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
              {isLiked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-full border border-neutral-500"
                />
              )}
            </motion.button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center w-full pb-2">
          {view === "cover" ? (
            <div className="relative w-full aspect-square rounded-[10px] overflow-hidden shadow-2xl mb-2 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentTrack.id}
                  src={currentTrack.coverUrl}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? "scale-110" : "scale-100"}`}
                  alt={currentTrack.title}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[450px] overflow-y-auto no-scrollbar py-2 px-2 space-y-2">
              <p className="text-xl font-bold text-foreground uppercase tracking-tighter leading-tight text-left">
                Frequencies locked, we're forging the soul
              </p>
              <p className="text-xl font-bold text-blue-400 uppercase tracking-tighter leading-tight text-left">
                Digital diamonds in a decentralized bowl
              </p>
              <p className="text-xl font-bold text-muted-foreground/50 uppercase tracking-tighter leading-tight text-left">
                TON blockchain rhythm, heart under control
              </p>
            </div>
          )}

          <div className="w-full text-center mb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <h2 
                  className="text-[18px] font-bold mb-2 tracking-tighter uppercase text-foreground leading-none truncate px-2 flex items-center justify-center gap-2 cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => {
                    setFullPlayerOpen(false);
                    navigate(`/track/${currentTrack.id}`);
                  }}
                >
                  {currentTrack.title}
                  {isHighFidelity && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full tracking-widest uppercase">
                      Hi-Fi
                    </span>
                  )}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {artistData && (
                    <img 
                      src={artistData.avatarUrl} 
                      alt={artistData.name} 
                      className="w-5 h-5 rounded-full object-cover cursor-pointer"
                      onClick={handleArtistClick}
                    />
                  )}
                  <p
                    onClick={handleArtistClick}
                    className="text-blue-500 font-bold text-[14px] tracking-widest uppercase cursor-pointer hover:text-foreground transition-colors"
                  >
                    {currentTrack.artist}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full flex justify-center mb-2">
            <AudioVisualizer isPlaying={isPlaying} isHighFidelity={isHighFidelity} />
          </div>

          <div className="w-full max-w-[420px] mb-2 space-y-2">
            {/* Row 1: Utility Icons */}
            <div className="flex items-center justify-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToPlaylist}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-foreground/[0.03] border border-border/50 hover:bg-foreground/[0.08] hover:border-border transition-all group"
                title="Add to Playlist"
              >
                <PlusCircle className="h-6 w-6 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest group-hover:text-muted-foreground/80">Sync</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setFullPlayerOpen(false);
                  navigate(`/nft/${currentTrack.id}`);
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-foreground/[0.03] border border-border/50 hover:bg-foreground/[0.08] hover:border-border transition-all group"
                title={isHighFidelity ? "View NFT" : "Mint NFT"}
              >
                <Gem className={`h-6 w-6 transition-colors ${isHighFidelity ? "text-purple-500" : "text-muted-foreground group-hover:text-purple-400"}`} />
                <span className={`text-[8px] font-bold uppercase tracking-widest ${isHighFidelity ? "text-purple-500" : "text-muted-foreground/50 group-hover:text-muted-foreground/80"}`}>
                  {isHighFidelity ? "Owned" : "Mint"}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-foreground/[0.03] border border-border/50 hover:bg-foreground/[0.08] hover:border-border transition-all group"
                title="Share"
              >
                <Share2 className="h-6 w-6 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest group-hover:text-muted-foreground/80">Share</span>
              </motion.button>

              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all cursor-pointer ${showVolume ? "bg-blue-500/10 border border-neutral-500/20" : "bg-foreground/[0.03] border border-border/50 hover:bg-foreground/[0.08]"}`}
                  onClick={() => setShowVolume(!showVolume)}
                  title="Volume"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6 text-red-500/60" />
                  ) : volume < 0.5 ? (
                    <Volume1 className={`h-6 w-6 ${showVolume ? "text-blue-400" : "text-muted-foreground"}`} />
                  ) : (
                    <Volume2 className={`h-6 w-6 ${showVolume ? "text-blue-400" : "text-muted-foreground"}`} />
                  )}
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${showVolume ? "text-blue-400" : "text-muted-foreground/50"}`}>Vol</span>
                </motion.div>
                {showVolume && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white p-2 rounded-[10px] shadow-2xl border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <div
                      className="h-32 w-2 bg-neutral-100 rounded-full relative cursor-pointer group/vslider"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const newVolume = Math.max(
                          0,
                          Math.min(1, 1 - y / rect.height),
                        );
                        setVolume(newVolume);
                      }}
                    >
                      <div
                        className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full shadow-lg scale-0 group-hover/vslider:scale-100 transition-transform"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Play Controls */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleShuffle}
                className={`text-lg transition-all p-2 rounded-full ${isShuffle ? "text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-muted-foreground/50 hover:text-foreground"}`}
                title="Shuffle"
              >
                <Shuffle className="h-5 w-5" />
              </motion.button>
              <button
                onClick={prevTrack}
                className="text-[20px] text-muted-foreground hover:text-foreground transition-all hover:scale-125 active:scale-90 p-2"
              >
                <SkipBack className="h-8 w-8 fill-current" />
              </button>
              <div className="relative flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-blue-500"
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10 md:h-12 md:w-12 fill-current" />
                  ) : (
                    <Play className="h-10 w-10 md:h-12 md:w-12 fill-current" />
                  )}
                </button>
                
                {/* JAM BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  whileTap={{ scale: 0.8, rotate: -15 }}
                  animate={{ 
                    boxShadow: isPlaying ? [
                      "0 0 20px rgba(245, 158, 11, 0.4)",
                      "0 0 40px rgba(245, 158, 11, 0.6)",
                      "0 0 20px rgba(245, 158, 11, 0.4)"
                    ] : "0 0 20px rgba(245, 158, 11, 0.2)"
                  }}
                  transition={{ 
                    boxShadow: { 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    } 
                  }}
                  onClick={handleJam}
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-xl border border-border/80 z-10 group"
                  title="JAM (Boost Track)"
                >
                  <img src={TJ_COIN_ICON} className="w-6 h-6 group-hover:animate-bounce" alt="JAM" />
                </motion.button>
              </div>
              <button
                onClick={nextTrack}
                className="text-[20px] text-muted-foreground hover:text-foreground transition-all hover:scale-125 active:scale-90 p-2"
              >
                <SkipForward className="h-8 w-8 fill-current" />
              </button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRepeat}
                className={`text-lg transition-all p-2 rounded-full ${isRepeat ? "text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-muted-foreground/50 hover:text-foreground"}`}
                title="Repeat"
              >
                <Repeat className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Track Details Section */}
        <div className="w-full mt-2 pt-2 space-y-2">
          {exclusiveContent && exclusiveContent.length > 0 && (
            <div className="space-y-2 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
              <h3 className="text-[14px] font-bold text-purple-400 uppercase tracking-[0.4em] flex items-center gap-2">
                <Gem className="w-4 h-4" />
                Exclusive Content
              </h3>
              <div className="space-y-2">
                {exclusiveContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-foreground uppercase tracking-tight">{content.title}</span>
                      {content.description && <span className="text-[10px] text-muted-foreground">{content.description}</span>}
                    </div>
                    <a href={content.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:underline">
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-[14px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em]">
              Track Info
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                Release Date
              </span>
              <span className="text-[12px] font-bold text-foreground uppercase tracking-tight">
                {currentTrack.releaseDate || "2023-10-01"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                Genre
              </span>
              <span className="text-[12px] font-bold text-blue-500 uppercase tracking-tight">
                {currentTrack.genre}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[14px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em]">
              Artist Info
            </h3>
            <div
              className="flex items-center gap-2 mb-2 cursor-pointer group/dossier"
              onClick={handleArtistClick}
            >
              <img
                src={artistData?.avatarUrl}
                className="w-12 h-12 rounded-full transition-all"
                alt=""
              />
              <div>
                <h4 className="text-[14px] font-bold text-foreground uppercase tracking-tight group-hover/dossier:text-blue-400 hover:underline transition-colors inline-block">
                  {currentTrack.artist}
                </h4>
                <p className="text-[12px] font-bold text-blue-500 uppercase tracking-widest">
                  {artistData?.followers ? artistData.followers.toLocaleString() : 0} Followers
                </p>
              </div>
            </div>
            <p className="text-[16px] text-muted-foreground/80 leading-relaxed font-medium italic">
              {artistData?.bio ||
                "Digital pioneer forging new sonic landscapes in the TON ecosystem."}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-[14px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em]">
              Track Comments
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <img
                  src={userProfile.avatar}
                  className="w-10 h-10 rounded-full"
                  alt=""
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full bg-muted/50 rounded-[10px] py-2 px-2 text-[14px] text-foreground outline-none transition-all"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-[14px] font-bold uppercase tracking-widest">
                    Post
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {[
                  {
                    id: 1,
                    user: "Neon Voyager",
                    avatar: "https://picsum.photos/100/100?random=21",
                    text: "This track is absolutely mind-blowing! The bass is perfect.",
                    time: "2h ago",
                  },
                  {
                    id: 2,
                    user: "Sarah Jenkins",
                    avatar: "https://picsum.photos/100/100?random=32",
                    text: "Love the atmospheric vibes here. Great work!",
                    time: "5h ago",
                  },
                  {
                    id: 3,
                    user: "CryptoPioneer",
                    avatar: "https://picsum.photos/100/100?random=50",
                    text: "Added this immediately. A future classic.",
                    time: "1d ago",
                  },
                ].map((comment) => (
                  <div key={comment.id} className="flex gap-2 group">
                    <img
                      src={comment.avatar}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] font-bold text-foreground uppercase tracking-tight">
                          {comment.user}
                        </span>
                        <span className="text-[12px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-[16px] text-foreground/90 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-neutral-500/10 px-2 md:px-2 py-2 flex items-center gap-2">
        <img
          src={APP_LOGO}
          alt="TonJam"
          className={`w-10 h-10 rounded-full ${isPlaying ? "animate-spin" : ""}`}
          style={{ animationDuration: "4s" }}
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-[12px] font-bold text-muted-foreground/80 tracking-widest uppercase px-2">
            <span>
              {Math.floor(((progress / 100) * currentTrack.duration) / 60)}:
              {String(
                Math.floor(((progress / 100) * currentTrack.duration) % 60),
              ).padStart(2, "0")}
            </span>
            <span>
              {Math.floor(currentTrack.duration / 60)}:
              {String(currentTrack.duration % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="relative w-full h-[3px] bg-muted/50 rounded-full overflow-hidden group cursor-pointer">
            <input
              type="range"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full shadow-[0_0_10px_white] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAudioPlayer;
