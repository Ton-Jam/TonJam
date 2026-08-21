import React, { useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Volume2, TrendingUp, Sparkles, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '@/types';

export const TrendingTracks: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { allTracks, playTrack, currentTrack, isPlaying } = useAudio();

  const topTrendingNFTs = useMemo(() => {
    return allTracks
      .filter((t) => t.isNFT)
      .sort((a, b) => {
        const scoreA = (a.playCount || 0) + (a.streams || 0) + (a.jamScore || 0);
        const scoreB = (b.playCount || 0) + (b.streams || 0) + (b.jamScore || 0);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [allTracks]);

  if (!topTrendingNFTs.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          Trending Tracks
          <TrendingUp className="w-4 h-4 text-[#00B4D8]" />
        </h2>
        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-sm border border-purple-500/20 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Top NFTs
        </span>
      </div>
      
      <div className="rounded-2xl bg-[#0A113A]/50 p-2 space-y-1.5">
        <AnimatePresence>
          {topTrendingNFTs.map((track, idx) => {
             const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
             const streamsCount = track.streams || track.playCount || 0;
             const displayStreams = streamsCount > 1000 ? `${(streamsCount / 1000).toFixed(1)}k` : streamsCount;

             return (
               <motion.div
                 key={track.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => playTrack(track)}
                 className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                   isCurrentlyPlaying ? 'bg-blue-900/40 border border-blue-500/30' : 'hover:bg-[#101A3B]/60 border border-transparent'
                 }`}
               >
                 <div className="flex items-center gap-3.5 min-w-0">
                   <span className="w-5 font-mono font-black text-base text-[#00B4D8]">#{idx + 1}</span>
                   <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
                     <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                     {isCurrentlyPlaying && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="flex items-end justify-center gap-[2px] h-3 px-1">
                           <motion.div animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-[2px] bg-[#00B4D8]" />
                           <motion.div animate={{ height: [6, 3, 6] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-[2px] bg-[#00B4D8]" />
                           <motion.div animate={{ height: [4, 9, 4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-[2px] bg-[#00B4D8]" />
                         </div>
                       </div>
                     )}
                   </div>
                   <div className="min-w-0">
                     <h4 className={`text-xs font-extrabold truncate ${isCurrentlyPlaying ? 'text-[#00B4D8]' : 'text-white'}`}>
                       {track.title}
                     </h4>
                     <p className="text-[10px] text-[#9AA0AE] truncate">{track.artist}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-1 shrink-0 pl-3">
                   <Volume2 className="w-3.5 h-3.5 text-[#2BE08C]" />
                   <span className="text-[10px] font-mono text-[#9AA0AE]">{displayStreams} plays</span>
                 </div>
               </motion.div>
             )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrendingTracks;
