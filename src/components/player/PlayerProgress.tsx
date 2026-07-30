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

  // Generate 48 pseudo-waveform bar heights for audio aesthetic
  const waveformBars = React.useMemo(() => {
    const bars = [];
    for (let i = 0; i < 48; i++) {
      const val = 20 + Math.sin(i * 0.4) * 25 + Math.cos(i * 0.8) * 35 + ((i % 5) * 8);
      bars.push(Math.max(15, Math.min(95, val)));
    }
    return bars;
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 font-sans select-none px-1">
      {/* Waveform / Interactive Bar Container */}
      <div
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => setHoverTime(null)}
        style={{ touchAction: "none" }}
        className="relative h-12 w-full bg-[#0A113A] rounded-[12px] p-2 flex items-center cursor-pointer group overflow-hidden"
      >
        {/* Scrubbing Hover Time Tooltip */}
        {hoverTime && (
          <div
            className="absolute -top-7 px-2 py-0.5 bg-[#5B6BFF] text-[#F2F4F8] text-[10px] font-bold rounded-[6px] shadow-lg pointer-events-none -translate-x-1/2 transition-opacity z-30"
            style={{ left: `${hoverPos}%` }}
          >
            {hoverTime}
          </div>
        )}

        {/* Buffered Progress Background Layer */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#16244F]/60 pointer-events-none transition-all duration-300"
          style={{ width: `${bufferedPercentage}%` }}
        />

        {/* Dynamic Waveform Bars */}
        <div className="w-full h-full flex items-center justify-between gap-0.5 relative z-10">
          {waveformBars.map((heightPct, idx) => {
            const barPosPct = (idx / waveformBars.length) * 100;
            const isPlayed = barPosPct <= localProgress;
            return (
              <motion.div
                key={idx}
                className="flex-1 rounded-full"
                animate={{
                  height: `${heightPct}%`,
                  backgroundColor: isPlayed ? "#5B6BFF" : "#16244F",
                  opacity: isPlayed ? 1 : 0.5
                }}
                transition={{ duration: 0.15 }}
              />
            );
          })}
        </div>

        {/* Scrubbing Handle Indicator Line and Thumb */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-[#F2F4F8] z-20 shadow-[0_0_12px_#5B6BFF] pointer-events-none flex items-center justify-center"
          style={{ left: `${localProgress}%` }}
          animate={{ scaleY: isSeeking ? 1.15 : 1, width: isSeeking ? "3px" : "2px" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-3 h-3 bg-[#5B6BFF] rounded-full border-2 border-white shadow-md -translate-x-1/2 absolute" />
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
