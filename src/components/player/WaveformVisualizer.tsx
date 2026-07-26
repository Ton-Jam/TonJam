import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudio } from '@/contexts/AudioContext';

interface WaveformVisualizerProps {
  className?: string;
  audioUrl: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ className, audioUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { audioElement } = useAudio();

  useEffect(() => {
    if (!containerRef.current || !audioElement || !audioUrl) return;

    try {
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        media: audioElement,
        waveColor: 'rgba(255, 255, 255, 0.25)',
        progressColor: '#2563eb',
        height: 60,
        barWidth: 3,
        barGap: 2,
        barRadius: 2,
        cursorWidth: 1,
        cursorColor: '#38bdf8',
        normalize: true,
        interact: true,
      });
    } catch (e) {
      console.warn('WaveSurfer initialization error:', e);
    }

    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) {
          // ignore cleanup error
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioElement, audioUrl]);

  return (
    <div className="w-full relative">
      <div ref={containerRef} className={className || "h-20 w-full mb-2"} />
    </div>
  );
};


