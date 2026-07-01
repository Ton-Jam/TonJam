import React from 'react';
import { Play, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface RecentlyPlayedSectionProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

export const RecentlyPlayedSection: React.FC<RecentlyPlayedSectionProps> = ({
  tracks,
  onPlayTrack
}) => {
  if (tracks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">History Stream</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Recently Played</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {tracks.slice(0, 10).map((track) => (
          <motion.div
            key={`recently-played-${track.id}`}
            whileHover={{ y: -3 }}
            onClick={() => onPlayTrack(track)}
            className="w-[140px] shrink-0 bg-[#090f2d] hover:bg-[#121A3E]/15 p-3 rounded-xl border border-white/5 cursor-pointer group flex flex-col justify-between transition-all"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-white/5">
              <img
                src={track.coverUrl || getPlaceholderImage(track.title)}
                alt={track.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(track.title); }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <PlayCircle className="w-8 h-8 text-white fill-current" />
              </div>
            </div>

            <div className="mt-2.5 truncate">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                {track.title}
              </h4>
              <p className="text-[9px] text-slate-400 truncate">{track.artist}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
