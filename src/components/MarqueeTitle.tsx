import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const MarqueeTitle = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldMarquee(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  if (!shouldMarquee) {
    return (
      <div className={cn("truncate", className)} ref={containerRef}>
        <span ref={textRef}>{text}</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)} ref={containerRef}>
      <motion.div
        className="whitespace-nowrap inline-block"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "linear"
        }}
      >
        <span ref={textRef} className="inline-block px-4">{text}</span>
        <span className="inline-block px-4">{text}</span>
      </motion.div>
    </div>
  );
};
