import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface PlayerProgressProps {
  progress: number; // 0 to 100
  duration: number; // in seconds
  onSeek: (percentage: number) => void;
  isSeeking: boolean;
  setIsSeeking: (seeking: boolean) => void;
  bufferedPercentage?: number;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const PlayerProgress: React.FC<PlayerProgressProps> = React.memo(({
  progress,
  duration,
  onSeek,
  isSeeking,
  setIsSeeking,
  bufferedPercentage = 0,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const clampedPropProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  const clampedBuffered = Number.isFinite(bufferedPercentage)
    ? Math.max(0, Math.min(100, bufferedPercentage))
    : 0;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  const [localProgress, setLocalProgress] = useState(clampedPropProgress);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);

  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(clampedPropProgress);
    }
  }, [clampedPropProgress, isSeeking]);

  const currentTime = (localProgress / 100) * safeDuration;

  const updateProgressFromEvent = useCallback((clientX: number) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setLocalProgress(percentage);
    return percentage;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
    setIsSeeking(true);
    updateProgressFromEvent(e.clientX);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, [setIsSeeking, updateProgressFromEvent]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const posX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (posX / rect.width) * 100));
      setHoverPos(pct);
      setHoverTime(formatTime((pct / 100) * safeDuration));
    }
    if (isSeeking) {
      updateProgressFromEvent(e.clientX);
    }
  }, [isSeeking, safeDuration, updateProgressFromEvent]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    setIsSeeking(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    const finalPct = updateProgressFromEvent(e.clientX);
    if (finalPct !== undefined) {
      onSeek(finalPct);
    }
  }, [isSeeking, onSeek, setIsSeeking, updateProgressFromEvent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    let nextPct: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      nextPct = Math.min(100, localProgress + 5);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      nextPct = Math.max(0, localProgress - 5);
    } else if (e.key === "Home") {
      nextPct = 0;
    } else if (e.key === "End") {
      nextPct = 100;
    }
    if (nextPct !== null) {
      e.preventDefault();
      setLocalProgress(nextPct);
      onSeek(nextPct);
    }
  }, [localProgress, onSeek]);

  return (
    <div className="w-full flex flex-col gap-1.5 font-sans select-none px-1">
      {/* Interactive Progress Container */}
      <div
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
        aria-label="Track playback position"
        aria-valuemin={0}
        aria-valuemax={Math.round(safeDuration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(safeDuration)}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => setHoverTime(null)}
        onKeyDown={handleKeyDown}
        style={{ touchAction: "none" }}
        className="relative py-2.5 w-full flex flex-col justify-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tj-color-border-focus,#00B4D8)] rounded-[var(--tj-radius-compact,5px)]"
      >
        {/* Scrubbing Hover Time Tooltip */}
        {hoverTime && (
          <div
            className="absolute -top-6 px-2 py-0.5 bg-[#07111F] text-[#FFFFFF] text-[10px] font-bold rounded-[var(--tj-radius-compact,5px)] shadow-lg pointer-events-none -translate-x-1/2 transition-opacity z-30 font-mono"
            style={{ left: `${hoverPos}%` }}
          >
            {hoverTime}
          </div>
        )}

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 group-hover:h-2 bg-[#22374D] rounded-full overflow-hidden relative transition-all duration-150">
          {/* Buffered Progress Layer */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#3B5570] rounded-full pointer-events-none transition-[width] duration-200"
            style={{ width: `${clampedBuffered}%` }}
          />

          {/* TonJam Cyan Played Progress */}
          <div
            className="h-full bg-[var(--tj-color-brand-primary,#00B4D8)] rounded-full relative shadow-[0_0_8px_rgba(0,180,216,0.6)] transition-[width] duration-75"
            style={{ width: `${localProgress}%` }}
          />
        </div>

        {/* Seek Handle Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none -translate-x-1/2"
          style={{ left: `${localProgress}%` }}
          animate={{ scale: isSeeking ? 1.3 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm group-hover:scale-125 transition-transform" />
        </motion.div>
      </div>

      {/* Time Labels Row */}
      <div className="flex justify-between items-center text-xs font-medium text-[#8C8C8C] px-0.5 tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
});

PlayerProgress.displayName = "PlayerProgress";

export default PlayerProgress;
