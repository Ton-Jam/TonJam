import React from 'react';
import PrimaryMiniPlayer from '../player/MiniPlayer';

export interface MiniPlayerProps {
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
  onSeek?: (percentage: number) => void;
  progress?: number;
  isMobileNavHidden?: boolean;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onQueueClick,
  isMobileNavHidden = false,
}) => {
  return (
    <PrimaryMiniPlayer
      onQueueClick={onQueueClick}
      isMobileNavHidden={isMobileNavHidden}
    />
  );
};

export default MiniPlayer;

