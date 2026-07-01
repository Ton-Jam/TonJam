import React from 'react';
import { Play, PlayCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface ContinueListeningSectionProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

export const ContinueListeningSection: React.FC<ContinueListeningSectionProps> = ({
  tracks,
  onPlayTrack
}) => {
  if (tracks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Resume Synapse</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Continue Listening</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tracks.slice(0, 2).map((track) => (
          <motion.div
            key={`continue-listening-${track.id}`}
            whileHover={{ y: -2 }}
            onClick={() => onPlayTrack(track)}
            className="p-4 rounded-xl bg-gradient-to-r from-[#0c133a]/50 to-[#070a24]/60 border border-white/5 flex items-center gap-4 cursor-pointer group transition-all"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-slate-900">
              <img
                src={track.coverUrl || getPlaceholderImage(track.title)}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(track.title); }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <PlayCircle className="w-8 h-8 text-white fill-current" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[7px] bg-[#0052FF]/10 text-[#0052FF] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                RESUME
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors mt-1">
                {track.title}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
            </div>

            <Clock className="w-5 h-5 text-slate-500 shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
