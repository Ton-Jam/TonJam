import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  cta: string;
}

interface AutoCarouselProps {
  items: CarouselItem[];
  interval?: number;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({ items, interval = 4000 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        let nextIndex = activeIndex + 1;
        
        if (nextIndex >= items.length) {
          nextIndex = 0;
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
        setActiveIndex(nextIndex);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [activeIndex, items.length, interval]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full overflow-hidden mb-8">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {items.map((item) => (
          <div key={item.id} className="w-full flex-shrink-0 snap-center px-4 lg:px-6">
            <Link to={item.link} className="block relative w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[4/1] rounded-[10px] overflow-hidden group border border-white/5">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              <div className="absolute top-4 left-4 bg-blue-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-[5px] shadow-lg">
                Featured
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-white/70 font-medium">{item.subtitle}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md px-4 py-2 rounded-[5px] text-xs font-bold text-white uppercase tracking-widest group-hover:bg-white/20 transition-colors border border-white/10">
                  {item.cta} <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: idx * scrollRef.current.clientWidth,
                  behavior: 'smooth'
                });
                setActiveIndex(idx);
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoCarousel;
