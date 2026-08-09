import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Disc3, Sparkles } from "lucide-react";
import { Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";

interface PlayerArtworkProps {
  track: Track | null;
  isPlaying: boolean;
  isLiked?: boolean;
  onDoubleTapLike?: () => void;
  onLongPress?: () => void;
  onDragDismiss?: () => void;
}

export const PlayerArtwork: React.FC<PlayerArtworkProps> = ({
  track,
  isPlaying,
  isLiked = false,
  onDoubleTapLike,
  onLongPress,
  onDragDismiss
}) => {
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const coverUrl = track?.coverUrl || getPlaceholderImage("cover");

  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
    }, 600);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      setShowHeartBurst(true);
      if (onDoubleTapLike) onDoubleTapLike();
      setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-3 select-none">
      {/* Blurred background image behind the artwork */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl opacity-35 filter blur-3xl scale-125">
        <img
          src={coverUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#050A24]/70" />
      </div>

      {/* Main Artwork Frame */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.1, bottom: 0.8 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 && onDragDismiss) {
            onDragDismiss();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{ scale: isZoomed ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-[50vw] max-w-[280px] sm:max-w-[320px] max-h-[32vh] aspect-square rounded-xl overflow-hidden shadow-2xl bg-[#0A113A] group cursor-pointer"
      >
        {/* Static artwork container (no rotation) */}
        <div className="w-full h-full relative flex items-center justify-center">
          <img
            src={coverUrl}
            alt={track?.title || "Track Artwork"}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
            }}
          />

          {/* Subdued vinyl center overlay for disc aesthetic */}
          <div className="absolute w-12 h-12 rounded-full bg-[#050A24]/40 backdrop-blur-sm flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <Disc3 className="w-6 h-6 text-[#F2F4F8]" />
          </div>
        </div>

        {/* Double-tap burst heart overlay */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.3, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-30"
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-20 h-20 text-[#0098EA] fill-[#0098EA] filter drop-shadow-[0_0_15px_rgba(0,152,234,0.8)]" />
                <Sparkles className="w-8 h-8 text-white absolute -top-2 -right-2 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Zoom Toggle Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-[#0A113A]/80 backdrop-blur-md rounded-[8px] text-[10px] font-bold text-[#F2F4F8] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isZoomed ? "Reset" : "Zoom"}
        </button>
      </motion.div>
    </div>
  );
};

export default PlayerArtwork;
