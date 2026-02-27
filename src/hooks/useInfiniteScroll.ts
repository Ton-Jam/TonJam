import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (callback: () => void) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [handleObserver]);

  return sentinelRef;
};
