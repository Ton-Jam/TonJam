import React from 'react';
import { Play, Pause, ListMusic, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QueueItem } from '../types';
import { useAudio } from '@/contexts/AudioContext';

interface QueueManagerProps {
  queue: QueueItem[];
  onRemoveFromQueue: (id: string) => void;
  onClearQueue: () => void;
  onPlay?: (item: QueueItem) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  onRemoveFromQueue,
  onClearQueue,
  onPlay
}) => {
  const { currentTrack, isPlaying } = useAudio();

  return (
    <div className="space-y-4">
      {/* Queue Header controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-amber-400" />
          <h2 className="section-title">Active Playing Queue</h2>
          {queue.length > 0 && (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-secondary,#A8B7CC)]">
              {queue.length}
            </span>
          )}
        </div>

        {queue.length > 0 && (
          <button
            type="button"
            onClick={onClearQueue}
            className="min-h-[36px] px-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-[var(--tj-radius-md,8px)] flex items-center gap-1.5 cursor-pointer transition-colors border-0 bg-transparent"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)]/60">
          <ListMusic className="w-7 h-7 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-70" />
          <h4 className="text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)]">Play Queue is Empty</h4>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] max-w-xs mx-auto mt-1">
            Tracks will appear here as you queue songs for playback.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current Track marker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] uppercase tracking-wider font-mono px-1">
              Now Playing
            </span>
            <button
              type="button"
              onClick={() => onPlay && onPlay(queue[0])}
              className="w-full flex items-center gap-3 p-3 bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] text-left cursor-pointer transition-colors border-0"
            >
              <div className="relative w-12 h-12 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0">
                <img src={queue[0].coverUrl} alt={queue[0].title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  {currentTrack?.id === queue[0].trackId && isPlaying ? (
                    <Pause className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                  ) : (
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] truncate">
                  {queue[0].title}
                </h4>
                <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                  {queue[0].artist}
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] bg-[var(--tj-color-brand-primary,#00B4D8)]/15 px-2.5 py-1 rounded-full shrink-0">
                Active
              </span>
            </button>
          </div>

          {/* Up Next List */}
          {queue.length > 1 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-[var(--tj-color-text-muted,#7F91AA)] uppercase tracking-wider font-mono px-1">
                Up Next
              </span>
              <div className="space-y-1.5">
                {queue.slice(1).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.25) }}
                    className="flex items-center gap-3 p-2.5 bg-[var(--tj-color-surface-elevated,#111C30)]/60 hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] group transition-colors cursor-pointer select-none"
                    onClick={() => onPlay && onPlay(item)}
                  >
                    <span className="text-xs font-mono font-semibold text-[var(--tj-color-text-muted,#7F91AA)] w-5 text-center shrink-0">
                      {index + 1}
                    </span>

                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-[var(--tj-radius-md,8px)] object-cover bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                        {item.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] bg-white/5 px-2 py-0.5 rounded-full">
                        {item.addedBy === 'user' ? 'Queued' : item.addedBy === 'autopilot' ? 'Autopilot' : 'Up Next'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromQueue(item.id);
                        }}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--tj-radius-md,8px)] hover:bg-rose-500/15 text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-rose-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer border-0 bg-transparent"
                        title="Remove from Queue"
                        aria-label={`Remove ${item.title} from queue`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
