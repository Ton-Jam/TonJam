import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerScreen } from '@/components/player/PlayerScreen';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Track } from '@/types';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

const mockNavigate = vi.fn();
let mockPathname = '/';
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock('@/lib/color-utils', () => ({
  useCoverColor: () => '#00B4D8',
}));

vi.mock('@/hooks/usePlaybackSpeed', () => ({
  usePlaybackSpeed: () => ({
    speed: 1,
    changeSpeed: vi.fn(),
    availableSpeeds: [0.5, 1, 1.25, 1.5, 2],
  }),
}));

const trackOne: Track = {
  id: 'track-figma-1',
  songId: 'song-figma-1',
  title: 'Midnight TON Wave',
  artist: 'Amina Pulse',
  artistId: 'artist-1',
  artistVerified: true,
  album: 'TON Sessions Vol. 2',
  coverUrl: 'https://example.com/midnight-cover.jpg',
  audioUrl: 'https://example.com/midnight-audio.mp3',
  duration: 200,
  genre: 'Electronic',
  isNFT: true,
  isHighFidelity: true,
  bitrate: 'FLAC 24-bit',
  playCount: 1240,
  likes: 42,
  lyrics: '[00:10.00] Riding the open wave\n[00:25.00] Signals across the chain',
  createdAt: '2026-03-01',
};

const trackTwo: Track = {
  id: 'track-figma-2',
  songId: 'song-figma-2',
  title: 'Deep Harbour',
  artist: 'Klara Synth',
  artistId: 'artist-2',
  coverUrl: 'https://example.com/harbour.jpg',
  audioUrl: 'https://example.com/harbour.mp3',
  duration: 180,
  genre: 'Ambient',
  isNFT: false,
  playCount: 90,
  likes: 5,
  createdAt: '2026-03-02',
};

const mockTogglePlay = vi.fn();
const mockNextTrack = vi.fn();
const mockPrevTrack = vi.fn();
const mockSeek = vi.fn();
const mockToggleShuffle = vi.fn();
const mockToggleRepeat = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockSetOptionsTrack = vi.fn();
const mockSetFullPlayerOpen = vi.fn();
const mockSetQueue = vi.fn();
const mockPlayTrack = vi.fn();
const mockSetVolume = vi.fn();
const mockToggleMute = vi.fn();
const mockSetSinkId = vi.fn().mockResolvedValue(undefined);

let mockAudioState: any;

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => mockAudioState,
}));

