import React, { useMemo } from 'react';
import { History, Play, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { HistoryEvent } from '../types';

interface ListeningHistoryProps {
  history: HistoryEvent[];
  onPlay: (event: any) => void;
  onClearHistory: () => void;
}

export const ListeningHistory: React.FC<ListeningHistoryProps> = ({
  history,
  onPlay,
  onClearHistory
}) => {
  // Group history items
  const groupedHistory = useMemo(() => {
    const today: HistoryEvent[] = [];
    const yesterday: HistoryEvent[] = [];
    const thisWeek: HistoryEvent[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 1000 * 60 * 60 * 24;
    const startOfThisWeek = startOfToday - 1000 * 60 * 60 * 24 * 7;

    history.forEach((item) => {
      const playTime = new Date(item.playedAt).getTime();
      if (playTime >= startOfToday) {
        today.push(item);
      } else if (playTime >= startOfYesterday) {
        yesterday.push(item);
      } else if (playTime >= startOfThisWeek) {
        thisWeek.push(item);
      }
    });

    return { today, yesterday, thisWeek };
  }, [history]);

  const renderHistoryList = (events: HistoryEvent[]) => {
    return (
      <div className="space-y-1.5">
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.005 }}
            className="flex items-center gap-3 p-2 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:bg-black/[0.01] border border-transparent hover:border-black/5 dark:hover:border-white/5 rounded-[10px] group transition-all"
          >
            <div className="relative w-10 h-10 rounded-[10px] overflow-hidden bg-slate-800 shrink-0">
              <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                onClick={() => onPlay(event)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 text-white fill-current" />
              </button>
            </div>

            <div className="flex-1 min-w-0" onClick={() => onPlay(event)}>
              <h5 className="text-xs font-bold text-foreground truncate cursor-pointer">{event.title}</h5>
              <p className="text-[10px] text-muted-foreground truncate">{event.artist}</p>
            </div>

            <span className="text-[9px] font-mono font-bold text-muted-foreground shrink-0 bg-white/5 px-2 py-0.5 rounded-md">
              {new Date(event.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <History className="w-5 h-5 text-purple-500" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Listening History Timeline</h3>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-[10px] bg-black/[0.01] dark:bg-white/[0.01]">
          <History className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h4 className="text-xs font-bold text-foreground">Listening History is Empty</h4>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-1">
            Wandered soundwaves will map here as you stream and explore TonJam music.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today Group */}
          {groupedHistory.today.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
                Today
              </span>
              {renderHistoryList(groupedHistory.today)}
            </div>
          )}

          {/* Yesterday Group */}
          {groupedHistory.yesterday.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Yesterday
              </span>
              {renderHistoryList(groupedHistory.yesterday)}
            </div>
          )}

          {/* This Week Group */}
          {groupedHistory.thisWeek.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Earlier This Week
              </span>
              {renderHistoryList(groupedHistory.thisWeek)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
