import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Disc, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryTrack } from '../types';
import { useAudio } from '@/contexts/AudioContext';

interface ContinueListeningProps {
  tracks: LibraryTrack[];
  onPlay: (track: LibraryTrack) => void;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '3:20';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const ContinueListening: React.FC<ContinueListeningProps> = ({ tracks, onPlay }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = useAudio();

  if (tracks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <h2 className="section-title">Continue Listening</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/explore/tracks?title=Continue+Listening&filter=recent')}
          className="text-xs font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-[var(--tj-color-brand-hover,#21C2E8)] flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer min-h-[36px] px-1.5"
        >
          <span>More</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
        {tracks.slice(0, 6).map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <motion.button
              type="button"
              key={track.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => onPlay(track)}
              className={`flex-shrink-0 w-64 snap-start p-3 rounded-[var(--tj-radius-lg,10px)] flex gap-3 items-center cursor-pointer group transition-colors text-left border-0 ${
                isCurrent
                  ? 'bg-[var(--tj-color-chip-active-background,#063C55)]'
                  : 'bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)]'
              }`}
            >
              <div className="relative w-14 h-14 shrink-0 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)]">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${
                    isCurrent ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-5 h-5 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4
                  className={`text-[13px] font-semibold truncate leading-snug ${
                    isCurrent
                      ? 'text-[var(--tj-color-brand-primary,#00B4D8)]'
                      : 'text-[var(--tj-color-text-primary,#F8FAFC)]'
                  }`}
                >
                  {track.title}
                </h4>
                <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                  {track.artist}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--tj-color-text-muted,#7F91AA)] pt-0.5">
                  <span className="truncate max-w-[110px]">{track.album || 'Single'}</span>
                  <span className="tabular-nums shrink-0">{formatDuration(track.duration)}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
