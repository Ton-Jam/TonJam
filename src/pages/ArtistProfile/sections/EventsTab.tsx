import * as React from "react";
import { ArtistEvent } from "../types";
import { Calendar, MapPin, Ticket, CheckCircle } from "lucide-react";
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
      toast(current ? "Successfully RSVP'd for this event!" : "RSVP cancelled.");
      return { ...prev, [id]: current };
    });
  };

  const handleBuyTickets = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Opening tickets gateway for: ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="spotify-events-tab">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Live Events & Tours</h3>
        <p className="text-xs text-neutral-400">Concerts, festival appearances, and live streams.</p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-neutral-900/40 hover:bg-neutral-900/70 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Event Category Header */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    event.type === "nft-drop" 
                      ? "bg-purple-500/10 text-purple-400" 
                      : event.type === "concert" 
                        ? "bg-amber-500/10 text-amber-400" 
                        : "bg-[#1DB954]/10 text-[#1DB954]"
                  )}>
                    {event.type.replace('-', ' ')}
                  </span>
                  
                  <span className="text-xs text-neutral-400 font-mono">{event.price}</span>
                </div>

                {/* Info block */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-tight">{event.title}</h4>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{event.date} • <span className="font-mono text-[11px]">{event.time}</span></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
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
                      ? "bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center gap-1.5" 
                      : "bg-neutral-800 hover:bg-neutral-700 text-white"
                  )}
                >
                  {rsvpState[event.id] ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#1DB954]" /> RSVP'd
                    </>
                  ) : "RSVP"}
                </button>

                {event.ticketUrl && (
                  <button 
                    onClick={(e) => handleBuyTickets(event.title, e)}
                    className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center justify-center gap-1"
                  >
                    <Ticket className="w-3.5 h-3.5 text-black" /> Tickets
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl">
          <p className="text-xs">No upcoming events scheduled.</p>
        </div>
      )}
    </div>
  );
};
