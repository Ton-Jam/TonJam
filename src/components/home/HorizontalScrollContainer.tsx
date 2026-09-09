import React from 'react';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = "",
  style = {}
}) => {
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      {...handlers}
      className={`flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 px-4 sm:px-6 lg:px-8 w-full snap-x snap-mandatory overscroll-x-contain select-none ${className}`}
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        touchAction: 'pan-x',
        overscrollBehaviorX: 'contain',
        WebkitOverflowScrolling: 'touch',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default HorizontalScrollContainer;
