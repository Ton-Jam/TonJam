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
          "absolute -inset-6 bg-gradient-to-tr from-[#00B4D8]/30 via-indigo-500/20 to-purple-600/30 rounded-full blur-[50px] opacity-70 transition-all duration-700 pointer-events-none",
          isHovered ? "scale-115 opacity-90" : "scale-100"
        )}
      />

      {/* 3D Vinyl Record sliding out behind the sleeve */}
      <motion.div
        className="absolute top-[6%] bottom-[6%] right-3 aspect-square rounded-full bg-[#070913] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center border-0 overflow-hidden"
        animate={{
          x: isHovered ? '32%' : '0%',
          rotate: isPlaying ? 360 : isHovered ? 30 : 0,
        }}
        transition={{
          x: { type: 'spring', damping: 22, stiffness: 110 },
          rotate: isPlaying 
            ? { repeat: Infinity, duration: 4.5, ease: 'linear' }
            : { type: 'spring', damping: 15 }
        }}
        style={{ zIndex: 0 }}
      >
        {/* Vinyl Grooves & Specular Reflection Ring */}
        <div className="absolute inset-1.5 rounded-full border border-white/[0.04]" />
        <div className="absolute inset-4 rounded-full border border-white/[0.03]" />
        <div className="absolute inset-7 rounded-full border border-white/[0.04]" />
        <div className="absolute inset-10 rounded-full border border-white/[0.03]" />
        <div className="absolute inset-14 rounded-full border border-white/[0.05]" />
        <div className="absolute inset-20 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-40 animate-pulse" />

        {/* Center label image */}
        <div className="w-[34%] h-[34%] rounded-full bg-[#0d1224] overflow-hidden flex items-center justify-center relative shadow-inner">
          <img
            src={imageUrl}
            alt="Vinyl Center Label"
            className="w-full h-full object-cover opacity-90 scale-110"
            referrerPolicy="no-referrer"
          />
          {/* Spindle hole */}
          <div className="absolute w-3.5 h-3.5 rounded-full bg-[#04060d] shadow-2xl" />
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
        className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_35px_70px_rgba(0,0,0,0.85)] bg-slate-950/90 backdrop-blur-xl transition-shadow duration-300 flex items-center justify-center group border-0"
      >
        {/* High-fidelity artwork image with interactive Framer Motion hover scale-up effect */}
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.06 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 160,
            damping: 24
          }}
          style={{ transform: 'translateZ(0px)' }}
          referrerPolicy="no-referrer"
        />

        {/* Dynamic gloss / holographic glare overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
          style={{
            background: glareBackground
          }}
        />

        {/* Playback / Pause Action Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[6px] transition-all duration-500",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          style={{ transform: 'translateZ(30px)' }}
        >
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            className="w-20 h-20 rounded-full bg-[#00B4D8] text-white flex items-center justify-center shadow-[0_0_40px_rgba(0,180,216,0.6)] transition-all"
          >
            {isActive && isPlaying ? (
              <Pause className="h-8 w-8 fill-current animate-pulse" />
            ) : (
              <Play className="h-8 w-8 fill-current ml-1" />
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
