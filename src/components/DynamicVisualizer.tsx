import React, { useRef, useEffect, useMemo } from 'react';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface DynamicVisualizerProps {
  className?: string;
  variant?: 'bars' | 'circle' | 'waves' | 'particles';
  color?: string;
  interactive?: boolean;
}

const DynamicVisualizer: React.FC<DynamicVisualizerProps> = ({ 
  className, 
  variant = 'bars', 
  color = '#3b82f6',
  interactive = true 
}) => {
  const { isPlaying, analyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const interactionRef = useRef<{ x: number, y: number, active: boolean }>({ x: 0, y: 0, active: false });

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 360
    }));
  }, []);

  const draw = () => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Interaction pulse
    if (interactionRef.current.active && variant === 'particles') {
      ctx.beginPath();
      ctx.arc(
        (interactionRef.current.x / 100) * width, 
        (interactionRef.current.y / 100) * height, 
        50, 0, Math.PI * 2
      );
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (variant === 'bars') {
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Dynamic gradient based on height
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = gradient;
        const opacity = (dataArray[i] / 255) * 0.8 + 0.2;
        ctx.globalAlpha = opacity;
        
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        // Dynamic cap
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = opacity * 0.5;
        ctx.fillRect(x, height - barHeight, barWidth - 1, 2);
        
        x += barWidth;
      }
      ctx.globalAlpha = 1;
    } 
    else if (variant === 'circle') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 5;
      
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / bufferLength;
      const scale = 1 + (avg / 255) * 0.5;

      // Glow effect
      const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * scale, centerX, centerY, radius * scale + 100);
      glowGradient.addColorStop(0, `${color}44`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Main Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * scale, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Outer rings
      for (let j = 1; j <= 3; j++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * scale + (j * 40 * (1 + avg/255)), 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = (0.2 / j) * (0.5 + (avg/255) * 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Frequency lines
      for (let i = 0; i < bufferLength; i += 2) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const intensity = dataArray[i] / 255;
        const lineLen = intensity * radius * 1.5;
        
        const startX = centerX + Math.cos(angle) * (radius * scale);
        const startY = centerY + Math.sin(angle) * (radius * scale);
        const endX = centerX + Math.cos(angle) * (radius * scale + lineLen);
        const endY = centerY + Math.sin(angle) * (radius * scale + lineLen);

        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, color);
        grad.addColorStop(1, '#ffffff');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = intensity * 0.8 + 0.2;
        ctx.lineWidth = 2 + intensity * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    else if (variant === 'waves') {
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const sliceWidth = width / bufferLength;
      
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.strokeStyle = j === 0 ? color : j === 1 ? '#60a5fa' : '#ffffff';
        ctx.globalAlpha = (0.6 - j * 0.2) * (isPlaying ? 1 : 0.2);
        
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2 + (j * 20 * (Math.sin(Date.now() / 1000 + i / 10)));

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    else if (variant === 'particles') {
      const bassAvg = (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / 4;
      const intensity = (bassAvg / 255) * 2;
      const midAvg = dataArray[Math.floor(bufferLength/2)] / 255;

      particlesRef.current.forEach(p => {
        let speedMult = 1 + intensity * 4;
        
        // Repel from interaction
        if (interactionRef.current.active) {
           const dx = p.x - interactionRef.current.x;
           const dy = p.y - interactionRef.current.y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           if (dist < 20) {
              p.x += dx * 0.1;
              p.y += dy * 0.1;
              speedMult *= 2;
           }
        }

        p.x += p.speedX * speedMult;
        p.y += p.speedY * speedMult;

        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;

        ctx.beginPath();
        ctx.arc((p.x / 100) * width, (p.y / 100) * height, p.size * (1 + intensity * 0.5), 0, Math.PI * 2);
        
        // Color shift based on mids
        if (midAvg > 0.6) {
           ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, 1)`;
        } else {
           ctx.fillStyle = color;
        }
        
        ctx.globalAlpha = p.opacity * (0.3 + intensity * 0.7);
        ctx.fill();
        
        particlesRef.current.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const limit = interactionRef.current.active ? 12 : 8;
          if (dist < limit) {
            ctx.beginPath();
            ctx.moveTo((p.x / 100) * width, (p.y / 100) * height);
            ctx.lineTo((p2.x / 100) * width, (p2.y / 100) * height);
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / limit) * (0.1 + intensity * 0.2);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    interactionRef.current = {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
      active: true
    };

    if (e.type === 'mousedown' || e.type === 'touchstart') {
       // Reset active after pulse
    }
  };

  const stopInteraction = () => {
    interactionRef.current.active = false;
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, variant, color, analyser]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        canvasRef.current.width = parent.clientWidth * window.devicePixelRatio;
        canvasRef.current.height = parent.clientHeight * window.devicePixelRatio;
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%' }}
        className="block"
        onMouseDown={handleInteraction}
        onMouseMove={handleInteraction}
        onMouseUp={stopInteraction}
        onMouseLeave={stopInteraction}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        onTouchEnd={stopInteraction}
      />
      {interactive && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px] cursor-pointer group pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
            Tap to morph frequency
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicVisualizer;
