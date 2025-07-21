// src/context/PlayerContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage: string;
};

type PlayerContextType = {
  currentTrack: Track | null;
  play: (track: Track) => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const play = (track: Track) => setCurrentTrack(track);
  const stop = () => setCurrentTrack(null);

  return (
    <PlayerContext.Provider value={{ currentTrack, play, stop }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
