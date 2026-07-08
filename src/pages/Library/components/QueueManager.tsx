import React from 'react';
import { Play, ListMusic, Trash2, ShieldCheck, Clock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { QueueItem } from '../types';

interface QueueManagerProps {
  queue: QueueItem[];
  onRemoveFromQueue: (id: string) => void;
  onClearQueue: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  onRemoveFromQueue,
  onClearQueue
}) => {
  return (
    <div className="space-y-4">
      {/* Queue Header controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <ListMusic className="w-5 h-5 text-amber-500" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Playing Queue</h3>
        </div>

        {queue.length > 0 && (
          <button
            onClick={onClearQueue}
            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-[10px] bg-black/[0.01] dark:bg-white/[0.01]">
          <ListMusic className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h4 className="text-xs font-bold text-foreground">Play Queue is Empty</h4>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-1">
            Tracks will appear here as you add them to your playlist queue. Start listening now!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current Track marker */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-[#0052FF] uppercase tracking-wider font-mono px-1">Now Playing</span>
            <div className="flex items-center gap-3 p-3 bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-[10px]">
              <div className="relative w-12 h-12 rounded-[10px] overflow-hidden bg-slate-800 shrink-0">
                <img src={queue[0].coverUrl} alt={queue[0].title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-current animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-[#0052FF] truncate">{queue[0].title}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{queue[0].artist}</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0052FF] bg-[#0052FF]/10 px-2.5 py-1 rounded-full uppercase">Active</span>
            </div>
          </div>

          {/* Up Next List */}
          {queue.length > 1 && (
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-1">Up Next</span>
              <div className="space-y-1.5">
                {queue.slice(1).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:bg-black/[0.01] border border-transparent hover:border-black/5 dark:hover:border-white/5 rounded-[10px] group transition-all"
                  >
                    {/* Index */}
                    <span className="text-[10px] font-mono font-bold text-muted-foreground w-4 text-center shrink-0">
                      {index + 1}
                    </span>

                    <img src={item.coverUrl} alt={item.title} className="w-10 h-10 rounded-[10px] object-cover bg-slate-800 shrink-0" referrerPolicy="no-referrer" />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{item.artist}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                        {item.addedBy === 'user' ? 'Added by you' : item.addedBy === 'autopilot' ? 'Autopilot' : 'Recommended'}
                      </span>
                      
                      <button
                        onClick={() => onRemoveFromQueue(item.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove from Queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
