import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import { equalizerBarVariants } from "@/motion/playerAnimation";

interface PlayerArtworkProps {
  track: Track | null;
  isPlaying: boolean;
  isLiked?: boolean;
  onDoubleTapLike?: () => void;
  onLongPress?: () => void;
  onDragDismiss?: () => void;
}

const WAVEFORM_DURATIONS = [1.1, 0.85, 1.3, 0.95, 1.15];

export const PlayerArtwork: React.FC<PlayerArtworkProps> = React.memo(({
  track,
  isPlaying,
  isLiked: _isLiked = false,
  onDoubleTapLike,
  onLongPress,
  onDragDismiss: _onDragDismiss,
}) => {
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartBurstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coverUrl = track?.coverUrl || getPlaceholderImage("cover");

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setIsZoomed(false);
  }, [track?.id]);

  useEffect(() => {
    return () => {
      clearLongPress();
      if (heartBurstTimerRef.current) {
        clearTimeout(heartBurstTimerRef.current);
      }
    };
  }, [clearLongPress]);

  const handlePointerDown = useCallback(() => {
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      onLongPress?.();
    }, 600);
  }, [clearLongPress, onLongPress]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setShowHeartBurst(true);
      onDoubleTapLike?.();
      if (heartBurstTimerRef.current) {
        clearTimeout(heartBurstTimerRef.current);
      }
      heartBurstTimerRef.current = setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  }, [onDoubleTapLike]);

  return (
    <div className="relative w-full shrink-0 flex flex-col items-center justify-center my-0.5 sm:my-1 select-none">
      {/* Stationary Square Artwork Frame (~16px corner radius + subtle silver border) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerLeave={clearLongPress}
        onClick={handleClick}
        className="relative w-[min(68vw,33dvh,284px)] sm:w-[min(36dvh,304px)] aspect-square rounded-[16px] overflow-hidden border border-[rgba(192,192,192,0.22)] bg-[#0A182E] group cursor-pointer"
      >
        <img
          src={coverUrl}
          alt={track?.title || "Track Artwork"}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover rounded-[16px] transition-transform duration-200 ${
            isZoomed ? "scale-105" : "scale-100"
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
          }}
        />

        {/* Subtle Live Waveform Indicator when actively playing */}
        {isPlaying && (
          <div
            aria-hidden="true"
            data-testid="artwork-live-waveform"
            className="absolute bottom-2.5 left-2.5 px-2 py-1.5 rounded-full bg-[#061426]/80 border border-[rgba(192,192,192,0.22)] flex items-end gap-[3px] h-6 pointer-events-none"
          >
            {WAVEFORM_DURATIONS.map((dur, idx) => (
              <motion.span
                key={idx}
                custom={dur}
                variants={equalizerBarVariants}
                animate="animate"
                className="w-[2.5px] h-1.5 rounded-full bg-[#229ED9] origin-bottom"
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.25, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-16 h-16 text-[#229ED9] fill-[#229ED9]" />
                <Sparkles className="w-7 h-7 text-white absolute -top-2 -right-2 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed((prev) => !prev);
          }}
          aria-label={isZoomed ? "Reset artwork zoom" : "Zoom artwork"}
          className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-[#061426]/85 rounded-full border border-[rgba(192,192,192,0.22)] text-[10px] font-semibold text-[#FFFFFF] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
        >
          {isZoomed ? "Reset" : "Zoom"}
        </button>
      </div>
    </div>
  );
});

PlayerArtwork.displayName = "PlayerArtwork";

export default PlayerArtwork;
