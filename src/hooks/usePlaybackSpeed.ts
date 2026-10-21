import { useState, useEffect, useCallback } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

export const PLAYBACK_SPEEDS = [0.5, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0] as const;
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

const SPEED_STORAGE_KEY = "tonjam_playback_speed";
const SPEED_CHANGE_EVENT = "tonjam:playback-speed-change";

export function usePlaybackSpeed() {
  const { audioElement, currentTrack } = useAudio();
  const [speed, setSpeedState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SPEED_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return 1.0;
  });

  // Apply speed to HTMLAudioElement whenever speed or track changes
  useEffect(() => {
    if (audioElement) {
      try {
        audioElement.playbackRate = speed;
      } catch (err) {
        console.warn("[usePlaybackSpeed] Failed to set playbackRate on audio element:", err);
      }
    }
  }, [speed, audioElement, currentTrack]);

  // Listen for speed changes across different components
  useEffect(() => {
    const handleSpeedEvent = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === "number") {
        setSpeedState(customEvent.detail);
      }
    };

    window.addEventListener(SPEED_CHANGE_EVENT, handleSpeedEvent);
    return () => window.removeEventListener(SPEED_CHANGE_EVENT, handleSpeedEvent);
  }, []);

  const changeSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, newSpeed.toString());
    } catch {}

    if (audioElement) {
      try {
        audioElement.playbackRate = newSpeed;
      } catch (err) {
        console.warn("[usePlaybackSpeed] Error updating audio element playbackRate:", err);
      }
    }

    // Broadcast change
    window.dispatchEvent(new CustomEvent(SPEED_CHANGE_EVENT, { detail: newSpeed }));
    toast.success(`Playback speed: ${newSpeed}x`);
  }, [audioElement]);

  return {
    speed,
    changeSpeed,
    availableSpeeds: PLAYBACK_SPEEDS,
  };
}

export default usePlaybackSpeed;
