import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Heart, Play, Shuffle, MoreVertical, Search, Music, Sparkles, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { MOCK_TRACKS } from '@/constants';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';

const FavoriteTracks: React.FC = () => {
  const { likedTrackIds, playTrack, setHeaderTitle, setOptionsTrack, toggleLikeTrack, currentTrack, isPlaying } = useAudio();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setHeaderTitle('Favorite Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  const likedTracks = useMemo(() => {
    return MOCK_TRACKS.filter(t => likedTrackIds.includes(t.id));
  }, [likedTrackIds]);

  const filteredLikedTracks = useMemo(() => {
    const safeQuery = typeof searchQuery === 'string' ? searchQuery.toLowerCase().trim() : '';
    if (!safeQuery) return likedTracks;
    return likedTracks.filter(t => 
      t.title.toLowerCase().includes(safeQuery) || 
      t.artist.toLowerCase().includes(safeQuery) ||
      (t.genre && t.genre.toLowerCase().includes(safeQuery))
    );
  }, [likedTracks, searchQuery]);

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0] as any);
    }
  };

  const handleShuffle = () => {
    if (likedTracks.length > 0) {
      const shuffled = [...likedTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0] as any);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32 relative select-none w-full max-w-full overflow-x-hidden">
      <PageHeader 
        title="Favorite Tracks" 
        showBack={true} 
        rightContent={
          likedTracks.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePlayAll}
                size="sm"
                className="h-8 px-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white text-[11px] font-bold uppercase tracking-wider rounded-full border-none flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play All
              </Button>
              <Button 
                onClick={handleShuffle}
                size="sm"
                className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-full border-none flex items-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </Button>
            </div>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A1628] p-3 rounded-xl border border-[#22374D]">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input 
              type="text"
              placeholder="Search in favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all"
            />
          </div>
          <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2">
            {filteredLikedTracks.length} of {likedTracks.length} tracks
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-1.5">
          {filteredLikedTracks.length > 0 ? (
            filteredLikedTracks.map((track, i) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={track.id}
                  className={cn(
                    "group flex items-center gap-3.5 p-3 rounded-xl transition-all cursor-pointer select-none",
                    isCurrentPlaying ? "bg-[#00B4D8]/15 border border-[#00B4D8]/30" : "bg-white/[0.03] hover:bg-white/[0.06] border-none"
                  )}
                  onClick={() => playTrack(track as any)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 relative shadow-md">
                    <img 
                      src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      alt={track.title} 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-xs sm:text-sm font-bold truncate tracking-tight", isCurrentPlaying ? "text-[#00B4D8]" : "text-white")}>
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] sm:text-xs text-zinc-400 truncate">{track.artist}</p>
                      {track.artistVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#00B4D8] shrink-0 fill-[#00B4D8]/20" />
                      )}
                    </div>
                  </div>

                  {track.genre && (
                    <span className="hidden md:inline-block text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400">
                      {track.genre}
                    </span>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className="p-2 rounded-lg text-red-500 hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer"
                    aria-label="Unlike track"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsTrack(track as any);
                    }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <div className="py-24 text-center space-y-6 bg-[#0A1628] rounded-2xl p-8 border border-[#22374D]">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto border border-dashed border-white/10">
                <Heart className="h-8 w-8 text-zinc-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tight">No Liked Tracks Found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {searchQuery ? `No saved tracks match "${searchQuery}"` : "Heart your favorite tracks while listening to save them here for quick access."}
                </p>
              </div>
              <Button
                onClick={() => navigate('/discover')}
                className="rounded-full px-6 h-10 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#00B4D8]/20 cursor-pointer border-none"
              >
                Explore Music
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoriteTracks;
