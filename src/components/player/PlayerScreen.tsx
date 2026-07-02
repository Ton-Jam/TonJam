import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import {
  X,
  Heart,
  Share2,
  Download,
  ListMusic,
  Plus,
  Compass,
  ArrowRight,
  Mic2,
  Music,
  ExternalLink,
  ChevronDown,
  Trash2,
  Check,
  ChevronUp,
  Volume2,
  VolumeX,
  HelpCircle,
  Gem,
  Award
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import Progress from "./Progress";
import PlayerControls from "./PlayerControls";
import { getPlaceholderImage, shareContent, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SubtleFrequencyVisualizer from "../SubtleFrequencyVisualizer";

// Mock Synced Lyrics Map based on track titles or ids
const getSyncedLyricsForTrack = (trackId: string, duration: number) => {
  const defaultLyrics = [
    { time: 0, text: "🎵 [Instrumental Intro] 🎵" },
    { time: 5, text: "Welcome to the TonJam universe" },
    { time: 10, text: "Streaming lossless audio on the blockchain" },
    { time: 15, text: "Where the music meets Web3" },
    { time: 20, text: "And creators own their future" },
    { time: 25, text: "Can you hear the digital wind?" },
    { time: 30, text: "Rising high above the clouds" },
    { time: 35, text: "Bringing power back to the fans" },
    { time: 40, text: "🎵 [Electronic Solo Section] 🎵" },
    { time: 55, text: "We are building something real" },
    { time: 60, text: "No more middleman between us" },
    { time: 65, text: "Just pure vibes and direct splits" },
    { time: 70, text: "Thank you for supporting this track" },
    { time: 75, text: "Let the sound wave carry you home" },
    { time: 80, text: "🎵 [Instrumental Outro] 🎵" }
  ];

  // Adjust timing dynamically to match track duration if needed
  if (duration > 0) {
    return defaultLyrics.map((lyric, idx) => {
      const scale = duration / 90; // scale based on 90s base
      return {
        time: Math.round(lyric.time * scale * 10) / 10,
        text: lyric.text
      };
    });
  }
  return defaultLyrics;
};

export const PlayerScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    setFullPlayerOpen,
    nextTrack,
    prevTrack,
    queue,
    setQueue,
    playTrack,
    likedTrackIds,
    toggleLikeTrack,
    addNotification,
    setTrackToAddToPlaylist,
    setOptionsTrack,
    downloadTrackForOffline,
    isTrackCached,
    deleteCachedTrack,
    isSeeking,
    setIsSeeking,
    userProfile
  } = useAudio();

  const [activeTab, setActiveTab] = useState<"player" | "lyrics" | "nft">("player");
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showHeartPulse, setShowHeartPulse] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Swipe gesture variables
  const dragY = useRef(0);

  // Double tap handler state
  const lastTapRef = useRef<number>(0);

  // Synced lyrics autoscroll ref
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let active = true;
    const checkCache = async () => {
      if (currentTrack) {
        const cached = await isTrackCached(currentTrack.id);
        if (active) setIsCached(cached);
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [currentTrack?.id, isTrackCached]);

  // Compute current elapsed time in seconds
  const trackDuration = currentTrack?.duration || 0;
  const currentTime = useMemo(() => {
    return (progress / 100) * trackDuration;
  }, [progress, trackDuration]);

  // Synced lyrics array
  const lyrics = useMemo(() => {
    if (!currentTrack) return [];
    return getSyncedLyricsForTrack(currentTrack.id, trackDuration);
  }, [currentTrack?.id, trackDuration]);

  // Current active lyric index
  const activeLyricIndex = useMemo(() => {
    let activeIdx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [currentTime, lyrics]);

  // Auto scroll lyrics container when active lyric changes
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const element = activeLyricRef.current;
      const targetScrollTop = element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
    }
  }, [activeLyricIndex, activeTab]);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const coverUrl = currentTrack.coverUrl || getPlaceholderImage("cover");

  // Handle double tap on artwork to like
  const handleArtworkTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      if (!isLiked) {
        toggleLikeTrack(currentTrack.id);
        setShowHeartPulse(true);
        setTimeout(() => setShowHeartPulse(false), 800);
        toast.success("Track added to favorites!", { icon: "❤️" });
      } else {
        toggleLikeTrack(currentTrack.id);
        toast.info("Track removed from favorites");
      }
    }
    lastTapRef.current = now;
  };

  // Handle long press on artwork for options
  let pressTimer: NodeJS.Timeout;
  const handlePressStart = () => {
    pressTimer = setTimeout(() => {
      setOptionsTrack(currentTrack);
      toast.info("Opening options menu...");
    }, 600);
  };
  const handlePressEnd = () => {
    clearTimeout(pressTimer);
  };

  // Handle Drag / Swipe Down to Close
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 100) {
      setFullPlayerOpen(false);
    }
  };

  // Offline caching handle
  const handleDownloadToggle = async () => {
    if (isDownloading) return;
    if (isCached) {
      await deleteCachedTrack(currentTrack.id);
      setIsCached(false);
      toast.success("Track removed from offline cache");
    } else {
      setIsDownloading(true);
      try {
        await downloadTrackForOffline(currentTrack);
        setIsCached(true);
        toast.success("Track downloaded for offline playback!");
      } catch (e) {
        toast.error("Failed to download track");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Queue item reordering handlers
  const moveQueueItemUp = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === 0) return;
    const newQueue = [...queue];
    const temp = newQueue[idx];
    newQueue[idx] = newQueue[idx - 1];
    newQueue[idx - 1] = temp;
    setQueue(newQueue);
    toast.success("Queue reordered");
  };

  const moveQueueItemDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === queue.length - 1) return;
    const newQueue = [...queue];
    const temp = newQueue[idx];
    newQueue[idx] = newQueue[idx + 1];
    newQueue[idx + 1] = temp;
    setQueue(newQueue);
    toast.success("Queue reordered");
  };

  const removeQueueItem = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = queue[idx];
    const newQueue = queue.filter((_, i) => i !== idx);
    setQueue(newQueue);
    toast.info(`Removed ${target.title} from queue`);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.8 }}
      onDragEnd={handleDragEnd}
      className="fixed inset-0 bg-zinc-950 text-white font-sans z-50 flex flex-col overflow-hidden select-none"
      id="tonjam-fullscreen-player"
    >
      {/* Back/Close Drag Handle Handle */}
      <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-2" id="player-header">
        <button
          onClick={() => setFullPlayerOpen(false)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          id="btn-close-player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Tab View Selection buttons */}
        <div className="flex items-center bg-zinc-900 rounded-full p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("player")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all uppercase tracking-wider text-[10px]",
              activeTab === "player" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab("lyrics")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all uppercase tracking-wider text-[10px] flex items-center gap-1",
              activeTab === "lyrics" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            <Mic2 className="w-3 h-3" />
            Lyrics
          </button>
          {currentTrack.isNFT && (
            <button
              onClick={() => setActiveTab("nft")}
              className={cn(
                "px-3.5 py-1.5 rounded-full transition-all uppercase tracking-wider text-[10px] flex items-center gap-1",
                activeTab === "nft" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Gem className="w-3 h-3" />
              NFT Info
            </button>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={async () => {
            const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
            const result = await shareContent({
              title: `${currentTrack.title} by ${currentTrack.artist}`,
              text: `Check out this song on TonJam!`,
              url: shareUrl
            });
            if (result.success) {
              toast.success("Link copied!");
            }
          }}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          id="btn-share-track"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Responsive Canvas Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6">
        <AnimatePresence mode="wait">
          {activeTab === "player" && (
            <motion.div
              key="player-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Large Animated Album Art Cover with Gestures */}
              <div
                onClick={handleArtworkTap}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] rounded-2xl bg-zinc-900 shadow-2xl overflow-hidden cursor-pointer group"
                id="artwork-gesture-box"
              >
                <motion.img
                  src={coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-700 select-none group-hover:scale-105"
                  animate={{ scale: isPlaying ? 1 : 0.96 }}
                  id="main-album-artwork"
                />

                {/* Sparkling Frequency overlay when playing */}
                {isPlaying && (
                  <div className="absolute bottom-2 left-2 right-2 h-8 pointer-events-none">
                    <SubtleFrequencyVisualizer isPlaying={isPlaying} color="#3b82f6" barCount={18} />
                  </div>
                )}

                {/* Giant pulsing favorite heart gesture animation */}
                <AnimatePresence>
                  {showHeartPulse && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
                    >
                      <Heart className="w-20 h-20 fill-red-500 text-red-500 filter drop-shadow-xl animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Title & Artist & Badges Metadata Row */}
              <div className="w-full flex justify-between items-center px-1">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-white truncate max-w-[240px]" id="full-track-title">
                      {currentTrack.title}
                    </h1>
                    {currentTrack.isNFT && (
                      <span className="flex items-center gap-0.5 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" id="nft-badge">
                        <Gem className="w-2 h-2" />
                        NFT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-1.5" id="full-track-artist">
                    {currentTrack.artist}
                    {currentTrack.artistVerified && (
                      <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-black" id="artist-verified-check">
                        ✓
                      </span>
                    )}
                  </p>
                </div>

                {/* Controls Left Column Options like Like button & Cache */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadToggle()}
                    disabled={isDownloading}
                    className={cn(
                      "p-2.5 rounded-full transition-colors",
                      isCached ? "text-green-500 bg-green-500/10" : "text-zinc-400 hover:text-white"
                    )}
                    id="btn-download-full"
                    aria-label="Download for offline"
                  >
                    <Download className={cn("w-5 h-5", isDownloading && "animate-bounce")} />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleLikeTrack(currentTrack.id)}
                    className={cn(
                      "p-2.5 rounded-full transition-colors",
                      isLiked ? "text-red-500 bg-red-500/10" : "text-zinc-400 hover:text-white"
                    )}
                    id="btn-like-full"
                    aria-label="Like Track"
                  >
                    <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "lyrics" && (
            <motion.div
              key="lyrics-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-[320px] sm:h-[380px] flex flex-col justify-between"
            >
              {/* Synced lyrics container */}
              <div
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide space-y-4 py-8 px-1"
                id="lyrics-autoscroll-container"
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => seek((line.time / trackDuration) * 100)}
                      className={cn(
                        "text-lg sm:text-xl font-bold tracking-tight leading-relaxed cursor-pointer transition-all duration-300",
                        isActive
                          ? "text-blue-500 scale-105 origin-left"
                          : "text-zinc-600 hover:text-zinc-300"
                      )}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "nft" && currentTrack.isNFT && (
            <motion.div
              key="nft-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col gap-5 text-left"
              id="nft-details-panel"
            >
              <div className="bg-zinc-900 rounded-[10px] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Floor Price</h3>
                    <p className="text-lg font-black text-white mt-0.5">42 TON</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Royalty</h3>
                    <p className="text-lg font-black text-blue-400 mt-0.5">5.0%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Edition Supply</h3>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">Limited 100 Copies</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mint Status</h3>
                    <p className="text-sm font-semibold text-green-500 mt-0.5">Sold Out</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Owner</h3>
                    <p className="text-xs font-mono text-zinc-400 truncate max-w-[150px] mt-0.5">
                      {userProfile.walletAddress || "EQCt...7K9A"}
                    </p>
                  </div>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
              </div>

              {/* NFT Actions Block */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setFullPlayerOpen(false);
                    navigate("/marketplace");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-[10px] transition-colors"
                >
                  Marketplace
                </button>
                <button
                  onClick={() => {
                    setFullPlayerOpen(false);
                    navigate(`/nft/${currentTrack.id}`);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-[10px] transition-colors"
                >
                  View NFT Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Progress Scrub slider */}
        <Progress
          progress={progress}
          duration={trackDuration}
          onSeek={seek}
          isSeeking={isSeeking}
          setIsSeeking={setIsSeeking}
        />

        {/* Dynamic Controls section */}
        <PlayerControls />

        {/* Bottom toolbar for Queue Bottom Sheet Trigger & Add To Playlist */}
        <div className="w-full flex justify-between items-center text-zinc-400 px-2 pt-2">
          <button
            onClick={() => setTrackToAddToPlaylist(currentTrack)}
            className="flex items-center gap-1.5 hover:text-white text-xs font-bold uppercase tracking-widest"
            id="btn-add-playlist"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Playlist</span>
          </button>

          <button
            onClick={() => setShowQueueSheet(true)}
            className="flex items-center gap-1.5 hover:text-white text-xs font-bold uppercase tracking-widest text-blue-500"
            id="btn-show-queue-sheet"
          >
            <ListMusic className="w-4 h-4" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>
      </div>

      {/* Queue Bottom Sheet overlay */}
      <AnimatePresence>
        {showQueueSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQueueSheet(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-zinc-950 rounded-t-2xl z-50 overflow-hidden flex flex-col pointer-events-auto shadow-[0_-12px_40px_rgba(0,0,0,0.8)]"
              id="queue-bottom-sheet"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-wider text-white">Playback Queue</span>
                  <span className="text-xs text-zinc-500 font-semibold">({queue.length} Tracks)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      localStorage.setItem("tonjam_saved_queue", JSON.stringify(queue));
                      toast.success("Current queue layout saved!");
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300"
                  >
                    Save Queue
                  </button>
                  <button
                    onClick={() => setShowQueueSheet(false)}
                    className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* List Container with items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-semibold">
                    The queue is currently empty. Add songs to play next!
                  </div>
                ) : (
                  queue.map((track, index) => {
                    const isCurrent = track.id === currentTrack.id;
                    return (
                      <div
                        key={`${track.id}-${index}`}
                        onClick={() => {
                          playTrack(track);
                          setShowQueueSheet(false);
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-[10px] cursor-pointer transition-colors group",
                          isCurrent ? "bg-blue-600/10" : "bg-zinc-900/40 hover:bg-zinc-900"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverUrl || getPlaceholderImage("cover")}
                            alt=""
                            className="w-10 h-10 object-cover rounded-[6px]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
                            }}
                          />
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span
                              className={cn(
                                "text-xs font-bold truncate max-w-[160px] sm:max-w-xs",
                                isCurrent ? "text-blue-400" : "text-white"
                              )}
                            >
                              {track.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate max-w-[140px] sm:max-w-xs mt-0.5">
                              {track.artist}
                            </span>
                          </div>
                        </div>

                        {/* Reordering / Actions controller */}
                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          {/* Play Next Option */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newQueue = [track, ...queue.filter((t, i) => i !== index)];
                              setQueue(newQueue);
                              toast.success(`"${track.title}" moved to front of queue`);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                            title="Play Next"
                          >
                            <Compass className="w-4 h-4" />
                          </button>

                          {/* Reordering control */}
                          <button
                            onClick={(e) => moveQueueItemUp(index, e)}
                            disabled={index === 0}
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => moveQueueItemDown(index, e)}
                            disabled={index === queue.length - 1}
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Trash Option */}
                          <button
                            onClick={(e) => removeQueueItem(index, e)}
                            className="p-1.5 text-red-500 hover:text-red-400 rounded hover:bg-zinc-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerScreen;
