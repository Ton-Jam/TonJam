import React, { useEffect, useState } from "react";
import { motion, PanInfo } from "motion/react";
import { Play, Pause, ListMusic, MoreVertical, Heart, Radio, Coins } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import TipArtistModal from "@/components/TipArtistModal";

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
    likedTrackIds,
    toggleLikeTrack
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(progress);
  const [showTipModal, setShowTipModal] = useState(false);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  // Drag handlers for Swipe Up to expand
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -45) {
      setFullPlayerOpen(true);
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

  return (
    <>
      <motion.div
        layoutId="tonjam-player-container"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.8, bottom: 0.1 }}
        onDragEnd={handleDragEnd}
        onClick={() => setFullPlayerOpen(true)}
        whileTap={{ scale: 0.99 }}
        className={`fixed left-0 right-0 lg:left-64 bg-[#0A113A] text-[#F2F4F8] font-sans border-t border-[#16244F] select-none z-40 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer ${
          isMobileNavHidden ? "bottom-0" : "bottom-16 lg:bottom-0"
        }`}
        style={{ touchAction: "none" }}
        id="tonjam-mini-player"
      >
      {/* Top progress bar */}
      <div className="w-full h-1 bg-[#050A24]" id="mini-progress-track">
        <div
          className="h-full bg-[#0098EA] transition-all duration-200"
          style={{ width: `${localProgress}%` }}
          id="mini-progress-indicator"
        />
      </div>

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
          <div className="flex flex-col min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-xs font-bold text-[#F2F4F8] truncate max-w-[150px] sm:max-w-xs"
                id="mini-track-title"
              >
                {currentTrack.title}
              </span>
              {currentTrack.isHighFidelity && (
                <span className="px-1 py-0.2 bg-[#0098EA]/20 text-[#0098EA] text-[8px] font-black rounded-xs uppercase">
                  Hi-Fi
                </span>
              )}
            </div>
            <span
              className="text-[11px] font-medium text-[#9AA0AE] truncate max-w-[140px] sm:max-w-xs flex items-center gap-1"
              id="mini-track-artist"
            >
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tip Artist TON Button */}
          <button
            onClick={handleTipClick}
            className="p-2 text-amber-400 hover:text-amber-300 transition-all hover:scale-110 active:scale-95"
            title={`Tip ${currentTrack.artist} (TON)`}
            aria-label="Tip Artist"
          >
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          </button>

          {/* Like button */}
          <button
            onClick={handleLikeClick}
            className="p-2 text-[#9AA0AE] hover:text-[#0098EA] transition-colors"
            title="Like track"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "text-[#0098EA] fill-[#0098EA]" : ""}`} />
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
              className="p-2 text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors hidden sm:block"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}

          {/* More options */}
          <button
            onClick={handleOptionsClick}
            className="p-2 text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
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
