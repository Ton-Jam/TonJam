import React from 'react';
import AudioWaveform from '@/components/AudioWaveform';

interface WaveformVisualizerProps {
  className?: string;
  audioUrl?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ className, audioUrl }) => {
  return (
    <AudioWaveform
      className={className || "h-16 w-full mb-2"}
      height={60}
      waveColor="rgba(255, 255, 255, 0.25)"
      progressColor="#3b82f6"
      audioUrl={audioUrl}
    />
  );
};

export default WaveformVisualizer;
