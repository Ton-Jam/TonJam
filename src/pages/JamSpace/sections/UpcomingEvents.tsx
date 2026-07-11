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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            className="bg-[#0c133a] border border-white/5 rounded-[12px] p-4 flex gap-4 items-center justify-between"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex gap-4 items-center min-w-0">
              <div className="relative shrink-0">
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="w-16 h-16 object-cover rounded-[10px] bg-slate-950"
                />
                <div className="absolute top-0 right-0 p-1">
                  <div className="bg-blue-600 w-2 h-2 rounded-full shadow-[0_0_8px_rgb(37,99,235)]" />
                </div>
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full border border-pink-400/20">
                    {ev.type}
                  </span>
                </div>
                <h4 className="text-[13px] font-black text-white tracking-tight truncate uppercase leading-tight">
                  {ev.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[100px]">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {ev.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => onToggleEvent(ev.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all ${
                  ev.interested
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${ev.interested ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{ev.interestedCount.toLocaleString()} </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
