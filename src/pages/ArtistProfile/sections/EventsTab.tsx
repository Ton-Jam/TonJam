import * as React from "react";
import { ArtistEvent } from "../types";
import { Calendar, MapPin, ExternalLink, Ticket, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventsTabProps {
  events: ArtistEvent[];
}

export const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
  const [rsvpState, setRsvpState] = React.useState<Record<string, boolean>>({});

  const handleRSVP = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRsvpState(prev => {
      const current = !prev[id];
      toast(current ? "Successfully RSVP'd for this event! Check notifications." : "RSVP cancelled.");
      return { ...prev, [id]: current };
    });
  };

  const handleBuyTickets = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Opening tickets gateway for: ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="events-tab-root">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold tracking-tight text-white">Event Itinerary</h3>
        <p className="text-xs text-muted-foreground">Digital drops, live AMAs, concerts, and metaverse stream schedules.</p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-neutral-900/20 border border-neutral-900 rounded-[10px] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Event Category Header */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px]",
                    event.type === "nft-drop" 
                      ? "bg-purple-500/10 text-purple-400" 
                      : event.type === "concert" 
                        ? "bg-amber-500/10 text-amber-400" 
                        : "bg-cyan-500/10 text-cyan-400"
                  )}>
                    {event.type.replace('-', ' ')}
                  </span>
                  
                  <span className="text-[10px] text-muted-foreground font-semibold font-mono">{event.price}</span>
                </div>

                {/* Info block */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-tight">{event.title}</h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{event.date} • <span className="font-mono text-[10px]">{event.time}</span></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{event.venue} ({event.location})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={(e) => handleRSVP(event.id, e)}
                  className={cn(
                    "flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none",
                    rsvpState[event.id] 
                      ? "bg-emerald-500/10 text-emerald-400 flex items-center justify-center gap-1.5" 
                      : "bg-neutral-900 hover:bg-neutral-800 text-white"
                  )}
                >
                  {rsvpState[event.id] ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> RSVP'd
                    </>
                  ) : "RSVP"}
                </button>

                {event.ticketUrl && (
                  <button 
                    onClick={(e) => handleBuyTickets(event.title, e)}
                    className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center justify-center gap-1"
                  >
                    <Ticket className="w-3.5 h-3.5 text-black" /> Get Entry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <Calendar className="w-8 h-8 text-muted-foreground" />
          <h4 className="text-base font-semibold text-white">No Upcoming Events</h4>
          <p className="text-xs text-muted-foreground max-w-xs">There are currently no active dates scheduled on this artist's roster.</p>
        </div>
      )}
    </div>
  );
};
