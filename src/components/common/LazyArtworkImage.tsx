import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface LazyArtworkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  rootMargin?: string;
  fadeIn?: boolean;
}

// 1x1 transparent PNG data URL to avoid broken image placeholders while awaiting intersection
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const LazyArtworkImage = React.forwardRef<HTMLImageElement, LazyArtworkImageProps>(({
  src,
  alt = '',
  fallbackSrc,
  className,
  rootMargin = '200px 100px',
  fadeIn = true,
  onLoad,
  onError,
  ...props
}, forwardedRef) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);

  const localRef = useRef<HTMLImageElement | null>(null);

  const setRef = useCallback((node: HTMLImageElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    }
  }, [forwardedRef]);

  // IntersectionObserver to detect when the artwork element approaches the viewport
  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    // Graceful fallback for non-browser or environments lacking IntersectionObserver (e.g. tests)
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

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  // Once in view, set the image source
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
    }
    onError?.(e);
  };

  const activeSrc = isInView ? (currentSrc || fallbackSrc) : TRANSPARENT_PIXEL;

  return (
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
        className,
        fadeIn && (!isLoaded && isInView ? "opacity-0" : "opacity-100 transition-opacity duration-300")
      )}
      {...props}
    />
  );
});

LazyArtworkImage.displayName = 'LazyArtworkImage';

export default LazyArtworkImage;
