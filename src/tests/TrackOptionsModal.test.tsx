import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrackOptionsModal from '@/components/TrackOptionsModal';
import { Track } from '@/types';

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AudioContext
const mockAddNotification = vi.fn();
const mockAddToQueue = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockPlayTrack = vi.fn();
const mockTogglePlay = vi.fn();

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    addNotification: mockAddNotification,
    addToQueue: mockAddToQueue,
    likedTrackIds: ['track-1'],
    toggleLikeTrack: mockToggleLikeTrack,
    userProfile: { uid: 'artist-user-123' },
    currentTrack: { id: 'track-1' },
    isPlaying: true,
    playTrack: mockPlayTrack,
    togglePlay: mockTogglePlay,
  }),
}));

describe('TrackOptionsModal Component', () => {
  const mockTrack: Track = {
    id: 'track-1',
    songId: 'song-1',
    title: 'Neon Nights',
    artist: 'CyberPulse',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/cover.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 180,
    genre: 'Synthwave',
    isNFT: true,
    price: '1.5',
    artistVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockOnClose = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders track header information correctly with verified badge and genre', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} />);

    expect(screen.getByText('Neon Nights')).toBeDefined();
    expect(screen.getByText('CyberPulse')).toBeDefined();
    expect(screen.getByText('Synthwave')).toBeDefined();
    expect(screen.getByLabelText('Verified Artist')).toBeDefined();
  });

  it('renders primary actions with Pause state when track is currently playing', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} />);

    const pauseBtn = screen.getByText('Pause Track');
    expect(pauseBtn).toBeDefined();

    fireEvent.click(pauseBtn);
    expect(mockTogglePlay).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles add to queue action correctly', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} />);

    const queueBtn = screen.getByText('Add to Queue');
    expect(queueBtn).toBeDefined();

    fireEvent.click(queueBtn);
    expect(mockAddToQueue).toHaveBeenCalledWith(mockTrack);
    expect(mockAddNotification).toHaveBeenCalledWith('"Neon Nights" added to queue', 'info');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders Remove option when onRemove prop is provided', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} onRemove={mockOnRemove} />);

    const removeBtn = screen.getByText('Remove from List');
    expect(removeBtn).toBeDefined();

    fireEvent.click(removeBtn);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to artist page when View Artist is clicked', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} />);

    const artistBtn = screen.getByText('View Artist (CyberPulse)');
    expect(artistBtn).toBeDefined();

    fireEvent.click(artistBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/artist/artist-1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles Report action cleanly with a confirmation notification', () => {
    render(<TrackOptionsModal track={mockTrack} onClose={mockOnClose} />);

    const reportBtn = screen.getByText('Report Track');
    expect(reportBtn).toBeDefined();

    fireEvent.click(reportBtn);
    expect(mockAddNotification).toHaveBeenCalledWith('Thank you. Track has been reported for review.', 'info');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
