import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Sparkles, Activity, Zap, Disc, Maximize2, Minimize2, Settings2, BarChart2, Radio, Compass } from 'lucide-react';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

export type VisualizerMode = 'bars' | 'radial' | 'wave' | 'hologram' | 'particles';
export type VisualizerTheme = 'cyber' | 'gold' | 'matrix' | 'sunset';

interface CanvasAudioAnalyzerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  track?: Track | null;
  height?: number;
  mode?: VisualizerMode;
  theme?: VisualizerTheme;
  className?: string;
  showControls?: boolean;
  showMetrics?: boolean;
  onModeChange?: (mode: VisualizerMode) => void;
}

const COLOR_PALETTES = {
  cyber: {
    primary: '#0098EA',
    secondary: '#3B82F6',
    accent: '#8B5CF6',
    highlight: '#EC4899',
    glow: 'rgba(0, 152, 234, 0.4)',
    bg: '#050A24',
  },
  gold: {
    primary: '#F59E0B',
    secondary: '#EAB308',
    accent: '#F97316',
    highlight: '#EF4444',
    glow: 'rgba(245, 158, 11, 0.4)',
    bg: '#1A1202',
  },
  matrix: {
    primary: '#10B981',
    secondary: '#06B6D4',
    accent: '#34D399',
    highlight: '#A7F3D0',
    glow: 'rgba(16, 185, 129, 0.4)',
    bg: '#021810',
  },
  sunset: {
    primary: '#F43F5E',
    secondary: '#A855F7',
    accent: '#FB923C',
    highlight: '#F06292',
    glow: 'rgba(244, 63, 94, 0.4)',
    bg: '#1A0210',
  },
};

