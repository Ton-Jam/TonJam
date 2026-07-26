import React, { useMemo, useState } from 'react';
import { useAudio } from '@/contexts/AudioContext';

export interface AudioWaveformProps {
  className?: string;
  height?: number;
  width?: string | number;
  waveColor?: string;
  progressColor?: string;
  hoverColor?: string;
  barWidth?: number;
  barGap?: number;
  barCount?: number;
  peaks?: number[];
  interactive?: boolean;
  audioUrl?: string;
  progress?: number; // Optional external progress override
  onSeek?: (percentage: number) => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  className = '',
  height = 48,
  width = '100%',
  waveColor = 'rgba(255, 255, 255, 0.25)',
  progressColor = '#3b82f6',
  hoverColor = 'rgba(255, 255, 255, 0.5)',
  barWidth = 3,
  barGap = 2,
  barCount = 70,
  peaks,
  interactive = true,
  audioUrl,
  progress: externalProgress,
  onSeek
}) => {
  const audioContext = useAudio();
  const contextProgress = audioContext?.progress ?? 0;
  const isPlaying = audioContext?.isPlaying ?? false;
  const currentProgress = externalProgress !== undefined ? externalProgress : contextProgress;

  const [hoverProgress, setHoverProgress] = useState<number | null>(null);

  // Generate or normalize amplitude peak array normalized between 0.15 and 1.0
  const normalizedPeaks = useMemo(() => {
    if (peaks && peaks.length > 0) {
      const max = Math.max(...peaks) || 1;
      return peaks.map(p => Math.max(0.15, p / max));
    }

    // Deterministic wave pattern calculated from audioUrl string seed
    const seed = audioUrl ? audioUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 123;
    const items: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const v = Math.sin((i + seed) * 0.15) * 0.35 + Math.cos((i * 0.35) + seed) * 0.3 + 0.35;
      items.push(Math.max(0.15, Math.min(1.0, v)));
    }
    return items;
  }, [peaks, audioUrl, barCount]);

  // Construct SVG Path strings for unplayed and played waveform bars
  const viewWidth = 1000;
  const viewHeight = 100;
  const totalBars = normalizedPeaks.length;
  const step = viewWidth / totalBars;
  const calculatedBarWidth = Math.max(1, Math.min(step - 1, (barWidth / (barWidth + barGap)) * step));

  // Generate SVG path d-string representing all vertical bars centered around mid Y axis
  const createWaveformPath = (peakArray: number[]) => {
    return peakArray.map((amplitude, i) => {
      const x = i * step + (step - calculatedBarWidth) / 2;
      const barH = amplitude * (viewHeight * 0.85);
      const y = (viewHeight - barH) / 2;
      const rx = calculatedBarWidth / 2;
      return `M ${x.toFixed(1)} ${(y + rx).toFixed(1)} 
              A ${rx.toFixed(1)} ${rx.toFixed(1)} 0 0 1 ${(x + calculatedBarWidth).toFixed(1)} ${(y + rx).toFixed(1)} 
              V ${(y + barH - rx).toFixed(1)} 
              A ${rx.toFixed(1)} ${rx.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${(y + barH - rx).toFixed(1)} Z`;
    }).join(' ');
  };

  const svgPathData = useMemo(() => createWaveformPath(normalizedPeaks), [normalizedPeaks, calculatedBarWidth]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setHoverProgress(pct);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    
    if (onSeek) {
      onSeek(pct);
    } else if (audioContext?.seek) {
      audioContext.seek(pct);
    }
  };

  return (
    <div
      className={`relative select-none overflow-hidden ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverProgress(null)}
      onClick={handleClick}
    >
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          {/* Clip path for played progress */}
          <clipPath id={`waveform-played-clip-${audioUrl || 'default'}`}>
            <rect x="0" y="0" width={`${currentProgress}%`} height="100%" />
          </clipPath>

          {/* Clip path for hover progress */}
          {hoverProgress !== null && (
            <clipPath id={`waveform-hover-clip-${audioUrl || 'default'}`}>
              <rect x="0" y="0" width={`${hoverProgress}%`} height="100%" />
            </clipPath>
          )}
        </defs>

        {/* Base Unplayed Waveform SVG Path */}
        <path
          d={svgPathData}
          fill={waveColor}
          className="transition-colors duration-200"
        />

        {/* Hover State Waveform Overlay */}
        {hoverProgress !== null && (
          <path
            d={svgPathData}
            fill={hoverColor}
            clipPath={`url(#waveform-hover-clip-${audioUrl || 'default'})`}
          />
        )}

        {/* Played Progress Waveform SVG Path */}
        <path
          d={svgPathData}
          fill={progressColor}
          clipPath={`url(#waveform-played-clip-${audioUrl || 'default'})`}
          className={isPlaying ? 'animate-pulse' : ''}
        />
      </svg>
    </div>
  );
};

export default AudioWaveform;
