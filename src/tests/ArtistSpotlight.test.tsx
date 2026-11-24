import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArtistSpotlightSection } from '@/components/home/ArtistSpotlightSection';
import { Artist, Track } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockPlayTrack = vi.fn();
const mockTogglePlay = vi.fn();
const mockToggleFollowUser = vi.fn();

const sampleArtists: Artist[] = [
  {
    uid: 'artist-1',
    name: 'Nova Pulse',
    username: 'novapulse',
    avatarUrl: 'https://example.com/nova.jpg',
    bannerUrl: 'https://example.com/nova-banner.jpg',
    followers: 18400,
    monthlyListeners: 42100,
    verified: true,
    isVerifiedArtist: true,
    genre: 'Electronic',
    bio: 'Ambient synth producer minting stem-enabled TON audio editions.',
    socials: {
      x: '@novapulse',
      telegram: 't.me/novapulse_ton',
      instagram: 'https://instagram.com/novapulse.music',
      website: 'novapulse.xyz',
    },
  },
  {
    uid: 'artist-2',
    name: 'Kofi Wave',
    username: 'kofiwave',
    avatarUrl: 'https://example.com/kofi.jpg',
    followers: 9200,
    monthlyListeners: 19500,
    verified: true,
    isVerifiedArtist: true,
    genre: 'Afrobeats',
    bio: 'Lagos-to-TON percussionist and live loop architect.',
    socials: {
      spotify: 'https://open.spotify.com/artist/kofiwave',
      telegram: '@kofiwave',
    },
  },
];

const sampleTracks: Track[] = [
  {
    id: 't1',
    songId: 's1',
    title: 'Neon Horizon',
    artist: 'Nova Pulse',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/t1.jpg',
    audioUrl: 'https://example.com/t1.mp3',
    duration: 205,
    genre: 'Electronic',
    isNFT: true,
    playCount: 1200,
    createdAt: '2026-01-01',
  },
  {
    id: 't2',
    songId: 's2',
    title: 'Deep Jetton',
    artist: 'Nova Pulse',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/t2.jpg',
    audioUrl: 'https://example.com/t2.mp3',
    duration: 185,
    genre: 'Electronic',
    isNFT: false,
    playCount: 4500,
    createdAt: '2026-01-02',
  },
  {
    id: 't3',
    songId: 's3',
    title: 'TON Drift',
    artist: 'Nova Pulse',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/t3.jpg',
    audioUrl: 'https://example.com/t3.mp3',
    duration: 195,
    genre: 'Synthwave',
    isNFT: false,
    playCount: 2800,
    createdAt: '2026-01-03',
  },
  {
    id: 't4',
    songId: 's4',
    title: 'Midnight Echo',
    artist: 'Nova Pulse',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/t4.jpg',
    audioUrl: 'https://example.com/t4.mp3',
    duration: 170,
    genre: 'Electronic',
    isNFT: false,
    playCount: 300,
    createdAt: '2026-01-04',
  },
  {
    id: 't5',
    songId: 's5',
    title: 'Lagos Rhythm',
    artist: 'Kofi Wave',
    artistId: 'artist-2',
    coverUrl: 'https://example.com/t5.jpg',
    audioUrl: 'https://example.com/t5.mp3',
    duration: 215,
    genre: 'Afrobeats',
    isNFT: true,
    playCount: 6400,
    createdAt: '2026-01-05',
  },
];

let mockCurrentTrack: Track | null = null;
let mockIsPlaying = false;
let mockFollowedUserIds: string[] = [];

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    artists: sampleArtists,
    allTracks: sampleTracks,
    currentTrack: mockCurrentTrack,
    isPlaying: mockIsPlaying,
    playTrack: mockPlayTrack,
    togglePlay: mockTogglePlay,
    followedUserIds: mockFollowedUserIds,
    toggleFollowUser: mockToggleFollowUser,
    userProfile: { uid: 'listener-1', name: 'Listener' },
  }),
}));

