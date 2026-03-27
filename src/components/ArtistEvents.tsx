import React from 'react';
import { Calendar, MapPin, Ticket, Clock } from 'lucide-react';
import { Event } from '@/types';

interface ArtistEventsProps {
  events: Event[];
}

const ArtistEvents: React.FC<ArtistEventsProps> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <section className="bg-card p-6 rounded-[10px] border border-blue-500/20">
      <div className="flex items-center gap-4 mb-6">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-tighter">Upcoming Events</h3>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-[10px] hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-center bg-background p-2 rounded-[8px] min-w-[60px]">
                <div className="text-[10px] font-bold text-blue-500 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="text-lg font-bold text-foreground">{new Date(event.date).getDate()}</div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.venue}, {event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
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
                className="px-4 py-2 bg-blue-600 text-foreground rounded-[8px] text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
              >
                <Ticket className="h-3 w-3" /> Get Tickets
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ArtistEvents;
