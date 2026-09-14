import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDown, Loader2, Check } from 'lucide-react';

interface HomePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 70; // Drag threshold to trigger reload (in px)
const MAX_PULL = 115; // Max displacement with rubber-band resistance
const HOLD_HEIGHT = 52; // Height held while actively reloading

export const HomePullToRefresh: React.FC<HomePullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if current scroll position is at the very top of the window
  const isAtTop = useCallback(() => {
    return (window.scrollY || document.documentElement.scrollTop || 0) <= 2;
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    if (isRefreshing || !isAtTop()) return;
    startYRef.current = clientY;
    startXRef.current = clientX;
    isPullingRef.current = false;
  };

  const handleMove = (clientX: number, clientY: number, e?: TouchEvent | PointerEvent) => {
    if (isRefreshing || !isAtTop()) {
      if (isDragging) {
        setIsDragging(false);
        setPullDistance(0);
        setIsReady(false);
      }
      return;
    }

    const deltaY = clientY - startYRef.current;
    const deltaX = clientX - startXRef.current;

    // Strict gesture isolation: discard horizontal or diagonal swipes (e.g. carousels or tabs)
    if (!isPullingRef.current) {
      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 10 || Math.abs(deltaY) < Math.abs(deltaX) * 1.4) {
        return;
      }
    }

    // Only engage if pulling downwards while at the top
    if (deltaY > 0) {
      isPullingRef.current = true;
      setIsDragging(true);

      // Prevent native browser overscroll navigation when actively pulling down
      if (e && e.cancelable) {
        e.preventDefault();
      }

      // Logarithmic rubber-band damping curve for authentic native elasticity
      const damping = Math.min(MAX_PULL, deltaY * 0.4);
      setPullDistance(damping);

      if (damping >= PULL_THRESHOLD && !isReady) {
        setIsReady(true);
        // Haptic feedback trigger when threshold is reached
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch {
            // Safe fallback if permissions restrict vibration
          }
        }
      } else if (damping < PULL_THRESHOLD && isReady) {
        setIsReady(false);
      }
    } else if (isDragging) {
      setPullDistance(0);
      setIsDragging(false);
      setIsReady(false);
    }
  };

  const handleEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;

    isPullingRef.current = false;
    setIsDragging(false);

    if (isReady) {
      setIsRefreshing(true);
      setPullDistance(HOLD_HEIGHT);

      try {
        // Enforce a minimum display duration of 850ms so user gets clear visual confirmation
        await Promise.all([
          Promise.resolve(onRefresh()),
          new Promise((resolve) => setTimeout(resolve, 850)),
        ]);
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (err) {
        console.error('Failed to refresh home content:', err);
      } finally {
        setIsSuccess(false);
        setIsRefreshing(false);
        setIsReady(false);
        setPullDistance(0);
      }
    } else {
      setIsReady(false);
      setPullDistance(0);
    }
  };

  // Attach non-passive touch listeners for reliable pull-to-refresh prevention of browser overscroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isRefreshing, isReady, isAtTop, onRefresh]);

  const showIndicator = pullDistance > 6 || isRefreshing || isSuccess;
  const progressPercent = Math.min(1, pullDistance / PULL_THRESHOLD);

  return (
    <div
      ref={containerRef}
      className="relative w-full overscroll-y-contain"
    >
      {/* Native-feeling Floating Pull Indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex justify-center transition-opacity duration-200"
        style={{
          opacity: showIndicator ? 1 : 0,
          transform: `translateY(${Math.max(4, pullDistance - 38)}px)`,
        }}
        aria-hidden={!showIndicator}
      >
        <div
          className="flex items-center gap-2 rounded-full bg-zinc-900/95 px-3.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-150"
          style={{
            transform: `scale(${0.8 + progressPercent * 0.2})`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00F0FF] shrink-0" />
          ) : isSuccess ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <ArrowDown
              className="h-3.5 w-3.5 text-zinc-300 shrink-0 transition-transform duration-200"
              style={{
                transform: isReady
                  ? 'rotate(180deg)'
                  : `rotate(${progressPercent * 180}deg)`,
                color: isReady ? '#00F0FF' : '#d4d4d8',
              }}
            />
          )}

          <span className="text-[11px] font-semibold tracking-wider text-zinc-200 uppercase">
            {isRefreshing
              ? 'Refreshing...'
              : isSuccess
              ? 'Refreshed'
              : isReady
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Main Home Content Container with rubber-band downward elasticity */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
};

export default HomePullToRefresh;
