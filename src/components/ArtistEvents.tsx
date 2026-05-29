import React from 'react';
import { Calendar, MapPin, Ticket, Clock } from 'lucide-react';
import { ArtistEvent } from '@/types';

interface ArtistEventsProps {
  events: ArtistEvent[];
}

const ArtistEvents: React.FC<ArtistEventsProps> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <section className="bg-card p-6 rounded-[4px] border border-blue-500/20">
      <div className="flex items-center gap-4 mb-6">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-tighter">Upcoming Events</h3>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="group relative overflow-hidden rounded-[4px] bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-blue-500/30">
            {event.bannerImageUrl && (
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={event.bannerImageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
              </div>
            )}
            
            <div className="relative z-10 flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="text-center bg-background/80 backdrop-blur-md p-2 rounded-[4px] min-w-[60px] border border-white/5">
                  <div className="text-[10px] font-bold text-blue-500 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div className="text-lg font-bold text-foreground">{new Date(event.date).getDate()}</div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">{event.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground mt-1">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-blue-500/50" />
                      {event.venue}, {event.location}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3 text-blue-500/50" />
                      {event.time}
                    </div>
                  </div>
                </div>
              </div>
              
              {event.ticketUrl && (
                <a 
                  href={event.ticketUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-500/20 flex items-center gap-2"
                >
                  <Ticket className="h-3 w-3" /> Tickets
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ArtistEvents;