describe('ArtistSpotlightSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentTrack = null;
    mockIsPlaying = false;
    mockFollowedUserIds = [];
  });

  it('renders featured artist profile, top 3 tracks sorted by playCount, and sanitized social links without border lines', () => {
    const { container } = render(<ArtistSpotlightSection />);

    expect(screen.getByText('Artist Spotlight')).toBeDefined();
    expect(screen.getAllByText('Nova Pulse').length).toBeGreaterThan(0);
    expect(screen.getByText(/Ambient synth producer/i)).toBeDefined();
    expect(screen.getByText(/@novapulse/i)).toBeDefined();

    // Top 3 tracks by playCount (4500, 2800, 1200); 4th track (300) should not render
    expect(screen.getByText('Deep Jetton')).toBeDefined();
    expect(screen.getByText('TON Drift')).toBeDefined();
    expect(screen.getByText('Neon Horizon')).toBeDefined();
    expect(screen.queryByText('Midnight Echo')).toBeNull();

    // Social links are properly normalized to https://
    const xLink = screen.getByRole('link', { name: /Nova Pulse on X/i });
    expect(xLink.getAttribute('href')).toBe('https://x.com/novapulse');
    const tgLink = screen.getByRole('link', { name: /Nova Pulse on Telegram/i });
    expect(tgLink.getAttribute('href')).toBe('https://t.me/novapulse_ton');
    const webLink = screen.getByRole('link', { name: /Nova Pulse on Website/i });
    expect(webLink.getAttribute('href')).toBe('https://novapulse.xyz');

    // Verify no border divider classes were introduced
    const elementsWithBorderClass = container.querySelectorAll('[class*="border-slate"], [class*="border-white"], [class*="border-2"], [class*="border-t"], [class*="border-b"]');
    expect(elementsWithBorderClass.length).toBe(0);
  });

  it('plays top track, toggles follow, and navigates to artist profile', () => {
    render(<ArtistSpotlightSection />);

    const playBtn = screen.getByRole('button', { name: 'Play Deep Jetton' });
    fireEvent.click(playBtn);
    expect(mockPlayTrack).toHaveBeenCalledWith(expect.objectContaining({ id: 't2', title: 'Deep Jetton' }));

    const followBtn = screen.getByRole('button', { name: 'Follow Nova Pulse' });
    fireEvent.click(followBtn);
    expect(mockToggleFollowUser).toHaveBeenCalledWith('artist-1');

    const viewProfileBtn = screen.getByRole('button', { name: /View Profile/i });
    fireEvent.click(viewProfileBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/artist/artist-1');
  });

  it('toggles playback when clicking the currently playing track', () => {
    mockCurrentTrack = sampleTracks[1]; // Deep Jetton
    mockIsPlaying = true;

    render(<ArtistSpotlightSection />);

    const pauseBtn = screen.getByRole('button', { name: 'Pause Deep Jetton' });
    fireEvent.click(pauseBtn);
    expect(mockTogglePlay).toHaveBeenCalledTimes(1);
    expect(mockPlayTrack).not.toHaveBeenCalled();
  });

  it('switches between spotlight artists using carousel controls', () => {
    render(<ArtistSpotlightSection />);

    const nextBtn = screen.getByRole('button', { name: 'Next spotlight artist' });
    fireEvent.click(nextBtn);

    expect(screen.getAllByText('Kofi Wave').length).toBeGreaterThan(0);
    expect(screen.getByText('Lagos Rhythm')).toBeDefined();
    const spotifyLink = screen.getByRole('link', { name: /Kofi Wave on Spotify/i });
    expect(spotifyLink.getAttribute('href')).toBe('https://open.spotify.com/artist/kofiwave');

    const prevBtn = screen.getByRole('button', { name: 'Previous spotlight artist' });
    fireEvent.click(prevBtn);
    expect(screen.getByText('Deep Jetton')).toBeDefined();
  });
});
