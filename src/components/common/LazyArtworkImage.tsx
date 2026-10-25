import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface LazyArtworkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  placeholderSrc?: string;
  rootMargin?: string;
  fadeIn?: boolean;
  containerClassName?: string;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const LazyArtworkImage = React.forwardRef<HTMLImageElement, LazyArtworkImageProps>(({
  src,
  alt = '',
  fallbackSrc,
  placeholderSrc,
  className,
  containerClassName,
  rootMargin = '250px 150px',
  fadeIn = true,
  onLoad,
  onError,
  ...props
}, forwardedRef) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  const localRef = useRef<HTMLImageElement | null>(null);

  const setRef = useCallback((node: HTMLImageElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    }
  }, [forwardedRef]);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [isInView, src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoaded(true);
    } else if (!hasError && !fallbackSrc) {
      setHasError(true);
      setIsLoaded(true);
    }
    onError?.(e);
  };

  const activeSrc = isInView ? (currentSrc || placeholderSrc || fallbackSrc || TRANSPARENT_PIXEL) : (placeholderSrc || TRANSPARENT_PIXEL);

  return (
    <div className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
      {/* Blur-up placeholder or gradient skeleton */}
      {placeholderSrc && !isLoaded && isInView && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn("absolute inset-0 w-full h-full object-cover filter blur-md scale-110 transition-opacity duration-700 pointer-events-none", className)}
        />
      )}

      {!isLoaded && !placeholderSrc && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/60 to-muted/35 animate-pulse pointer-events-none" />
      )}

      <img
        ref={setRef}
        src={activeSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-all duration-700 ease-out",
          fadeIn && (!isLoaded ? "opacity-0 scale-105 filter blur-sm" : "opacity-100 scale-100 filter blur-0"),
          className
        )}
        {...props}
      />
    </div>
  );
});

LazyArtworkImage.displayName = 'LazyArtworkImage';

export default LazyArtworkImage;
