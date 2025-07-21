import React, { createContext, useContext, useState } from "react";
import { supabase } from "../App";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [error, setError] = useState(null);

  const playTrack = async (filePath) => {
    try {
      const { data } = supabase.storage.from("audio").getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error("Invalid track URL");
      setCurrentTrack(data.publicUrl);
      setError(null);
    } catch (err) {
      setError(`Playback error: ${err.message}`);
    }
  };

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, playTrack, error }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
