import React, { useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useLibraryData } from './hooks/useLibraryData';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { Play, Shuffle } from 'lucide-react';
import { Track } from '@/types';
import { SpotifyTrackRow } from './components/SpotifyTrackRow';

export const DownloadedTracks: React.FC = () => {
  const { setHeaderTitle, playAll, isShuffle, toggleShuffle } = useAudio();
  const data = useLibraryData();

  useEffect(() => {
    setHeaderTitle('Downloaded Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  // Filter downloaded tracks from library data
  const downloadedTracks = useMemo(() => {
    return data.rawTracks.filter((t) => t.isDownloaded);
  }, [data.rawTracks]);

  // Map to core Track type
  const mappedTracks: Track[] = useMemo(() => {
    return downloadedTracks.map((t) => ({
      id: t.id,
      songId: t.id,
      title: t.title,
      artist: t.artist,
      artistId: t.artistId || 'artist-1',
      coverUrl: t.coverUrl,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: t.duration || 210,
      streams: t.plays || 0,
      playCount: t.plays || 0,
      album: t.album || 'Downloaded Compilation',
      genre: 'Music',
      isNFT: false,
      createdAt: new Date().toISOString()
    }));
  }, [downloadedTracks]);

  const handlePlayAll = () => {
    if (mappedTracks.length > 0) {
      playAll(mappedTracks);
    }
  };

  const handleShufflePlay = () => {
    if (mappedTracks.length > 0) {
      if (!isShuffle) toggleShuffle();
      const shuffled = [...mappedTracks].sort(() => Math.random() - 0.5);
      playAll(shuffled);
    }
  };

  const handleRemoveDownload = (trackId: string) => {
    data.toggleDownloadTrack(trackId);
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* 1. MINIMAL HEADER */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" ariaLabel="Back to Library" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            Downloaded Tracks
          </h1>
        </div>

        {mappedTracks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShufflePlay}
              className={`p-2 rounded-full transition-colors cursor-pointer active:scale-95 ${
                isShuffle ? 'text-[#00B4D8]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Shuffle play downloaded tracks"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePlayAll}
              className="w-10 h-10 rounded-full bg-[#0052FF] hover:bg-[#0040D9] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              title="Play All"
              aria-label="Play all downloaded tracks"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. COMPACT TRACK LIST OR EMPTY STATE */}
      {mappedTracks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-zinc-400">No downloaded tracks yet</p>
        </div>
      ) : (
        <div className="divide-y-0 space-y-1">
          {mappedTracks.map((track, idx) => (
            <SpotifyTrackRow
              key={track.id}
              track={track}
              index={idx}
              onRemove={() => handleRemoveDownload(track.id)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default DownloadedTracks;
