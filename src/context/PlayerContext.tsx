import React, { createContext, useContext, useState, useRef } from 'react';

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (url: string) => {
    if (audioRef.current && currentTrackUrl === url) {
      // Toggle
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(url);
      audioRef.current = newAudio;
      newAudio.play();
      setCurrentTrackUrl(url);
      setIsPlaying(true);

      newAudio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  return (
    <AudioPlayerContext.Provider value={{ currentTrackUrl, isPlaying, playTrack }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => useContext(AudioPlayerContext);
