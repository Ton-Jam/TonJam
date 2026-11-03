import React, { useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrackCard } from '@/components/music';

export const TrendingTracks: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { allTracks } = useAudio();

  const topTrendingNFTs = useMemo(() => {
    return (allTracks || [])
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
        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-sm flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Top NFTs
        </span>
      </div>
      
      <div className="rounded-2xl bg-[#0A1628]/80 p-2 space-y-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <AnimatePresence>
          {topTrendingNFTs.map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <TrackCard
                track={track}
                variant="compact"
                index={idx}
                showVerifiedBadge={true}
                showDuration={true}
                showGenre={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrendingTracks;
