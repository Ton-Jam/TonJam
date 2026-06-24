import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import { Play, Pause, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Interactive3DViewerProps {
  imageUrl: string;
  title: string;
  isActive: boolean;
  isPlaying: boolean;
  handlePlayClick: () => void;
  edition?: string | number;
  minted?: number;
  supply?: number;
  isAuction?: boolean;
  auctionTimerComponent?: React.ReactNode;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  imageUrl,
  title,
  isActive,
  isPlaying,
  handlePlayClick,
  edition,
  minted,
  supply,
  isAuction = false,
  auctionTimerComponent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt coordinates
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smoothed physics spring configurations for a weighty premium feel
  const springConfig = { damping: 25, stiffness: 140, mass: 0.8 };
  
  // Dynamic rotate angles based on normalized cursor position
  const rotateX = useSpring(useTransform(y, [0, 1], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-18, 18]), springConfig);

  // Dynamic glare sheen positions
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), springConfig);
  const glareOpacity = useSpring(useTransform(y, [0, 1], [0.15, 0.45]), springConfig);

  // Construct dynamic background style using useMotionTemplate
  const glareBackground = useMotionTemplate`radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}), transparent)`;

  // Track position updates on mouse movement inside container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate position relative to container
    const relativeX = (e.clientX - rect.left) / width;
    const relativeY = (e.clientY - rect.top) / height;

    x.set(relativeX);
    y.set(relativeY);
  };

  // Reset springs when cursor leaves container
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  // Handle touch events on mobile devices for native interactive tactile tilt
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    const relativeX = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    x.set(relativeX);
    y.set(relativeY);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      className="relative w-full aspect-square max-w-[340px] sm:max-w-none mx-auto cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      id="interactive-3d-artwork-container"
    >
      {/* Dynamic ambient background glow matching the artwork colors */}
      <div 
        className={cn(
          "absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-pink-500/25 rounded-full blur-[40px] opacity-60 transition-all duration-700",
          isHovered ? "scale-110 opacity-80" : "scale-100"
        )}
      />

      {/* 3D Vinyl Record sliding out behind the sleeve */}
      <motion.div
        className="absolute top-[8%] bottom-[8%] right-2 aspect-square rounded-full bg-[#0d0f1a] shadow-2xl flex items-center justify-center border border-white/5"
        animate={{
          x: isHovered ? '28%' : '0%',
          rotate: isPlaying ? 360 : isHovered ? 45 : 0,
        }}
        transition={{
          x: { type: 'spring', damping: 20, stiffness: 100 },
          rotate: isPlaying 
            ? { repeat: Infinity, duration: 6, ease: 'linear' }
            : { type: 'spring', damping: 15 }
        }}
        style={{ zIndex: 0 }}
      >
        {/* Vinyl Grooves */}
        <div className="absolute inset-2 rounded-full border border-black/80 opacity-80" />
        <div className="absolute inset-4 rounded-full border border-black/70 opacity-70" />
        <div className="absolute inset-6 rounded-full border border-black/60 opacity-60" />
        <div className="absolute inset-8 rounded-full border border-black/50 opacity-50" />
        <div className="absolute inset-10 rounded-full border border-black/40 opacity-40" />
        <div className="absolute inset-12 rounded-full border border-white/5 opacity-30" />
        <div className="absolute inset-16 rounded-full border border-black/90 opacity-90" />

        {/* Center label image */}
        <div className="w-[32%] h-[32%] rounded-full bg-[#111322] border-4 border-[#07080f] overflow-hidden flex items-center justify-center relative">
          <img
            src={imageUrl}
            alt="Vinyl Center Label"
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          {/* Spindle hole */}
          <div className="absolute w-3 h-3 rounded-full bg-[#050a24] shadow-inner border border-black/60" />
        </div>
      </motion.div>

      {/* Main Card Sleeve container with 3D tilt transformation */}
      <motion.div
        onClick={handlePlayClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          zIndex: 10,
        }}
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] bg-neutral-950/80 backdrop-blur-md border border-white/10 transition-shadow duration-300 flex items-center justify-center group"
      >
        {/* High-fidelity artwork image */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700"
          style={{ transform: 'translateZ(0px)' }}
          referrerPolicy="no-referrer"
        />

        {/* Dynamic gloss / holographic glare overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-30"
          style={{
            background: glareBackground
          }}
        />

        {/* Playback / Pause Action Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[4px] transition-all duration-500",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          style={{ transform: 'translateZ(30px)' }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-blue-600/95 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(37,99,235,0.7)] border border-white/20 transition-all"
          >
            {isActive && isPlaying ? (
              <Pause className="h-8 w-8 text-white fill-current animate-pulse" />
            ) : (
              <Play className="h-8 w-8 text-white fill-current ml-2" />
            )}
          </motion.div>
        </div>

        {/* Edition badges container (styled perfectly without harsh border lines) */}
        <div 
          className="absolute top-4 left-4 flex flex-col gap-1.5 sm:top-5 sm:left-5 text-left select-none pointer-events-none"
          style={{ transform: 'translateZ(45px)' }}
        >
          {edition && (
            <div className="px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-md">
              {edition} <span className="text-white/50 font-normal ml-1">Edition</span>
            </div>
          )}
          {minted !== undefined && supply !== undefined && (
            <div className="px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-md">
              {minted} <span className="text-white/50 font-normal ml-1">Minted / {supply} Total</span>
            </div>
          )}
          {supply !== undefined && minted !== undefined && (
            <div className="px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-md">
              {supply - minted} <span className="text-white/50 font-normal ml-1">Remaining</span>
            </div>
          )}
        </div>

        {/* Live Auction countdown integration */}
        {isAuction && auctionTimerComponent && (
          <div 
            className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 select-none pointer-events-none"
            style={{ transform: 'translateZ(40px)' }}
          >
            {auctionTimerComponent}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Interactive3DViewer;
