import { EqualizerView } from "./EqualizerView";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Heart,
  Share2,
  Volume2,
  List,
  ListMusic,
  User,
  MoreVertical,
  ChevronDown,
  Info,
  MessageSquare,
  Music,
  Send,
  PlusCircle,
  Hash,
  Clock,
  ExternalLink,
  Verified,
  Mic2,
  Zap,
  ShoppingBag,
  History,
  Maximize2,
  VolumeX,
  Volume1,
  Sparkles,
  Loader2,
  RefreshCw,
  DownloadCloud,
  Play,
  PlayCircle,
  Pause,
  PauseCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_ARTISTS, MOCK_TRACKS, DJ_KRUPY_AVATAR } from "@/constants";
import DynamicVisualizer from "./DynamicVisualizer";
import TrackCard from "./TrackCard";
import { useNavigate } from "react-router-dom";
import { getPlaceholderImage, shareContent, cn } from "@/lib/utils";
import { MarqueeTitle } from "./MarqueeTitle";
import { fetchNFTMetadata } from "@/services/nftService";
import {
  chatWithKrupy,
  getKrupyRecommendations,
  ChatAssistantResponse,
} from "@/services/geminiService";
import { NFTItem, Track, Artist } from "@/types";
import BuyNFTModal from "./BuyNFTModal";
import { SoundscapeMixer } from "./SoundscapeMixer";
import { Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";                
import SubtleFrequencyVisualizer from "./SubtleFrequencyVisualizer";

const LyricsView: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const lines = lyrics.split("\n");

  return (
    <ScrollArea className="w-full h-[450px] pr-4">
      <div className="space-y-4 text-left mask-image-gradient py-4">
        {lines.map((line, i) => (
          <motion.p
            key={`${line.substring(0, 10)}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-base md:text-xl font-black tracking-tight leading-snug text-white/40 hover:text-white transition-colors cursor-default"
          >
            {line || <br />}
          </motion.p>
        ))}
      </div>
    </ScrollArea>
  );
};

const FullPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    isFullPlayerOpen,
    setFullPlayerOpen,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    toggleLikeTrack,
    likedTrackIds,
    queue,
    playTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    userProfile,
    addNotification,
    allTracks,
    setTrackToAddToPlaylist,
    updateTrack,
    setOptionsTrack,
    isOffline,
    toggleOfflineMode,
    isTrackCached,
    downloadTrackForOffline,
    deleteCachedTrack,
  } = useAudio();

  const [isCached, setIsCached] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  useEffect(() => {
    let active = true;
    const checkCache = async () => {
      if (currentTrack) {
        const cached = await isTrackCached(currentTrack.id);
        if (active) {
          setIsCached(cached);
        }
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [currentTrack?.id, isTrackCached]);

  const handleToggleCache = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentTrack) return;

    if (isCached) {
      try {
        await deleteCachedTrack(currentTrack.id);
        setIsCached(false);
        addNotification("Track removed from offline storage", "info");
      } catch (err) {
        addNotification("Failed to remove track from offline cache", "error");
      }
    } else {
      setIsCaching(true);
      try {
        await downloadTrackForOffline(currentTrack);
        setIsCached(true);
        addNotification(
          "Track cached successfully for offline listening",
          "success",
        );
      } catch (err) {
        addNotification("Failed to download track for offline", "error");
      } finally {
        setIsCaching(false);
      }
    }
  };

  const [activeView, setActiveView] = useState<
    "player" | "lyrics" | "comments" | "artist" | "nft" | "krupy" | "ambient" | "equalizer"
  >("player");
  const [visualizerVariant, setVisualizerVariant] = useState<
    "bars" | "circle" | "particles" | "waves"
  >("bars");
  const [showQueue, setShowQueue] = useState(false);
  const { artworkStyle, setArtworkStyle } = useAudio();

  // Dynamic color based on mood and variant
  const visualizerColor = useMemo(() => {
    if (!currentTrack) return "#3b82f6";

    // Mood color mapping
    const moodColors: Record<string, string> = {
      chill: "#a78bfa", // Purple
      energetic: "#f59e0b", // Amber
      focus: "#10b981", // Emerald
      happy: "#fbbf24", // Yellow
      melancholic: "#6366f1", // Indigo
      unknown: "#3b82f6", // Blue
    };

    const moodKey = (currentTrack.mood || "unknown").toLowerCase();
    const baseColor = moodColors[moodKey] || moodColors["unknown"];

    if (visualizerVariant === "circle") return "#60a5fa";
    if (visualizerVariant === "particles") return "#3b82f6";
    if (visualizerVariant === "waves") return "#ffffff";
    return baseColor;
  }, [currentTrack?.mood, visualizerVariant]);

  const [comment, setComment] = useState("");
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  const [currentNFT, setCurrentNFT] = useState<NFTItem | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // DJ Krupy State
  const [krupyMessage, setKrupyMessage] = useState("");
  const [isKrupyLoading, setIsKrupyLoading] = useState(false);
  const [krupyChat, setKrupyChat] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [recommendations, setRecommendations] = useState<{
    tracks: string[];
    artists: string[];
    reasoning: string;
  } | null>(null);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  const krupyScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (krupyScrollRef.current) {
      krupyScrollRef.current.scrollTop = krupyScrollRef.current.scrollHeight;
    }
  }, [krupyChat]);

  const handleAskKrupy = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || krupyMessage;
    if (!textToSend.trim() || isKrupyLoading) return;

    setKrupyChat((prev) => [...prev, { role: "user", text: textToSend }]);
    if (!overrideMessage) setKrupyMessage("");
    setIsKrupyLoading(true);

    try {
      const response: ChatAssistantResponse = await chatWithKrupy(
        textToSend,
        krupyChat,
        currentTrack,
      );
      setKrupyChat((prev) => [
        ...prev,
        { role: "ai", text: response.text || "Signal lost..." },
      ]);
    } catch (error) {
      console.error("Krupy FullPlayer Error:", error);
      setKrupyChat((prev) => [
        ...prev,
        { role: "ai", text: "Signal lost in the nebula. Re-syncing..." },
      ]);
    } finally {
      setIsKrupyLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!currentTrack) return;
    setIsRecsLoading(true);
    try {
      const recs = await getKrupyRecommendations(
        currentTrack,
        allTracks,
        MOCK_ARTISTS as any,
      );
      setRecommendations(recs);
    } catch (error) {
      console.error("Recs error:", error);
    } finally {
      setIsRecsLoading(false);
    }
  };

  const initKrupyTrivia = async () => {
    if (currentTrack) {
      setIsKrupyLoading(true);
      try {
        const trivia: ChatAssistantResponse = await chatWithKrupy(
          `Give me some cool trivia and vibez about this track: ${currentTrack.title} by ${currentTrack.artist}. Mention its genre.`,
          [],
          currentTrack,
        );
        setKrupyChat([
          {
            role: "ai",
            text:
              trivia.text ||
              "Yo! Ready to analyze this frequency. What do you want to know?",
          },
        ]);
        fetchRecommendations();
      } catch (error) {
        setKrupyChat([
          {
            role: "ai",
            text: "Yo! Ready to analyze this frequency. What do you want to know?",
          },
        ]);
      } finally {
        setIsKrupyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeView === "krupy") {
      initKrupyTrivia();
    }
  }, [activeView, currentTrack]);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentTrack?.isNFT) {
      fetchNFTMetadata(currentTrack.id).then(setCurrentNFT);
    } else {
      setCurrentNFT(null);
    }
  }, [currentTrack]);

  /* Removed automatic HUD display */

  // Waveform logic
  const waveformHeights = useMemo(() => {
    return Array.from({ length: 60 }, () => Math.random() * 80 + 20);
  }, []);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = (x / rect.width) * 100;
    seek(clickedProgress);
  };

  const handleProgressScrub = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
    } else {
      return;
    }
    const relativeX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    seek(pct);
  };

  if (!isFullPlayerOpen || !currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * duration;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const artistData = MOCK_ARTISTS.find((a) => a.uid === currentTrack.artistId);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const result = await shareContent({
      title: currentTrack.title,
      text: `Listening to ${currentTrack.title} on TonJam`,
      url: shareUrl,
    });

    if (result.success) {
      if (result.method === "clipboard") {
        addNotification("Link copied!", "success");
      }
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    addNotification("Comment posted", "success");
    setComment("");
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 24, stiffness: 180 }}
      className="fixed inset-0 z-[60] bg-[#060c1f]/60 backdrop-blur-2xl text-white overflow-y-auto no-scrollbar select-none"
      ref={containerRef}
    >
      {/* Dynamic Background Fog & Blur matching Spotify album-bleed backdrop */}
      <div className="fixed inset-0 z-0 bg-[#060c1f]" />
      <div
        className="fixed inset-0 z-0 opacity-35 blur-[120px] scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${visualizerColor}70, transparent 75%)`,
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#060c1f] via-transparent to-[#060c1f]/80 pointer-events-none" />

      {/* Volume HUD - Re-styled without border lines */}
      <AnimatePresence>
        {showVolumeHUD && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[80] backdrop-blur-2xl rounded-2xl p-4 flex flex-col items-center gap-3"
          >
            <div className="p-2">
              {volume === 0 || isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-rose-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </div>
            <div className="w-1.5 h-16 bg-white/10 rounded-full relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 w-full rounded-full"
                style={{ backgroundColor: visualizerColor }}
                initial={false}
                animate={{ height: `${volume * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-3 pb-24 max-w-screen-xl mx-auto sm:px-5 sm:py-4 md:px-12 md:py-8">
        {/* Spotify Premium Navigation Header (Strictly no borders, crisp fonts) */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <button
            onClick={() => setFullPlayerOpen(false)}
            className="text-white hover:text-white/80 active:scale-95 transition-all h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 outline-none focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div className="text-center select-none">
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400">
              PLAYING FROM CHANNEL
            </p>
            <p className="text-[10px] md:text-xs font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-xs mt-0.5">
              {currentTrack.isNFT
                ? "🌌 Web3 Sound Collectible"
                : "✨ Recommended Audio Transmissions"}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQueue(true);
            }}
            className="h-10 w-10 text-white hover:text-white/80 active:scale-95 transition-all flex items-center justify-center shrink-0 border-0 bg-transparent outline-none focus:outline-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </button>
        </div>

        <Tabs
          defaultValue="player"
          value={activeView}
          onValueChange={(v) => setActiveView(v as any)}
          className="w-full flex-1 flex flex-col justify-between"
        >
          <TabsContent value="player" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full gap-2 py-1 md:gap-4 md:py-4 items-center"
            >
              {/* Cover Art Stage - Centered on Mobile, beautiful layout with interactive Toggle */}
              <div className="relative flex items-center justify-center py-2 select-none w-full max-w-2xl">
                <AnimatePresence mode="wait">
                  {artworkStyle === "spotify" && (
                    /* Spotify Immersive High-Res Cover art with soft mood backglow */
                    <motion.div
                      key="spotify-art"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative group cursor-pointer w-full"
                      onClick={() => {
                        const variants: (
                          | "bars"
                          | "circle"
                          | "particles"
                          | "waves"
                        )[] = ["bars", "circle", "particles", "waves"];
                        const nextIndex =
                          (variants.indexOf(visualizerVariant) + 1) %
                          variants.length;
                        setVisualizerVariant(variants[nextIndex]);
                      }}
                    >
                      {/* Interactive Aura reflection breathing with audio track mood */}
                      <div
                        className="absolute inset-0 rounded-2xl transition-all duration-1000 scale-[1.03]"
                        style={{
                          background: `radial-gradient(circle, ${visualizerColor}40 0%, transparent 70%)`,
                          filter: "blur(35px)",
                          opacity: isPlaying ? 0.8 : 0.4,
                        }}
                      />

                      {/* Main cover art frame - No border lines, crisp radius and heavy shadow */}
                      <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.92)] select-none">
                        <img
                          src={
                            currentTrack.coverUrl ||
                            getPlaceholderImage(`track-${currentTrack.id}`)
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out select-none"
                          alt={currentTrack.title}
                          referrerPolicy="no-referrer"
                        />

                        {/* Shimmer on hover */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/50 animate-pulse">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9.196l.813 5.096L15 15l-5.096.813ZM19.5 12l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319ZM15 4.5l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319Z" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {artworkStyle === "vinyl" && (
                    /* Vinyl mode - Spinning disk overlay */
                    <motion.div
                      key="vinyl-art"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative"
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: visualizerColor,
                          opacity: 0.22,
                          filter: "blur(35px)",
                          transform: "scale(1.2)",
                        }}
                      />

                      <div
                        className="relative flex h-48 w-48 min-[400px]:h-56 min-[400px]:w-56 sm:h-72 sm:w-72 items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          const variants: (
                            | "bars"
                            | "circle"
                            | "particles"
                            | "waves"
                          )[] = ["bars", "circle", "particles", "waves"];
                          const nextIndex =
                            (variants.indexOf(visualizerVariant) + 1) %
                            variants.length;
                          setVisualizerVariant(variants[nextIndex]);
                        }}
                        style={{
                          background: `radial-gradient(circle at 38% 35%, ${visualizerColor}20, ${visualizerColor}04 60%, transparent)`,
                          boxShadow: `0 0 0 8px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.85)`,
                        }}
                      >
                        <motion.div
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="relative h-32 w-32 min-[400px]:h-40 min-[400px]:w-40 sm:h-52 sm:w-52 rounded-full overflow-hidden flex items-center justify-center"
                          style={{
                            boxShadow: `inset 0 0 15px rgba(0,0,0,0.9)`,
                          }}
                        >
                          <img
                            src={
                              currentTrack.coverUrl ||
                              getPlaceholderImage(`track-${currentTrack.id}`)
                            }
                            alt={currentTrack.title}
                            className="absolute inset-0 w-full h-full object-cover rounded-full select-none"
                            referrerPolicy="no-referrer"
                          />
                          {[0.88, 0.76, 0.64, 0.52].map((s, i) => (
                            <div
                              key={i}
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                transform: `scale(${s})`,
                                border: `1px solid rgba(255,255,255, ${0.06 - i * 0.01})`,
                              }}
                            />
                          ))}
                          <div
                            className="absolute left-1/2 top-1/2 h-[44px] w-[44px] sm:h-[50px] sm:w-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                            style={{
                              background: `radial-gradient(circle at 40% 40%, ${visualizerColor}e0, ${visualizerColor}90)`,
                              boxShadow: `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`,
                            }}
                          >
                            <div className="w-[10px] h-[10px] rounded-full bg-neutral-950/95" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {artworkStyle === "visualizer" && (
                    /* Real-time Visualizer component with quick-variant selectors at the bottom */
                    <motion.div
                      key="visualizer-art"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative w-[180px] h-[180px] min-[400px]:w-[240px] min-[400px]:h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-[0_30px_90px_rgba(0,0,0,0.92)] select-none px-4 py-8 group"
                    >
                      {/* Interactive Aura reflection breathing with audio track mood */}
                      <div
                        className="absolute inset-0 rounded-2xl transition-all duration-1000 scale-[1.03] pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${visualizerColor}30 0%, transparent 70%)`,
                          filter: "blur(35px)",
                          opacity: isPlaying ? 0.85 : 0.4,
                        }}
                      />

                      {/* Interactive visualizer area */}
                      <div className="absolute inset-x-0 top-0 bottom-12 overflow-hidden flex items-center justify-center p-3">
                        <DynamicVisualizer
                          variant={visualizerVariant}
                          color={visualizerColor}
                          interactive={true}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Variant pill selectors */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 bg-zinc-900/80 backdrop-blur-xl p-1 rounded-full shadow-lg z-10">
                        {(
                          ["bars", "circle", "waves", "particles"] as const
                        ).map((v) => (
                          <button
                            key={v}
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisualizerVariant(v);
                            }}
                            className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer leading-none border-0 bg-neutral-800/20 active:scale-95 outline-none focus:outline-none",
                              visualizerVariant === v
                                ? "bg-white text-black shadow-sm"
                                : "text-neutral-400 hover:text-white",
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls Deck - Styled perfectly like Spotify's structural layout */}
              <div className="space-y-2 sm:space-y-4 pt-1 sm:pt-2 md:pt-4 w-full max-w-2xl flex flex-col justify-center">
                {/* Information Header Block */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex-1 min-w-0 pr-6">
                    <motion.div
                      className="flex items-center gap-2 flex-wrap"
                      key={currentTrack.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden w-full">
                        <MarqueeTitle
                          text={currentTrack.title}
                          className="text-lg xs:text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight flex-shrink-0"
                        />
                        {isPlaying && (
                          <SubtleFrequencyVisualizer
                            isPlaying={isPlaying}
                            color={visualizerColor}
                            barCount={6}
                            className="h-6 w-8 flex-shrink-0 inline-flex items-end self-center pb-1"
                          />
                        )}
                      </div>
                      {isOffline && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[6px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase">
                          OFFLINE
                        </span>
                      )}
                      {isCached && (
                        <span className="bg-blue-500/10 text-blue-400 text-[7px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                          OFFLINE READY
                        </span>
                      )}
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-2 mt-1.5"
                      key={`${currentTrack.id}-artist`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1,
                        ease: "easeInOut",
                      }}
                    >
                      <p
                        className="text-sm sm:text-base font-medium text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer"
                        onClick={() => {
                          setFullPlayerOpen(false);
                          navigate(`/artist/${currentTrack.artistId}`);
                        }}
                      >
                        {currentTrack.artist}
                      </p>
                      {artistData?.verified && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500 flex-shrink-0">
                          <path fillRule="evenodd" d="M8.603 3.712A3 3 0 0 1 12 2.25a3 3 0 0 1 3.397 1.462l.148.243a4.5 4.5 0 0 0 1.932 1.932l.243.148a3 3 0 0 1 1.462 3.397 3.397 3.397 0 0 0-1.462 3.397l-.243.148a4.5 4.5 0 0 0-1.932 1.932l-.148.243a3 3 0 0 1-3.397 1.462c-.397 0-.79-.112-1.144-.326l-.243-.148a4.5 4.5 0 0 0-1.932-1.932l-.243-.148a3 3 0 0 1-1.462-3.397 3.397 3.397 0 0 0 1.462-3.397l.243-.148a4.5 4.5 0 0 0 1.932-1.932l.148-.243Zm6.207 7.03a.75.75 0 0 0-1.06-1.06l-3.5 3.5-1.5-1.5a.75.75 0 1 0-1.06 1.06l2.03 2.03a.75.75 0 0 0 1.06 0l4.03-4.03Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.div>
                  </div>

                  {/* Action block - Download and Heart aligned dynamically to the right */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleToggleCache}
                      disabled={isCaching}
                      className={cn(
                        "transition-all text-neutral-400 hover:text-white bg-transparent h-11 w-11 flex items-center justify-center cursor-pointer border-0 outline-none focus:outline-none rounded-full active:scale-95",
                        isCached && "text-blue-400"
                      )}
                      title={
                        isCached ? "Remove from cache" : "Download for offline"
                      }
                    >
                      {isCaching ? (
                        <svg className="w-5 h-5 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => toggleLikeTrack(currentTrack.id)}
                      className={cn(
                        "transition-all text-neutral-400 hover:text-white bg-transparent h-11 w-11 flex items-center justify-center cursor-pointer border-0 outline-none focus:outline-none rounded-full active:scale-95",
                        isLiked && "text-emerald-400 hover:text-emerald-300"
                      )}
                    >
                      {isLiked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5 text-emerald-400">
                          <path d="m11.645 20.91-.007-.003-.003-.001a.752.752 0 0 1-.703 0l-.003.001-.007.003-2.732-1.341a41.57 41.57 0 0 1-4.707-2.618C1.53 15.547 0 12.87 0 9.75A5.25 5.25 0 0 1 9 6.038a5.25 5.25 0 0 1 9 3.712c0 3.12-1.53 5.797-3.495 7.202a41.57 41.57 0 0 1-4.707 2.618l-2.73 1.341Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Spotify-style Lyrics Preview overlay (Translucent card with zero borders) */}
                {currentTrack.lyrics && (
                  <div
                    onClick={() => setActiveView("lyrics")}
                    className="hidden md:block rounded-2xl hover:bg-white/5 p-5 h-36 overflow-hidden relative cursor-pointer group transition-all"
                  >
                    <div className="absolute top-4 right-5 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                        Full Lyrics
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-400 animate-pulse">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">
                      Lyrics Preview
                    </p>
                    <div className="space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {currentTrack.lyrics
                        .split("\n")
                        .slice(0, 3)
                        .map((line, i) => (
                          <p
                            key={i}
                            className={cn(
                              "text-sm sm:text-base font-extrabold tracking-tight truncate leading-normal",
                              i === 0 ? "text-white" : "text-neutral-400",
                            )}
                          >
                            {line}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                {/* DJ Krupy AI Consult insight cards if no lyrics */}
                {!currentTrack.lyrics && recommendations && (
                  <div
                    onClick={() => setActiveView("krupy")}
                    className="hidden md:block rounded-2xl hover:bg-white/5 p-5 h-36 overflow-hidden relative cursor-pointer group transition-all"
                  >
                    <div className="absolute top-4 right-5 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">
                        DJ AIRLAB
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9.196l.813 5.096L15 15l-5.096.813ZM19.5 12l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319ZM15 4.5l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319Z" />
                      </svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                      AI Trivia Insight
                    </p>
                    <p className="text-xs font-bold leading-relaxed text-zinc-300 italic line-clamp-3">
                      "{recommendations.reasoning}"
                    </p>
                  </div>
                )}

                {/* Spotify-standard Progress Slider Deck */}
                <div className="relative pt-6 pb-2 px-1 group/slider-deck">
                  <div
                    className="relative w-full h-4 flex items-center cursor-pointer group/seek-deck select-none rounded bg-transparent z-10"
                    onClick={handleProgressScrub}
                    onTouchStart={handleProgressScrub}
                    onTouchMove={(e) => {
                      if (e.touches.length > 0) {
                        handleProgressScrub(e);
                      }
                    }}
                  >
                    <div className="w-full h-[2px] bg-neutral-700/60 rounded-full relative transition-all group-hover/seek-deck:h-[4px] overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full group-hover/seek-deck:bg-emerald-400 transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 size-3 bg-white rounded-full opacity-0 group-hover/seek-deck:opacity-100 shadow-md pointer-events-none transition-opacity -ml-1.5"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-neutral-400 tracking-wider font-mono mt-2 z-10 relative">
                    <span>{formatTime(currentTime)}</span>
                    <span style={{ color: `${visualizerColor}cc` }}>
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Main Playback Control Deck - Pure Spotify Layout Mapping */}
                <div className="flex items-center justify-between px-2 sm:px-4 max-w-md mx-auto w-full pt-1">
                  <button
                    onClick={toggleShuffle}
                    className="relative h-11 w-11 sm:h-16 sm:w-16 md:h-18 md:w-18 rounded-full bg-transparent hover:text-white active:scale-95 flex items-center justify-center cursor-pointer transition-colors shrink-0 border-0 outline-none focus:outline-none"
                    style={{ color: isShuffle ? "#00B4D8" : "#9AA0AE" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    {isShuffle && (
                      <span className="absolute bottom-[2px] sm:bottom-[4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00B4D8] rounded-full" />
                    )}
                  </button>

                  {/* Previous Track */}
                  <button
                    onClick={prevTrack}
                    className="text-[#9AA0AE] hover:text-white active:scale-90 transition-all h-12 w-12 sm:h-20 sm:w-20 md:h-22 md:w-22 rounded-full bg-transparent flex items-center justify-center cursor-pointer shrink-0 border-0 outline-none focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062A1.125 1.125 0 0 1 21 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953L9.567 7.71a1.125 1.125 0 0 1 1.683.977v8.123z" />
                    </svg>
                  </button>

                  {/* Center Play Button - Clean UI without backdrop */}
                  <button
                    onClick={togglePlay}
                    className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center p-0 hover:scale-[1.05] active:scale-[0.95] transition-all bg-transparent text-white shrink-0 overflow-hidden border-0 outline-none focus:outline-none"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 2, opacity: 0.4 }}
                      transition={{ duration: 0.3 }}
                      style={{ pointerEvents: "none" }}
                    />
                    <AnimatePresence mode="wait" initial={false}>
                      {isPlaying ? (
                        <motion.div
                          key="pause"
                          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="w-full h-full flex items-center justify-center text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#00B4D8]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                          </svg>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="play"
                          initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="w-full h-full flex items-center justify-center text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white translate-x-[2px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653z" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={nextTrack}
                    className="text-[#9AA0AE] hover:text-white active:scale-90 transition-all h-12 w-12 sm:h-20 sm:w-20 md:h-22 md:w-22 rounded-full bg-transparent flex items-center justify-center cursor-pointer shrink-0 border-0 outline-none focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.688z" />
                    </svg>
                  </button>

                  {/* Repeat Button */}
                  <button
                    onClick={toggleRepeat}
                    className="relative h-11 w-11 sm:h-16 sm:w-16 md:h-18 md:w-18 rounded-full bg-transparent hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 border-0 outline-none focus:outline-none font-sans"
                    style={{ color: repeatMode !== "off" ? "#00B4D8" : "#9AA0AE" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    {repeatMode !== "off" && (
                      <span className="absolute bottom-[2px] sm:bottom-[4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00B4D8] rounded-full" />
                    )}
                    {repeatMode === "one" && (
                      <span className="absolute top-[2px] right-[2px] text-[8px] font-black text-[#050A24] rounded-full w-4 h-4 flex items-center justify-center bg-[#00B4D8] shadow-sm shadow-[#00B4D8]/50">
                        1
                      </span>
                    )}
                  </button>

                  {/* Lyrics Toggle Button */}
                  <button
                    onClick={() => setActiveView(activeView === "lyrics" ? "player" : "lyrics")}
                    className={cn(
                      "relative h-11 w-11 sm:h-16 sm:w-16 md:h-18 md:w-18 rounded-full bg-transparent hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 border-0 outline-none focus:outline-none",
                      activeView === "lyrics" ? "text-[#00B4D8]" : "text-[#9AA0AE]"
                    )}
                  >
                    <Mic2 className="w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]" />
                    {activeView === "lyrics" && (
                      <span className="absolute bottom-[2px] sm:bottom-[4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00B4D8] rounded-full" />
                    )}
                  </button>

                  {/* Equalizer Toggle Button */}
                  <button
                    onClick={() => setActiveView(activeView === "equalizer" ? "player" : "equalizer")}
                    className={cn(
                      "relative h-11 w-11 sm:h-16 sm:w-16 md:h-18 md:w-18 rounded-full bg-transparent hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 border-0 outline-none focus:outline-none",
                      activeView === "equalizer" ? "text-[#00B4D8]" : "text-[#9AA0AE]"
                    )}
                  >
                    <Sliders className="w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]" />
                    {activeView === "equalizer" && (
                      <span className="absolute bottom-[2px] sm:bottom-[4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00B4D8] rounded-full" />
                    )}
                  </button>
                </div>

                {/* Dynamic Bottom Utility Accessories Row - No borders */}
                <div className="flex items-center justify-between pt-5 pb-1 px-2 text-white mt-2 select-none">
                  {/* Volume Slider - Interactive matching Spotify bottom bar */}
                  <div className="flex items-center gap-2 w-1/3 group/volume">
                    <button
                      className="h-10 w-10 text-white hover:text-white/80 active:scale-95 transition-colors cursor-pointer bg-transparent border-0 outline-none focus:outline-none flex items-center justify-center shrink-0"
                      onClick={toggleMute}
                    >
                      {volume === 0 || isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5 text-rose-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                      )}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      max={100}
                      step={1}
                      className="w-20 hidden sm:flex cursor-pointer py-1 [&_[data-slot=slider-track]]:!h-[3px] [&_[data-slot=slider-track]]:bg-neutral-700/60 [&_[data-slot=slider-range]]:!bg-neutral-300 group-hover/volume:[&_[data-slot=slider-range]]:!bg-emerald-400 [&_[data-slot=slider-thumb]]:!size-[10px] [&_[data-slot=slider-thumb]]:!border-none [&_[data-slot=slider-thumb]]:!bg-white [&_[data-slot=slider-thumb]]:!ring-0 [&_[data-slot=slider-thumb]]:opacity-0 group-hover/volume:[&_[data-slot=slider-thumb]]:opacity-100"
                      onValueChange={(vals) => setVolume(vals[0] / 100)}
                    />
                  </div>

                  {/* Right hand Queue and Share accessories */}
                  <div className="flex items-center gap-4 justify-end w-1/2">
                    <button
                      onClick={handleShare}
                      className="h-10 w-10 text-white hover:text-white/80 active:scale-95 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-0 outline-none focus:outline-none shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowQueue(true)}
                      className="h-10 w-10 text-white hover:text-white/80 active:scale-95 transition-colors flex items-center justify-center cursor-pointer bg-transparent border-0 outline-none focus:outline-none shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full mt-6 space-y-4">
                {currentTrack.lyrics && <LyricsView lyrics={currentTrack.lyrics} />}
                <EqualizerView />
              </div>
            </motion.div>
          </TabsContent>

          {/* Premium Bottom Mode Bar Selector (No border lines, transparent capsule rounded list) */}
          <TabsList
            className={cn(
              "grid w-full max-w-lg mx-auto border-none h-12 p-1 mb-6 relative z-10 rounded-xl",
              currentTrack.isNFT ? "grid-cols-6" : "grid-cols-5",
            )}
          >
            <TabsTrigger
              value="player"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white font-bold py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 0v11.25m0-11.25L9 9m10.5-3h-1.5M9 9H7.5M9 9v11.25m0 0A3 3 0 1 1 6 17.25M19.5 14.25a3 3 0 1 1-3-3" />
              </svg>
            </TabsTrigger>
            <TabsTrigger
              value="krupy"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white relative font-bold py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9.196l.813 5.096L15 15l-5.096.813ZM19.5 12l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319ZM15 4.5l.18.319.319.18-.319.18-.18.319-.18-.319-.319-.18.319-.18.18-.319Z" />
              </svg>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-emerald-400 rounded-full"
              />
            </TabsTrigger>
            <TabsTrigger
              value="ambient"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 5.969 5.969 0 0 0 2.753-.513c.614-.307 1.342-.245 1.958.156A8.961 8.961 0 0 0 12 20.25Z" />
              </svg>
            </TabsTrigger>
            <TabsTrigger
              value="artist"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </TabsTrigger>
            {currentTrack.isNFT && (
              <TabsTrigger
                value="nft"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </TabsTrigger>
            )}
          </TabsList>

          {/* AI Tab - Clean Translucent Capsule with NO BORDERS */}
          <TabsContent value="krupy" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-[460px] max-w-2xl mx-auto rounded-2xl bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl pb-4 mt-2"
            >
              <div className="flex items-center gap-3 p-4 bg-zinc-800/10">
                <div className="w-10 h-10 rounded-full bg-neutral-850 flex items-center justify-center p-0.5 shadow-sm">
                  <img
                    src={DJ_KRUPY_AVATAR}
                    alt="DJ Krupy"
                    className="w-full h-full rounded-full object-cover select-none"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                    DJ Krupy Neural Assistant
                  </h3>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                    Frequency Lock: {currentTrack.title}
                  </p>
                </div>
              </div>

              <div
                ref={krupyScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
              >
                {recommendations && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        AI Recommendation Layer
                      </h4>
                      {isRecsLoading && (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-neutral-400 font-medium italic">
                        "{recommendations.reasoning}"
                      </p>

                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {recommendations.tracks.map((trackTitle, idx) => {
                          const track = allTracks.find(
                            (t) =>
                              (t.title || "").toLowerCase() ===
                              (trackTitle || "").toLowerCase(),
                          );
                          return (
                            <button
                              key={idx}
                              onClick={() => track && playTrack(track)}
                              className="flex-shrink-0 bg-neutral-800/30 hover:bg-neutral-800/60 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate max-w-[120px]">
                                {trackTitle}
                              </p>
                              <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-widest mt-0.5">
                                Track
                              </p>
                            </button>
                          );
                        })}
                        {recommendations.artists.map((artistName, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const artist = MOCK_ARTISTS.find(
                                (a) =>
                                  (a.name || "").toLowerCase() ===
                                  (artistName || "").toLowerCase(),
                              );
                              if (artist) {
                                setFullPlayerOpen(false);
                                navigate(`/artist/${artist.uid}`);
                              }
                            }}
                            className="flex-shrink-0 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                          >
                            <p className="text-[10px] font-black uppercase tracking-tighter text-blue-400 truncate max-w-[120px]">
                              {artistName}
                            </p>
                            <p className="text-[8px] font-bold text-blue-400/80 uppercase tracking-widest mt-0.5">
                              Artist
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick actions for IA bot */}
                <div className="flex flex-wrap gap-2 mb-4 select-none">
                  <button
                    onClick={() =>
                      handleAskKrupy("Show me some trivia about this track!")
                    }
                    className="bg-neutral-800/40 hover:bg-neutral-800/80 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    Get Trivia
                  </button>
                  <button
                    onClick={fetchRecommendations}
                    className="bg-zinc-800/50 hover:bg-zinc-800 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw
                      className={cn(
                        "w-2.5 h-2.5",
                        isRecsLoading && "animate-spin",
                      )}
                    />
                    Refresh Recs
                  </button>
                  <button
                    onClick={() =>
                      handleAskKrupy("Describe the mood of this track.")
                    }
                    className="bg-neutral-800/40 hover:bg-neutral-800/80 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    Vibe Check
                  </button>
                </div>

                {krupyChat.map((chat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-[10px] sm:text-xs font-bold leading-relaxed shadow-sm ${
                        chat.role === "user"
                          ? "bg-zinc-100 text-black rounded-tr-none"
                          : "bg-neutral-900/60 text-white/80 rounded-tl-none"
                      }`}
                    >
                      {chat.text}
                    </div>
                  </motion.div>
                ))}
                {isKrupyLoading && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-900/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <svg className="w-3 h-3 animate-spin text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4">
                <div className="relative">
                  <input
                    type="text"
                    value={krupyMessage}
                    onChange={(e) => setKrupyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskKrupy()}
                    placeholder="Ask DJ Krupy about this track..."
                    className="w-full bg-neutral-950/40 border-none rounded-xl py-3.5 px-4 pr-12 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:bg-neutral-950/80 transition-all placeholder:text-neutral-500"
                  />
                  <button
                    onClick={() => handleAskKrupy()}
                    disabled={isKrupyLoading || !krupyMessage.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 cursor-pointer bg-transparent border-none outline-none focus:outline-none flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Lyrics View - Absolute Spotify layout matching lyrics view */}
          <TabsContent value="lyrics" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col max-w-2xl mx-auto"
            >
              {currentTrack.lyrics ? (
                <LyricsView lyrics={currentTrack.lyrics} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[360px] text-center space-y-4">
                  <div className="p-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neutral-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-450">
                    No lyrics available for this transmission
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Comments board - Borderless matching UI layout */}
          <TabsContent value="comments" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 h-full flex flex-col max-w-2xl mx-auto mt-2"
            >
              <div className="relative">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Drop a vibe on this frequency..."
                  className="w-full bg-zinc-900/60 border-none rounded-xl py-3.5 px-4 pr-12 text-xs focus:outline-none focus:bg-zinc-900 transition-all placeholder:text-neutral-500 font-bold"
                />
                <button
                  onClick={handlePostComment}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-white hover:bg-neutral-100 text-black rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-md border-none outline-none focus:outline-none active:scale-95 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>

              <ScrollArea className="flex-1 h-[360px] pr-2">
                <div className="space-y-3 pb-4 no-scrollbar">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-xl bg-neutral-900/30 hover:bg-neutral-900/50 items-center transition-colors"
                    >
                      <Avatar className="w-10 h-10 rounded-full bg-neutral-800">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black">
                          #
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-black uppercase text-neutral-300 truncate">
                            transmitting_node_{i}
                          </span>
                          <span className="text-[8px] font-bold text-neutral-500 whitespace-nowrap ml-2">
                            {i}m ago
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 leading-normal font-medium">
                          {i % 3 === 0
                            ? "Breathtaking production on this track. Heavy rotation!"
                            : i % 3 === 1
                              ? "Collector artifact obtained. Absolute gem."
                              : "Pure auditory bliss."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </TabsContent>

          {/* Artist details - styled beautifully */}
          <TabsContent value="artist" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 max-w-2xl mx-auto rounded-2xl bg-zinc-900/40 backdrop-blur-md p-6 shadow-2xl mt-2"
            >
              {artistData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-full shadow-lg">
                      <AvatarImage
                        src={
                          artistData.avatarUrl ||
                          getPlaceholderImage(`artist-${artistData.uid}`)
                        }
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-zinc-800 text-white font-black">
                        {(artistData.name || "").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black uppercase tracking-tight text-white truncate">
                          {artistData.name}
                        </h4>
                        {artistData.verified && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 text-blue-500 flex-shrink-0">
                            <path fillRule="evenodd" d="M8.603 3.712A3 3 0 0 1 12 2.25a3 3 0 0 1 3.397 1.462l.148.243a4.5 4.5 0 0 0 1.932 1.932l.243.148a3 3 0 0 1 1.462 3.397 3.397 3.397 0 0 0-1.462 3.397l-.243.148a4.5 4.5 0 0 0-1.932 1.932l-.148.243a3 3 0 0 1-3.397 1.462c-.397 0-.79-.112-1.144-.326l-.243-.148a4.5 4.5 0 0 0-1.932-1.932l-.243-.148a3 3 0 0 1-1.462-3.397 3.397 3.397 0 0 0 1.462-3.397l.243-.148a4.5 4.5 0 0 0 1.932-1.932l.148-.243Zm6.207 7.03a.75.75 0 0 0-1.06-1.06l-3.5 3.5-1.5-1.5a.75.75 0 1 0-1.06 1.06l2.03 2.03a.75.75 0 0 0 1.06 0l4.03-4.03Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider mt-0.5">
                        {artistData.followers?.toLocaleString()} Followers
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-semibold line-clamp-4">
                    {artistData.bio ||
                      "No biography details released. This creator communicates directly through frequencies."}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full h-11 bg-white hover:bg-neutral-100 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all gap-2 border-none text-black text-black cursor-pointer shadow-md"
                    onClick={() => {
                      setFullPlayerOpen(false);
                      navigate(`/artist/${artistData.uid}`);
                    }}
                  >
                    Explore Artist Domain{" "}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/60 p-4 rounded-xl flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                      Release Date
                    </p>
                    <p className="font-extrabold uppercase tracking-tight text-xs mt-0.5">
                      {currentTrack.releaseDate
                        ? new Date(currentTrack.releaseDate).toLocaleDateString(
                            undefined,
                            { month: "short", year: "numeric" },
                          )
                        : "MAR 2026"}
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-900/60 p-4 rounded-xl flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 6h15m-13.5-3h12m-13.5-3l3.75-3H18l3 3m-16.5 3H18.75" />
                  </svg>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                      Record ID
                    </p>
                    <p className="font-extrabold uppercase tracking-tight text-xs mt-0.5">
                      TJ-{currentTrack.id?.slice(-4).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* NFT Detail Screen - redesigned with pure style and zero borders */}
          {currentTrack.isNFT && currentNFT && (
            <TabsContent value="nft" className="flex-1 mt-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 max-w-2xl mx-auto rounded-2xl bg-zinc-900/40 p-6 shadow-2xl mt-2 select-none"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-0.5">
                      Sonic NFT Artifact
                    </h3>
                    <p className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                      {currentNFT.edition} Edition ID
                    </p>
                  </div>
                  <Badge className="bg-emerald-400 text-black shadow-lg shadow-emerald-400/10 h-8 px-4 font-black tracking-tight text-sm border-none">
                    {currentNFT.price} TON
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 0v11.25m0-11.25L9 9m10.5-3h-1.5M9 9H7.5M9 9v11.25m0 0A3 3 0 1 1 6 17.25M19.5 14.25a3 3 0 1 1-3-3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase text-neutral-500 tracking-wider">
                        Blockchain Owner
                      </p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {currentNFT.owner === userProfile.walletAddress
                          ? "You (Collector)"
                          : currentNFT.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase text-neutral-500 tracking-wider">
                        Verification History
                      </p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {currentNFT.history?.length || 0} Ledger logs recorded
                      </p>
                    </div>
                  </div>
                </div>

                {currentNFT.owner !== userProfile.walletAddress && (
                  <Button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full h-12 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-400/10 gap-2.5 border-none cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v3.5m-3 3.5h13.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5Zm3 0h7.5m-7.5 0-1-3h9.5l-1 3" />
                    </svg> Acquire Web3 Asset
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {currentNFT.traits?.slice(0, 4).map((trait, i) => (
                    <div key={i} className="bg-neutral-900/40 p-4 rounded-xl">
                      <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">
                        {trait.trait_type}
                      </p>
                      <p className="font-extrabold uppercase tracking-tight text-xs text-white/90">
                        {trait.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          )}

          <TabsContent value="ambient" className="flex-1 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-2"
            >
              <SoundscapeMixer />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Buy Modal trigger */}
      {showBuyModal && currentNFT && (
        <BuyNFTModal nft={currentNFT} onClose={() => setShowBuyModal(false)} />
      )}

      {/* Spotify-style Slide-over Queue panel with zero border lines */}
      <AnimatePresence>
        {showQueue && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQueue(false)}
              className="fixed inset-0 z-[65] bg-black"
            />

            {/* Slide-over Queue Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-0 z-[70] bg-[#0A113A] w-full flex flex-col pt-8 select-none border-none"
            >
              <div className="flex items-center justify-between px-4 sm:px-8 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Up Next
                  </h3>
                  <p className="text-[9px] font-black uppercase text-neutral-500 tracking-wider mt-0.5">
                    Awaiting Transmission
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQueue(false)}
                  className="rounded-full bg-neutral-850 text-neutral-450 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer w-10 h-10"
                >
                  <ChevronDown className="h-6 w-6" />
                </Button>
              </div>

              <ScrollArea className="flex-1 w-full">
                <div className="space-y-6 w-full pb-32">
                  <div className="p-4 mx-4 sm:mx-8 rounded-xl bg-zinc-900/60 flex items-center gap-4">
                    <Avatar className="w-12 h-12 rounded-lg">
                      <AvatarImage
                        src={
                          currentTrack.coverUrl ||
                          getPlaceholderImage(`track-${currentTrack.id}`)
                        }
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                        NOW TRANSMITTING
                      </p>
                      <p className="text-base font-bold text-white truncate mt-0.5">
                        {currentTrack.title}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-0.5">
                        {currentTrack.artist}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3 px-4 sm:px-8">
                      Queued Tracks
                    </p>
                    {queue.length > 0 ? (
                      <div className="space-y-1">
                        {queue.map((track, i) => (
                          <motion.div
                            key={`${track.id}-${i}`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <TrackCard
                              track={track}
                              variant="row"
                              index={i}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-neutral-500 font-bold text-xs uppercase tracking-widest pl-1 select-none">
                        Queue is empty. Let the standard algorithm guide you.
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Thin, animated progress bar at the bottom of the global player */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/10 z-[80] pointer-events-none overflow-hidden">
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: visualizerColor || '#3b82f6' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default FullPlayer;
