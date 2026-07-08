import React from 'react';
import { Play, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryTrack } from '../types';

interface ContinueListeningProps {
  tracks: LibraryTrack[];
  onPlay: (track: LibraryTrack) => void;
}

export const ContinueListening: React.FC<ContinueListeningProps> = ({ tracks, onPlay }) => {
  // Generate mock progresses for continue listening demo
  const getMockProgress = (id: string) => {
    const hashes = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 20 + (hashes % 60); // range 20% to 80%
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Disc className="w-4 h-4 text-[#0052FF] animate-spin-slow" />
          Continue Listening
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono font-medium">Auto-saved state</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
        {tracks.slice(0, 4).map((track) => {
          const progress = getMockProgress(track.id);
          return (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onPlay(track)}
              className="flex-shrink-0 w-64 snap-start border border-black/5 dark:border-white/5 bg-white/[0.02] dark:bg-white/[0.02] hover:bg-white/[0.04] p-3 rounded-[10px] flex gap-3 items-center cursor-pointer group transition-colors"
            >
              <div className="relative w-14 h-14 shrink-0 rounded-[10px] overflow-hidden">
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-5 h-5 text-white fill-current" />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0052FF] h-full rounded-full" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-muted-foreground font-mono font-bold uppercase">
                    <span>{progress}% listened</span>
                    <span>Resume</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
