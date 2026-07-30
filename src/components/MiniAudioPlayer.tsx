import React from 'react';
import MiniPlayer from './player/MiniPlayer';

interface MiniAudioPlayerProps {
  onQueueClick?: () => void;
  isMobileNavHidden?: boolean;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = (props) => {
  return <MiniPlayer {...props} />;
};

export default MiniAudioPlayer;
