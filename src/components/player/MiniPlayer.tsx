import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, PanInfo, AnimatePresence } from "motion/react";
import { Play, Pause, ListMusic, MoreVertical, Heart, ChevronUp, Music2 } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";

interface MiniPlayerProps {
  onQueueClick?: () => void;
  isMobileNavHidden?: boolean;
}

interface ScrollingTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  speed?: number; // pixels per second for readable scrolling
}

const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  className = "",
  containerClassName = "",
  id,
  speed = 35,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    const updateOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.offsetWidth || measureRef.current.scrollWidth;
        const overflowing = textWidth > containerWidth + 2;
        setIsOverflowing(overflowing);
        if (overflowing) {
          const totalDistance = textWidth + 32;
          const calculatedDuration = Math.max(6, Math.min(30, totalDistance / speed));
          setDuration(calculatedDuration);
        }
      }
    };

    updateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      updateOverflow();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateOverflow);

    if (document.fonts) {
      document.fonts.ready.then(updateOverflow).catch(() => {});
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [text, speed]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`overflow-hidden relative whitespace-nowrap ${containerClassName}`}
      style={{
        maskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)"
          : "none",
        WebkitMaskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)"
          : "none",
      }}
    >
      {/* Invisible measurement element to calculate natural unpadded text width */}
      <span
        ref={measureRef}
        className={`invisible absolute top-0 left-0 whitespace-nowrap pointer-events-none -z-50 select-none opacity-0 ${className}`}
        aria-hidden="true"
      >
        {text}
      </span>

      {isOverflowing ? (
        <div
          className="animate-mini-marquee inline-flex"
          style={{ animationDuration: `${duration}s`, willChange: "transform" }}
        >
          <span className={`pr-8 inline-block shrink-0 ${className}`}>
            {text}
          </span>
          <span className={`pr-8 inline-block shrink-0 ${className}`} aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span className={`inline-block truncate max-w-full ${className}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onQueueClick,
  isMobileNavHidden = false,
}) => {
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    setIsSeeking,
    setFullPlayerOpen,
    setOptionsTrack,
    likedTrackIds,
    toggleLikeTrack,
    audioConnectionState
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(progress);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  const duration = currentTrack?.duration || 0;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Auto drop-down on pages like settings, notifications, profile, tasks, wallet
  const isDropdownPage = 
    location.pathname === '/settings' ||
    location.pathname === '/notifications' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/user/') ||
    location.pathname.startsWith('/artist/') ||
    location.pathname === '/edit-profile' ||
    location.pathname === '/wallet' ||
    location.pathname === '/tasks';

  const [isDroppedDown, setIsDroppedDown] = useState(isDropdownPage);
  const [lastPath, setLastPath] = useState(location.pathname);

  useEffect(() => {
    if (!isScrubbing) {
      setLocalProgress(progress);
    }
  }, [progress, isScrubbing]);

  // When location changes to/from a dropdown page, update state
  useEffect(() => {
    if (location.pathname !== lastPath) {
      setLastPath(location.pathname);
      setIsDroppedDown(isDropdownPage);
    }
  }, [location.pathname, isDropdownPage, lastPath]);

  const getPercentageFromEvent = (clientX: number) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
    setIsScrubbing(true);
    if (typeof setIsSeeking === 'function') setIsSeeking(true);
    const pct = getPercentageFromEvent(e.clientX);
    setLocalProgress(pct);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pct = getPercentageFromEvent(e.clientX);
    setHoverPos(pct);
    if (isScrubbing) {
      e.stopPropagation();
      setLocalProgress(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    setIsScrubbing(false);
    if (typeof setIsSeeking === 'function') setIsSeeking(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    const pct = getPercentageFromEvent(e.clientX);
    setLocalProgress(pct);
    if (typeof seek === 'function') {
      seek(pct);
    }
  };

  const handlePointerLeave = () => {
    if (!isScrubbing) {
      setHoverPos(null);
    }
  };

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  // Drag handlers: Swipe Up to expand full player, Swipe Down to drop down mini player
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -40) {
      setFullPlayerOpen(true);
    } else if (info.offset.y > 40) {
      setIsDroppedDown(true);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(currentTrack);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(currentTrack.id);
  };

  const coverUrl = currentTrack.coverUrl || getPlaceholderImage("cover");

  // RENDER DROPPED-DOWN (COLLAPSED) FLOATING PILL
  if (isDroppedDown) {
    return (
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`fixed right-3 sm:right-6 z-40 transition-all duration-300 ease-in-out ${
          isMobileNavHidden ? "bottom-3 sm:bottom-6" : "bottom-20 lg:bottom-6"
        }`}
        id="tonjam-dropped-down-player"
      >
        <div 
          onClick={() => setIsDroppedDown(false)}
          className="group relative flex items-center gap-2.5 p-1.5 pr-3 text-white rounded-full border-none shadow-[0_8px_30px_rgba(0,0,0,0.6)] cursor-pointer transition-all hover:scale-105 active:scale-95 select-none overflow-hidden"
          style={{
            backgroundColor: "#000000",
            background: "#000000",
            opacity: 1,
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
          title="Click to expand Mini Player"
        >
          {/* Sleek top progress indicator on collapsed pill */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-slate-800/80">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-[#0098EA] to-cyan-400" 
              style={{ width: `${localProgress}%` }} 
            />
          </div>
          {/* Animated artwork thumbnail */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner">
              <img 
                src={coverUrl} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? "animate-spin-slow" : ""}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                </div>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="flex flex-col min-w-0 pr-1 max-w-[100px] sm:max-w-[130px]">
            <div className="flex items-center gap-1 min-w-0">
              <Music2 className="w-3 h-3 text-[#0098EA] shrink-0" />
              <ScrollingText
                text={currentTrack.title}
                className="text-[11px] font-bold text-white"
                containerClassName="w-full"
              />
            </div>
            <ScrollingText
              text={currentTrack.artist}
              className="text-[9.5px] font-medium text-slate-400"
              containerClassName="w-full pl-4"
            />
          </div>

          {/* Play/Pause button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-7 h-7 rounded-full bg-[#0098EA] hover:bg-blue-400 text-white flex items-center justify-center shadow-md transition-transform active:scale-90 shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Expand / Drop-up icon button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDroppedDown(false);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Expand Mini Player"
          >
            <ChevronUp className="w-4 h-4 text-[#0098EA]" />
          </button>
        </div>

        {/* Streaming Health Indicator - Upward in the top-right angle */}
        <div 
          className="absolute top-1.5 right-2 z-30 flex items-center justify-center pointer-events-auto" 
          id="mini-pill-streaming-health-indicator"
          onClick={(e) => e.stopPropagation()}
        >
          <span 
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
              audioConnectionState === 'connected' ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' :
              audioConnectionState === 'connecting' ? 'bg-amber-400 animate-pulse' :
              audioConnectionState === 'error' ? 'bg-rose-500' :
              'bg-slate-500'
            }`}
            title={
              audioConnectionState === 'connected' ? 'Streaming Health: Optimal' :
              audioConnectionState === 'connecting' ? 'Streaming Health: Connecting...' :
              audioConnectionState === 'error' ? 'Streaming Health: Error' :
              'Streaming Health: Idle'
            }
          />
        </div>
      </motion.div>
    );
  }

  // RENDER FULL MINI PLAYER BAR
  return (
    <motion.div
      layoutId="tonjam-player-container"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.8, bottom: 0.2 }}
      onDragEnd={handleDragEnd}
      onClick={() => setFullPlayerOpen(true)}
      whileTap={{ scale: 0.99 }}
      className={`fixed left-0 right-0 lg:left-64 text-[#F2F4F8] font-sans border-none select-none z-40 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-in-out cursor-pointer ${
        isMobileNavHidden ? "bottom-0" : "bottom-16 lg:bottom-0"
      }`}
      style={{
        touchAction: "none",
        backgroundColor: "#000000",
        background: "#000000",
        opacity: 1,
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      id="tonjam-mini-player"
    >
      {/* Interactive Flush Top Seek Bar (Perfect 1px top alignment) */}
      <div 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => e.stopPropagation()}
        role="slider"
        aria-label="Seek track progress"
        aria-valuenow={Math.round(localProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            const next = Math.max(0, localProgress - 5);
            setLocalProgress(next);
            if (typeof seek === 'function') seek(next);
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            const next = Math.min(100, localProgress + 5);
            setLocalProgress(next);
            if (typeof seek === 'function') seek(next);
          }
        }}
        className="relative w-full h-[1px] group/seek cursor-pointer select-none z-30 touch-none outline-none bg-white/10" 
        id="mini-progress-track"
        title="Click or drag to scrub playback position"
      >
        {/* Expanded touch/click target area */}
        <div className="absolute -top-1.5 -bottom-1.5 left-0 right-0 z-10" />

        {/* Hover/Scrub Time Tooltip */}
        {(isScrubbing || hoverPos !== null) && duration > 0 && (
          <div 
            className="absolute top-2 -translate-x-1/2 px-1.5 py-0.5 bg-[#050A24]/95 text-white text-[10px] font-mono font-bold rounded shadow-lg pointer-events-none z-40 transition-opacity"
            style={{ left: `${Math.max(5, Math.min(95, isScrubbing ? localProgress : (hoverPos ?? localProgress)))}%` }}
          >
            {formatTime(((isScrubbing ? localProgress : (hoverPos ?? localProgress)) / 100) * duration)}
          </div>
        )}

        {/* Progress Fill */}
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-[#0098EA] to-cyan-400 relative transition-all shadow-[0_0_4px_rgba(0,152,234,0.5)]"
          style={{ width: `${localProgress}%` }}
          id="mini-progress-indicator"
        >
          {/* Glowing Seek Knob / Thumb (shown on hover and active scrub) */}
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_6px_rgba(0,152,234,1)] transition-transform duration-100 ${
              isScrubbing ? 'scale-100' : 'scale-0 group-hover/seek:scale-100'
            }`} 
          />
        </div>
      </div>

      {/* Main Content Row: Artwork, Metadata, Controls */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 gap-3">
        {/* Artwork + Title + Artist */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0" id="mini-metadata-area">
          <div className="relative shrink-0">
            <img
              src={coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 object-cover rounded-md shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
              }}
              id="mini-artwork"
            />
            {/* Streaming Health Indicator badge on artwork corner */}
            <span 
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black shrink-0 transition-all duration-300 ${
                audioConnectionState === 'connected' ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' :
                audioConnectionState === 'connecting' ? 'bg-amber-400 animate-pulse' :
                audioConnectionState === 'error' ? 'bg-rose-500 animate-bounce' :
                'bg-slate-500'
              }`}
              title={
                audioConnectionState === 'connected' ? 'Streaming: Connected' :
                audioConnectionState === 'connecting' ? 'Streaming: Connecting...' :
                audioConnectionState === 'error' ? 'Streaming: Blocked / Error' :
                'Streaming: Idle'
              }
            />
          </div>

          <div className="flex flex-col min-w-0 justify-center leading-tight flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <ScrollingText
                text={currentTrack.title}
                className="text-xs sm:text-sm font-bold text-[#F2F4F8]"
                containerClassName="min-w-0 flex-1"
                id="mini-track-title"
              />
              {currentTrack.isHighFidelity && (
                <span className="px-1 py-0.2 bg-[#0098EA]/20 text-[#0098EA] text-[8px] font-black rounded-xs uppercase shrink-0">
                  Hi-Fi
                </span>
              )}
            </div>
            <ScrollingText
              text={currentTrack.artist}
              className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5"
              containerClassName="min-w-0 flex-1"
              id="mini-track-artist"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0098EA] text-white flex items-center justify-center hover:bg-[#0098EA]/90 transition-transform active:scale-90 shadow-md shadow-[#0098EA]/30 cursor-pointer border-none shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Queue Button */}
          {onQueueClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQueueClick();
              }}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:flex items-center justify-center cursor-pointer border-none bg-transparent"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}

          {/* More options */}
          <button
            onClick={handleOptionsClick}
            aria-label="Track options"
            className="p-1.5 text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer border-none bg-transparent"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniPlayer;