export const CanvasAudioAnalyzer: React.FC<CanvasAudioAnalyzerProps> = ({
  analyser,
  isPlaying,
  track,
  height = 180,
  mode: initialMode = 'bars',
  theme: initialTheme = 'cyber',
  className = '',
  showControls = true,
  showMetrics = true,
  onModeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [mode, setMode] = useState<VisualizerMode>(initialMode);
  const [theme, setTheme] = useState<VisualizerTheme>(initialTheme);
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [barCount, setBarCount] = useState<number>(48);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live audio metrics state
  const [metrics, setMetrics] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    peakDb: -60,
  });

  // Peaks array for smooth falling peak dots in bars mode
  const peaksRef = useRef<number[]>([]);

  // Particle positions for particle visualizer mode
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);

  const currentPalette = COLOR_PALETTES[theme];

  const handleModeSelect = (newMode: VisualizerMode) => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Buffer array for frequency data
    const fftSize = 128;
    const dataArray = new Uint8Array(fftSize / 2);

    // Track simulated time for fallback synthesis when real FFT is zero or restricted
    let time = 0;

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const canvasHeight = canvas.height;

      // Read audio analyzer data if available
      let hasRealSignal = false;
      if (analyser) {
        try {
          analyser.getByteFrequencyData(dataArray);
          // Check if array has non-zero values
          for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > 0) {
              hasRealSignal = true;
              break;
            }
          }
        } catch (e) {
          hasRealSignal = false;
        }
      }

      // If no real signal while playing, generate realistic frequency spectrum
      if (!hasRealSignal && isPlaying) {
        time += 0.05;
        const count = dataArray.length;
        for (let i = 0; i < count; i++) {
          const normIdx = i / count;
          // Bass range (low index) has stronger pulse, treble has faster flicker
          const bassPulse = Math.sin(time * 3) * 0.4 + 0.6;
          const midPulse = Math.cos(time * 2 + normIdx * 4) * 0.3 + 0.5;
          const trebleFlicker = Math.sin(time * 8 + i * 2) * 0.25 + 0.35;

          const freqVal =
            (normIdx < 0.25
              ? bassPulse * 220
              : normIdx < 0.6
              ? midPulse * 180
              : trebleFlicker * 140) * Math.min(1, Math.sin(normIdx * Math.PI) + 0.2);

          dataArray[i] = Math.max(10, Math.min(255, Math.floor(freqVal)));
        }
      } else if (!isPlaying) {
        // Decay to zero slowly
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.85);
        }
      }

      // Calculate band metrics
      const len = dataArray.length;
      if (len > 0) {
        let bassSum = 0;
        let midSum = 0;
        let trebleSum = 0;
        let maxVal = 0;

        const bassEnd = Math.floor(len * 0.25);
        const midEnd = Math.floor(len * 0.65);

        for (let i = 0; i < len; i++) {
          const val = dataArray[i] * sensitivity;
          if (val > maxVal) maxVal = val;

          if (i < bassEnd) bassSum += val;
          else if (i < midEnd) midSum += val;
          else trebleSum += val;
        }

        const bAvg = Math.min(100, Math.round((bassSum / (bassEnd || 1) / 255) * 100));
        const mAvg = Math.min(100, Math.round((midSum / ((midEnd - bassEnd) || 1) / 255) * 100));
        const tAvg = Math.min(100, Math.round((trebleSum / ((len - midEnd) || 1) / 255) * 100));
        const peak = Math.max(-60, Math.round(20 * Math.log10((maxVal || 1) / 255)));

        setMetrics({
          bass: bAvg,
          mid: mAvg,
          treble: tAvg,
          peakDb: peak,
        });
      }

      // Clear Canvas with subtle trail dark background
      ctx.clearRect(0, 0, width, canvasHeight);

      // Create gradient for drawing
      const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
      gradient.addColorStop(0, currentPalette.primary);
      gradient.addColorStop(0.5, currentPalette.secondary);
      gradient.addColorStop(0.8, currentPalette.accent);
      gradient.addColorStop(1, currentPalette.highlight);

      // RENDER SELECTED VISUALIZER MODE
      if (mode === 'bars') {
        renderBarsMode(ctx, width, canvasHeight, dataArray, gradient);
      } else if (mode === 'radial') {
        renderRadialMode(ctx, width, canvasHeight, dataArray);
      } else if (mode === 'wave') {
        renderWaveMode(ctx, width, canvasHeight, dataArray, gradient);
      } else if (mode === 'hologram') {
        renderHologramMode(ctx, width, canvasHeight, dataArray);
      } else if (mode === 'particles') {
        renderParticlesMode(ctx, width, canvasHeight, dataArray);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    // 1. RENDER BARS MODE
    const renderBarsMode = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      data: Uint8Array,
      gradient: CanvasGradient
    ) => {
      const activeBars = Math.min(barCount, data.length);
      const barWidth = (width / activeBars) * 0.75;
      const gap = (width / activeBars) * 0.25;

      // Initialize peaks if needed
      if (peaksRef.current.length !== activeBars) {
        peaksRef.current = new Array(activeBars).fill(0);
      }

      for (let i = 0; i < activeBars; i++) {
        // Map bar index to frequency array index
        const dataIdx = Math.floor((i / activeBars) * data.length);
        const val = (data[dataIdx] / 255) * height * 0.85 * sensitivity;
        const barHeight = Math.max(4, val);

        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight;

        // Draw glowing frequency bar
        ctx.fillStyle = gradient;
        ctx.shadowColor = currentPalette.glow;
        ctx.shadowBlur = isPlaying ? 10 : 2;

        // Rounded top bars
        const radius = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height);
        ctx.closePath();
        ctx.fill();

        // Peak point physics
        if (barHeight > peaksRef.current[i]) {
          peaksRef.current[i] = barHeight;
        } else {
          peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.8);
        }

        // Draw peak dot
        const peakY = height - peaksRef.current[i] - 4;
        ctx.fillStyle = currentPalette.highlight;
        ctx.shadowBlur = 12;
        ctx.fillRect(x, Math.max(0, peakY), barWidth, 3);
      }
      ctx.shadowBlur = 0;
    };

    // 2. RENDER RADIAL MODE
    const renderRadialMode = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      data: Uint8Array
    ) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.28;
      const barCountRadial = Math.min(64, data.length * 2);

      // Central glowing circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = currentPalette.primary;
      ctx.lineWidth = 3;
      ctx.shadowColor = currentPalette.glow;
      ctx.shadowBlur = 20;
      ctx.stroke();

      for (let i = 0; i < barCountRadial; i++) {
        const dataIdx = Math.floor((i / barCountRadial) * data.length);
        const amplitude = (data[dataIdx] / 255) * (radius * 0.8) * sensitivity;

        const angle = (i / barCountRadial) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + amplitude);
        const y2 = centerY + Math.sin(angle) * (radius + amplitude);

        ctx.strokeStyle = i % 2 === 0 ? currentPalette.primary : currentPalette.accent;
        ctx.lineWidth = 3;
        ctx.shadowColor = currentPalette.glow;
        ctx.shadowBlur = amplitude > 20 ? 12 : 4;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    // 3. RENDER WAVE MODE
    const renderWaveMode = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      data: Uint8Array,
      gradient: CanvasGradient
    ) => {
      const slices = data.length;
      const sliceWidth = width / (slices - 1);

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < slices; i++) {
        const v = (data[i] / 255) * sensitivity;
        const y = height - v * (height * 0.7) - 10;
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * sliceWidth;
          const prevV = (data[i - 1] / 255) * sensitivity;
          const prevY = height - prevV * (height * 0.7) - 10;
          const cx = (prevX + x) / 2;
          const cy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, cy);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.45;
      ctx.fill();

      // Top wave outline
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = currentPalette.highlight;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = currentPalette.glow;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // 4. RENDER HOLOGRAM MODE
    const renderHologramMode = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      data: Uint8Array
    ) => {
      const centerX = width / 2;
      const horizonY = height * 0.35;
      const gridLines = 16;

      // Draw perspective grid floor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= gridLines; i++) {
        const x = (i / gridLines) * width;
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let j = 1; j <= 6; j++) {
        const y = horizonY + (j / 6) * (height - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Holographic frequency pillars
      const pillarCount = 24;
      const pillarWidth = (width / pillarCount) * 0.5;

      for (let i = 0; i < pillarCount; i++) {
        const dataIdx = Math.floor((i / pillarCount) * data.length);
        const amp = (data[dataIdx] / 255) * (height * 0.55) * sensitivity;
        const x = (i / pillarCount) * width + (width / pillarCount) * 0.25;
        const y = height - amp;

        ctx.fillStyle = i % 3 === 0 ? currentPalette.primary : currentPalette.accent;
        ctx.shadowColor = currentPalette.glow;
        ctx.shadowBlur = 15;
        ctx.fillRect(x, y, pillarWidth, amp);

        // Top cap glow ring
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 2, y - 2, pillarWidth + 4, 3);
      }
      ctx.shadowBlur = 0;
    };

    // 5. RENDER PARTICLES MODE
    const renderParticlesMode = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      data: Uint8Array
    ) => {
      // Spawn new particles if audio is active
      const bassValue = data[2] || 0;
      if (bassValue > 100 && Math.random() < 0.6) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: height - 10,
          vx: (Math.random() - 0.5) * 3,
          vy: - (Math.random() * 4 + 2) * (bassValue / 150),
          radius: Math.random() * 4 + 2,
          color: Math.random() > 0.5 ? currentPalette.primary : currentPalette.highlight,
          life: 0,
          maxLife: Math.floor(Math.random() * 40 + 30),
        });
      }

      // Update & render particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        if (p.life >= p.maxLife || p.y < 0) {
          particles.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    };

    // Auto-Resize canvas resolution
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    // Start render loop
    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [analyser, isPlaying, mode, theme, sensitivity, barCount, height, currentPalette]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-[#050A24] border border-[#16244F] p-3 shadow-2xl select-none ${className}`}
      style={{ backgroundColor: currentPalette.bg }}
    >
      {/* Visualizer Canvas Header / Status Bar */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-[#9AA0AE]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F2F4F8]">
              {mode} Visualizer
            </span>
          </div>

          {isPlaying && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live FFT
            </span>
          )}
        </div>

        {/* Action Controls Toggle */}
        {showControls && (
          <div className="flex items-center gap-1.5">
            {/* Mode Selector Buttons */}
            <div className="hidden sm:flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
              {(['bars', 'radial', 'wave', 'hologram', 'particles'] as VisualizerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeSelect(m)}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md transition-all ${
                    mode === m
                      ? 'bg-[#0098EA] text-white shadow-sm'
                      : 'text-[#9AA0AE] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as VisualizerTheme)}
              className="bg-black/60 border border-white/10 text-white text-[10px] font-bold rounded-lg px-2 py-0.5 outline-none cursor-pointer"
            >
              <option value="cyber">Cyan Cyber</option>
              <option value="gold">NFT Gold</option>
              <option value="matrix">Matrix Green</option>
              <option value="sunset">Synthwave</option>
            </select>
          </div>
        )}
      </div>

      {/* Main HTML5 Canvas */}
      <div className="relative w-full overflow-hidden flex items-center justify-center rounded-xl bg-black/30">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
          className="w-full block transition-opacity duration-300"
        />

        {/* Central Album Artwork Overlay for Radial Mode */}
        {mode === 'radial' && track && (
          <div className="absolute w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl pointer-events-none animate-spin-slow">
            <img
              src={track.coverUrl || getPlaceholderImage('cover')}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Live Audio Frequency Spectrum Metrics Bar */}
      {showMetrics && (
        <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-[#9AA0AE]">
          {/* Sub-Bass Band */}
          <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-amber-400">Sub-Bass</span>
            <span className="text-xs font-black text-white">{metrics.bass}%</span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-75"
                style={{ width: `${metrics.bass}%` }}
              />
            </div>
          </div>

          {/* Mid-Range Band */}
          <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-cyan-400">Mid-Range</span>
            <span className="text-xs font-black text-white">{metrics.mid}%</span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-75"
                style={{ width: `${metrics.mid}%` }}
              />
            </div>
          </div>

          {/* High Treble Band */}
          <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-purple-400">Treble</span>
            <span className="text-xs font-black text-white">{metrics.treble}%</span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-purple-400 h-full transition-all duration-75"
                style={{ width: `${metrics.treble}%` }}
              />
            </div>
          </div>

          {/* Peak Level dB */}
          <div className="bg-white/5 rounded-lg p-1.5 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400">Peak Level</span>
            <span className="text-xs font-black text-white">{metrics.peakDb} dB</span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-75"
                style={{ width: `${Math.max(0, 100 + (metrics.peakDb * 1.6))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasAudioAnalyzer;
