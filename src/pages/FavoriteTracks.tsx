import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Heart, Play, Shuffle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MOCK_TRACKS } from '@/constants';
import { PageLayout } from '@/components/layout/PageLayout';
import { BackButton } from '@/components/BackButton';
import { SpotifyTrackRow } from './Library/components/SpotifyTrackRow';

const FavoriteTracks: React.FC = () => {
  const { likedTrackIds, playTrack, setHeaderTitle, toggleLikeTrack } = useAudio();
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
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* Header with Back, Title, Subtitle, and Play Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton 
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
            ariaLabel="Back to Library" 
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              Favorite Tracks
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {likedTracks.length} tracks saved in your favorites
            </p>
          </div>
        </div>

        {likedTracks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2.5 rounded-full transition-colors cursor-pointer active:scale-95 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              title="Shuffle"
              aria-label="Shuffle play"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-transform shadow-md"
              title="Play All"
              aria-label="Play all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input 
          type="text"
          placeholder="Search in favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all"
        />
      </div>

      {/* Tracks List */}
      {filteredLikedTracks.length === 0 ? (
        <div className="py-20 text-center space-y-3 p-6 rounded-2xl bg-white/[0.02]">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto text-zinc-400">
            <Heart className="w-6 h-6 animate-pulse text-red-400 fill-red-400/20" />
          </div>
          <h3 className="text-base font-bold text-white">No Liked Tracks Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery ? `No saved tracks match "${searchQuery}"` : "Heart your favorite tracks while listening to save them here for quick access."}
          </p>
          <Button
            onClick={() => navigate('/discover')}
            className="rounded-full px-6 h-9 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer border-none mt-2"
          >
            Explore Music
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredLikedTracks.map((track, idx) => (
            <SpotifyTrackRow
              key={track.id}
              track={track as any}
              index={idx}
              subtitleExtra={track.genre || 'Favorite'}
              rightExtra={
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLikeTrack(track.id);
                  }}
                  className="p-2 rounded-lg text-red-500 hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer"
                  aria-label="Unlike track"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              }
              onRemove={() => toggleLikeTrack(track.id)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default FavoriteTracks;
