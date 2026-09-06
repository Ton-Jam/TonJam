import React from 'react';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  customRef?: React.RefObject<HTMLDivElement | null>;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = '',
  style = {},
  customRef,
}) => {
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  // If customRef is passed, we can merge or use scrollRef
  const mergedRef = (node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (customRef) {
      (customRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div
      ref={mergedRef}
      {...handlers}
      className={`flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory overscroll-x-contain select-none w-full ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorX: 'contain',
        scrollBehavior: 'smooth',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default HorizontalScrollContainer;
