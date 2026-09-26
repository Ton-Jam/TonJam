import React from 'react';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { getPlaceholderImage } from '@/lib/utils';

interface SpotifyTrackRowProps {
  track: Track;
  index?: number;
  onRemove?: () => void;
  subtitleExtra?: string;
  rightExtra?: React.ReactNode;
}

export const SpotifyTrackRow: React.FC<SpotifyTrackRowProps> = ({
  track,
  onRemove,
  subtitleExtra,
  rightExtra
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, setOptionsTrack } = useAudio();
  const isActive = currentTrack?.id === track.id;

  const handleRowClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track, onRemove ? { onRemove } : undefined);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:20';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      onClick={handleRowClick}
      className="group flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      aria-label={`Play ${track.title} by ${track.artist}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        {/* Artwork */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[4px] overflow-hidden shrink-0 bg-neutral-900">
          <LazyArtworkImage
            src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)}
            fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isActive && isPlaying ? (
              <Pause className="w-4 h-4 text-[#00B4D8] fill-current" />
            ) : (
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug truncate ${
              isActive ? 'text-[#00B4D8] font-semibold' : 'text-white'
            }`}
          >
            {track.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {track.artist}
            {subtitleExtra ? ` • ${subtitleExtra}` : ''}
          </p>
        </div>
      </div>

      {/* Right metadata: Duration & More options */}
      <div className="flex items-center gap-3 shrink-0">
        {rightExtra}
        <span className="text-xs font-mono text-zinc-500 tabular-nums">
          {formatDuration(track.duration)}
        </span>
        <button
          type="button"
          onClick={handleOptionsClick}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Track options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
