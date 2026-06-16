import React from "react";
import { motion } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import SubtleFrequencyVisualizer from "./SubtleFrequencyVisualizer";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Pause, 
  MoreVertical, 
  X, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Maximize2,
  Share2,
  Heart,
  ListMusic,
  Plus,
  User,
  Info,
  Gem,
  DownloadCloud
} from "lucide-react";
import { getPlaceholderImage, cn, shareContent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MiniAudioPlayerProps {
  onOptionsClick?: () => void;
  isMobileNavHidden?: boolean;
}

const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  onOptionsClick,
  isMobileNavHidden,
}) => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    closePlayer,
    setFullPlayerOpen,
    isHighFidelity,
    setOptionsTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    addToQueue,
    setTrackToAddToPlaylist,
    likedTrackIds,
    toggleLikeTrack,
    addNotification,
    seek,
    isTrackCached
  } = useAudio();

  const [isCached, setIsCached] = React.useState(false);

  React.useEffect(() => {
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

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  const duration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * duration;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptionsClick) {
      onOptionsClick();
    } else {
      setOptionsTrack(currentTrack);
    }
  };

  const handleToggleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleLikeTrack(currentTrack.id);
  };

  const handleAddToQueue = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToQueue(currentTrack);
  };

  const handleAddToPlaylist = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTrackToAddToPlaylist(currentTrack);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const result = await shareContent({
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Listening to ${currentTrack.title} on TonJam!`,
      url: shareUrl,
    });
    if (result.success) {
      addNotification(result.method === 'clipboard' ? 'Link copied!' : 'Shared!', 'success');
    }
  };



  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed left-0 right-0 z-[48] bg-background/85 backdrop-blur-xl border-t border-blue-500/10 px-6 py-3 flex flex-col items-stretch shadow-[0_-12px_45px_rgba(0,0,0,0.4)] h-[76px] md:h-24 lg:left-64 transition-all duration-300",
        isMobileNavHidden ? "bottom-0" : "bottom-16 lg:bottom-0"
      )}
    >
      {/* Blurred Cover Background */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl scale-110"
          style={{ backgroundImage: `url(${currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Top Progress Bar for Mobile Screen only (Compact indicator, interactive slider is on desktop center column) */}
      <div className="absolute top-0 left-0 right-0 px-0 z-10 sm:hidden">
        <Progress 
          value={progress} 
          className="h-[2.5px] w-full rounded-none bg-muted/10" 
        />
      </div>

      <div className="flex items-center justify-between h-full relative z-10">
        {/* ================= COLUMN 1: TRACK INFO ================= */}
        <div className="flex items-center gap-3.5 w-auto max-w-[45%] sm:max-w-[30%] min-w-0">
          <div 
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
            onClick={() => setFullPlayerOpen(true)}
          >
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[4px] overflow-hidden flex-shrink-0 bg-zinc-900 shadow-md ring-1 ring-white/10 flex items-center justify-center">
              <img
                src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt=""
                referrerPolicy="no-referrer"
              />
              {/* Subtle frequency visualizer overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px] flex items-end justify-center pb-1.5 px-1 pb-1">
                  <SubtleFrequencyVisualizer isPlaying={isPlaying} color="#60a5fa" barCount={4} className="h-4.5 w-6" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <h4 className="text-[11px] md:text-sm font-black truncate text-white uppercase tracking-tighter leading-tight">
                  {currentTrack.title}
                </h4>
                {isHighFidelity && (
                  <span className="bg-blue-600 text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-[2px] tracking-[0.2em] uppercase flex-shrink-0">
                    Hi-Fi
                  </span>
                )}
                {isCached && (
                  <span className="text-blue-400 flex items-center flex-shrink-0" title="Cached for offline listening">
                    <DownloadCloud className="w-3.5 h-3.5 fill-blue-500/10" />
                  </span>
                )}
              </div>
              <button
                onClick={handleArtistClick}
                className="text-[8.5px] md:text-[10px] text-zinc-400 hover:text-blue-400 transition-colors text-left leading-none w-fit font-bold uppercase tracking-widest truncate"
              >
                {currentTrack.artist}
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: CENTER PLAYBACK & SEEK BAR ================= */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-2 w-[40%] px-2">
          {/* Controls Row */}
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 rounded-[4px] transition-all relative hover:bg-white/5", 
                    isShuffle ? "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10" : "text-zinc-400 hover:text-white"
                  )}
                  onClick={toggleShuffle}
                >
                  <Shuffle className="h-4 w-4" />
                  {isShuffle && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shuffle</TooltipContent>
            </Tooltip>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={prevTrack}
            >
              <SkipBack className="h-[18px] w-[18px] fill-current" />
            </Button>

            <Button
              size="icon"
              className="relative w-10 h-10 rounded-full bg-white hover:bg-neutral-100 text-black shadow-lg transition-transform hover:scale-105 active:scale-95 overflow-hidden"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              <motion.div
                className="absolute inset-0 bg-black/10"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 2, opacity: 0.4 }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: 'none' }}
              />
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current text-black" />
              ) : (
                <Play className="h-4 w-4 fill-current text-black ml-0.5" />
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={nextTrack}
            >
              <SkipForward className="h-[18px] w-[18px] fill-current" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 rounded-[4px] transition-all relative hover:bg-white/5", 
                    repeatMode !== 'off' ? "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10" : "text-zinc-400 hover:text-white"
                  )}
                  onClick={toggleRepeat}
                >
                  <Repeat className="h-4 w-4" />
                  {repeatMode !== 'off' && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Repeat</TooltipContent>
            </Tooltip>
          </div>

          {/* Live Progress Bar with Time Labels */}
          <div className="flex items-center gap-3 w-full max-w-sm md:max-w-md">
            <span className="text-[10px] font-bold text-zinc-500 w-8 text-right font-mono select-none">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={(val) => seek(val[0])}
              className="w-full cursor-pointer h-1"
            />
            <span className="text-[10px] font-bold text-zinc-500 w-8 text-left font-mono select-none">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ================= COLUMN 3: AUXILIARY & VOLUME ================= */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-auto max-w-[45%] sm:max-w-[30%]">
          {/* Mobile-only Play Button */}
          <Button
            size="icon"
            className="relative sm:hidden w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 2, opacity: 0.4 }}
              transition={{ duration: 0.3 }}
              style={{ pointerEvents: 'none' }}
            />
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </Button>

          {/* Queue Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"
                onClick={handleAddToQueue}
              >
                <ListMusic className="h-4.5 w-4.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Queue</TooltipContent>
          </Tooltip>

          {/* Interactive Volume control hover styled */}
          <div className="hidden md:flex items-center gap-2 group/volume ml-1 mr-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              className="w-[72px] lg:w-20 cursor-pointer h-1"
              onValueChange={(vals) => setVolume(vals[0] / 100)}
            />
          </div>

          {/* Maximize screen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"
                onClick={() => setFullPlayerOpen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Full Player</TooltipContent>
          </Tooltip>

          {/* Dropdown Options */}
          <button 
            onClick={handleOptionsClick}
            className="h-8 w-8 flex items-center justify-center rounded-[4px] text-zinc-400 hover:text-white hover:bg-white/5 outline-none transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Discard Player Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-[4px] text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors hidden sm:flex"
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniAudioPlayer;
