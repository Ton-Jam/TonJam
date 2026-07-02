import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

interface ProgressProps {
  progress: number; // 0 to 100
  duration: number; // in seconds
  onSeek: (value: number) => void;
  isSeeking: boolean;
  setIsSeeking: (seeking: boolean) => void;
}

export const Progress: React.FC<ProgressProps> = ({
  progress,
  duration,
  onSeek,
  isSeeking,
  setIsSeeking,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(progress);

  // Keep local progress in sync with prop progress when not seeking
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsSeeking(true);
    updateProgressFromEvent(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    updateProgressFromEvent(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    setIsSeeking(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Final seek to the local position
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = e.clientX;
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      onSeek(percentage);
    }
  };

  const updateProgressFromEvent = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX;
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setLocalProgress(percentage);
  };

  const currentTime = (localProgress / 100) * duration;

  return (
    <div className="w-full flex flex-col gap-2 font-sans select-none" id="tonjam-progress-container">
      {/* Interactive Progress Bar */}
      <div
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-2 w-full bg-zinc-800 rounded-full cursor-pointer group transition-all"
        id="tonjam-progress-bar-track"
      >
        {/* Filled Area */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"
          style={{ width: `${localProgress}%` }}
          id="tonjam-progress-fill"
        />

        {/* Grab Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${localProgress}% - 7px)` }}
          animate={{ scale: isSeeking ? 1.2 : undefined }}
          id="tonjam-progress-handle"
        />
      </div>

      {/* Time Labels */}
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        <span id="tonjam-current-time">{formatTime(currentTime)}</span>
        <span id="tonjam-total-duration">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Progress;
