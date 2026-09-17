import React from 'react';
import { Play, MoreVertical, Heart, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryTrack } from '../types';
import { useAudio } from '@/contexts/AudioContext';

interface LikedSongsProps {
  tracks: LibraryTrack[];
  onPlay: (track: LibraryTrack) => void;
  onToggleLike?: (id: string) => void;
  onToggleDownload?: (id: string) => void;
}

export const LikedSongs: React.FC<LikedSongsProps> = ({ 
  tracks, 
  onPlay
}) => {
  const { setOptionsTrack } = useAudio();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-full">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="section-title">Liked Songs</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold tracking-wider">{tracks.length} tracks saved</p>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-[3px] bg-black/[0.01] dark:bg-white/[0.01]">
          <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h4 className="text-xs font-bold text-foreground">No Liked Songs</h4>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-1">Tap the heart icon on any track while streaming to collect them here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3.5 p-2 hover:bg-white/[0.04] rounded-[3px] transition-all group cursor-pointer select-none"
              onClick={() => onPlay(track)}
            >
              <div className="relative w-12 h-12 shrink-0 rounded-[3px] overflow-hidden bg-neutral-900 border border-white/12">
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-medium leading-tight text-white/95 truncate">{track.title}</h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOptionsTrack(track as any);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
