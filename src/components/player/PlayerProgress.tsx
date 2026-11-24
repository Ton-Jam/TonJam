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

export function formatTime(seconds: number): string {
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
  const [showTotalDuration, setShowTotalDuration] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(clampedPropProgress);
    }
  }, [clampedPropProgress, isSeeking]);

  const currentTime = (localProgress / 100) * safeDuration;
  const remainingTime = Math.max(0, safeDuration - currentTime);

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
    <div className="w-full flex flex-col gap-1 font-sans select-none px-0.5">
      {/* Interactive Scrubber Track (44px+ comfortable touch height) */}
      <div
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
        aria-label="Track playback position"
        aria-valuemin={0}
        aria-valuemax={Math.round(safeDuration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} elapsed, ${formatTime(remainingTime)} remaining`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => setHoverTime(null)}
        onKeyDown={handleKeyDown}
        style={{ touchAction: "none" }}
        className="relative min-h-[36px] py-3 w-full flex flex-col justify-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-[var(--tj-radius-compact,5px)]"
      >
        {/* Scrubbing Hover Time Tooltip */}
        {hoverTime && (
          <div
            className="absolute -top-6 px-2 py-0.5 bg-[#0A182E] border border-[rgba(192,192,192,0.22)] text-[#FFFFFF] text-[10px] font-semibold rounded-[5px] pointer-events-none -translate-x-1/2 z-30 tabular-nums"
            style={{ left: `${hoverPos}%` }}
          >
            {hoverTime}
          </div>
        )}

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 group-hover:h-2 bg-[#1A314D] rounded-full overflow-hidden relative transition-all duration-150">
          {/* Buffered Progress Layer */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#325173] rounded-full pointer-events-none transition-[width] duration-200"
            style={{ width: `${clampedBuffered}%` }}
          />

          {/* TonJam Blue Played Progress */}
          <div
            className="h-full bg-[#229ED9] rounded-full relative transition-[width] duration-75"
            style={{ width: `${localProgress}%` }}
          />
        </div>

        {/* Visible Scrubber Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none -translate-x-1/2"
          style={{ left: `${localProgress}%` }}
          animate={{ scale: isSeeking ? 1.25 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-3.5 h-3.5 bg-[#FFFFFF] rounded-full border border-[rgba(192,192,192,0.35)] group-hover:scale-115 transition-transform" />
        </motion.div>
      </div>

      {/* Elapsed & Remaining Time Row */}
      <div className="flex justify-between items-center text-[11px] font-medium text-[#8FA3BF] px-0.5 tabular-nums">
        <span data-testid="player-elapsed-time">{formatTime(currentTime)}</span>
        <button
          type="button"
          data-testid="player-remaining-time"
          onClick={() => setShowTotalDuration((prev) => !prev)}
          aria-label={showTotalDuration ? "Show remaining time" : "Show total duration"}
          className="text-[11px] font-medium text-[#8FA3BF] hover:text-[#FFFFFF] bg-transparent border-none p-0 cursor-pointer tabular-nums"
        >
          {showTotalDuration ? formatTime(safeDuration) : `-${formatTime(remainingTime)}`}
        </button>
      </div>
    </div>
  );
});

PlayerProgress.displayName = "PlayerProgress";

export default PlayerProgress;
