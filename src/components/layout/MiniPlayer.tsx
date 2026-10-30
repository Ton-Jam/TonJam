import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Play, Pause, ListMusic } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface MiniPlayerProps {
  track?: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
  };
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onQueueClick?: () => void;
  onExpand?: () => void;
  onSeek?: (percentage: number) => void;
  progress?: number; // float between 0 and 1, or percentage 0 to 100
  isMobileNavHidden?: boolean;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track: propTrack,
  isPlaying: propIsPlaying,
  onPlayPause: propOnPlayPause,
  onQueueClick: propOnQueueClick,
  onExpand: propOnExpand,
  onSeek: propOnSeek,
  progress: propProgress,
  isMobileNavHidden = false,
}) => {
  const navigate = useNavigate();
  const audio = useAudio();

  // Seamlessly use props if provided, otherwise fall back to global AudioContext
  const currentTrack = propTrack ?? audio.currentTrack;
  const isPlaying = propIsPlaying !== undefined ? propIsPlaying : audio.isPlaying;
  const togglePlay = propOnPlayPause ?? audio.togglePlay;
  const setFullPlayerOpen = propOnExpand ?? (() => audio.setFullPlayerOpen(true));
  const seekHandler = propOnSeek ?? audio.seek;

  // Normalize progress to 0-100 percentage
  const rawProgress = propProgress !== undefined 
    ? (propProgress <= 1 ? propProgress * 100 : propProgress) 
    : audio.progress;

  const [localProgress, setLocalProgress] = useState(rawProgress);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);

  useEffect(() => {
    if (!isScrubbing) {
      setLocalProgress(rawProgress);
    }
  }, [rawProgress, isScrubbing]);

  if (!currentTrack) return null;

  const coverUrl = currentTrack.coverUrl || getPlaceholderImage('cover');

  const getPercentageFromEvent = (clientX: number) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const pct = getPercentageFromEvent(e.clientX);
    setLocalProgress(pct);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      e.stopPropagation();
      const pct = getPercentageFromEvent(e.clientX);
      setLocalProgress(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    setIsScrubbing(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    const pct = getPercentageFromEvent(e.clientX);
    setLocalProgress(pct);
    if (seekHandler) {
      seekHandler(pct);
    }
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (info.offset.y < -40 && setFullPlayerOpen) {
      setFullPlayerOpen();
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.4, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={{ y: dragY }}
      className={`fixed left-0 right-0 lg:left-64 text-[#FFFFFF] font-sans border-none select-none z-40 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-in-out cursor-pointer bg-[#0F1C32] ${
        isMobileNavHidden ? 'bottom-0' : 'bottom-[64px] lg:bottom-0'
      }`}
      id="tonjam-mini-player"
      onClick={setFullPlayerOpen}
    >
      {/* 2px Progress Bar at Top */}
      <div 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => e.stopPropagation()}
        role="slider"
        aria-label="Seek track playback"
        aria-valuenow={Math.round(localProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative w-full h-[2px] bg-transparent border-none cursor-pointer touch-none select-none z-20 group"
        title="Scrub playback position"
      >
        {/* Expanded touch target */}
        <div className="absolute -top-2 -bottom-2 left-0 right-0" />
        <div
          className="h-full bg-[#00B4D8] transition-all duration-100 shadow-[0_0_6px_rgba(0,180,216,0.6)]"
          style={{ width: `${Math.min(100, Math.max(0, localProgress))}%` }}
        />
      </div>

      {/* Main Track Details Row */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 gap-3">
        {/* Artwork + Title + Artist */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-[#0A1628] shrink-0 shadow-sm">
            <img
              src={coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPlaceholderImage('cover');
              }}
            />
          </div>

          <div className="flex flex-col min-w-0 justify-center leading-tight flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#FFFFFF] truncate tracking-tight">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] font-medium text-[#C2C7CD] truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="w-9 h-9 rounded-full bg-[#00B4D8] hover:bg-[#009CC0] text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-[#00B4D8]/30 cursor-pointer border-none shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Queue Button */}
          <button
            onClick={() => {
              if (propOnQueueClick) {
                propOnQueueClick();
              } else {
                navigate('/queue');
              }
            }}
            aria-label="Track queue"
            className="p-2 text-[#8C8C8C] hover:text-[#FFFFFF] transition-colors flex items-center justify-center cursor-pointer border-none bg-transparent active:scale-90"
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniPlayer;