describe('TonJam Full Player Figma Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';

    mockAudioState = {
      currentTrack: trackOne,
      isPlaying: true,
      togglePlay: mockTogglePlay,
      nextTrack: mockNextTrack,
      prevTrack: mockPrevTrack,
      analyser: null,
      audioElement: {
        duration: 200,
        buffered: { length: 1, end: () => 120 },
        setSinkId: mockSetSinkId,
      },
      progress: 25,
      seek: mockSeek,
      setFullPlayerOpen: mockSetFullPlayerOpen,
      isFullPlayerOpen: true,
      queue: [trackOne, trackTwo],
      setQueue: mockSetQueue,
      playTrack: mockPlayTrack,
      likedTrackIds: [],
      toggleLikeTrack: mockToggleLikeTrack,
      setOptionsTrack: mockSetOptionsTrack,
      recentlyPlayed: [],
      downloadTrackForOffline: vi.fn(),
      isTrackCached: vi.fn().mockResolvedValue(false),
      deleteCachedTrack: vi.fn(),
      isSeeking: false,
      setIsSeeking: vi.fn(),
      setTrackToAddToPlaylist: vi.fn(),
      isSmartRadio: false,
      toggleSmartRadio: vi.fn(),
      isHighFidelity: true,
      createPost: vi.fn(),
      isShuffle: false,
      toggleShuffle: mockToggleShuffle,
      repeatMode: 'off',
      toggleRepeat: mockToggleRepeat,
      volume: 0.8,
      setVolume: mockSetVolume,
      isMuted: false,
      toggleMute: mockToggleMute,
      allTracks: [trackOne, trackTwo],
      allNFTs: [],
      artists: [],
    };

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: vi.fn().mockResolvedValue([
          { deviceId: 'default', kind: 'audiooutput', label: 'Speaker (Default)' },
          { deviceId: 'bt-1', kind: 'audiooutput', label: 'Galaxy Buds2 Pro' },
        ]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  it('renders Figma header, square silver-bordered 16px artwork, live waveform, and real track metadata', () => {
    const { container } = render(<PlayerScreen />);

    const dialog = screen.getByRole('dialog', { name: /Full player: Midnight TON Wave/i });
    expect(dialog.id).toBe('tonjam-full-player-screen');
    expect(dialog.className).toContain('bg-[#061426]');
    expect(dialog.className).toContain('h-dvh');
    expect(dialog.className).toContain('overflow-hidden');

    // Header: collapse, playing source, more options
    expect(screen.getByText('NOW PLAYING')).toBeDefined();
    expect(screen.getByText('TON Sessions Vol. 2')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    expect(mockSetOptionsTrack).toHaveBeenCalledWith(trackOne);

    fireEvent.click(screen.getByRole('button', { name: /Minimize player/i }));
    expect(mockSetFullPlayerOpen).toHaveBeenCalledWith(false);

    // Artwork: square 16px corner radius + silver border + real cover image + waveform while playing
    const artworkImg = screen.getByAltText('Midnight TON Wave') as HTMLImageElement;
    expect(artworkImg.src).toContain('https://example.com/midnight-cover.jpg');
    expect(artworkImg.className).toContain('rounded-[16px]');
    expect(container.innerHTML).toContain('aspect-square');
    expect(container.innerHTML).toContain('border-[rgba(192,192,192,0.22)]');
    expect(screen.getByTestId('artwork-live-waveform')).toBeDefined();

    // No audio elements created inside Full Player UI (single engine stays in AudioContext)
    expect(container.querySelectorAll('audio').length).toBe(0);
  });

  it('displays elapsed and remaining time and connects scrubber, transport, shuffle, repeat, and like to AudioContext', () => {
    render(<PlayerScreen />);

    // 25% of 200s => 0:50 elapsed, -2:30 remaining
    expect(screen.getByTestId('player-elapsed-time').textContent).toBe('0:50');
    expect(screen.getByTestId('player-remaining-time').textContent).toBe('-2:30');

    // Toggle remaining time pill to inspect total duration
    fireEvent.click(screen.getByTestId('player-remaining-time'));
    expect(screen.getByTestId('player-remaining-time').textContent).toBe('3:20');

    // Keyboard seek on progress slider
    const slider = screen.getByRole('slider', { name: /Track playback position/i });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(mockSeek).toHaveBeenCalledWith(30);

    // Playback transport controls
    fireEvent.click(screen.getByRole('button', { name: /Pause playback/i }));
    expect(mockTogglePlay).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Previous track/i }));
    expect(mockPrevTrack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Next track/i }));
    expect(mockNextTrack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Toggle shuffle/i }));
    expect(mockToggleShuffle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Repeat mode/i }));
    expect(mockToggleRepeat).toHaveBeenCalledTimes(1);

    // Favourite / like action
    fireEvent.click(screen.getByRole('button', { name: /Add to favourites/i }));
    expect(mockToggleLikeTrack).toHaveBeenCalledWith('track-figma-1');
  });

  it('supports High Quality specs, Queue management, Lyrics display, and Audio Output device routing', async () => {
    render(<PlayerScreen />);

    // High Quality pill -> AudioInfoCard
    fireEvent.click(screen.getByRole('button', { name: /High Quality/i }));
    expect(screen.getByText(/Audio Specs & Metadata/i)).toBeDefined();
    expect(screen.getByText(/FLAC \/ PCM/i)).toBeDefined();

    // Queue pill -> QueueSheet with tracks + remove action
    fireEvent.click(screen.getByRole('button', { name: /Queue/i }));
    expect(screen.getByText('Deep Harbour')).toBeDefined();

    // Lyrics pill -> LyricsSheet with real lyrics
    fireEvent.click(screen.getByRole('button', { name: /Lyrics/i }));
    expect(screen.getByText('Riding the open wave')).toBeDefined();

    // Audio output device card -> enumerates devices & calls setSinkId
    const outputCardBtn = await screen.findByRole('button', { name: /Audio output device/i });
    fireEvent.click(outputCardBtn);

    const budsOption = await screen.findByRole('option', { name: /Galaxy Buds2 Pro/i });
    fireEvent.click(budsOption);

    await waitFor(() => {
      expect(mockSetSinkId).toHaveBeenCalledWith('bt-1');
    });
  });

  it('preserves responsive mobile classes and seamless navigation across Home, MiniPlayer, and Full Player', () => {
    const { container } = render(
      <>
        <MiniPlayer />
        <PlayerScreen />
        <BottomNavigation activeTab="home" onTabChange={vi.fn()} />
      </>
    );

    const fixedStage = screen.getByTestId('full-player-fixed-stage');
    const scrollRegion = screen.getByTestId('full-player-scroll-region');

    // Safe area & mobile scroll hygiene
    expect(fixedStage.className).toContain('env(safe-area-inset-top');
    expect(scrollRegion.className).toContain('overflow-x-hidden');
    expect(scrollRegion.className).toContain('no-scrollbar');
    expect(container.innerHTML).toContain('env(safe-area-inset-bottom');

    // Tapping Home tab in BottomNavigation closes Full Player and navigates home without resetting playback
    fireEvent.click(screen.getByRole('button', { name: /Home/i }));
    expect(mockSetFullPlayerOpen).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('opens Full Player when MiniPlayer body is tapped', () => {
    mockAudioState = {
      ...mockAudioState,
      isFullPlayerOpen: false,
    };

    render(<MiniPlayer />);

    fireEvent.click(screen.getAllByText('Midnight TON Wave')[0]);
    expect(mockSetFullPlayerOpen).toHaveBeenCalledWith(true);
  });
});
