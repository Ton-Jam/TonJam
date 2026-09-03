import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_TESTING_TRACKS, MockTrack } from '@/data/mockTracks';
import { Track } from '@/types';
import { GENRES } from '@/constants';

interface LibraryContextType {
  testingTracks: MockTrack[];
  injectTestingTracks: () => { success: boolean; count: number; message: string };
  clearTestingTracks: () => { success: boolean; message: string };
  isTestingTracksInjected: boolean;
  recentlyPlayed: Track[];
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableGenres: string[];
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTestingTracksInjected, setIsTestingTracksInjected] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_recently_played');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    genreSet.add('All');
    GENRES.forEach(g => genreSet.add(g.name));
    return Array.from(genreSet);
  }, []);

  // Check if testing tracks are already present in localStorage on mount
  useEffect(() => {
    const checkInjectionStatus = () => {
      const localTracksStr = localStorage.getItem('tonjam_library_tracks');
      if (localTracksStr) {
        try {
          const currentTracks = JSON.parse(localTracksStr);
          const hasAll = MOCK_TESTING_TRACKS.every(mt => 
            currentTracks.some((t: any) => t.id === mt.id)
          );
          setIsTestingTracksInjected(hasAll);
        } catch (e) {
          setIsTestingTracksInjected(false);
        }
      }
    };

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('tonjam_recently_played');
        if (saved) {
          setRecentlyPlayed(JSON.parse(saved));
        }
      } catch (e) {}
      checkInjectionStatus();
    };

    checkInjectionStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tonjam_library_updated', handleStorageChange);
    window.addEventListener('tonjam_audio_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tonjam_library_updated', handleStorageChange);
      window.removeEventListener('tonjam_audio_updated', handleStorageChange);
    };
  }, []);

  const injectTestingTracks = () => {
    const localTracksStr = localStorage.getItem('tonjam_library_tracks') || '[]';
    try {
      const currentTracks = JSON.parse(localTracksStr);
      let addedCount = 0;

      const updatedTracks = [...currentTracks];
      MOCK_TESTING_TRACKS.forEach(mock => {
        const exists = updatedTracks.some((t: any) => t.id === mock.id);
        if (!exists) {
          // Map mock track fields to the LibraryTrack expected format
          updatedTracks.unshift({
            id: mock.id,
            title: mock.title,
            artist: mock.artist,
            artistId: 'art-mock-testing',
            album: mock.album || 'Testing Album',
            coverUrl: mock.coverArtUrl, // both variants
            duration: mock.duration,
            plays: 42,
            isLiked: true,
            isDownloaded: true, // make them immediately offline available for testing
            isOfflineAvailable: true,
            downloadSize: '4.8 MB',
            downloadQuality: 'Lossless'
          });
          addedCount++;
        }
      });

      localStorage.setItem('tonjam_library_tracks', JSON.stringify(updatedTracks));
      setIsTestingTracksInjected(true);
      
      // Dispatch custom events to notify other contexts or hooks
      window.dispatchEvent(new Event('tonjam_library_updated'));
      window.dispatchEvent(new Event('storage'));

      return {
        success: true,
        count: addedCount,
        message: addedCount > 0 
          ? `Successfully injected ${addedCount} testing tracks into local state.`
          : 'Testing tracks are already loaded in state.'
      };
    } catch (err) {
      console.error('Failed to inject testing tracks:', err);
      return {
        success: false,
        count: 0,
        message: 'Could not write tracks to application state.'
      };
    }
  };

  const clearTestingTracks = () => {
    const localTracksStr = localStorage.getItem('tonjam_library_tracks');
    if (!localTracksStr) return { success: true, message: 'Library is already clear.' };

    try {
      const currentTracks = JSON.parse(localTracksStr);
      const mockIds = MOCK_TESTING_TRACKS.map(m => m.id);
      const filtered = currentTracks.filter((t: any) => !mockIds.includes(t.id));

      localStorage.setItem('tonjam_library_tracks', JSON.stringify(filtered));
      setIsTestingTracksInjected(false);

      // Dispatch synchronization events
      window.dispatchEvent(new Event('tonjam_library_updated'));
      window.dispatchEvent(new Event('storage'));

      return {
        success: true,
        message: 'Successfully purged testing tracks from local state.'
      };
    } catch (err) {
      console.error('Failed to clear testing tracks:', err);
      return {
        success: false,
        message: 'Purge operation failed.'
      };
    }
  };

  return (
    <LibraryContext.Provider value={{
      testingTracks: MOCK_TESTING_TRACKS,
      injectTestingTracks,
      clearTestingTracks,
      isTestingTracksInjected,
      recentlyPlayed,
      selectedGenre,
      setSelectedGenre,
      availableGenres
    }}>
      {children}
    </LibraryContext.Provider>
  );
};
