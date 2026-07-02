import React, { useEffect, useState } from "react";
import { motion, useDragControls, PanInfo } from "motion/react";
import { Play, Pause, ListMusic, Maximize2, MoreVertical } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";

interface MiniPlayerProps {
  onQueueClick?: () => void;
  isMobileNavHidden?: boolean;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onQueueClick,
  isMobileNavHidden = false,
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    setFullPlayerOpen,
    setOptionsTrack,
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  if (!currentTrack) return null;

  // Drag handlers for Swipe Up to expand
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If the user drags up by more than 50px, open full player
    if (info.offset.y < -55) {
      setFullPlayerOpen(true);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(currentTrack);
  };

  const coverUrl = currentTrack.coverUrl || getPlaceholderImage("cover");

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.8, bottom: 0.1 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      className={`fixed left-2 right-2 bg-zinc-950 font-sans rounded-[10px] select-none z-40 flex flex-col pointer-events-auto overflow-hidden shadow-2xl transition-all duration-300 ${
        isMobileNavHidden ? "bottom-4" : "bottom-20 lg:bottom-4"
      }`}
      style={{ touchAction: "none" }}
      id="tonjam-mini-player"
    >
      {/* Tiny top progress bar */}
      <div className="w-full h-1 bg-zinc-900" id="mini-progress-track">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${localProgress}%` }}
          id="mini-progress-indicator"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing">
        {/* Artwork + Title + Artist */}
        <div
          onClick={() => setFullPlayerOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0"
          id="mini-metadata-area"
        >
          <img
            src={coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 object-cover rounded-[6px] flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
            }}
            id="mini-artwork"
          />
          <div className="flex flex-col min-w-0 leading-tight">
            <span
              className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs"
              id="mini-track-title"
            >
              {currentTrack.title}
            </span>
            <span
              className="text-[10px] font-medium text-zinc-400 truncate max-w-[140px] sm:max-w-xs flex items-center gap-1"
              id="mini-track-artist"
            >
              {currentTrack.artist}
              {currentTrack.artistVerified && (
                <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white font-black scale-90">
                  ✓
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Queue Trigger */}
          {onQueueClick && (
            <button
              onClick={onQueueClick}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              id="mini-queue-trigger"
              aria-label="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          )}

          {/* Play/Pause control */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow"
            id="mini-play-toggle"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current pl-0.5" />
            )}
          </motion.button>

          {/* Full Screen expand trigger */}
          <button
            onClick={() => setFullPlayerOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            id="mini-expand"
            aria-label="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Option Menu Toggle */}
          <button
            onClick={handleOptionsClick}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            id="mini-options"
            aria-label="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniPlayer;
