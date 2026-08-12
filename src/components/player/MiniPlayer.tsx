import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, PanInfo, AnimatePresence } from "motion/react";
import { Play, Pause, ListMusic, MoreVertical, Heart, Coins, ChevronUp, Music2 } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import TipArtistModal from "@/components/TipArtistModal";

interface MiniPlayerProps {
  onQueueClick?: () => void;
  isMobileNavHidden?: boolean;
}

interface ScrollingTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
  id?: string;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  className = "",
  containerClassName = "",
  id,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth + 1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  const duration = Math.max(7, Math.min(25, text.length * 0.45));

  return (
    <div
      ref={containerRef}
      id={id}
      className={`overflow-hidden relative whitespace-nowrap ${containerClassName}`}
      style={{
        maskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)"
          : "none",
        WebkitMaskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)"
          : "none",
      }}
    >
      {isOverflowing ? (
        <div
          className="animate-mini-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <span ref={textRef} className={`pr-8 inline-block ${className}`}>
            {text}
          </span>
          <span className={`pr-8 inline-block ${className}`}>
            {text}
          </span>
        </div>
      ) : (
        <span ref={textRef} className={`inline-block truncate ${className}`}>
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
    setFullPlayerOpen,
    setOptionsTrack,
    likedTrackIds,
    toggleLikeTrack
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(progress);
  const [showTipModal, setShowTipModal] = useState(false);

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
    setLocalProgress(progress);
  }, [progress]);

  // When location changes to/from a dropdown page, update state
  useEffect(() => {
    if (location.pathname !== lastPath) {
      setLastPath(location.pathname);
      setIsDroppedDown(isDropdownPage);
    }
  }, [location.pathname, isDropdownPage, lastPath]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0) {
      const newPercent = Math.max(0, Math.min(100, (clickX / width) * 100));
      setLocalProgress(newPercent);
      if (typeof seek === 'function') {
        seek(newPercent);
      }
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

  const handleTipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTipModal(true);
  };

  const coverUrl = currentTrack.coverUrl || getPlaceholderImage("cover");

  // RENDER DROPPED-DOWN (COLLAPSED) FLOATING PILL
  if (isDroppedDown) {
    return (
      <>
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
            className="group relative flex items-center gap-2.5 p-1.5 pr-3 bg-[#080d2d]/95 hover:bg-[#0c1445] text-white rounded-full border border-[#0098EA]/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl cursor-pointer transition-all hover:scale-105 active:scale-95 select-none overflow-hidden"
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
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#0098EA]/50 shadow-inner">
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
        </motion.div>

        {showTipModal && (
          <TipArtistModal track={currentTrack} onClose={() => setShowTipModal(false)} />
        )}
      </>
    );
  }

  // RENDER FULL MINI PLAYER BAR
  return (
    <>
      <motion.div
        layoutId="tonjam-player-container"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.8, bottom: 0.2 }}
        onDragEnd={handleDragEnd}
        onClick={() => setFullPlayerOpen(true)}
        whileTap={{ scale: 0.99 }}
        className={`fixed left-0 right-0 lg:left-64 bg-[#0A113A] text-[#F2F4F8] font-sans border-t border-[#16244F] select-none z-40 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-in-out cursor-pointer ${
          isMobileNavHidden ? "bottom-0" : "bottom-16 lg:bottom-0"
        }`}
        style={{ touchAction: "none" }}
        id="tonjam-mini-player"
      >
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Artwork + Title + Artist */}
          <div className="flex items-center gap-3 flex-1 min-w-0" id="mini-metadata-area">
            <img
              src={coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 object-cover rounded-[10px] flex-shrink-0 border border-[#16244F]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
              }}
              id="mini-artwork"
            />
            <div className="flex flex-col min-w-0 leading-tight flex-1 max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              <div className="flex items-center gap-1.5 min-w-0">
                <ScrollingText
                  text={currentTrack.title}
                  className="text-xs font-bold text-[#F2F4F8]"
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
                className="text-[11px] font-medium text-[#9AA0AE]"
                containerClassName="min-w-0 flex-1"
                id="mini-track-artist"
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Tip Artist TON Button */}
            <button
              onClick={handleTipClick}
              className="p-1.5 text-amber-400 hover:text-amber-300 transition-all hover:scale-110 active:scale-95"
              title={`Tip ${currentTrack.artist} (TON)`}
              aria-label="Tip Artist"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-9 h-9 rounded-full bg-[#0098EA] text-white flex items-center justify-center hover:bg-[#0098EA]/90 transition-transform active:scale-90 shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Queue Button */}
            {onQueueClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQueueClick();
                }}
                className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors hidden sm:block"
                title="Queue"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            )}

            {/* More options */}
            <button
              onClick={handleOptionsClick}
              className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ultra-thin, sleek progress bar sitting directly at bottom edge */}
        <div 
          onClick={handleSeek}
          className="relative w-full h-[1.5px] hover:h-[3.5px] bg-[#050A24] cursor-pointer group transition-all duration-150 z-20" 
          id="mini-progress-track"
          title="Click to seek playback position"
        >
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-[#0098EA] to-cyan-400 transition-all duration-150 shadow-[0_0_10px_rgba(0,152,234,0.8)] relative"
            style={{ width: `${localProgress}%` }}
            id="mini-progress-indicator"
          >
            {/* Glowing seek knob on hover */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(0,152,234,1)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </motion.div>

      {showTipModal && (
        <TipArtistModal track={currentTrack} onClose={() => setShowTipModal(false)} />
      )}
    </>
  );
};

export default MiniPlayer;
