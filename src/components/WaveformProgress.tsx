import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
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
  waveColor = 'rgba(255, 255, 255, 0.2)',
  progressColor = '#3b82f6'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { currentTrack, audioElement } = useAudio();

  useEffect(() => {
    if (!containerRef.current || !audioElement || !currentTrack?.audioUrl) return;

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      media: audioElement,
      waveColor,
      progressColor,
      height,
      barWidth: 2.5,
      barGap: 1.5,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true,
      interact: true, 
    });

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioElement, currentTrack?.audioUrl, waveColor, progressColor, height]);

  return (
    <div className={`w-full relative ${className}`}>
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

export default WaveformProgress;
