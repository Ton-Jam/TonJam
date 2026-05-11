import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem as ShadcnCarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

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
  onCtaClick?: (item: CarouselItem) => void;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({ items, interval = 4000, onCtaClick }) => {
  const plugin = React.useRef(
    Autoplay({ delay: interval, stopOnInteraction: true })
  );

  return (
    <div className="group relative w-full mb-8">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, idx) => (
            <ShadcnCarouselItem key={item.id || `carousel-item-${idx}`} className="pl-2 md:pl-4">
              <Link to={item.link} className="block relative w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[4/1] rounded-2xl overflow-hidden group/item">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-1000 ease-in-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full shadow-xl">
                    FEATURED.RELAY
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none font-display">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-[0.2em]">{item.subtitle}</p>
                  </div>
                  {onCtaClick && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCtaClick(item);
                      }}
                      className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20 shadow-2xl active:scale-95 group/btn"
                    >
                      {item.cta} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </Link>
            </ShadcnCarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute -bottom-12 right-12 flex gap-2">
          <CarouselPrevious className="static translate-x-0 translate-y-0 h-10 w-10 bg-background border-border hover:bg-secondary transition-all" />
          <CarouselNext className="static translate-x-0 translate-y-0 h-10 w-10 bg-background border-border hover:bg-secondary transition-all" />
        </div>
      </Carousel>
    </div>
  );
};

export default AutoCarousel;
