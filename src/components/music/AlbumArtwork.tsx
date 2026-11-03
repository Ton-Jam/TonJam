import React, { useState } from 'react';
import { Play, Pause, Music2 } from 'lucide-react';
import { cn, getPlaceholderImage } from '@/lib/utils';

export type AlbumArtworkShape = 'square' | 'rounded' | 'circle';
export type AlbumArtworkSize = 'thumbnail' | 'standard' | 'large' | 'featured';

export interface AlbumArtworkProps {
  src?: string | null;
  alt?: string;
  shape?: AlbumArtworkShape;
  size?: AlbumArtworkSize;
  fallbackType?: 'album' | 'track' | 'nft' | 'playlist';
  showPlayOverlay?: boolean;
  isPlaying?: boolean;
  onPlayToggle?: (e: React.MouseEvent) => void;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  featuredBadge?: React.ReactNode;
}

const SHAPE_CLASSES: Record<AlbumArtworkShape, string> = {
  square: 'rounded-none',
  rounded: 'rounded-[14px]',
  circle: 'rounded-full',
};

const SIZE_CLASSES: Record<AlbumArtworkSize, { container: string; icon: string; playBtn: string }> = {
  thumbnail: {
    container: 'w-12 h-12 min-w-12',
    icon: 'w-5 h-5',
    playBtn: 'w-7 h-7',
  },
  standard: {
    container: 'w-full aspect-square max-w-[180px]',
    icon: 'w-8 h-8',
    playBtn: 'w-11 h-11',
  },
  large: {
    container: 'w-full aspect-square max-w-[280px]',
    icon: 'w-12 h-12',
    playBtn: 'w-14 h-14',
  },
  featured: {
    container: 'w-full aspect-square max-w-[340px]',
    icon: 'w-16 h-16',
    playBtn: 'w-16 h-16',
  },
};

export const AlbumArtwork: React.FC<AlbumArtworkProps> = ({
  src,
  alt = 'Album artwork',
  shape = 'rounded',
  size = 'standard',
  fallbackType = 'album',
  showPlayOverlay = false,
  isPlaying = false,
  onPlayToggle,
  className = '',
  imgClassName = '',
  priority = false,
  featuredBadge,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority && Boolean(src));

  const resolvedFallback = getPlaceholderImage(fallbackType);
  const imageSource = !hasError && src ? src : resolvedFallback;

  const shapeClass = SHAPE_CLASSES[shape] || SHAPE_CLASSES.rounded;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.standard;
  const isFeatured = size === 'featured';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayToggle) {
      onPlayToggle(e);
    }
  };

  return (
    <div
      className={cn(
        'relative aspect-square select-none overflow-hidden transition-all duration-200 group/art',
        shapeClass,
        sizeConfig.container,
        isFeatured
          ? 'shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,180,216,0.2)] bg-gradient-to-b from-[#0F223D] to-[#071324]'
          : 'shadow-[0_8px_24px_rgba(0,0,0,0.35)] bg-[#0B1728]',
        className
      )}
      data-testid="album-artwork"
      data-size={size}
      data-shape={shape}
    >
      {/* Featured ambient backdrop glow */}
      {isFeatured && (
        <div
          className="absolute -inset-4 bg-gradient-to-tr from-[#00B4D8]/20 to-transparent blur-2xl pointer-events-none -z-10"
          aria-hidden="true"
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center bg-[#0F1C32] animate-pulse',
            shapeClass
          )}
          data-testid="artwork-loading"
        >
          <Music2 className={cn('text-[#405672] animate-pulse', sizeConfig.icon)} />
        </div>
      )}

      {/* Image Element */}
      <img
        src={imageSource}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={cn(
          'w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105',
          shapeClass,
          imgClassName
        )}
      />

      {/* Subtle Depth Vignette (Zero border lines) */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent',
          shapeClass
        )}
        aria-hidden="true"
      />

      {/* Featured Badge slot */}
      {isFeatured && featuredBadge && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          {featuredBadge}
        </div>
      )}

      {/* Interactive Play Overlay */}
      {(showPlayOverlay || isPlaying) && (
        <div
          className={cn(
            'absolute inset-0 z-20 flex items-center justify-center transition-all duration-200',
            shapeClass,
            isPlaying
              ? 'bg-black/40 opacity-100'
              : 'bg-black/45 opacity-0 group-hover/art:opacity-100'
          )}
        >
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={cn(
              'flex items-center justify-center rounded-full bg-[#00B4D8] text-white shadow-[0_4px_16px_rgba(0,180,216,0.45)] transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8]',
              sizeConfig.playBtn
            )}
            data-testid="artwork-play-button"
          >
            {isPlaying ? (
              <Pause className={cn('fill-current', size === 'thumbnail' ? 'w-3.5 h-3.5' : 'w-5 h-5')} />
            ) : (
              <Play className={cn('fill-current translate-x-0.5', size === 'thumbnail' ? 'w-3.5 h-3.5' : 'w-5 h-5')} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlbumArtwork;
