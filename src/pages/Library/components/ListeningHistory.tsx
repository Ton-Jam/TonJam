import React, { useMemo } from 'react';
import { History, Play, Trash2, Calendar } from 'lucide-react';
import { HistoryEvent } from '../types';

interface ListeningHistoryProps {
  history: HistoryEvent[];
  onPlay: (event: any) => void;
  onClearHistory: () => void;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return 'Recent';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatEventTime = (playedAt?: string, duration?: number) => {
  if (playedAt) {
    const parsed = new Date(playedAt);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  return formatDuration(duration);
};

export const ListeningHistory: React.FC<ListeningHistoryProps> = ({
  history,
  onPlay,
  onClearHistory
}) => {
  const groupedHistory = useMemo(() => {
    const today: HistoryEvent[] = [];
    const yesterday: HistoryEvent[] = [];
    const thisWeek: HistoryEvent[] = [];
    const older: HistoryEvent[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 1000 * 60 * 60 * 24;
    const startOfThisWeek = startOfToday - 1000 * 60 * 60 * 24 * 7;

    history.forEach((item) => {
      const playTime = item.playedAt ? new Date(item.playedAt).getTime() : 0;
      if (!playTime || isNaN(playTime)) {
        today.push(item);
      } else if (playTime >= startOfToday) {
        today.push(item);
      } else if (playTime >= startOfYesterday) {
        yesterday.push(item);
      } else if (playTime >= startOfThisWeek) {
        thisWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, thisWeek, older };
  }, [history]);

  const renderHistoryList = (events: HistoryEvent[]) => {
    return (
      <div className="space-y-1.5">
        {events.map((event) => (
          <button
            type="button"
            key={event.id}
            onClick={() => onPlay(event)}
            className="w-full flex items-center gap-3 p-2.5 bg-[var(--tj-color-surface-elevated,#111C30)]/60 hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] group transition-colors cursor-pointer text-left border-0"
          >
            <div className="relative w-10 h-10 rounded-[var(--tj-radius-md,8px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0">
              <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
                {event.title}
              </h5>
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                {event.artist}
              </p>
            </div>

            <span className="text-[11px] font-mono font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0 bg-white/5 px-2 py-0.5 rounded-[var(--tj-radius-sm,6px)] tabular-nums">
              {formatEventTime(event.playedAt, event.duration)}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h2 className="section-title">Listening History</h2>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="min-h-[36px] px-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-[var(--tj-radius-md,8px)] flex items-center gap-1.5 cursor-pointer transition-colors border-0 bg-transparent"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)]/60">
          <History className="w-7 h-7 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-70" />
          <h4 className="text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)]">
            Listening History is Empty
          </h4>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] max-w-xs mx-auto mt-1">
            Tracks you play on TonJam will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedHistory.today.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                Recent
              </span>
              {renderHistoryList(groupedHistory.today)}
            </div>
          )}

          {groupedHistory.yesterday.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Yesterday
              </span>
              {renderHistoryList(groupedHistory.yesterday)}
            </div>
          )}

          {groupedHistory.thisWeek.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Earlier This Week
              </span>
              {renderHistoryList(groupedHistory.thisWeek)}
            </div>
          )}

          {groupedHistory.older.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--tj-color-text-muted,#7F91AA)]" />
                Older
              </span>
              {renderHistoryList(groupedHistory.older)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
