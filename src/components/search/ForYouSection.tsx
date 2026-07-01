import React from 'react';
import { Sparkles, Play, Flame, Heart, Radio, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface ForYouSectionProps {
  recommendedTracks: Track[];
  onPlayTrack: (track: Track) => void;
  listeningStreak: number;
  favoriteGenre: string;
}

export const ForYouSection: React.FC<ForYouSectionProps> = ({
  recommendedTracks,
  onPlayTrack,
  listeningStreak = 4,
  favoriteGenre = 'Electronic'
}) => {
  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sync Summary Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-gradient-to-br from-[#0c133a]/60 to-[#070a24]/80 border border-white/5 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">Neural Sync</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-bold uppercase tracking-wide">
              Frequencies aligned to your favorite wave, <span className="text-[#0052FF]">{favoriteGenre}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Updates hourly based on listen telemetry</span>
          </div>
        </motion.div>

        {/* Streak Stats Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-gradient-to-br from-[#0c133a]/60 to-[#070a24]/80 border border-white/5 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest">Streak Level</span>
            </div>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wide">
              You are on a <span className="text-orange-400">{listeningStreak}-day</span> listening loop! Keep it going.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Level 12 Collector Rank</span>
          </div>
        </motion.div>
      </div>

      {/* Recommended Items Grid */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <span>Personalized Neural Stream</span>
        </h3>

        {recommendedTracks.length === 0 ? (
          <div className="p-8 text-center bg-[#07102e]/40 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading your wave recommendations...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedTracks.map((track) => (
              <motion.div
                key={`foryou-track-${track.id}`}
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => onPlayTrack(track)}
                className="p-4 rounded-xl bg-[#090f2d] border border-white/5 flex items-center gap-4 cursor-pointer transition-all duration-200 group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={track.coverUrl || getPlaceholderImage(track.title)}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(track.title); }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[7px] bg-[#0052FF]/10 text-[#0052FF] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      {track.recommendationReason || 'AI Suggested'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                </div>

                <div className="flex items-center text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
                  <span>{(track.likes || 0).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
