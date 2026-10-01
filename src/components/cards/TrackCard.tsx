import React from 'react';
import { TrackCard as CanonicalTrackCard, TrackCardProps as CanonicalTrackCardProps } from '@/components/TrackCard';
import { Track } from '@/types';

export interface TrackData {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  isVerified?: boolean;
  coverUrl: string;
  duration: string;
  genre?: string;
  isExplicit?: boolean;
  isNFT?: boolean;
  streams?: number;
  isLiked?: boolean;
}

export interface TrackCardProps {
  // Direct props support for backwards compatibility
  title?: string;
  artist?: string;
  coverUrl?: string;
  duration?: string;
  isExplicit?: boolean;
  isNFT?: boolean;

  track?: Track | TrackData;
  variant?: 'default' | 'row' | 'compact';
  index?: number;
  isLoading?: boolean;
  isPlaying?: boolean;
  enableSwipe?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  onPlay?: (track: any) => void;
  onLike?: (track: any) => void;
  onMore?: (track: any) => void;
  onMint?: (track: any) => void;
  onRemove?: () => void;
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  title,
  artist,
  coverUrl,
  duration,
  isExplicit,
  isNFT,
  track,
  variant = 'default',
  index,
  isLoading = false,
  enableSwipe,
  onClick,
  onPlay,
  onLike,
  onMore,
  onMint,
  onRemove,
  className = '',
}) => {
  const finalTrack: Track = (track as Track) || ({
    id: 'compat',
    title: title || 'Unknown Title',
    artist: artist || 'Unknown Artist',
    coverUrl: coverUrl || '',
    duration: duration || '0:00',
    isExplicit: Boolean(isExplicit),
    isNFT: Boolean(isNFT),
    audioUrl: '',
  } as Track);

  return (
    <CanonicalTrackCard
      track={finalTrack}
      variant={variant}
      index={index}
      isLoading={isLoading}
      enableSwipe={enableSwipe}
      onClick={onClick}
      onPlay={onPlay ? () => onPlay(finalTrack) : undefined}
      onLike={onLike ? () => onLike(finalTrack) : undefined}
      onMore={onMore ? () => onMore(finalTrack) : undefined}
      onMint={onMint ? () => onMint(finalTrack) : undefined}
      onRemove={onRemove}
      className={className}
    />
  );
};

export default TrackCard;
