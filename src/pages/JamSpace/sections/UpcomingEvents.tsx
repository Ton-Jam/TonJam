import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';
import { Event } from '../types';

interface UpcomingEventsProps {
  events: Event[];
  onToggleEvent: (id: string) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  onToggleEvent
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Scheduled Events</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Ecosystem Calendar</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-3 flex gap-3.5 items-center justify-between"
            whileHover={{ y: -1 }}
          >
            <div className="flex gap-3 items-center min-w-0">
              <img
                src={ev.imageUrl}
                alt={ev.title}
                className="w-14 h-14 object-cover rounded-[10px] bg-slate-950 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-mono font-bold uppercase text-pink-400 px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                  {ev.type}
                </span>
                <h4 className="text-xs font-bold text-white tracking-tight truncate">
                  {ev.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {ev.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[9px] font-mono text-slate-500">{ev.interestedCount.toLocaleString()} Interested</span>
              <button
                onClick={() => onToggleEvent(ev.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-colors flex items-center gap-1 ${
                  ev.interested
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${ev.interested ? 'fill-current' : ''}`} />
                <span>{ev.interested ? 'RSVP\'d' : 'RSVP'}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
