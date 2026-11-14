import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Track } from '@/types';
import { GENRES } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';

interface LibraryContextType {
  testingTracks: Track[];
  injectTestingTracks: () => { success: boolean; count: number; message: string };
  clearTestingTracks: () => { success: boolean; message: string };
  isTestingTracksInjected: boolean;
  recentlyPlayed: Track[];
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableGenres: string[];
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const FALLBACK_LIBRARY_CONTEXT: LibraryContextType = {
  testingTracks: [],
  injectTestingTracks: () => ({ success: false, count: 0, message: 'Mock testing tracks are disabled.' }),
  clearTestingTracks: () => ({ success: true, message: 'Library is clear.' }),
  isTestingTracksInjected: false,
  recentlyPlayed: [],
  selectedGenre: 'All',
  setSelectedGenre: () => {},
  availableGenres: ['All', 'Pop', 'Electronic', 'Hip Hop', 'Rock', 'Ambient', 'Synthwave', 'Lo-Fi'],
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    return FALLBACK_LIBRARY_CONTEXT;
  }
  return context;
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { recentlyPlayed: audioRecentlyPlayed } = useAudio();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(audioRecentlyPlayed || []);

  useEffect(() => {
    setRecentlyPlayed(audioRecentlyPlayed || []);
  }, [audioRecentlyPlayed]);

  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    genreSet.add('All');
    GENRES.forEach((g) => genreSet.add(g.name));
    return Array.from(genreSet);
  }, []);

  const injectTestingTracks = () => ({
    success: false,
    count: 0,
    message: 'Mock testing tracks are disabled. Library uses live Firestore tracks.',
  });

  const clearTestingTracks = () => {
    try {
      localStorage.removeItem('tonjam_library_tracks');
      localStorage.removeItem('tonjam_library_nfts');
    } catch {
      // Ignore storage errors
    }
    return {
      success: true,
      message: 'Cleared cached library data.',
    };
  };

  return (
    <LibraryContext.Provider
      value={{
        testingTracks: [],
        injectTestingTracks,
        clearTestingTracks,
        isTestingTracksInjected: false,
        recentlyPlayed,
        selectedGenre,
        setSelectedGenre,
        availableGenres,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
