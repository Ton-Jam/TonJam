import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  ...props
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        rootMargin: '200px', // Preload images 200px before they enter the viewport
        threshold: 0.01
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden ${placeholderClassName}`}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#060c1f] dark:bg-[#060c1f] animate-pulse flex items-center justify-center z-10"
          >
            <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {isIntersecting && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            filter: isLoaded ? 'blur(0px)' : 'blur(10px)' 
          }}
          transition={{ duration: 0.4 }}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover select-none transition-transform duration-300 ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
