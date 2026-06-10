import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat as RepeatIcon, 
  Shuffle as ShuffleIcon,
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
  DownloadCloud
} from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ARTISTS, MOCK_TRACKS, DJ_KRUPY_AVATAR } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage, shareContent, cn } from '@/lib/utils';
import { fetchNFTMetadata } from '@/services/nftService';
import { chatWithKrupy, getKrupyRecommendations, ChatAssistantResponse } from '@/services/geminiService';
import { NFTItem, Track, Artist } from '@/types';
import BuyNFTModal from './BuyNFTModal';
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
import { Separator } from "@/components/ui/separator";

import DynamicVisualizer from './DynamicVisualizer';

const LyricsView: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const lines = lyrics.split('\n');

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
    deleteCachedTrack
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
        addNotification("Track cached successfully for offline listening", "success");
      } catch (err) {
        addNotification("Failed to download track for offline", "error");
      } finally {
        setIsCaching(false);
      }
    }
  };

  const [activeView, setActiveView] = useState<'player' | 'lyrics' | 'comments' | 'artist' | 'nft' | 'krupy'>('player');
  const [visualizerVariant, setVisualizerVariant] = useState<'bars' | 'circle' | 'particles' | 'waves'>('bars');
  const [showQueue, setShowQueue] = useState(false);
  const [artworkStyle, setArtworkStyle] = useState<'spotify' | 'vinyl' | 'visualizer'>('spotify');
  
  // Dynamic color based on mood and variant
  const visualizerColor = useMemo(() => {
    if (!currentTrack) return '#3b82f6';
    
    // Mood color mapping
    const moodColors: Record<string, string> = {
      'chill': '#a78bfa', // Purple
      'energetic': '#f59e0b', // Amber
      'focus': '#10b981', // Emerald
      'happy': '#fbbf24', // Yellow
      'melancholic': '#6366f1', // Indigo
      'unknown': '#3b82f6', // Blue
    };

    const moodKey = (currentTrack.mood || 'unknown').toLowerCase();
    const baseColor = moodColors[moodKey] || moodColors['unknown'];

    if (visualizerVariant === 'circle') return '#60a5fa';
    if (visualizerVariant === 'particles') return '#3b82f6';
    if (visualizerVariant === 'waves') return '#ffffff';
    return baseColor;
  }, [currentTrack?.mood, visualizerVariant]);

  const [comment, setComment] = useState("");
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  const [currentNFT, setCurrentNFT] = useState<NFTItem | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // DJ Krupy State
  const [krupyMessage, setKrupyMessage] = useState('');
  const [isKrupyLoading, setIsKrupyLoading] = useState(false);
  const [krupyChat, setKrupyChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [recommendations, setRecommendations] = useState<{ tracks: string[], artists: string[], reasoning: string } | null>(null);
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
    
    setKrupyChat(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!overrideMessage) setKrupyMessage('');
    setIsKrupyLoading(true);

    try {
      const response: ChatAssistantResponse = await chatWithKrupy(textToSend, krupyChat, currentTrack);
      setKrupyChat(prev => [...prev, { role: 'ai', text: response.text || "Signal lost..." }]);
    } catch (error) {
      console.error("Krupy FullPlayer Error:", error);
      setKrupyChat(prev => [...prev, { role: 'ai', text: "Signal lost in the nebula. Re-syncing..." }]);
    } finally {
      setIsKrupyLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!currentTrack) return;
    setIsRecsLoading(true);
    try {
      const recs = await getKrupyRecommendations(currentTrack, allTracks, MOCK_ARTISTS as any);
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
        const trivia: ChatAssistantResponse = await chatWithKrupy(`Give me some cool trivia and vibez about this track: ${currentTrack.title} by ${currentTrack.artist}. Mention its genre.`, [], currentTrack);
        setKrupyChat([{ role: 'ai', text: trivia.text || "Yo! Ready to analyze this frequency. What do you want to know?" }]);
        fetchRecommendations();
      } catch (error) {
        setKrupyChat([{ role: 'ai', text: "Yo! Ready to analyze this frequency. What do you want to know?" }]);
      } finally {
        setIsKrupyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeView === 'krupy') {
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

  if (!isFullPlayerOpen || !currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * duration;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const artistData = MOCK_ARTISTS.find(a => a.uid === currentTrack.artistId);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const result = await shareContent({
      title: currentTrack.title,
      text: `Listening to ${currentTrack.title} on TonJam`,
      url: shareUrl
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification('Link copied!', 'success');
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
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 24, stiffness: 180 }}
      className="fixed inset-0 z-[60] bg-[#121212] text-white overflow-y-auto no-scrollbar select-none"
      ref={containerRef}
    >
      {/* Dynamic Background Fog & Blur matching Spotify album-bleed backdrop */}
      <div 
        className="fixed inset-0 z-0 bg-[#121212]"
      />
      <div 
        className="fixed inset-0 z-0 opacity-35 blur-[120px] scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${visualizerColor}70, transparent 75%)`,
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-[#121212]/80 pointer-events-none" />

      {/* Volume HUD - Re-styled without border lines */}
      <AnimatePresence>
        {showVolumeHUD && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[80] bg-zinc-900/90 backdrop-blur-2xl rounded-2xl p-4 flex flex-col items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="p-2 rounded-full bg-white/5">
              {volume === 0 || isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
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

      <div className="relative z-10 flex flex-col min-h-screen px-5 py-4 pb-24 max-w-screen-xl mx-auto md:px-12 md:py-8">
        
        {/* Spotify Premium Navigation Header (Strictly no borders, crisp fonts) */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setFullPlayerOpen(false)}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800/40 rounded-full transition-all h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
          
          <div className="text-center select-none">
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400">PLAYING FROM CHANNEL</p>
            <p className="text-[10px] md:text-xs font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-xs mt-0.5">
              {currentTrack.isNFT ? "🌌 Web3 Sound Collectible" : "✨ Recommended Audio Transmissions"}
            </p>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOptionsTrack(currentTrack);
            }}
            className="h-10 w-10 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-all flex items-center justify-center shrink-0"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <Tabs defaultValue="player" value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full flex-1 flex flex-col justify-between">

          <TabsContent value="player" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full justify-between py-2 md:grid md:grid-cols-12 md:gap-16 md:items-center md:py-8"
            >
              {/* Cover Art Stage - Centered on Mobile, beautiful layout with interactive Toggle */}
              <div className="relative flex-1 flex flex-col items-center justify-center md:col-span-5 py-2 select-none">
                
                {/* Artwork Mode Switcher (Spotify-standard vs Spinning Disc vs Visualizer) - Borderless Pill */}
                <div className="mb-4 bg-zinc-900/60 p-1 rounded-full flex gap-1 shadow-inner relative z-20">
                  <button 
                    onClick={() => setArtworkStyle('spotify')}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                      artworkStyle === 'spotify' ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    Classic Cover
                  </button>
                  <button 
                    onClick={() => setArtworkStyle('vinyl')}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                      artworkStyle === 'vinyl' ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    Vinyl Disc
                  </button>
                  <button 
                    onClick={() => setArtworkStyle('visualizer')}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                      artworkStyle === 'visualizer' ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    Visualizer
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {artworkStyle === 'spotify' && (
                    /* Spotify Immersive High-Res Cover art with soft mood backglow */
                    <motion.div
                      key="spotify-art"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        const variants: ('bars' | 'circle' | 'particles' | 'waves')[] = ['bars', 'circle', 'particles', 'waves'];
                        const nextIndex = (variants.indexOf(visualizerVariant) + 1) % variants.length;
                        setVisualizerVariant(variants[nextIndex]);
                      }}
                    >
                      {/* Interactive Aura reflection breathing with audio track mood */}
                      <div
                        className="absolute inset-0 rounded-2xl transition-all duration-1000 scale-[1.03]"
                        style={{
                          background: `radial-gradient(circle, ${visualizerColor}40 0%, transparent 70%)`,
                          filter: 'blur(35px)',
                          opacity: isPlaying ? 0.8 : 0.4
                        }}
                      />
                      
                      {/* Main cover art frame - No border lines, crisp radius and heavy shadow */}
                      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.92)] select-none">
                        <img
                          src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out select-none"
                          alt={currentTrack.title}
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Shimmer on hover */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="w-8 h-8 text-white/50 animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {artworkStyle === 'vinyl' && (
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
                          filter: 'blur(35px)',
                          transform: 'scale(1.2)',
                        }}
                      />
                      
                      <div
                        className="relative flex h-60 w-60 sm:h-72 sm:w-72 items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          const variants: ('bars' | 'circle' | 'particles' | 'waves')[] = ['bars', 'circle', 'particles', 'waves'];
                          const nextIndex = (variants.indexOf(visualizerVariant) + 1) % variants.length;
                          setVisualizerVariant(variants[nextIndex]);
                        }}
                        style={{
                          background: `radial-gradient(circle at 38% 35%, ${visualizerColor}20, ${visualizerColor}04 60%, transparent)`,
                          boxShadow: `0 0 0 8px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.85)`,
                        }}
                      >
                        <motion.div
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                          className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full overflow-hidden flex items-center justify-center"
                          style={{
                            boxShadow: `inset 0 0 15px rgba(0,0,0,0.9)`,
                          }}
                        >
                          <img
                            src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
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
                                border: `1px solid rgba(255,255,255, ${0.06 - (i * 0.01)})`,
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

                  {artworkStyle === 'visualizer' && (
                    /* Real-time Visualizer component with quick-variant selectors at the bottom */
                    <motion.div
                      key="visualizer-art"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-[0_30px_90px_rgba(0,0,0,0.92)] select-none px-4 py-8 group"
                    >
                      {/* Interactive Aura reflection breathing with audio track mood */}
                      <div
                        className="absolute inset-0 rounded-2xl transition-all duration-1000 scale-[1.03] pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${visualizerColor}30 0%, transparent 70%)`,
                          filter: 'blur(35px)',
                          opacity: isPlaying ? 0.85 : 0.4
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
                        {(['bars', 'circle', 'waves', 'particles'] as const).map((v) => (
                          <button
                            key={v}
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisualizerVariant(v);
                            }}
                            className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer leading-none",
                              visualizerVariant === v 
                                ? "bg-white text-black shadow-sm" 
                                : "text-neutral-400 hover:text-white"
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
              <div className="space-y-6 pt-6 md:pt-0 md:col-span-7 flex flex-col justify-center h-full">
                
                {/* Information Header Block */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight truncate">
                        {currentTrack.title}
                      </h1>
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
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <p 
                        className="text-sm sm:text-base font-medium text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer" 
                        onClick={() => { setFullPlayerOpen(false); navigate(`/artist/${currentTrack.artistId}`); }}
                      >
                        {currentTrack.artist}
                      </p>
                      {artistData?.verified && <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                    </div>
                  </div>
                  
                  {/* Action block - Download and Heart aligned dynamically to the right */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleToggleCache}
                      disabled={isCaching}
                      className={cn(
                        "rounded-full p-2.5 transition-all text-neutral-400 hover:text-white hover:bg-neutral-800/40 active:scale-95 h-11 w-11 flex items-center justify-center cursor-pointer",
                        isCached && "text-blue-400 bg-blue-500/5 hover:bg-blue-500/10"
                      )}
                      title={isCached ? "Remove from cache" : "Download for offline"}
                    >
                      {isCaching ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      ) : (
                        <DownloadCloud className={cn("w-5.5 h-5.5", isCached && "fill-blue-500/10")} />
                      )}
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleLikeTrack(currentTrack.id)}
                      className={cn(
                        "rounded-full p-2.5 transition-all text-neutral-400 hover:text-white hover:bg-neutral-800/40 active:scale-95 h-11 w-11 flex items-center justify-center cursor-pointer",
                        isLiked && "text-emerald-400 hover:text-emerald-300 bg-emerald-500/5"
                      )}
                    >
                      <Heart className={`w-5.5 h-5.5 ${isLiked ? 'fill-current text-emerald-400' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Spotify-style Lyrics Preview overlay (Translucent card with zero borders) */}
                {currentTrack.lyrics && (
                  <div 
                    onClick={() => setActiveView('lyrics')}
                    className="hidden md:block rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/20 p-5 h-36 overflow-hidden relative cursor-pointer group transition-all"
                  >
                    <div className="absolute top-4 right-5 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Full Lyrics</span>
                      <Mic2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Lyrics Preview</p>
                    <div className="space-y-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {currentTrack.lyrics.split('\n').slice(0, 3).map((line, i) => (
                        <p key={i} className={cn(
                          "text-sm sm:text-base font-extrabold tracking-tight truncate leading-normal",
                          i === 0 ? "text-white" : "text-neutral-400"
                        )}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* DJ Krupy AI Consult insight cards if no lyrics */}
                {!currentTrack.lyrics && recommendations && (
                  <div 
                    onClick={() => setActiveView('krupy')}
                    className="hidden md:block rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/20 p-5 h-36 overflow-hidden relative cursor-pointer group transition-all"
                  >
                    <div className="absolute top-4 right-5 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">DJ AIRLAB</span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">AI Trivia Insight</p>
                    <p className="text-xs font-bold leading-relaxed text-zinc-300 italic line-clamp-3">
                      "{recommendations.reasoning}"
                    </p>
                  </div>
                )}

                {/* Spotify-standard Progress Slider Deck */}
                <div className="space-y-2 px-1 group/slider-deck">
                  <Slider 
                    value={[progress]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(val) => seek(val[0])}
                    className="cursor-pointer py-1.5 [&_[data-slot=slider-track]]:!h-[4px] [&_[data-slot=slider-track]]:bg-neutral-700/60 [&_[data-slot=slider-range]]:!bg-neutral-200 group-hover/slider-deck:[&_[data-slot=slider-range]]:!bg-emerald-400 [&_[data-slot=slider-thumb]]:!size-3 [&_[data-slot=slider-thumb]]:!border-none [&_[data-slot=slider-thumb]]:!bg-white [&_[data-slot=slider-thumb]]:!ring-0 [&_[data-slot=slider-thumb]]:opacity-0 group-hover/slider-deck:[&_[data-slot=slider-thumb]]:opacity-100 transition-all"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-neutral-400 tracking-wider font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span style={{ color: `${visualizerColor}cc` }}>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Playback Control Deck - Pure Spotify Layout Mapping */}
                <div className="flex items-center justify-between px-4 max-w-md mx-auto w-full pt-1">
                  
                  {/* Shuffle Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleShuffle} 
                    className="relative h-16 w-16 md:h-18 md:w-18 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/20 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  >
                    <ShuffleIcon className="w-[28px] h-[28px] md:w-[34px] md:h-[34px]" strokeWidth={2.5} style={{ color: isShuffle ? visualizerColor : undefined }} />
                    {isShuffle && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: visualizerColor }} />
                    )}
                  </Button>

                  {/* Previous Track */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={prevTrack} 
                    className="text-neutral-200 hover:text-white hover:bg-neutral-800/20 active:scale-90 transition-all h-20 w-20 md:h-22 md:w-22 rounded-full flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <SkipBack className="w-12 h-12 md:w-14 md:h-14 fill-current" strokeWidth={2.5} />
                  </Button>
                  
                  {/* Center Play Button - Perfect big rounded Spotify Play block */}
                  <Button
                    onClick={togglePlay}
                    className="w-24 h-24 md:w-26 md:h-26 rounded-full flex items-center justify-center p-0 hover:scale-[1.05] active:scale-[0.95] transition-all bg-white hover:bg-white text-black shrink-0"
                    style={{
                      boxShadow: `0 12px 30px rgba(255,255,255,0.06)`
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 md:w-12 md:h-12 text-black fill-black" strokeWidth={3} />
                    ) : (
                      <Play className="w-10 h-10 md:w-12 md:h-12 text-black fill-black ml-1 md:ml-1.5" strokeWidth={3} />
                    )}
                  </Button>

                  {/* Next Track */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={nextTrack} 
                    className="text-neutral-200 hover:text-white hover:bg-neutral-800/20 active:scale-90 transition-all h-20 w-20 md:h-22 md:w-22 rounded-full flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <SkipForward className="w-12 h-12 md:w-14 md:h-14 fill-current" strokeWidth={2.5} />
                  </Button>

                  {/* Repeat Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleRepeat} 
                    className="relative h-16 w-16 md:h-18 md:w-18 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/20 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  >
                    <RepeatIcon className="w-[28px] h-[28px] md:w-[34px] md:h-[34px]" strokeWidth={2.5} style={{ color: repeatMode !== 'off' ? visualizerColor : undefined }} />
                    {repeatMode !== 'off' && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: visualizerColor }} />
                    )}
                    {repeatMode === 'one' && (
                      <span className="absolute top-[2px] right-[2px] text-[8px] font-black text-black rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: visualizerColor }}>1</span>
                    )}
                  </Button>
                </div>

                {/* Dynamic Bottom Utility Accessories Row - No borders */}
                <div className="flex items-center justify-between pt-5 pb-1 px-2 text-neutral-400 mt-2 select-none">
                  {/* Volume Slider - Interactive matching Spotify bottom bar */}
                  <div className="flex items-center gap-2 w-1/3 group/volume">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-neutral-400 hover:text-white hover:bg-neutral-800/20 rounded-md transition-colors cursor-pointer"
                      onClick={toggleMute}
                    >
                      {volume === 0 || isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                      className="h-10 w-10 text-neutral-400 hover:text-white hover:bg-neutral-800/20 rounded-md transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQueue(true)}
                      className="h-10 w-10 text-neutral-400 hover:text-white hover:bg-neutral-800/20 rounded-md transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <ListMusic className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          </TabsContent>

          {/* Premium Bottom Mode Bar Selector (No border lines, transparent capsule rounded list) */}
          <TabsList className={cn(
            "grid w-full max-w-lg mx-auto bg-zinc-900/60 border-none h-12 p-1 mb-6 relative z-10 rounded-xl shadow-lg",
            currentTrack.isNFT ? "grid-cols-6" : "grid-cols-5"
          )}>
            <TabsTrigger value="player" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white font-bold py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
              <Music className="w-4.5 h-4.5" />
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white font-bold py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
              <Mic2 className="w-4.5 h-4.5" />
            </TabsTrigger>
            <TabsTrigger value="krupy" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white relative font-bold py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
              <Sparkles className="w-4.5 h-4.5" />
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-emerald-400 rounded-full"
              />
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
              <MessageSquare className="w-4.5 h-4.5" />
            </TabsTrigger>
            <TabsTrigger value="artist" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
              <User className="w-4.5 h-4.5" />
            </TabsTrigger>
            {currentTrack.isNFT && (
              <TabsTrigger value="nft" className="data-[state=active]:bg-white data-[state=active]:text-black text-neutral-400 hover:text-white py-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer">
                <Zap className="w-4.5 h-4.5" />
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
                  <img src={DJ_KRUPY_AVATAR} alt="DJ Krupy" className="w-full h-full rounded-full object-cover select-none" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">DJ Krupy Neural Assistant</h3>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Frequency Lock: {currentTrack.title}</p>
                </div>
              </div>

              <div ref={krupyScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {recommendations && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">AI Recommendation Layer</h4>
                      {isRecsLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <p className="text-[10px] text-neutral-400 font-medium italic">"{recommendations.reasoning}"</p>
                       
                       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {recommendations.tracks.map((trackTitle, idx) => {
                            const track = allTracks.find(t => (t.title || '').toLowerCase() === (trackTitle || '').toLowerCase());
                            return (
                              <button 
                                key={idx}
                                onClick={() => track && playTrack(track)}
                                className="flex-shrink-0 bg-neutral-800/30 hover:bg-neutral-800/60 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                              >
                                <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate max-w-[120px]">{trackTitle}</p>
                                <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-widest mt-0.5">Track</p>
                              </button>
                            );
                          })}
                          {recommendations.artists.map((artistName, idx) => (
                            <button 
                              key={idx}
                              onClick={() => {
                                const artist = MOCK_ARTISTS.find(a => (a.name || '').toLowerCase() === (artistName || '').toLowerCase());
                                if (artist) {
                                  setFullPlayerOpen(false);
                                  navigate(`/artist/${artist.uid}`);
                                }
                              }}
                              className="flex-shrink-0 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-black uppercase tracking-tighter text-blue-400 truncate max-w-[120px]">{artistName}</p>
                              <p className="text-[8px] font-bold text-blue-400/80 uppercase tracking-widest mt-0.5">Artist</p>
                            </button>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick actions for IA bot */}
                <div className="flex flex-wrap gap-2 mb-4 select-none">
                  <button 
                    onClick={() => handleAskKrupy("Show me some trivia about this track!")}
                    className="bg-neutral-800/40 hover:bg-neutral-800/80 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    Get Trivia
                  </button>
                  <button 
                    onClick={fetchRecommendations}
                    className="bg-zinc-800/50 hover:bg-zinc-800 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={cn("w-2.5 h-2.5", isRecsLoading && "animate-spin")} />
                    Refresh Recs
                  </button>
                  <button 
                    onClick={() => handleAskKrupy("Describe the mood of this track.")}
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
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[10px] sm:text-xs font-bold leading-relaxed shadow-sm ${
                      chat.role === 'user' 
                        ? 'bg-zinc-100 text-black rounded-tr-none' 
                        : 'bg-neutral-900/60 text-white/80 rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                  </motion.div>
                ))}
                {isKrupyLoading && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-900/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Thinking...</span>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleAskKrupy()}
                    placeholder="Ask DJ Krupy about this track..."
                    className="w-full bg-neutral-950/40 border-none rounded-xl py-3.5 px-4 pr-12 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:bg-neutral-950/80 transition-all placeholder:text-neutral-500"
                  />
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAskKrupy()}
                    disabled={isKrupyLoading || !krupyMessage.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
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
                  <div className="p-5 rounded-full bg-zinc-900">
                    <Mic2 className="w-10 h-10 text-neutral-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-450">No lyrics available for this transmission</p>
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
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={handlePostComment}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-white hover:bg-neutral-100 text-black rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 h-[360px] pr-2">
                <div className="space-y-3 pb-4 no-scrollbar">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-neutral-900/30 hover:bg-neutral-900/50 items-center transition-colors">
                      <Avatar className="w-10 h-10 rounded-full bg-neutral-800">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black">#</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-black uppercase text-neutral-300 truncate">transmitting_node_{i}</span>
                          <span className="text-[8px] font-bold text-neutral-500 whitespace-nowrap ml-2">{i}m ago</span>
                        </div>
                        <p className="text-xs text-neutral-200 leading-normal font-medium">
                          {i % 3 === 0 ? "Breathtaking production on this track. Heavy rotation!" : i % 3 === 1 ? "Collector artifact obtained. Absolute gem." : "Pure auditory bliss."}
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
                      <AvatarImage src={artistData.avatarUrl || getPlaceholderImage(`artist-${artistData.uid}`)} referrerPolicy="no-referrer" className="object-cover" />
                      <AvatarFallback className="bg-zinc-800 text-white font-black">{(artistData.name || '').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black uppercase tracking-tight text-white truncate">{artistData.name}</h4>
                        {artistData.verified && <Verified className="h-4.5 w-4.5 text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider mt-0.5">{artistData.followers?.toLocaleString()} Followers</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-semibold line-clamp-4">
                    {artistData.bio || "No biography details released. This creator communicates directly through frequencies."}
                  </p>
                  <Button 
                    variant="secondary"
                    className="w-full h-11 bg-white hover:bg-neutral-100 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all gap-2 border-none text-black text-black cursor-pointer shadow-md"
                    onClick={() => {
                      setFullPlayerOpen(false);
                      navigate(`/artist/${artistData.uid}`);
                    }}
                  >
                    Explore Artist Domain <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/60 p-4 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-neutral-500" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500">Release Date</p>
                    <p className="font-extrabold uppercase tracking-tight text-xs mt-0.5">{currentTrack.releaseDate ? new Date(currentTrack.releaseDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'MAR 2026'}</p>
                  </div>
                </div>
                <div className="bg-neutral-900/60 p-4 rounded-xl flex items-center gap-3">
                  <Hash className="w-5 h-5 text-neutral-500" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500">Record ID</p>
                    <p className="font-extrabold uppercase tracking-tight text-xs mt-0.5">TJ-{currentTrack.id?.slice(-4).toUpperCase()}</p>
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
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-0.5">Sonic NFT Artifact</h3>
                    <p className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">{currentNFT.edition} Edition ID</p>
                  </div>
                  <Badge className="bg-emerald-400 text-black shadow-lg shadow-emerald-400/10 h-8 px-4 font-black tracking-tight text-sm border-none">
                    {currentNFT.price} TON
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <Music className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase text-neutral-500 tracking-wider">Blockchain Owner</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{currentNFT.owner === userProfile.walletAddress ? 'You (Collector)' : currentNFT.owner}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <History className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase text-neutral-500 tracking-wider">Verification History</p>
                      <p className="text-xs font-bold text-white mt-0.5">{currentNFT.history?.length || 0} Ledger logs recorded</p>
                    </div>
                  </div>
                </div>

                {currentNFT.owner !== userProfile.walletAddress && (
                  <Button 
                    onClick={() => setShowBuyModal(true)}
                    className="w-full h-12 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-400/10 gap-2.5 border-none cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Acquire Web3 Asset
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {currentNFT.traits?.slice(0, 4).map((trait, i) => (
                    <div key={i} className="bg-neutral-900/40 p-4 rounded-xl">
                      <p className="text-[8px] font-black uppercase tracking-wider text-neutral-500 mb-0.5">{trait.trait_type}</p>
                      <p className="font-extrabold uppercase tracking-tight text-xs text-white/90">{trait.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Buy Modal trigger */}
      {showBuyModal && currentNFT && (
        <BuyNFTModal 
          nft={currentNFT} 
          onClose={() => setShowBuyModal(false)} 
        />
      )}

      {/* Spotify-style Slide-up Queue overlay with zero border lines */}
      <AnimatePresence>
        {showQueue && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 180 }}
            className="fixed inset-0 z-[70] bg-[#121212] flex flex-col pt-8 select-none"
          >
            <div className="flex items-center justify-between px-6 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Up Next</h3>
                <p className="text-[9px] font-black uppercase text-neutral-500 tracking-wider mt-0.5">Awaiting Transmission</p>
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
            
            <ScrollArea className="flex-1 px-6 pb-20 no-scrollbar">
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-zinc-900/60 flex items-center gap-4">
                  <Avatar className="w-12 h-12 rounded-lg">
                    <AvatarImage src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">NOW TRANSMITTING</p>
                    <p className="text-base font-bold text-white truncate mt-0.5">{currentTrack.title}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-0.5">{currentTrack.artist}</p>
                  </div>
                </div>

                <div className="space-y-2 pb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3 px-1">Queued Tracks</p>
                  {queue.length > 0 ? (
                    queue.map((track, i) => (
                      <motion.div 
                        key={`${track.id}-${i}`} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { playTrack(track); setShowQueue(false); }}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/60 transition-all cursor-pointer"
                      >
                        <Avatar className="w-10 h-10 rounded-lg">
                          <AvatarImage src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="object-cover" />
                          <AvatarFallback className="rounded-lg bg-zinc-800">{(track.title || '').slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{track.title}</p>
                          <p className="text-[10px] font-medium text-neutral-400 truncate mt-0.5">{track.artist}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-600 group-hover:text-white transition-colors cursor-pointer">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-neutral-500 font-bold text-xs uppercase tracking-widest pl-1 select-none">
                      Queue is empty. Let the standard algorithm guide you.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FullPlayer;
