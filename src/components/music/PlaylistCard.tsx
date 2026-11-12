import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Lock, Globe, ListMusic, Share2, Copy, Check } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { AlbumArtwork } from './AlbumArtwork';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type PlaylistArtworkStyle = 'single' | 'collage';
export type PlaylistCardVariant = 'compact' | 'expanded';

export interface PlaylistCardProps {
  playlist: Playlist;
  variant?: PlaylistCardVariant;
  artworkStyle?: PlaylistArtworkStyle;
  collageImages?: string[];
  showStatusIndicator?: boolean;
  showOptions?: boolean;
  showPlayAction?: boolean;
  isPlaying?: boolean;
  onPlayToggle?: (playlist: Playlist) => void;
  onOptionsClick?: (playlist: Playlist) => void;
  onClick?: () => void;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  variant = 'expanded',
  artworkStyle = 'single',
  collageImages,
  showStatusIndicator = true,
  showOptions = true,
  showPlayAction = true,
  isPlaying: externalIsPlaying = false,
  onPlayToggle,
  onOptionsClick,
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const { allTracks, playTrack } = useAudio();
  const [copied, setCopied] = useState(false);
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);

  const isPlaying = externalIsPlaying || isPlayingInternal;

  // Resolve collage images from trackIds if not explicitly passed
  const resolvedCollageImages: string[] = React.useMemo(() => {
    if (collageImages && collageImages.length > 0) {
      return collageImages.slice(0, 4);
    }
    if (playlist.trackIds && Array.isArray(playlist.trackIds) && playlist.trackIds.length > 0) {
      const covers = playlist.trackIds
        .map((id) => allTracks.find((t) => t.id === id)?.coverUrl)
        .filter(Boolean) as string[];
      if (covers.length > 0) {
        return covers.slice(0, 4);
      }
    }
    // Fallback images
    return [
      playlist.coverUrl || getPlaceholderImage('album'),
      getPlaceholderImage('track'),
      getPlaceholderImage('playlist'),
      getPlaceholderImage('nft'),
    ];
  }, [collageImages, playlist.trackIds, playlist.coverUrl, allTracks]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayToggle) {
      onPlayToggle(playlist);
      return;
    }
    // Default: play first track in playlist
    if (playlist.trackIds && playlist.trackIds.length > 0) {
      const firstTrack = allTracks.find((t) => t.id === playlist.trackIds?.[0]);
      if (firstTrack) {
        playTrack(firstTrack);
        setIsPlayingInternal(!isPlayingInternal);
      }
    } else {
      setIsPlayingInternal(!isPlayingInternal);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareContent({
      title: playlist.title,
      text: `Listen to "${playlist.title}" by ${playlist.creator} on TonJam`,
      url: window.location.origin + `/playlist/${playlist.id}`,
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/playlist/${playlist.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackCount = playlist.trackCount || (playlist.trackIds ? playlist.trackIds.length : 0);

  // Compact Variant (Horizontal list item matching TrackCard)
  if (variant === 'compact') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={cn(
          'group relative flex items-center justify-between gap-3 p-2.5 rounded-[14px] transition-all duration-200 select-none cursor-pointer',
          'bg-[#0F1C32] hover:bg-[#132B49] active:bg-[#193657]',
          'shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
          isPlaying && 'bg-[#132B49]',
          className
        )}
        data-testid="playlist-card-compact"
        data-playlist-id={playlist.id}
        data-playing={isPlaying}
      >
        {/* Left Section: Artwork & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <AlbumArtwork
              src={playlist.coverUrl}
              alt={playlist.title}
              shape="rounded"
              size="thumbnail"
              fallbackType="playlist"
              showPlayOverlay={false}
              isPlaying={isPlaying}
            />
            <button
              type="button"
              onClick={handlePlayToggle}
              aria-label={isPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`}
              className={cn(
                'absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/45 text-white transition-opacity duration-150 border-none cursor-pointer',
                isPlaying ? 'opacity-100 bg-[#00B4D8]/80' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h4 className={cn(
              'text-sm font-semibold truncate transition-colors duration-150',
              isPlaying ? 'text-[#00B4D8]' : 'text-white group-hover:text-white'
            )}>
              {playlist.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-[#C2C7CD] truncate mt-0.5">
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{playlist.creator ? `By ${playlist.creator}` : 'TonJam'}</span>
              <span className="text-[#64748B]" aria-hidden="true">·</span>
              <span className="tabular-nums text-[#8193A8] shrink-0">
                {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOptionsClick) onOptionsClick(playlist);
                }}
                aria-label="Playlist options"
                className="p-1.5 rounded-full text-[#A8B7CC] hover:text-white hover:bg-white/10 transition-colors border-none cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0F1C32] text-white shadow-[0_12px_32px_rgba(0,0,0,0.6)] rounded-[12px] p-1.5 border-none"
            >
              <DropdownMenuItem
                onClick={handleShare}
                className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#00B4D8]" />
                <span>Share playlist</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Copy className="w-4 h-4 text-[#00B4D8]" />}
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        'group relative flex flex-col p-3 rounded-[16px] transition-all duration-200 select-none cursor-pointer',
        'bg-[#0F1C32] hover:bg-[#132B49] active:bg-[#193657]',
        'shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(0,180,216,0.15)]',
        className
      )}
      data-testid="playlist-card"
      data-playlist-id={playlist.id}
      data-style={artworkStyle}
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden mb-3 bg-[#0B1728]">
        {artworkStyle === 'single' ? (
          <AlbumArtwork
            src={playlist.coverUrl}
            alt={playlist.title}
            shape="rounded"
            size="standard"
            fallbackType="playlist"
            showPlayOverlay={false}
            className="w-full h-full max-w-none"
          />
        ) : (
          /* 4-Artwork Collage */
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5" data-testid="playlist-collage">
            {Array.from({ length: 4 }).map((_, idx) => {
              const src = resolvedCollageImages[idx] || resolvedCollageImages[0] || getPlaceholderImage('track');
              return (
                <div key={idx} className="relative w-full h-full overflow-hidden bg-[#111C30]">
                  <img
                    src={src}
                    alt={`Cover ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Top Status & Options Overlays */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
          {showStatusIndicator && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium text-[#C2C7CD] bg-black/60 backdrop-blur-md">
              {playlist.isPrivate ? (
                <>
                  <Lock className="w-3 h-3 text-[#A8B7CC]" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-[#00B4D8]" />
                  <span>Public</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Top Right More Options */}
        {showOptions && (
          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOptionsClick) onOptionsClick(playlist);
                  }}
                  aria-label="Playlist options"
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
                  onClick={handleShare}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-[#C2C7CD] hover:text-white hover:bg-[#132B49] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#00B4D8]" />
                  <span>Share playlist</span>
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
          </div>
        )}

        {/* Bottom Right Floating Play Action Button */}
        {showPlayAction && (
          <div
            className={cn(
              'absolute bottom-2.5 right-2.5 z-20 transition-all duration-200',
              isPlaying
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
            )}
          >
            <button
              type="button"
              onClick={handlePlayToggle}
              aria-label={isPlaying ? 'Pause playlist' : 'Play playlist'}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#00B4D8] text-white shadow-[0_4px_16px_rgba(0,180,216,0.45)] transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8]"
              data-testid="playlist-play-button"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate transition-colors duration-150 group-hover:text-white">
          {playlist.title}
        </h4>

        <div className="flex items-center justify-between text-xs text-[#C2C7CD] mt-0.5">
          <span className="truncate max-w-[140px]">
            {playlist.creator ? `By ${playlist.creator}` : 'Curated Playlist'}
          </span>

          <span className="text-[11px] text-[#8193A8] shrink-0 tabular-nums">
            {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
