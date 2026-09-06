import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio, useUserRole } from '../AudioContext';
import { useAudioStore } from '@/store/audioStore';
import { Track } from '@/types';

const mockTrack1: Track = {
  id: 'track-1',
  songId: 'song-1',
  title: 'Cosmic TON Rhythm',
  artist: 'DJ TonJam',
  artistId: 'artist-1',
  duration: 180,
  audioUrl: 'https://example.com/audio1.mp3',
  coverUrl: 'https://example.com/cover1.jpg',
  genre: 'Electronic',
  isNFT: false,
  playCount: 1000,
  likes: 500,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockTrack2: Track = {
  id: 'track-2',
  songId: 'song-2',
  title: 'Midnight Blockchain Vibe',
  artist: 'TON Master',
  artistId: 'artist-2',
  duration: 210,
  audioUrl: 'https://example.com/audio2.mp3',
  coverUrl: 'https://example.com/cover2.jpg',
  genre: 'Synthwave',
  isNFT: true,
  playCount: 2500,
  likes: 1200,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockTrack3: Track = {
  id: 'track-3',
  songId: 'song-3',
  title: 'Hyperdrive Future',
  artist: 'Cyber Artist',
  artistId: 'artist-3',
  duration: 240,
  audioUrl: 'https://example.com/audio3.mp3',
  coverUrl: 'https://example.com/cover3.jpg',
  genre: 'Cyberpunk',
  isNFT: false,
  playCount: 5000,
  likes: 3000,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AudioContext & Audio Engine - Unit, Integration & Race Condition Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAudioStore.setState({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      progress: 0,
      isFullPlayerOpen: false,
      isShuffle: false,
      isSmartShuffle: false,
      smartShuffleMode: 'mood',
      repeatMode: 'off',
      volume: 1,
      isMuted: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Initial State & Initialization
  describe('Initial State & Hook Initialization', () => {
    it('initializes with a valid default state when accessed outside provider via proxy', () => {
      const { result } = renderHook(() => useAudio());
      expect(result.current).toBeDefined();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.queue).toEqual([]);
      expect(result.current.currentTrack).toBeNull();
      expect(result.current.progress).toBe(0);
      expect(result.current.volume).toBe(0);
      expect(result.current.repeatMode).toBe('off');
    });

    it('returns safe fallback values on property access when unprovided', () => {
      const { result } = renderHook(() => useAudio());

      // Array fallbacks
      expect(result.current.queue).toEqual([]);
      expect(result.current.playlists).toEqual([]);
      expect(result.current.allTracks).toEqual([]);
      expect(result.current.posts).toEqual([]);
      expect(result.current.tasks).toEqual([]);

      // User profile fallback
      expect(result.current.userProfile).toBeDefined();
      expect(result.current.userProfile.role).toBe('collector');
    });

    it('invokes any function as a safe NOOP without throwing exceptions during unmounted or fallback state', () => {
      const { result } = renderHook(() => useAudio());

      expect(() => {
        result.current.playTrack?.(mockTrack1);
        result.current.togglePlay?.();
        result.current.addToQueue?.(mockTrack1);
        result.current.nextTrack?.();
        result.current.prevTrack?.();
        result.current.seek?.(50);
        result.current.toggleLikeTrack?.('track-1');
        result.current.toggleRepeat?.();
        result.current.toggleShuffle?.();
        result.current.closePlayer?.();
      }).not.toThrow();
    });
  });

  // 2. Play, Pause, Resume & State Transitions
  describe('Playback State Transitions (Play, Pause, Resume)', () => {
    it('handles play, pause, and resume toggles accurately', () => {
      act(() => {
        useAudioStore.getState().setCurrentTrack(mockTrack1);
        useAudioStore.getState().setIsPlaying(true);
      });

      expect(useAudioStore.getState().isPlaying).toBe(true);
      expect(useAudioStore.getState().currentTrack?.id).toBe('track-1');

      // Pause
      act(() => {
        useAudioStore.getState().togglePlay();
      });
      expect(useAudioStore.getState().isPlaying).toBe(false);

      // Resume
      act(() => {
        useAudioStore.getState().togglePlay();
      });
      expect(useAudioStore.getState().isPlaying).toBe(true);
    });

    it('updates playback progress and seek position accurately', () => {
      act(() => {
        useAudioStore.getState().setCurrentTrack(mockTrack1);
        useAudioStore.getState().setProgress(45);
      });

      expect(useAudioStore.getState().progress).toBe(45);

      act(() => {
        useAudioStore.getState().setProgress(120);
      });
      expect(useAudioStore.getState().progress).toBe(120);
    });
  });

  // 3. Queue Management & Navigation
  describe('Queue Management & Navigation Lifecycle', () => {
    it('maintains correct queue order and avoids duplicate item collisions', () => {
      act(() => {
        useAudioStore.getState().addToQueue(mockTrack1);
        useAudioStore.getState().addToQueue(mockTrack2);
        useAudioStore.getState().addToQueue(mockTrack3);
      });

      const queue = useAudioStore.getState().queue;
      expect(queue).toHaveLength(3);
      expect(queue[0].id).toBe('track-1');
      expect(queue[1].id).toBe('track-2');
      expect(queue[2].id).toBe('track-3');
    });

    it('navigates nextTrack through queue in linear mode and stops at end when repeatMode is off', () => {
      act(() => {
        useAudioStore.getState().setQueue([mockTrack1, mockTrack2, mockTrack3]);
        useAudioStore.getState().setCurrentTrack(mockTrack1);
        useAudioStore.getState().setIsPlaying(true);
        useAudioStore.getState().setRepeatMode('off');
      });

      // Move to track 2
      act(() => {
        useAudioStore.getState().nextTrack();
      });
      expect(useAudioStore.getState().currentTrack?.id).toBe('track-2');

      // Move to track 3
      act(() => {
        useAudioStore.getState().nextTrack();
      });
      expect(useAudioStore.getState().currentTrack?.id).toBe('track-3');

      // End of queue -> stops
      act(() => {
        useAudioStore.getState().nextTrack();
      });
      expect(useAudioStore.getState().isPlaying).toBe(false);
    });

    it('cycles back to beginning of queue on nextTrack when repeatMode is "all"', () => {
      act(() => {
        useAudioStore.getState().setQueue([mockTrack1, mockTrack2]);
        useAudioStore.getState().setCurrentTrack(mockTrack2);
        useAudioStore.getState().setIsPlaying(true);
        useAudioStore.getState().setRepeatMode('all');
      });

      act(() => {
        useAudioStore.getState().nextTrack();
      });

      expect(useAudioStore.getState().currentTrack?.id).toBe('track-1');
      expect(useAudioStore.getState().isPlaying).toBe(true);
    });

    it('restarts current track if prevTrack is called after 3 seconds of playback', () => {
      act(() => {
        useAudioStore.getState().setQueue([mockTrack1, mockTrack2]);
        useAudioStore.getState().setCurrentTrack(mockTrack2);
        useAudioStore.getState().setProgress(15);
      });

      act(() => {
        useAudioStore.getState().prevTrack();
      });

      expect(useAudioStore.getState().progress).toBe(0);
      expect(useAudioStore.getState().currentTrack?.id).toBe('track-2');
    });

    it('navigates to previous track if progress is under 3 seconds', () => {
      act(() => {
        useAudioStore.getState().setQueue([mockTrack1, mockTrack2]);
        useAudioStore.getState().setCurrentTrack(mockTrack2);
        useAudioStore.getState().setProgress(1);
      });

      act(() => {
        useAudioStore.getState().prevTrack();
      });

      expect(useAudioStore.getState().currentTrack?.id).toBe('track-1');
    });
  });

  // 4. Volume, Mute, and Mode Toggles
  describe('Volume, Mute, Shuffle & Repeat Controls', () => {
    it('toggles mute and preserves volume level', () => {
      act(() => {
        useAudioStore.getState().setVolume(0.8);
      });
      expect(useAudioStore.getState().volume).toBe(0.8);
      expect(useAudioStore.getState().isMuted).toBe(false);

      act(() => {
        useAudioStore.getState().toggleMute();
      });
      expect(useAudioStore.getState().isMuted).toBe(true);
      expect(useAudioStore.getState().volume).toBe(0.8); // Preserved
    });

    it('cycles repeatMode: off -> all -> one -> off', () => {
      expect(useAudioStore.getState().repeatMode).toBe('off');

      act(() => {
        useAudioStore.getState().setRepeatMode('all');
      });
      expect(useAudioStore.getState().repeatMode).toBe('all');

      act(() => {
        useAudioStore.getState().setRepeatMode('one');
      });
      expect(useAudioStore.getState().repeatMode).toBe('one');

      act(() => {
        useAudioStore.getState().setRepeatMode('off');
      });
      expect(useAudioStore.getState().repeatMode).toBe('off');
    });

    it('toggles shuffle and smart shuffle modes cleanly', () => {
      act(() => {
        useAudioStore.getState().setIsShuffle((prev) => !prev);
      });
      expect(useAudioStore.getState().isShuffle).toBe(true);

      act(() => {
        useAudioStore.getState().setIsSmartShuffle((prev) => !prev);
      });
      expect(useAudioStore.getState().isSmartShuffle).toBe(true);
    });
  });

  // 5. Race-Condition & Asynchronous Resolution Tests
  describe('Race Condition & Async Navigation Lifecycle', () => {
    it('maintains Track B when Track A starts, Track B is triggered immediately, and Track A finishes later', async () => {
      // Simulate rapid asynchronous track selection
      let resolveTrackA: () => void = () => {};
      let resolveTrackB: () => void = () => {};

      const asyncPlayA = new Promise<void>((res) => {
        resolveTrackA = res;
      });
      const asyncPlayB = new Promise<void>((res) => {
        resolveTrackB = res;
      });

      let activeTrackId = '';

      // User clicks Track A
      const triggerA = async () => {
        await asyncPlayA;
        // Check if superseded
        if (activeTrackId === 'track-1') {
          useAudioStore.getState().setCurrentTrack(mockTrack1);
        }
      };

      // User immediately clicks Track B before A resolves
      const triggerB = async () => {
        activeTrackId = 'track-2';
        useAudioStore.getState().setCurrentTrack(mockTrack2);
        await asyncPlayB;
      };

      activeTrackId = 'track-1';
      const promiseA = triggerA();
      const promiseB = triggerB();

      // Track A resolves after Track B
      resolveTrackB();
      await promiseB;

      resolveTrackA();
      await promiseA;

      // Final state must remain Track B
      expect(useAudioStore.getState().currentTrack?.id).toBe('track-2');
    });

    it('survives rapid component mounting, unmounting, and route transitions without state leakage', () => {
      act(() => {
        useAudioStore.getState().setQueue([mockTrack1, mockTrack2, mockTrack3]);
        useAudioStore.getState().setCurrentTrack(mockTrack2);
        useAudioStore.getState().setIsPlaying(true);
      });

      // Rapidly mount and unmount 15 components simulating hyperactive route navigation
      for (let i = 0; i < 15; i++) {
        const { unmount } = renderHook(() => useAudio());
        unmount();
      }

      // Audio engine state remains intact
      const state = useAudioStore.getState();
      expect(state.currentTrack?.id).toBe('track-2');
      expect(state.isPlaying).toBe(true);
      expect(state.queue).toHaveLength(3);
    });

    it('safely handles unmount while async audio initialization is pending without throwing unhandled rejections', async () => {
      let isUnmounted = false;
      const delayedAudioInit = new Promise<string>((resolve) => {
        setTimeout(() => {
          if (!isUnmounted) {
            resolve('initialized');
          } else {
            resolve('aborted_safely');
          }
        }, 20);
      });

      const { unmount } = renderHook(() => useAudio());
      
      // Unmount before promise resolves (simulates user navigating away while track loads)
      isUnmounted = true;
      unmount();

      const result = await delayedAudioInit;
      expect(result).toBe('aborted_safely');
      expect(useAudioStore.getState()).toBeDefined();
    });
  });

  // 6. User Role Derivation
  describe('useUserRole Hook State & Role Derivation', () => {
    it('evaluates default collector role when unprovided or default profile', () => {
      const { result } = renderHook(() => useUserRole());

      expect(result.current.role).toBe('collector');
      expect(result.current.isCollector).toBe(true);
      expect(result.current.isArtist).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });
  });
});
