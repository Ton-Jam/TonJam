import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Play, Pause, ListMusic, ChevronUp } from 'lucide-react';

interface MiniPlayerProps {
  track?: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
  };
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onQueueClick?: () => void;
  onExpand?: () => void;
  onSeek?: (percentage: number) => void;
  progress?: number; // float between 0 and 1
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying = false,
  onPlayPause,
  onQueueClick,
  onExpand,
  onSeek,
  progress = 0.35,
}) => {
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [0, -100], [1, 0]);
  const [localProgress, setLocalProgress] = useState(progress * 100);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isScrubbing) {
      setLocalProgress(progress * 100);
    }
  }, [progress, isScrubbing]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setLocalProgress(pct);
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      e.stopPropagation();
      const rect = progressBarRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        setLocalProgress(pct);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    setIsScrubbing(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setLocalProgress(pct);
      if (onSeek) onSeek(pct);
    }
  };

  if (!track) return null;

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y < -50 && onExpand) {
      onExpand();
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={{
        y: dragY,
        opacity: 1,
        backgroundColor: "#000000",
        background: "#000000",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      className="fixed bottom-[72px] left-4 right-4 z-40 select-none rounded-2xl shadow-2xl p-3 pt-2 flex flex-col gap-2 cursor-pointer active:cursor-grabbing border-none overflow-hidden"
      onClick={onExpand}
    >
      {/* Embedded Progress Bar at Top (1px flush) */}
      <div 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-[1px] -mt-2 mb-1 flex items-center cursor-pointer group/seek select-none touch-none bg-white/10"
        title="Click or drag to scrub"
      >
        <div
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, localProgress))}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Track Metadata Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1E2230] flex-shrink-0">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                {track.title[0]}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white truncate">
              {track.title}
            </h4>
            <p className="text-[9px] font-bold text-[#9AA0AE] uppercase tracking-widest truncate mt-0.5">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onQueueClick && (
            <button
              onClick={onQueueClick}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all"
              aria-label="View Queue"
            >
              <ListMusic className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            onClick={onPlayPause}
            className="w-9 h-9 bg-blue-500 hover:bg-blue-600 active:scale-90 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default MiniPlayer;
