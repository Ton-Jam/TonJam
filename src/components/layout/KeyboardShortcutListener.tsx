import { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';

export const KeyboardShortcutListener = () => {
  const { togglePlay, nextTrack, prevTrack } = useAudio();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          nextTrack();
          break;
        case 'ArrowLeft':
          prevTrack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack]);

  return null;
};
