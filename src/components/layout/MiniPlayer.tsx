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
  progress?: number; // float between 0 and 1
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying = false,
  onPlayPause,
  onQueueClick,
  onExpand,
  progress = 0.35,
}) => {
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [0, -100], [1, 0]);

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
      style={{ y: dragY, opacity }}
      className="fixed bottom-[72px] left-4 right-4 z-40 select-none bg-[#12141C]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-3 flex flex-col gap-2 cursor-pointer active:cursor-grabbing"
      onClick={onExpand}
    >
      {/* Top tiny touch handle bar to represent physical swipeability */}
      <div className="flex justify-center -mt-1.5 mb-1 opacity-50">
        <ChevronUp className="w-3.5 h-3.5 text-[#9AA0AE] animate-bounce" />
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

      {/* Embedded Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </motion.div>
  );
};
export default MiniPlayer;
