import React from 'react';
import { PlaylistCard as CanonicalPlaylistCard, PlaylistCardProps as CanonicalPlaylistCardProps } from '@/components/PlaylistCard';
import { Playlist } from '@/types';

export interface PlaylistCardData {
  id: string;
  title: string;
  creator: string;
  isCreatorVerified?: boolean;
  coverUrl?: string;
  trackCount: number;
  duration?: string;
  followersCount?: number;
  isCollaborative?: boolean;
  isPrivate?: boolean;
  isLiked?: boolean;
}

export interface PlaylistCardProps {
  playlist?: Playlist | PlaylistCardData;
  variant?: 'default' | 'row';
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (playlist: any) => void;
  onLike?: (playlist: any) => void;
  onDownload?: (playlist: any) => void;
  onClick?: (playlist?: any) => void;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  variant = 'default',
  onClick,
  className = '',
}) => {
  if (!playlist) return null;

  const canonicalPlaylist: Playlist = {
    id: playlist.id,
    title: playlist.title,
    creator: playlist.creator,
    coverUrl: playlist.coverUrl || '',
    trackCount: playlist.trackCount || 0,
    trackIds: (playlist as any).trackIds || [],
  };

  return (
    <CanonicalPlaylistCard
      playlist={canonicalPlaylist}
      variant={variant}
      className={className}
      onClick={() => onClick?.(canonicalPlaylist)}
    />
  );
};

export default PlaylistCard;
