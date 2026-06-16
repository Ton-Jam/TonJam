import React, { useRef } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/context/AudioContext';

interface SubtleFrequencyVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
  className?: string;
}

export const SubtleFrequencyVisualizer: React.FC<SubtleFrequencyVisualizerProps> = ({
  isPlaying,
  color = '#3b82f6', // default brand blue
  barCount = 5,
  className
}) => {
  const { analyser } = useAudio();
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useAnimationFrame(() => {
    if (!isPlaying || !analyser) {
        // Reset bars if not playing
        barRefs.current.forEach(bar => {
            if (bar) bar.style.height = '15%';
        });
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency bin
        const value = dataArray[i * 2 + 16]; // Focus on audible mids
        const height = (value / 255) * 100;
        if (barRefs.current[i]) {
            barRefs.current[i]!.style.height = `${Math.max(10, height)}%`;
        }
    }
  });

  return (
    <div className={cn("flex items-end gap-[1.5px] h-full justify-center", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        return (
          <div
            key={i}
            ref={el => barRefs.current[i] = el}
            className="w-[2px] rounded-full transition-all duration-75"
            style={{ backgroundColor: color, height: '15%' }}
          />
        );
      })}
    </div>
  );
};

export default SubtleFrequencyVisualizer;
