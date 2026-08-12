import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

interface PlayerProgressProps {
  progress: number; // 0 to 100
  duration: number; // in seconds
  onSeek: (percentage: number) => void;
  isSeeking: boolean;
  setIsSeeking: (seeking: boolean) => void;
  bufferedPercentage?: number;
}

export const PlayerProgress: React.FC<PlayerProgressProps> = ({
  progress,
  duration,
  onSeek,
  isSeeking,
  setIsSeeking,
  bufferedPercentage = 70
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(progress);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);

  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(progress);
    }
  }, [progress, isSeeking]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentTime = (localProgress / 100) * duration;
  const remainingTime = Math.max(0, duration - currentTime);

  const updateProgressFromEvent = (clientX: number) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setLocalProgress(percentage);
    return percentage;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
    setIsSeeking(true);
    updateProgressFromEvent(e.clientX);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback for environments without capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (rect) {
      const posX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (posX / rect.width) * 100));
      setHoverPos(pct);
      setHoverTime(formatTime((pct / 100) * duration));
    }
    if (isSeeking) {
      updateProgressFromEvent(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    setIsSeeking(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // fallback
    }
    const finalPct = updateProgressFromEvent(e.clientX);
    if (finalPct !== undefined) {
      onSeek(finalPct);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 font-sans select-none px-1">
      {/* Interactive Progress Container */}
      <div
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => setHoverTime(null)}
        style={{ touchAction: "none" }}
        className="relative py-2 w-full flex flex-col justify-center cursor-pointer group"
      >
        {/* Scrubbing Hover Time Tooltip */}
        {hoverTime && (
          <div
            className="absolute -top-6 px-2 py-0.5 bg-[#0098EA] text-[#F2F4F8] text-[10px] font-bold rounded-[6px] shadow-lg pointer-events-none -translate-x-1/2 transition-opacity z-30"
            style={{ left: `${hoverPos}%` }}
          >
            {hoverTime}
          </div>
        )}

        {/* Clean Progress Bar Track */}
        <div className="w-full h-1.5 group-hover:h-2 bg-[#16244F]/50 rounded-full overflow-hidden relative transition-all duration-150">
          {/* Buffered Progress Background Layer */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#16244F] rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${bufferedPercentage}%` }}
          />

          {/* Active Played Fill Layer */}
          <motion.div
            className="h-full bg-gradient-to-r from-[#0098EA] to-[#00D2FF] rounded-full relative shadow-[0_0_8px_rgba(0,152,234,0.8)]"
            style={{ width: `${localProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Sleek Thumb handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none -translate-x-1/2"
          style={{ left: `${localProgress}%` }}
          animate={{ scale: isSeeking ? 1.25 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-3.5 h-3.5 bg-white rounded-full border border-[#0098EA] shadow-[0_0_8px_rgba(0,152,234,0.8)] group-hover:scale-125 transition-transform" />
        </motion.div>
      </div>

      {/* Time Labels Row */}
      <div className="flex justify-between items-center text-[11px] font-medium text-[#9AA0AE] px-0.5">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(remainingTime)}</span>
      </div>
    </div>
  );
};

export default PlayerProgress;

