import React from 'react';
import { Play, Pause, MoreVertical, Heart, Music, Download, Check } from 'lucide-react';
import { AnimatedHeart } from '@/components/common/AnimatedHeart';
import { motion } from 'motion/react';
import { LibraryTrack } from '../types';
import { useAudio } from '@/contexts/AudioContext';

interface LikedSongsProps {
  tracks: LibraryTrack[];
  onPlay: (track: LibraryTrack) => void;
  onToggleLike?: (id: string) => void;
  onToggleDownload?: (id: string) => void;
}

export const LikedSongs: React.FC<LikedSongsProps> = ({
  tracks,
  onPlay,
  onToggleLike,
  onToggleDownload
}) => {
  const { setOptionsTrack, currentTrack, isPlaying } = useAudio();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-500/12 text-pink-400 rounded-[var(--tj-radius-md,8px)]">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div>
            <h2 className="section-title">Liked Songs</h2>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-mono font-medium">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} saved
            </p>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)]/60">
          <Music className="w-7 h-7 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-70" />
          <h4 className="text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)]">No Liked Songs</h4>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] max-w-xs mx-auto mt-1">
            Tap the heart icon on any track while listening to collect them here.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tracks.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.2) }}
                className={`flex items-center gap-3 p-2.5 rounded-[var(--tj-radius-lg,10px)] transition-colors group cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-[var(--tj-color-chip-active-background,#063C55)]'
                    : 'bg-[var(--tj-color-surface-elevated,#111C30)]/60 hover:bg-[var(--tj-color-surface-hover,#132B49)]'
                }`}
                onClick={() => onPlay(track)}
              >
                <div className="relative w-12 h-12 shrink-0 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)]">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-semibold leading-tight truncate ${
                      isCurrent
                        ? 'text-[var(--tj-color-brand-primary,#00B4D8)]'
                        : 'text-[var(--tj-color-text-primary,#F8FAFC)]'
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onToggleDownload && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDownload(track.id);
                      }}
                      className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--tj-radius-md,8px)] transition-colors cursor-pointer border-0 bg-transparent ${
                        track.isDownloaded
                          ? 'text-emerald-400 hover:bg-emerald-500/15'
                          : 'text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-[var(--tj-color-text-primary,#F8FAFC)] hover:bg-white/10'
                      }`}
                      title={track.isDownloaded ? 'Remove offline download' : 'Download for offline'}
                      aria-label={track.isDownloaded ? `Remove ${track.title} download` : `Download ${track.title}`}
                    >
                      {track.isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </button>
                  )}

                  {onToggleLike && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--tj-radius-md,8px)] text-pink-400 hover:text-pink-300 hover:bg-pink-500/15 transition-colors cursor-pointer border-0 bg-transparent"
                      title="Remove from Liked Songs"
                      aria-label={`Remove ${track.title} from Liked Songs`}
                    >
                      <AnimatedHeart liked={true} className="w-4 h-4 fill-current" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsTrack(track as any);
                    }}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--tj-radius-md,8px)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-[var(--tj-color-text-primary,#F8FAFC)] hover:bg-white/10 transition-colors cursor-pointer border-0 bg-transparent"
                    aria-label={`More options for ${track.title}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
