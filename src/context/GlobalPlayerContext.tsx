import React, { createContext, useContext, useRef, useState } from "react";

type Track = {
  id: number;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlay: (track: Track) => void;
};

const GlobalPlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const useGlobalPlayer = () => {
  const context = useContext(GlobalPlayerContext);
  if (!context) {
    throw new Error("useGlobalPlayer must be used within a GlobalPlayerProvider");
  }
  return context;
};

export const GlobalPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track: Track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.audioUrl);
    } else {
      audioRef.current.pause();
      audioRef.current.src = track.audioUrl;
    }

    audioRef.current.play().then(() => {
      setCurrentTrack(track);
      setIsPlaying(true);
    }).catch((error) => {
      console.error("Failed to play audio:", error);
    });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pauseTrack() : playTrack(track);
    } else {
      playTrack(track);
    }
  };

  return (
    <GlobalPlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, pauseTrack, togglePlay }}>
      {children}
    </GlobalPlayerContext.Provider>
  );
};
