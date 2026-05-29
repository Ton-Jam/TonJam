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
  RefreshCw
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
    toggleOfflineMode
  } = useAudio();

  const [activeView, setActiveView] = useState<'player' | 'lyrics' | 'comments' | 'artist' | 'nft' | 'krupy'>('player');
  const [visualizerVariant, setVisualizerVariant] = useState<'bars' | 'circle' | 'particles' | 'waves'>('bars');
  const [showQueue, setShowQueue] = useState(false);
  
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
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-[#0B0F14] text-white overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 z-0 bg-black/40 pointer-events-none"
      />
      <div 
        className="fixed inset-0 z-0 opacity-40 blur-[100px] scale-150 pointer-events-none"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-[#0B0F14]/60 pointer-events-none" />

      {/* Volume HUD */}
      <AnimatePresence>
        {showVolumeHUD && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[80] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-2xl"
          >
            <div className="p-2 rounded-full bg-white/10">
              {volume === 0 || isMuted ? <Volume2 className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4 text-blue-500" />}
            </div>
            <div className="w-1.5 h-16 bg-white/10 rounded-full relative overflow-hidden">
              <motion.div 
                className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full" 
                initial={false}
                animate={{ height: `${volume * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-2 pb-24 max-w-sm mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setFullPlayerOpen(false)}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30">Now Playing</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-blue-500">Node Transmission</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOptionsTrack(currentTrack);
            }}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 outline-none"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <Tabs defaultValue="player" value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full flex-1 flex flex-col">

          <TabsContent value="player" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full justify-between py-2"
            >
              {/* Cover Art Area */}
              <div className="relative flex-1 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative w-[320px] h-[320px] overflow-hidden rounded-[4px] shadow-2xl border border-white/5 cursor-pointer"
                  onClick={() => {
                    const variants: ('bars' | 'circle' | 'particles' | 'waves')[] = ['bars', 'circle', 'particles', 'waves'];
                    const nextIndex = (variants.indexOf(visualizerVariant) + 1) % variants.length;
                    setVisualizerVariant(variants[nextIndex]);
                  }}
                >
                  <img
                    src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
                    className="w-full h-full object-cover"
                    alt={currentTrack.title}
                  />
                  
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Sparkles className="w-8 h-8 text-white/50" />
                  </div>
                </motion.div>
              </div>

              {/* Info Area */}
              <div className="space-y-6 pt-8">
                <div className="flex justify-between items-start px-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <h1 className="text-2xl font-black uppercase tracking-tight truncate">
                      {currentTrack.title}
                    </h1>
                    <p className="text-sm font-bold text-white/60 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors mt-1" onClick={() => { setFullPlayerOpen(false); navigate(`/artist/${currentTrack.artistId}`); }}>
                      {currentTrack.artist}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleLikeTrack(currentTrack.id)}
                    className={cn(
                      "rounded-full p-2 transition-all",
                      isLiked ? 'text-blue-500' : 'text-white/20 hover:text-white'
                    )}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Slider 
                    value={[progress]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(val) => seek(val[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <span className="text-white">{formatTime(currentTime)}</span>
                    <span className="text-white">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <Button variant="ghost" size="icon" onClick={toggleShuffle} className={isShuffle ? 'text-blue-500' : 'text-white/40 hover:text-white'}>
                    <ShuffleIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white hover:text-blue-500 transition-colors">
                    <SkipBack className="w-8 h-8 fill-current" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-white text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-1" />}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white hover:text-blue-500 transition-colors">
                    <SkipForward className="w-8 h-8 fill-current" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleRepeat} className={repeatMode !== 'off' ? 'text-blue-500' : 'text-white/40 hover:text-white'}>
                    <RepeatIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Bottom secondary tools */}
              <div className="flex items-center justify-center pt-8 pb-4 gap-6 text-white/30">
                 <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setShowVolumeHUD(!showVolumeHUD)} />
                 <Share2 className="w-4 h-4 cursor-pointer hover:text-white" onClick={handleShare} />
                 <ListMusic className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setShowQueue(true)} />
              </div>
            </motion.div>
          </TabsContent>

          <TabsList className={cn(
            "grid w-full bg-white/5 border-none h-10 p-1 mb-6",
            currentTrack.isNFT ? "grid-cols-6" : "grid-cols-5"
          )}>
            <TabsTrigger value="player" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
              <Music className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
              <Mic2 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="krupy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40 relative">
              <Sparkles className="w-4 h-4" />
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"
              />
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
              <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="artist" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
              <Hash className="w-4 h-4" />
            </TabsTrigger>
            {currentTrack.isNFT && (
              <TabsTrigger value="nft" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40">
                <Zap className="w-4 h-4" />
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="krupy" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-[500px]"
            >
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-t-[4px] border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center p-0.5 border border-white/10">
                  <img src={DJ_KRUPY_AVATAR} alt="DJ Krupy" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Neural Insights</h3>
                  <p className="text-[8px] font-bold text-white uppercase tracking-widest">Active Relay: {currentTrack.title}</p>
                </div>
              </div>

              <div ref={krupyScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {/* Recommendations Section */}
                {recommendations && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Neural Recommendations</h4>
                      {isRecsLoading && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-500" />}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <p className="text-[10px] text-white/60 font-medium italic">"{recommendations.reasoning}"</p>
                       
                       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {recommendations.tracks.map((trackTitle, idx) => {
                            const track = allTracks.find(t => (t.title || '').toLowerCase() === (trackTitle || '').toLowerCase());
                            return (
                              <button 
                                key={idx}
                                onClick={() => track && playTrack(track)}
                                className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[4px] px-3 py-2 transition-all"
                              >
                                <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate max-w-[120px]">{trackTitle}</p>
                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Track</p>
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
                              className="flex-shrink-0 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-[4px] px-3 py-2 transition-all"
                            >
                              <p className="text-[10px] font-black uppercase tracking-tighter text-blue-500 truncate max-w-[120px]">{artistName}</p>
                              <p className="text-[8px] font-bold text-blue-500/40 uppercase tracking-widest">Artist</p>
                            </button>
                          ))}
                       </div>
                    </div>
                    <Separator className="bg-white/5" />
                  </motion.div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => handleAskKrupy("Show me some trivia about this track!")}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all"
                  >
                    Get Trivia
                  </button>
                  <button 
                    onClick={fetchRecommendations}
                    className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-blue-500 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={cn("w-2.5 h-2.5", isRecsLoading && "animate-spin")} />
                    Refresh Recs
                  </button>
                  <button 
                    onClick={() => handleAskKrupy("Describe the mood of this track.")}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all"
                  >
                    Vibe Check
                  </button>
                </div>

                {krupyChat.map((chat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-[4px] text-[10px] sm:text-xs font-bold leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                  </motion.div>
                ))}
                {isKrupyLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-[4px] rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Syncing...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-b-[4px]">
                <div className="relative">
                  <input 
                    type="text" 
                    value={krupyMessage}
                    onChange={(e) => setKrupyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskKrupy()}
                    placeholder="Ask DJ Krupy about this track..."
                    className="w-full bg-black/40 border border-white/10 rounded-[4px] py-3 px-4 pr-12 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                  />
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAskKrupy()}
                    disabled={isKrupyLoading || !krupyMessage.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-blue-500 hover:text-blue-400 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="lyrics" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col"
            >
              {currentTrack.lyrics ? (
                <LyricsView lyrics={currentTrack.lyrics} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                  <div className="p-6 rounded-[4px] bg-white/5">
                    <Mic2 className="w-12 h-12 text-white/20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-white/30">No neural lyrics found for this frequency</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 h-full flex flex-col"
            >
              <div className="relative">
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Drop a vibe..."
                  className="w-full bg-white/5 border border-white/10 rounded-[4px] py-3 px-4 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                />
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={handlePostComment}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[4px] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 h-[400px] pr-4">
                <div className="space-y-3 pb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-[4px] bg-white/[0.02] border border-white/5 items-center">
                      <Avatar className="w-10 h-10 rounded-[4px] border border-white/5">
                        <AvatarFallback className="bg-blue-600/10 text-blue-500/30 text-[10px] font-black">#</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black uppercase text-white truncate">vibe_node_{i}</span>
                          <span className="text-[7px] font-bold text-white/10 whitespace-nowrap ml-2">{i}m ago</span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-normal font-bold">
                          {i % 3 === 0 ? "Incredible sonic landscape." : i % 3 === 1 ? "Minted this artifact immediately." : "This vibration is pure energy."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </TabsContent>

          <TabsContent value="artist" className="flex-1 mt-0">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {artistData && (
                <div className="bg-white/5 border-none rounded-[4px] p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-[4px] border-2 border-blue-600/20 shadow-xl">
                      <AvatarImage src={artistData.avatarUrl || getPlaceholderImage(`artist-${artistData.uid}`)} referrerPolicy="no-referrer" className="object-cover" />
                      <AvatarFallback className="bg-blue-600/10 text-blue-500 font-black">{(artistData.name || '').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black uppercase tracking-tight text-white truncate">{artistData.name}</h4>
                        {artistData.verified && <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{artistData.followers?.toLocaleString()} Listeners</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-medium line-clamp-4">
                    {artistData.bio || "No biography data available. This artist is forging new frequencies in silence."}
                  </p>
                  <Button 
                    variant="secondary"
                    className="w-full h-11 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] rounded-[4px] transition-all gap-2 border-none"
                    onClick={() => {
                      setFullPlayerOpen(false);
                      navigate(`/artist/${artistData.uid}`);
                    }}
                  >
                    View Domain <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-[4px] border-none flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500/40" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Release</p>
                    <p className="font-black uppercase tracking-tighter text-sm">{currentTrack.releaseDate ? new Date(currentTrack.releaseDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'MAR 2024'}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-[4px] border-none flex items-center gap-3">
                  <Hash className="w-4 h-4 text-blue-500/40" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">ID</p>
                    <p className="font-black uppercase tracking-tighter text-sm">TJ-{currentTrack.id?.slice(-4).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {currentTrack.isNFT && currentNFT && (
            <TabsContent value="nft" className="flex-1 mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* NFT Hero Info */}
                <div className="bg-white/5 border-none rounded-[4px] p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">Sonic Artifact</h3>
                      <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">{currentNFT.edition} Edition</p>
                    </div>
                    <Badge className="bg-blue-600 text-white shadow-lg shadow-blue-500/20 h-8 px-4 font-black tracking-tighter text-lg border-none">
                      {currentNFT.price} TON
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-[4px]">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Music className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Collector / Owner</p>
                        <p className="text-xs font-bold text-white truncate">{currentNFT.owner === userProfile.walletAddress ? 'You (Owner)' : currentNFT.owner}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-[4px]">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <History className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Provenance</p>
                        <p className="text-xs font-bold text-white">{currentNFT.history?.length || 0} Transfers recorded</p>
                      </div>
                    </div>
                  </div>

                  {currentNFT.owner !== userProfile.walletAddress && (
                    <Button 
                      onClick={() => setShowBuyModal(true)}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-[4px] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] gap-3 border-none"
                    >
                      <ShoppingBag className="w-4 h-4" /> Acquire Asset
                    </Button>
                  )}
                </div>

                {/* Traits/Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {currentNFT.traits?.slice(0, 4).map((trait, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-[4px] border-none">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">{trait.trait_type}</p>
                      <p className="font-black uppercase tracking-tighter text-sm text-white/80">{trait.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Purchase History Preview */}
                <div className="space-y-3 pb-8">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] px-1">Blockchain Ledger</p>
                  {currentNFT.history?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-[4px] bg-white/[0.02] border-none">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <p className="text-[10px] font-bold text-white/60 uppercase">{item.event}</p>
                      </div>
                      <p className="text-[10px] font-black text-white/20">{item.date}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      {showBuyModal && currentNFT && (
        <BuyNFTModal 
          nft={currentNFT} 
          onClose={() => setShowBuyModal(false)} 
        />
      )}

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[70] bg-[#0B0F14]/95 backdrop-blur-3xl flex flex-col pt-10"
          >
            <div className="flex items-center justify-between p-6 mb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Transmission Queue</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowQueue(false)}
                className="rounded-full bg-white/5 text-white/50"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 px-6 pb-20">
              <div className="space-y-6">
                <div className="p-6 rounded-[4px] bg-blue-500/10 border-none flex items-center gap-4">
                  <Avatar className="w-16 h-16 rounded-[4px]">
                    <AvatarImage src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black uppercase text-blue-500 truncate">{currentTrack.title}</p>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{currentTrack.artist}</p>
                  </div>
                </div>

                <div className="space-y-3 pb-10">
                  {queue.map((track, i) => (
                    <motion.div 
                      key={`${track.id}-${i}`} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { playTrack(track); setShowQueue(false); }}
                      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <Avatar className="w-10 h-10 rounded-lg">
                        <AvatarImage src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-white/5">{(track.title || '').slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">{track.title}</p>
                        <p className="text-[10px] font-medium text-white/40 truncate">{track.artist}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 group-hover:text-white transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </Button>
                    </motion.div>
                  )
                )
              }
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
