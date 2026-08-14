import React from 'react';
import { Play, User, BadgeCheck, Headphones } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Track, Artist } from '@/types';
import { getPlaceholderImage, formatNumber } from '@/lib/utils';

interface RecommendedSectionProps {
  recommendedTracks: Track[];
  recommendedArtists: Artist[];
  onPlayTrack: (track: Track) => void;
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  recommendedTracks,
  recommendedArtists,
  onPlayTrack
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Recommended Tracks Sub-column */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest">Recommended Sounds</span>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Recommended Tracks</h3>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:mx-0 sm:px-0">
          {recommendedTracks.slice(0, 6).map((track) => (
            <motion.div
              key={`rec-track-${track.id}`}
              whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              onClick={() => onPlayTrack(track)}
              className="w-[220px] shrink-0 p-3 rounded-[12px] bg-[#0c133a] flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-[8px] overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={track.coverUrl || getPlaceholderImage(track.title)}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(track.title); }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                <div className="truncate pr-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 font-mono text-[9px] font-bold tracking-widest">
                <span className="flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5" />
                  {formatNumber(track.playCount || 0)}
                </span>
                <span className="hidden sm:inline">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended Artists Sub-column */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest">Aligned Creators</span>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Recommended Artists</h3>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:mx-0 sm:px-0">
          {recommendedArtists.slice(0, 6).map((artist) => {
            const imageSrc = artist.avatarUrl || getPlaceholderImage(artist.name);

            return (
              <motion.div
                key={`rec-artist-${artist.uid}`}
                whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="w-[200px] shrink-0 p-3 rounded-[12px] bg-[#0c133a] flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={imageSrc}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = getPlaceholderImage(artist.name); }}
                    />
                  </div>

                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                        {artist.name}
                      </h4>
                      {artist.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#00B4D8] fill-current" />
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                      {artist.genre || 'Independent'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">
                    {(artist.followers || 0).toLocaleString()} FOLLOWERS
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
