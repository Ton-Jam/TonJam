import React from 'react';
import AudioWaveform from './AudioWaveform';
import { useAudio } from '@/contexts/AudioContext';

interface WaveformProgressProps {
  className?: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export const WaveformProgress: React.FC<WaveformProgressProps> = ({
  className = '',
  height = 40,
  waveColor = 'rgba(255, 255, 255, 0.25)',
  progressColor = '#3b82f6'
}) => {
  const { currentTrack } = useAudio();

  return (
    <AudioWaveform
      className={className}
      height={height}
      waveColor={waveColor}
      progressColor={progressColor}
      audioUrl={currentTrack?.audioUrl}
    />
  );
};

export default WaveformProgress;
