// components/AudioController.tsx
import { useEffect, useRef } from "react";
import { usePlayer } from "../context/GlobalPlayerContext";

const AudioController = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  return <audio ref={audioRef} hidden />;
};

export default AudioController;
