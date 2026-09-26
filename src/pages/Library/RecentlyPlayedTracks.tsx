import React, { useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useLibraryData } from './hooks/useLibraryData';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { Play, Shuffle } from 'lucide-react';
import { Track } from '@/types';
import { SpotifyTrackRow } from './components/SpotifyTrackRow';

export const RecentlyPlayedTracks: React.FC = () => {
  const { 
    setHeaderTitle, recentlyPlayed, playAll, isShuffle, 
    toggleShuffle, allTracks 
  } = useAudio();
  const data = useLibraryData();

  useEffect(() => {
    setHeaderTitle('Recently Played');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  // Combine recentlyPlayed from AudioContext and history events from LibraryData
  const activeHistoryTracks: Track[] = useMemo(() => {
    if (recentlyPlayed && recentlyPlayed.length > 0) {
      return recentlyPlayed;
    }

    // Fallback to library data history
    if (data.history && data.history.length > 0) {
      return data.history.map((h) => {
        const found = allTracks?.find((t) => t.id === h.trackId);
        if (found) return found;
        return {
          id: h.trackId,
          songId: h.trackId,
          title: h.title,
          artist: h.artist,
          artistId: 'artist-1',
          coverUrl: h.coverUrl,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: h.duration || 180,
          streams: 12000,
          playCount: 12000,
          album: 'Single',
          genre: 'Music',
          isNFT: false,
          createdAt: new Date().toISOString()
        };
      });
    }

    return [];
  }, [recentlyPlayed, data.history, allTracks]);

  const handlePlayAll = () => {
    if (activeHistoryTracks.length > 0) {
      playAll(activeHistoryTracks);
    }
  };

  const handleShufflePlay = () => {
    if (activeHistoryTracks.length > 0) {
      if (!isShuffle) toggleShuffle();
      const shuffled = [...activeHistoryTracks].sort(() => Math.random() - 0.5);
      playAll(shuffled);
    }
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* 1. MINIMAL HEADER */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" ariaLabel="Back to Library" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            Recently Played
          </h1>
        </div>

        {activeHistoryTracks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShufflePlay}
              className={`p-2 rounded-full transition-colors cursor-pointer active:scale-95 ${
                isShuffle ? 'text-[#00B4D8]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Shuffle play recently played tracks"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePlayAll}
              className="w-10 h-10 rounded-full bg-[#0052FF] hover:bg-[#0040D9] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              title="Play All"
              aria-label="Play all recently played tracks"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. COMPACT TRACK LIST OR EMPTY STATE */}
      {activeHistoryTracks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-zinc-400">No recently played tracks</p>
        </div>
      ) : (
        <div className="divide-y-0 space-y-1">
          {activeHistoryTracks.map((track, idx) => (
            <SpotifyTrackRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default RecentlyPlayedTracks;
