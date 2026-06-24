import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';
import { Sparkles, Sliders, Music, Waves, Activity, Zap } from 'lucide-react';

interface AudioVisualizerProps {
  className?: string;
  color?: string;
  accentColor?: string;
}

type VisualizerMode = 'waves' | 'bars' | 'spiral' | 'retro';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  color = '#3b82f6', // Brand Blue
  accentColor = '#ec4899', // Cyan/Pink Accent
}) => {
  const { analyser, isPlaying } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState<VisualizerMode>('waves');
  const animationRef = useRef<number | null>(null);
  const [isCorsBlocked, setIsCorsBlocked] = useState(false);

  // Mode descriptions & titles
  const modes: { id: VisualizerMode; label: string; icon: React.ReactNode }[] = [
    { id: 'waves', label: 'Flowing Wave', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'bars', label: 'Spectral Bars', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'spiral', label: 'Orbital Core', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'retro', label: 'Pulse Grid', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    // Resize observer to scale canvas perfectly
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      // Set display size
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      // Scale for High DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Reset variables
      width = canvas.width;
      height = canvas.height;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Call resize initially
    handleResize();

    // Frequency buffer variables
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);
    
    // For smooth transitions in modes and procedural flow
    let frame = 0;
    
    // Procedural energy levels for fallbacks or enhancing raw stream
    let lastEnergy = 0;

    const draw = () => {
      // Keep loops going
      animationRef.current = requestAnimationFrame(draw);
      frame++;

      if (!canvas || !ctx) return;
      
      // Get internal sizes in standard coordinates (pre-DPR scaling)
      const dpr = window.devicePixelRatio || 1;
      const renderW = width / dpr;
      const renderH = height / dpr;

      // Soft clear background with very slight transparency to create neon trail effect
      ctx.fillStyle = 'rgba(5, 10, 36, 0.25)';
      ctx.fillRect(0, 0, renderW, renderH);

      // Check for zeroed telemetry (unconnected or CORS-restricted streams)
      let hasRealSignal = false;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        // Sum signal to verify we have direct stream feedback
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        if (sum > 50) {
          hasRealSignal = true;
          if (isCorsBlocked) setIsCorsBlocked(false);
        } else {
          // If sum is too low while playing, it might be a CORS-restricted asset
          if (!isCorsBlocked && isPlaying) {
            setIsCorsBlocked(true);
          }
        }
      }

      // Generate procedural data if no real signal or is paused
      if (!hasRealSignal) {
        const speed = isPlaying ? 0.08 : 0.01;
        const baseLevel = isPlaying ? 80 : 15;
        for (let i = 0; i < bufferLength; i++) {
          // Combination of sine waves to simulate live sound ranges
          const wave1 = Math.sin(i * 0.15 + frame * speed) * 35;
          const wave2 = Math.cos(i * 0.05 - frame * (speed * 0.7)) * 25;
          const noise = Math.sin(i * 0.6 + frame * (speed * 1.5)) * 10;
          dataArray[i] = Math.max(0, baseLevel + wave1 + wave2 + noise);
        }
      }

      // Compute overall audio energy
      let totalEnergy = 0;
      for (let i = 0; i < bufferLength; i++) {
        totalEnergy += dataArray[i];
      }
      const energyNorm = totalEnergy / (bufferLength * 255); // 0.0 to 1.0 scale
      lastEnergy = lastEnergy * 0.8 + energyNorm * 0.2; // Smooth energy response

      // RENDER DESIRED MODES
      if (activeMode === 'waves') {
        renderWaveform(ctx, renderW, renderH, dataArray, bufferLength, lastEnergy, frame);
      } else if (activeMode === 'bars') {
        renderBars(ctx, renderW, renderH, dataArray, bufferLength, lastEnergy);
      } else if (activeMode === 'spiral') {
        renderCircularSpectrum(ctx, renderW, renderH, dataArray, bufferLength, lastEnergy, frame);
      } else if (activeMode === 'retro') {
        renderMatrixGrid(ctx, renderW, renderH, dataArray, bufferLength, lastEnergy, frame);
      }
    };

    // Visualization renderers
    const renderWaveform = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array,
      len: number,
      energy: number,
      f: number
    ) => {
      // Glow settings
      c.shadowBlur = 15;
      c.shadowColor = color;

      // Draw primary glowing line
      c.beginPath();
      c.strokeStyle = color;
      c.lineWidth = 3 + energy * 4;

      const sliceWidth = w / (len - 1);
      
      for (let i = 0; i < len; i++) {
        const x = i * sliceWidth;
        const v = data[i] / 255.0;
        // Float the wave in the center vertical region
        const y = h / 2 + (v - 0.5) * (h * 0.75);

        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }
      }
      c.stroke();

      // Draw mirrored background gradient flow
      c.shadowBlur = 0;
      c.beginPath();
      c.fillStyle = `rgba(59, 130, 246, ${0.08 + energy * 0.15})`;
      
      c.moveTo(0, h);
      for (let i = 0; i < len; i++) {
        const x = i * sliceWidth;
        const v = data[i] / 255.0;
        const y = h / 2 + (v - 0.5) * (h * 0.6) + Math.sin(f * 0.02 + i * 0.1) * 10;
        c.lineTo(x, y);
      }
      c.lineTo(w, h);
      c.closePath();
      c.fill();

      // Draw a secondary high-frequency thin accent line on top
      c.beginPath();
      c.strokeStyle = accentColor;
      c.lineWidth = 1.5;
      c.shadowBlur = 8;
      c.shadowColor = accentColor;

      for (let i = 0; i < len; i++) {
        const x = i * sliceWidth;
        // Shift data index or scale slightly to desynchronize
        const shiftedIdx = (i + 15) % len;
        const v = data[shiftedIdx] / 255.0;
        const y = h / 2 + Math.sin(f * 0.04 + i * 0.05) * 5 + (v - 0.5) * (h * 0.55);

        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }
      }
      c.stroke();
      c.shadowBlur = 0;
    };

    const renderBars = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array,
      len: number,
      energy: number
    ) => {
      const barCount = Math.min(32, len);
      const gap = 4;
      const totalGapWidth = gap * (barCount - 1);
      const barWidth = (w - totalGapWidth) / barCount;

      for (let i = 0; i < barCount; i++) {
        // Average frequency peaks across raw bins
        const rawIdx = Math.floor((i / barCount) * len);
        const v = data[rawIdx] / 255.0;
        
        // Calculate variable dynamic heights based on frequency profile and energy amplification
        const barHeight = Math.max(8, v * h * 0.85 + (energy * 15));
        const x = i * (barWidth + gap);
        const y = h - barHeight;

        // Gradient color based on frequency
        const gradient = c.createLinearGradient(x, y, x, h);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, '#1e3a8a');

        // Draw bar
        c.fillStyle = gradient;
        // Smooth rounded bar cap
        c.beginPath();
        c.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        c.fill();

        // High frequency glow particles floating above standard bars
        if (v > 0.6 && i % 2 === 0) {
          c.shadowBlur = 10;
          c.shadowColor = accentColor;
          c.fillStyle = accentColor;
          c.beginPath();
          c.arc(x + barWidth / 2, y - 6, 2.5, 0, Math.PI * 2);
          c.fill();
          c.shadowBlur = 0;
        }
      }
    };

    const renderCircularSpectrum = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array,
      len: number,
      energy: number,
      f: number
    ) => {
      const centerX = w / 2;
      const centerY = h / 2;
      const baseRadius = Math.min(w, h) * 0.22 + (energy * 18);
      
      c.save();
      c.translate(centerX, centerY);
      // Gentle spin rotation
      c.rotate(f * 0.003);

      // Gradient background glow ring
      const radialGrad = c.createRadialGradient(0, 0, baseRadius * 0.4, 0, 0, baseRadius * 1.5);
      radialGrad.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
      radialGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.03 + energy * 0.08})`);
      radialGrad.addColorStop(1, 'rgba(5, 10, 36, 0)');
      c.fillStyle = radialGrad;
      c.beginPath();
      c.arc(0, 0, baseRadius * 1.6, 0, Math.PI * 2);
      c.fill();

      // Plot circular audio rings
      const totalPoints = 64;
      c.shadowBlur = 12;
      c.shadowColor = color;
      c.strokeStyle = color;
      c.lineWidth = 2 + energy * 3;

      c.beginPath();
      for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2;
        const dataIndex = Math.floor((Math.abs(totalPoints / 2 - i) / (totalPoints / 2)) * (len - 1) * 0.8);
        const v = data[dataIndex] / 255.0;
        const currentRadius = baseRadius + v * 40;

        const lx = Math.cos(angle) * currentRadius;
        const ly = Math.sin(angle) * currentRadius;

        if (i === 0) {
          c.moveTo(lx, ly);
        } else {
          c.lineTo(lx, ly);
        }
      }
      c.closePath();
      c.stroke();

      // Core particle pulses reactively
      c.shadowBlur = 20 * energy;
      c.shadowColor = accentColor;
      c.fillStyle = isPlaying ? accentColor : color;
      c.beginPath();
      c.arc(0, 0, baseRadius * 0.35, 0, Math.PI * 2);
      c.fill();

      c.restore();
      c.shadowBlur = 0;
    };

    const renderMatrixGrid = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: Uint8Array,
      len: number,
      energy: number,
      f: number
    ) => {
      const gridCols = 16;
      const gridRows = 8;
      const colWidth = w / gridCols;
      const rowHeight = h / gridRows;

      for (let col = 0; col < gridCols; col++) {
        const rawIdx = Math.floor((col / gridCols) * len * 0.6);
        const v = data[rawIdx] / 255.0;
        const activeRows = Math.floor(v * gridRows);

        for (let row = 0; row < gridRows; row++) {
          const isCellOn = (gridRows - row) <= activeRows;
          const x = col * colWidth + 2;
          const y = row * rowHeight + 2;
          const cellW = colWidth - 4;
          const cellH = rowHeight - 4;

          if (isCellOn) {
            // Bright frequency-dependent cells
            const ratio = row / gridRows;
            c.fillStyle = ratio < 0.3 
              ? accentColor // high frequencies
              : ratio < 0.7 
                ? color // mid ranges
                : '#1d4ed8'; // deep bass
            
            c.shadowBlur = isPlaying ? (ratio < 0.3 ? 10 : 4) : 0;
            c.shadowColor = c.fillStyle as string;
            c.fillRect(x, y, cellW, cellH);
          } else {
            // Faint offline template mesh cell
            c.shadowBlur = 0;
            c.fillStyle = 'rgba(255,255,255,0.02)';
            c.fillRect(x, y, cellW, cellH);
          }
        }
      }
      c.shadowBlur = 0;
    };

    // Fire animation loop
    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [analyser, activeMode, isPlaying]);

  return (
    <div className={`flex flex-col bg-[#050a24]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 overflow-hidden relative group/viz ${className}`} id="audio-visualizer-card">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-[pulse_1s_infinite] shadow-lg shadow-blue-500/50" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
            Neural Audio Spectrum
          </h4>
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[8px] tracking-wider text-foreground/45 bg-white/5 px-2 py-1 rounded-[4px] uppercase select-none">
          <Sliders className="w-2.5 h-2.5" />
          <span>
            {isCorsBlocked ? "Fallback Sync Mode" : isPlaying ? "Live Stream Telemetry" : "Ready"}
          </span>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div ref={containerRef} className="flex-1 w-full min-h-[140px] relative rounded-lg overflow-hidden bg-[#020617]/70 border border-white/5 shadow-inner">
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        
        {/* Playback instruction overlay if stream isn't playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center p-4 backdrop-blur-[1px] pointer-events-none select-none">
            <Music className="w-6 h-6 text-muted-foreground/30 mb-2 animate-bounce" />
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
              Initialize track playback to activate audio analysis
            </p>
          </div>
        )}
      </div>

      {/* Interface Mode Controls */}
      <div className="flex items-center justify-between mt-4 z-10 pt-2 border-t border-white/5">
        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
          Visualization Mode
        </span>
        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-0.5 border border-white/5">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`p-1.5 px-2.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 select-none cursor-pointer ${
                activeMode === mode.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/10 shadow-sm'
                  : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/5'
              }`}
              title={mode.label}
            >
              {mode.icon}
              <span className="hidden xs:inline">{mode.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
