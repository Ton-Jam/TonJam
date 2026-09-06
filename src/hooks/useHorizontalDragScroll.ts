import React, { useRef } from 'react';

export function useHorizontalDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const scrollRef = useRef<T>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const onPointerDown = (e: React.PointerEvent<T>) => {
    // Only handle primary button / touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (!scrollRef.current) return;
    
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<T>) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // Threshold to distinguish scroll/drag from tap/click
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasMovedRef.current = true;
    }

    // Optional mouse-drag horizontal scrolling
    if (e.pointerType === 'mouse' && Math.abs(dx) > Math.abs(dy)) {
      scrollRef.current.scrollLeft = scrollLeftRef.current - dx;
    }
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    // Reset hasMoved after a short delay so click handlers can check it
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  return {
    scrollRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp,
      onClickCapture,
    },
  };
}
