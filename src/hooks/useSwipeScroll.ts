import { useRef, useEffect } from 'react';

/**
 * Hook to provide touch-based swipe interactions, momentum scroll handling,
 * and precise 'flick' detection for horizontal scroll shelves.
 */
export function useSwipeScroll() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let startX = 0;
    let scrollLeft = 0;
    let startTime = 0;
    let isDown = false;

    const handleTouchStart = (e: TouchEvent) => {
      isDown = true;
      startX = e.touches[0].pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      startTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2; // slight multiplier for smooth responsive drag
      el.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDown) return;
      isDown = false;

      const elapsed = Date.now() - startTime;
      const endX = e.changedTouches[0].pageX - el.offsetLeft;
      const distance = endX - startX;

      // Flick detection: if swipe was fast (< 300ms) and distance > 40px, snap to next/prev item
      if (elapsed < 300 && Math.abs(distance) > 40) {
        const cardWidth = el.querySelector('.swipe-scroll-item')?.clientWidth || 160;
        const direction = distance > 0 ? -1 : 1;
        el.scrollBy({
          left: direction * (cardWidth + 16),
          behavior: 'smooth'
        });
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return scrollRef;
}
