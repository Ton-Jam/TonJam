import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Sparkles, Disc3, Headphones, Zap } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_TRACKS } from '@/constants';
import { NFTItem, Track } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface NFTAudioPreviewPlayerProps {
  nft?: Partial<NFTItem>;
  audioUrl?: string;
  trackId?: string;
  variant?: 'full' | 'compact' | 'banner' | 'card' | 'dialog';
  className?: string;
  title?: string;
  artist?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const PREVIEW_DURATION_LIMIT = 30; // 30 seconds preview

export const NFTAudioPreviewPlayer: React.FC<NFTAudioPreviewPlayerProps> = ({
  nft,
  audioUrl: customAudioUrl,
  trackId,
  variant = 'full',
  className = '',
  title: customTitle,
  artist: customArtist,
  onPlayStateChange
}) => {
  const { isPlaying: isGlobalPlaying, togglePlay: toggleGlobalPlay, addNotification } = useAudio();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewCompleted, setPreviewCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // 1. Resolve Audio Source
  const resolvedAudioUrl = useMemo(() => {
    if (customAudioUrl) return customAudioUrl;
    if (nft?.audioUrl) return nft.audioUrl;
    
    // Check by trackId or NFT id
    const targetTrackId = trackId || nft?.trackId || nft?.id;
    if (targetTrackId) {
      const matched = MOCK_TRACKS.find(t => t.id === targetTrackId || t.songId === targetTrackId);
      if (matched?.audioUrl) return matched.audioUrl;
    }
    
    // Check by title
    const searchTitle = (customTitle || nft?.title || '').toLowerCase().trim();
    if (searchTitle) {
      const matchedByTitle = MOCK_TRACKS.find(t => 
        searchTitle.includes(t.title.toLowerCase()) || t.title.toLowerCase().includes(searchTitle)
      );
      if (matchedByTitle?.audioUrl) return matchedByTitle.audioUrl;
    }

    // High quality fallback audio for preview
    return 'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3';
  }, [customAudioUrl, nft, trackId, customTitle]);

  const displayTitle = customTitle || nft?.title || 'Sonic NFT Master';
  const displayArtist = customArtist || nft?.artist || nft?.creator || 'Verified Artist';

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const clamped = Math.min(PREVIEW_DURATION_LIMIT, Math.max(0, secs));
    const m = Math.floor(clamped / 60);
    const s = Math.floor(clamped % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Stop preview function
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  // Sync with window-level singleton to allow only 1 preview at a time
  useEffect(() => {
    const audio = new Audio();
    audio.src = resolvedAudioUrl;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current && audio) {
        const time = audio.currentTime;
        if (time >= PREVIEW_DURATION_LIMIT) {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          setCurrentTime(PREVIEW_DURATION_LIMIT);
          setPreviewCompleted(true);
          onPlayStateChange?.(false);
        } else {
          setCurrentTime(time);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setPreviewCompleted(true);
      onPlayStateChange?.(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.src = '';
      if ((window as any).__activeNFTPreviewStop === stopAudio) {
        (window as any).__activeNFTPreviewStop = null;
      }
    };
  }, [resolvedAudioUrl, stopAudio, onPlayStateChange]);

  // Toggle Play / Pause
  const togglePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      // Pause global audio stream to prevent overlap
      if (isGlobalPlaying) {
        toggleGlobalPlay().catch(() => {});
      }

      // Stop any other active NFT preview
      if ((window as any).__activeNFTPreviewStop && (window as any).__activeNFTPreviewStop !== stopAudio) {
        try {
          (window as any).__activeNFTPreviewStop();
        } catch {
          // Ignore
        }
      }
      (window as any).__activeNFTPreviewStop = stopAudio;

      if (previewCompleted || currentTime >= PREVIEW_DURATION_LIMIT) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setPreviewCompleted(false);
      }

      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        onPlayStateChange?.(true);
      } catch (err: any) {
        setIsLoading(false);
        if (err.name !== 'AbortError') {
          console.warn('Playback error:', err);
        }
      }
    }
  };

  // Replay from start
  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setPreviewCompleted(false);
    if (!isPlaying) {
      togglePlay();
    }
  };

  // Toggle Mute
  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Scrubbing within 30s preview limit
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressContainerRef.current || !audioRef.current) return;
    
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * PREVIEW_DURATION_LIMIT;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setPreviewCompleted(false);
  };

  const progressPercent = (currentTime / PREVIEW_DURATION_LIMIT) * 100;

  // Render Compact Variant (for modals or cards)
  if (variant === 'compact' || variant === 'dialog') {
    return (
      <div className={cn("p-3 rounded-xl bg-white/[0.04] backdrop-blur-md select-none", className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md",
                isPlaying
                  ? "bg-blue-500 text-white shadow-blue-500/30 scale-105"
                  : "bg-white/10 hover:bg-white/20 text-white"
              )}
              title={isPlaying ? "Pause 30s Preview" : "Play 30s Snippet"}
            >
              {isLoading ? (
                <Disc3 className="w-4 h-4 animate-spin text-blue-400" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                  30s Preview
                </span>
                <span className="text-[8px] text-zinc-400 font-medium truncate">
                  Master Snippet
                </span>
              </div>
              <p className="text-[11px] font-bold text-white truncate leading-tight mt-0.5">
                {displayTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-blue-400">
                {formatTime(currentTime)}
              </span>
              <span className="text-[9px] font-mono text-zinc-500"> / 0:30</span>
            </div>
            <button
              onClick={handleReplay}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              title="Restart 30s preview"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Waveform */}
        <div
          ref={progressContainerRef}
          onClick={handleSeek}
          className="mt-2.5 h-1.5 w-full bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Render Full Banner / Interactive Preview Player (For NFTDetail and High-Visibility views)
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-gradient-to-br from-[#0c122a]/95 via-[#0b0f20]/90 to-[#070913]/95 backdrop-blur-xl shadow-xl select-none",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">
            30-Second Audio Snippet Preview
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 text-[8px] font-bold uppercase tracking-wider hidden sm:inline-block">
            Listen Before Buying
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            Lossless Master (30s Limit)
          </span>
        </div>
      </div>

      {/* Main Controls & Waveform Display */}
      <div className="flex items-center gap-3.5">
        {/* Play / Pause Big Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-lg",
            isPlaying
              ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/40 scale-105"
              : "bg-white/10 hover:bg-white/20 text-white hover:scale-102"
          )}
          title={isPlaying ? "Pause snippet" : "Listen to 30-second snippet"}
        >
          {isLoading ? (
            <Disc3 className="w-5 h-5 animate-spin text-white" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Center Track Details & Interactive Visualizer Scrubber */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate leading-tight">
                {displayTitle}
              </h4>
              <p className="text-[10px] text-zinc-400 truncate">
                {displayArtist}
              </p>
            </div>

            {/* Time Indicator */}
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-black text-blue-400">
                {formatTime(currentTime)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 font-medium">
                {" "}/ 0:30
              </span>
            </div>
          </div>

          {/* Interactive Scrubbing Bar with Audio Frequency Bars */}
          <div
            ref={progressContainerRef}
            onClick={handleSeek}
            className="h-7 w-full bg-white/[0.04] rounded-lg cursor-pointer relative overflow-hidden flex items-center px-1.5 group"
            title="Click to jump anywhere in 30s preview"
          >
            {/* Background Waveform Simulation */}
            <div className="absolute inset-0 flex items-center justify-between px-2 gap-1 opacity-30 pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => {
                const heightPercent = 20 + Math.sin(i * 0.45) * 40 + Math.cos(i * 0.9) * 30;
                const isPassed = (i / 36) * 100 <= progressPercent;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all duration-150",
                      isPassed ? "bg-blue-400" : "bg-white/40",
                      isPlaying && isPassed && "animate-pulse"
                    )}
                    style={{ height: `${Math.max(15, heightPercent)}%` }}
                  />
                );
              })}
            </div>

            {/* Smooth Progress Fill */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-500/20 pointer-events-none transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            
            {/* Playhead Pin */}
            <div
              className="absolute top-1 bottom-1 w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none transition-all duration-75"
              style={{ left: `calc(${progressPercent}% - 2px)` }}
            />
          </div>
        </div>

        {/* Action Controls (Replay, Mute) */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={handleReplay}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Replay snippet from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isMuted ? "Unmute preview" : "Mute preview"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Subtle Notice When Snippet Ends */}
      <AnimatePresence>
        {previewCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 pt-2 flex items-center justify-between text-[9px] text-zinc-400 overflow-hidden"
          >
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> 30-Second preview finished.
            </span>
            <button
              onClick={handleReplay}
              className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer"
            >
              Replay Snippet
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NFTAudioPreviewPlayer;
