import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface HorizontalCarouselProps {
  children: React.ReactNode;
  className?: string;
  snapAlign?: 'start' | 'center' | 'end' | 'none';
  gap?: 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6';
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  children,
  className = '',
  snapAlign = 'start',
  gap = 'gap-4',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragScrolling, setIsDragScrolling] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Smooth drag scroll on desktop for premium feel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragScrolling(true);
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragScrolling(false);
  };

  const handleMouseUp = () => {
    setIsDragScrolling(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragScrolling || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const snapClass = snapAlign !== 'none' ? `snap-x snap-mandatory` : '';
  const itemSnapClass = snapAlign === 'start' ? 'snap-start' : snapAlign === 'center' ? 'snap-center' : snapAlign === 'end' ? 'snap-end' : '';

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`
          flex 
          overflow-x-auto 
          scrollbar-none 
          overscroll-x-contain 
          -mx-4 
          px-4 
          pb-4 
          cursor-grab 
          active:cursor-grabbing
          touch-pan-x
          ${snapClass} 
          ${gap} 
          ${className}
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {React.Children.map(children, (child, idx) => {
          if (!child) return null;
          return (
            <div 
              key={idx} 
              className={`flex-shrink-0 ${itemSnapClass} transition-transform duration-300 hover:scale-[1.01]`}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default HorizontalCarousel;
