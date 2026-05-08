import React from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Ticket } from 'lucide-react';
import { ArtistEvent } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface EventCardProps {
  event: ArtistEvent;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
        className
      )}
    >
      {/* 2px Blue Gradient Boundary (Request) */}
      <div className="absolute inset-0 p-[2px] rounded-[32px] bg-gradient-to-br from-blue-500/50 via-transparent to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
      
      <div className="relative z-10 bg-card/90 m-[2px] rounded-[30px] overflow-hidden h-full flex flex-col">
        {/* Event Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img 
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/400`} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
          
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-2xl flex flex-col items-center shadow-xl backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-widest">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-xl font-black italic tracking-tighter leading-none">{eventDate.getDate()}</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
             <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest">
              {event.status || 'Upcoming'}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter italic mb-4 group-hover:text-blue-400 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/20 transition-colors">
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Venue</p>
                <p className="text-xs font-bold text-white uppercase italic">{event.venue}, {event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/20 transition-colors">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Schedule</p>
                <p className="text-xs font-bold text-white uppercase italic">{formattedDate} @ {event.time}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3">
            {event.ticketUrl ? (
              <a 
                href={event.ticketUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                <Ticket className="w-4 h-4" />
                Secure Passes
              </a>
            ) : (
              <button 
                disabled
                className="flex-1 py-4 bg-white/5 text-white/30 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-not-allowed border border-white/5"
              >
                Tickets Coming Soon
              </button>
            )}
            
            <button className="p-4 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 rounded-2xl transition-all active:scale-90">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
