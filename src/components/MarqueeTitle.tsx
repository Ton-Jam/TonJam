import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeTitleProps {
  text: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  speed?: number;
}

export const MarqueeTitle: React.FC<MarqueeTitleProps> = ({
  text,
  className = "",
  containerClassName = "",
  id,
  speed = 35,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    const updateOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.offsetWidth || measureRef.current.scrollWidth;
        const overflowing = textWidth > containerWidth + 2;
        setIsOverflowing(overflowing);
        if (overflowing) {
          const totalDistance = textWidth + 32;
          const calculatedDuration = Math.max(6, Math.min(30, totalDistance / speed));
          setDuration(calculatedDuration);
        }
      }
    };

    updateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      updateOverflow();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateOverflow);

    if (document.fonts) {
      document.fonts.ready.then(updateOverflow).catch(() => {});
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [text, speed]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={cn("overflow-hidden relative whitespace-nowrap", containerClassName)}
      style={{
        maskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)"
          : "none",
        WebkitMaskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)"
          : "none",
      }}
    >
      {/* Invisible measurement element to strictly calculate natural unpadded text width */}
      <span
        ref={measureRef}
        className={cn("invisible absolute top-0 left-0 whitespace-nowrap pointer-events-none -z-50 select-none opacity-0", className)}
        aria-hidden="true"
      >
        {text}
      </span>

      {isOverflowing ? (
        <div
          className="animate-mini-marquee inline-flex"
          style={{ animationDuration: `${duration}s`, willChange: "transform" }}
        >
          <span className={cn("pr-8 inline-block shrink-0", className)}>
            {text}
          </span>
          <span className={cn("pr-8 inline-block shrink-0", className)} aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span className={cn("inline-block truncate max-w-full", className)}>
          {text}
        </span>
      )}
    </div>
  );
};

export default MarqueeTitle;

