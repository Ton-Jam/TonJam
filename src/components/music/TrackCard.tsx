import React from 'react';
import { Play, Pause, Heart, MoreVertical, ListPlus, Share2, User, Copy, Check } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { AlbumArtwork } from './AlbumArtwork';
import VerifiedArtistBadge, { checkIsArtistVerified } from '@/components/common/VerifiedArtistBadge';
import { cn, shareContent } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TrackCardVariant = 'compact' | 'expanded';

export interface TrackCardProps {
  track: Track;
  variant?: TrackCardVariant;
  showVerifiedBadge?: boolean;
  showGenre?: boolean;
  showDuration?: boolean;
  showLike?: boolean;
  showOptions?: boolean;
  isPlaying?: boolean;
  onPlayToggle?: (track: Track) => void;
  onLikeToggle?: (track: Track) => void;
  onOptionsClick?: (track: Track) => void;
  onClick?: () => void;
  className?: string;
  index?: number;
}

const formatTrackDuration = (seconds?: number): string => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  variant = 'compact',
  showVerifiedBadge = true,
  showGenre = true,
  showDuration = true,
  showLike = true,
  showOptions = true,
  isPlaying: externalIsPlaying,
  onPlayToggle,
  onLikeToggle,
  onOptionsClick,
  onClick,
  className = '',
  index,
}) => {
  const { currentTrack, isPlaying: contextIsPlaying, playTrack, togglePlay, likedTrackIds, toggleLikeTrack, openAddToPlaylistModal } = useAudio();
  const [copied, setCopied] = React.useState(false);

  const isCurrentTrack = currentTrack?.id === track.id;
  const isActivelyPlaying = externalIsPlaying !== undefined 
    ? externalIsPlaying 
    : (isCurrentTrack && contextIsPlaying);

  const isLiked = Array.isArray(likedTrackIds) 
    ? likedTrackIds.includes(track.id) 
    : false;

  const isVerified = showVerifiedBadge && (
    track.artistVerified || 
    checkIsArtistVerified(track.artist, track.artistVerified)
  );

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayToggle) {
      onPlayToggle(track);
      return;
    }
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeToggle) {
      onLikeToggle(track);
      return;
    }
    toggleLikeTrack(track.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareContent({
      title: track.title,
      text: `Listen to "${track.title}" by ${track.artist} on TonJam`,
      url: window.location.origin + `/track/${track.id}`,
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/track/${track.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact Variant (Horizontal list item)
  if (variant === 'compact') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick || ((e) => handlePlayToggle(e))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) onClick();
            else handlePlayToggle(e as unknown as React.MouseEvent);
          }
        }}
        className={cn(
          'group relative flex items-center justify-between gap-3 p-2.5 rounded-[14px] transition-all duration-200 select-none cursor-pointer',
          'bg-[#0F1C32] hover:bg-[#132B49] active:bg-[#193657]',
          'shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
          isActivelyPlaying && 'bg-[#132B49]',
          className
        )}
        data-testid="track-card-compact"
        data-track-id={track.id}
        data-playing={isActivelyPlaying}
      >
        {/* Left Section: Artwork & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {typeof index === 'number' && (
            <span className="w-5 text-center text-xs font-medium text-[#7F91AA] tabular-nums shrink-0">
              {index + 1}
            </span>
          )}

          {/* Square Artwork */}
          <div className="relative shrink-0">
            <AlbumArtwork
              src={track.coverUrl}
              alt={track.title}
              shape="rounded"
              size="thumbnail"
              fallbackType="track"
              showPlayOverlay={false}
              isPlaying={isActivelyPlaying}
            />
            {/* Play Button Overlay on thumbnail */}
            <button
              type="button"
              onClick={handlePlayToggle}
              aria-label={isActivelyPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              className={cn(
                'absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/45 text-white transition-opacity duration-150',
                isActivelyPlaying ? 'opacity-100 bg-[#00B4D8]/80' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              {isActivelyPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Text Info */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h4
                className={cn(
                  'text-sm font-semibold truncate transition-colors duration-150',
                  isActivelyPlaying ? 'text-[#00B4D8]' : 'text-white group-hover:text-white'
                )}
              >
                {track.title}
              </h4>
              {isActivelyPlaying && (
                <span className="flex items-end gap-0.5 h-3 shrink-0" aria-label="Playing equalizer">
                  <span className="w-0.5 h-full bg-[#00B4D8] animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="w-0.5 h-2/3 bg-[#00B4D8] animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                  <span className="w-0.5 h-4/5 bg-[#00B4D8] animate-[pulse_0.5s_ease-in-out_infinite_0.4s]" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#C2C7CD] truncate mt-0.5">
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{track.artist}</span>
              {isVerified && <VerifiedArtistBadge isVerified={true} size="xs" className="shrink-0" />}

              {(showGenre && track.genre && track.genre !== 'Unknown') && (
                <>
                  <span className="text-[#64748B]" aria-hidden="true">·</span>
                  <span className="text-[#A8B7CC] shrink-0">{track.genre}</span>
                </>
              )}

              {showDuration && (
                <>
                  <span className="text-[#64748B]" aria-hidden="true">·</span>
                  <span className="tabular-nums text-[#8193A8] shrink-0">
                    {formatTrackDuration(track.duration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {showLike && (
            <button
              type="button"
              onClick={handleLikeToggle}
              aria-label={isLiked ? 'Unlike track' : 'Like track'}
              className={cn(
                'p-2 rounded-full transition-colors duration-150 hover:bg-[#193657]',
                isLiked ? 'text-[#F87171]' : 'text-[#8193A8] hover:text-white'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </button>
          )}

          {showOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOptionsClick) onOptionsClick(track);
                  }}
                  aria-label="More options"
                  className="p-2 rounded-full text-[#8193A8] hover:text-white hover:bg-[#193657] transition-colors duration-150"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#0F1C32] text-white shadow-[0_12px_32px_rgba(0,0,0,0.6)] rounded-[12px] p-1.5 border-none"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openAddToPlaylistModal) openAddToPlaylistModal(track);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  <ListPlus className="w-4 h-4 text-[#00B4D8]" />
                  <span>Add to playlist</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShare}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#00B4D8]" />
                  <span>Share track</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#34D399]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#00B4D8]" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy link'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  // Expanded Variant (Grid card for explore / hero)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick || ((e) => handlePlayToggle(e))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
          else handlePlayToggle(e as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        'group relative flex flex-col p-3 rounded-[16px] transition-all duration-200 select-none cursor-pointer',
        'bg-[#0F1C32] hover:bg-[#132B49] active:bg-[#193657]',
        'shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
        isActivelyPlaying && 'shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_24px_rgba(0,180,216,0.18)]',
        className
      )}
      data-testid="track-card-expanded"
      data-track-id={track.id}
      data-playing={isActivelyPlaying}
    >
      {/* Prominent Square Artwork Container */}
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden mb-3">
        <AlbumArtwork
          src={track.coverUrl}
          alt={track.title}
          shape="rounded"
          size="standard"
          fallbackType="track"
          showPlayOverlay={true}
          isPlaying={isActivelyPlaying}
          onPlayToggle={handlePlayToggle}
          className="w-full h-full max-w-none"
        />

        {/* Top Floating Controls (Like & Options) */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {showLike && (
            <button
              type="button"
              onClick={handleLikeToggle}
              aria-label={isLiked ? 'Unlike track' : 'Like track'}
              className={cn(
                'p-2 rounded-full bg-black/60 backdrop-blur-md transition-transform duration-150 hover:scale-110 active:scale-95',
                isLiked ? 'text-[#F87171]' : 'text-white hover:text-[#00B4D8]'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </button>
          )}

          {showOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOptionsClick) onOptionsClick(track);
                  }}
                  aria-label="More options"
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#00B4D8] transition-transform duration-150 hover:scale-110 active:scale-95"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#0F1C32] text-white shadow-[0_12px_32px_rgba(0,0,0,0.6)] rounded-[12px] p-1.5 border-none"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openAddToPlaylistModal) openAddToPlaylistModal(track);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  <ListPlus className="w-4 h-4 text-[#00B4D8]" />
                  <span>Add to playlist</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShare}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#00B4D8]" />
                  <span>Share track</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#34D399]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#00B4D8]" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy link'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="flex flex-col gap-1 min-w-0">
        <h4
          className={cn(
            'text-sm font-semibold truncate transition-colors duration-150',
            isActivelyPlaying ? 'text-[#00B4D8]' : 'text-white'
          )}
        >
          {track.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-[#C2C7CD] truncate">
          <span className="truncate">{track.artist}</span>
          {isVerified && <VerifiedArtistBadge isVerified={true} size="xs" className="shrink-0" />}
        </div>

        {/* Clean Unboxed Footer Details */}
        <div className="flex items-center justify-between text-[11px] text-[#8193A8] mt-1 pt-1">
          {showGenre && track.genre && track.genre !== 'Unknown' ? (
            <span className="truncate">{track.genre}</span>
          ) : (
            <span className="truncate text-[#64748B]">TonJam Original</span>
          )}

          {showDuration && (
            <span className="tabular-nums shrink-0">
              {formatTrackDuration(track.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
