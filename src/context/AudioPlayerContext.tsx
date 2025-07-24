import React, { createContext, useContext, useState } from 'react';

interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTrack: string | null;
  play: (url: string) => void;
  pause: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const play = (url: string) => {
    setCurrentTrack(url);
    setIsPlaying(true);
    // Add audio player logic here
  };

  const pause = () => {
    setIsPlaying(false);
    // Add pause logic here
  };

  return (
    <AudioPlayerContext.Provider value={{ isPlaying, currentTrack, play, pause }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  return context;
};
