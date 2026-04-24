import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/types';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  progress: number;
  isFullPlayerOpen: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
  
  // Actions
  setCurrentTrack: (track: Track | null | ((prev: Track | null) => Track | null)) => void;
  setIsPlaying: (isPlaying: boolean | ((prev: boolean) => boolean)) => void;
  setQueue: (queue: Track[] | ((prev: Track[]) => Track[])) => void;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  setIsFullPlayerOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  setIsShuffle: (isShuffle: boolean | ((prev: boolean) => boolean)) => void;
  setRepeatMode: (mode: RepeatMode | ((prev: RepeatMode) => RepeatMode)) => void;
  setVolume: (volume: number | ((prev: number) => number)) => void;
  setIsMuted: (isMuted: boolean | ((prev: boolean) => boolean)) => void;
  
  // Complex Actions
  addToQueue: (track: Track) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      progress: 0,
      isFullPlayerOpen: false,
      isShuffle: false,
      repeatMode: 'off',
      volume: 1,
      isMuted: false,

      setCurrentTrack: (track) => set((state) => ({ currentTrack: typeof track === 'function' ? track(state.currentTrack) : track })),
      setIsPlaying: (isPlaying) => set((state) => ({ isPlaying: typeof isPlaying === 'function' ? isPlaying(state.isPlaying) : isPlaying })),
      setQueue: (queue) => set((state) => ({ queue: typeof queue === 'function' ? queue(state.queue) : queue })),
      setProgress: (progress) => set((state) => ({ progress: typeof progress === 'function' ? progress(state.progress) : progress })),
      setIsFullPlayerOpen: (isOpen) => set((state) => ({ isFullPlayerOpen: typeof isOpen === 'function' ? isOpen(state.isFullPlayerOpen) : isOpen })),
      setIsShuffle: (isShuffle) => set((state) => ({ isShuffle: typeof isShuffle === 'function' ? isShuffle(state.isShuffle) : isShuffle })),
      setRepeatMode: (mode) => set((state) => ({ repeatMode: typeof mode === 'function' ? mode(state.repeatMode) : mode })),
      setVolume: (volume) => set((state) => ({ volume: typeof volume === 'function' ? volume(state.volume) : volume })),
      setIsMuted: (isMuted) => set((state) => ({ isMuted: typeof isMuted === 'function' ? isMuted(state.isMuted) : isMuted })),

      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      nextTrack: () => {
        const { currentTrack, queue, isShuffle, repeatMode } = get();
        if (!currentTrack || queue.length === 0) return;
        
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        let nextIndex = currentIndex + 1;
        
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }
        
        set({ currentTrack: queue[nextIndex], progress: 0 });
      },
      prevTrack: () => {
        const { currentTrack, queue, progress } = get();
        if (!currentTrack || queue.length === 0) return;
        
        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        let prevIndex = currentIndex - 1;
        
        if (prevIndex < 0) {
          prevIndex = queue.length - 1;
        }
        
        set({ currentTrack: queue[prevIndex], progress: 0 });
      }
    }),
    {
      name: 'tonjam-audio-storage',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        volume: state.volume,
        isMuted: state.isMuted
      })
    }
  )
);
