import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

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
  // Delays and randomized cycle speeds to create an authentic organic spectrum bounce
  const barDelays = [0.05, 0.25, 0.1, 0.3, 0.15, 0.35, 0.2, 0.0];

  return (
    <div className={cn("flex items-end gap-[1.5px] h-full justify-center", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = barDelays[i % barDelays.length];
        const duration = 1.3 + (i * 0.14) % 0.8; // between 1.3s and 2.1s

        return (
          <motion.div
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{ color }}
            animate={
              isPlaying
                ? {
                    height: ['10%', '85%', '30%', '95%', '40%', '10%'],
                  }
                : { height: '15%' }
            }
            transition={
              isPlaying
                ? {
                    duration: duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: delay,
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
};

export default SubtleFrequencyVisualizer;
