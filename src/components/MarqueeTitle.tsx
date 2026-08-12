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
  speed = 0.45,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth + 1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  const duration = Math.max(7, Math.min(30, (text?.length || 1) * speed));

  return (
    <div
      ref={containerRef}
      id={id}
      className={cn("overflow-hidden relative whitespace-nowrap", containerClassName)}
      style={{
        maskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)"
          : "none",
        WebkitMaskImage: isOverflowing
          ? "linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)"
          : "none",
      }}
    >
      {isOverflowing ? (
        <div
          className="animate-mini-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <span ref={textRef} className={cn("pr-8 inline-block", className)}>
            {text}
          </span>
          <span className={cn("pr-8 inline-block", className)}>
            {text}
          </span>
        </div>
      ) : (
        <span ref={textRef} className={cn("inline-block truncate", className)}>
          {text}
        </span>
      )}
    </div>
  );
};

export default MarqueeTitle;

