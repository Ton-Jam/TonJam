import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { QueueManager } from '@/pages/Library/components/QueueManager';
import { DownloadsManager } from '@/pages/Library/components/DownloadsManager';
import LibraryPage from '@/pages/Library';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/library' }),
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockPlayTrack = vi.fn();
const mockRemoveFromQueue = vi.fn();
const mockClearQueue = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockAddToQueue = vi.fn();
const mockClearRecentlyPlayed = vi.fn();

const trackOne = {
  id: 'track-alpha-1',
  title: 'Alpha Signal',
  artist: 'Aria Nova',
  artistId: 'artist-1',
  album: 'Cosmic Drift',
  coverUrl: 'https://example.com/a.jpg',
  audioUrl: 'https://example.com/a.mp3',
  duration: 185,
  streams: 120,
  playCount: 120,
  genre: 'Electronic',
};

const trackTwo = {
  id: 'track-beta-2',
  title: 'Beta Waves',
  artist: 'Koda Pulse',
  artistId: 'artist-2',
  album: 'Cosmic Drift',
  coverUrl: 'https://example.com/b.jpg',
  audioUrl: 'https://example.com/b.mp3',
  duration: 210,
  streams: 85,
  playCount: 85,
  genre: 'Electronic',
};

const historyTrack = {
  id: 'track-hist-1',
  title: 'Past Horizon',
  artist: 'Sora Drift',
  artistId: 'artist-3',
  album: 'Echoes',
  coverUrl: 'https://example.com/h.jpg',
  audioUrl: 'https://example.com/h.mp3',
  duration: 195,
  streams: 44,
  playCount: 44,
  genre: 'Ambient',
};

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    allTracks: [trackOne, trackTwo],
    artists: [{ uid: 'artist-1', name: 'Aria Nova', followers: 100, verified: true, genre: 'Electronic' }],
    collections: [],
    playlists: [],
    recentlyPlayed: [historyTrack],
    queue: [trackOne, trackTwo],
    likedTrackIds: ['track-alpha-1'],
    followedUserIds: ['artist-1'],
    localTracks: [],
    currentTrack: trackOne,
    isPlaying: false,
    userProfile: { uid: 'u-1', walletAddress: 'EQTEST', ownedTrackIds: [], ownedNftIds: [] },
    playTrack: mockPlayTrack,
    toggleLikeTrack: mockToggleLikeTrack,
    createNewPlaylist: vi.fn(),
    deletePlaylist: vi.fn(),
    setIsCreatePlaylistModalOpen: vi.fn(),
    removeFromQueue: mockRemoveFromQueue,
    clearQueue: mockClearQueue,
    addToQueue: mockAddToQueue,
    clearRecentlyPlayed: mockClearRecentlyPlayed,
    setHeaderTitle: vi.fn(),
    isShuffle: false,
    toggleShuffle: vi.fn(),
  }),
  useUserRole: () => ({ role: 'listener', isArtist: false }),
}));

vi.mock('@/contexts/NFTContext', () => ({
  useNFT: () => ({ nfts: [] }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ userProfile: { uid: 'u-1', name: 'Listener' } }),
}));

vi.mock('@/components/layout/ToastProvider', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/services/serviceWorkerCacheService', () => ({
  cacheTrackInServiceWorker: vi.fn().mockResolvedValue(undefined),
  removeTrackFromServiceWorker: vi.fn().mockResolvedValue(undefined),
  getCachedTrackIdsSet: vi.fn().mockResolvedValue(new Set<string>()),
  syncInitialOfflineTracks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/audioCacheService', () => ({
  audioCacheService: {
    cacheTrack: vi.fn().mockResolvedValue(undefined),
    removeCachedTrack: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/ArtistProfile', () => ({
  ArtistProfile: () => <div data-testid="artist-profile" />,
}));

vi.mock('@/pages/Library/components/RoyaltiesDashboard', () => ({
  RoyaltiesDashboard: () => <div data-testid="royalties-dashboard" />,
}));

describe('Marketplace Radius & Library Audit Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies +2px global radius tokens and enforces 1px borders across Marketplace', () => {
    const tokensCss = fs.readFileSync(path.resolve('src/styles/tonjam-tokens.css'), 'utf-8');
    expect(tokensCss).toContain('--tj-radius-compact: 5px;');
    expect(tokensCss).toContain('--tj-radius-sm: 8px;');
    expect(tokensCss).toContain('--tj-radius-md: 10px;');

    const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
    expect(indexCss).toContain('--radius-sm: 8px;');
    expect(indexCss).toContain('--radius: 10px;');

    const filesToCheck = [
      'src/components/marketplace/MarketplaceHeader.tsx',
      'src/components/marketplace/FeaturedDropBanner.tsx',
      'src/components/marketplace/MusicNFTCard.tsx',
      'src/components/marketplace/AuctionCard.tsx',
      'src/components/marketplace/CollectionCard.tsx',
      'src/components/marketplace/FavouriteButton.tsx',
      'src/components/marketplace/FilterPill.tsx',
      'src/components/marketplace/MarketplaceSkeleton.tsx',
      'src/components/marketplace/MarketplaceTransparency.tsx',
      'src/pages/Marketplace/components/EmptyStates.tsx',
      'src/pages/Marketplace/index.tsx',
      'src/components/music/NFTCard.tsx',
      'src/components/NFTCard.tsx',
    ];

    for (const file of filesToCheck) {
      const content = fs.readFileSync(path.resolve(file), 'utf-8');
      expect(content).not.toMatch(/--tj-radius-compact,\s*[23]px/);
      expect(content).not.toMatch(/\bborder(?:-[trbl])?-2\b/);
    }
  });

  it('QueueManager remove button deletes item without bubbling click to onPlay', () => {
    const onRemove = vi.fn();
    const onPlay = vi.fn();
    const items = [
      { id: 'q-track-alpha-1-0', trackId: 'track-alpha-1', title: 'Alpha Signal', artist: 'Aria Nova', coverUrl: 'a.jpg', duration: 180, addedBy: 'user' as const },
      { id: 'q-track-beta-2-1', trackId: 'track-beta-2', title: 'Beta Waves', artist: 'Koda Pulse', coverUrl: 'b.jpg', duration: 200, addedBy: 'user' as const },
    ];

    render(
      <QueueManager
        queue={items}
        onRemoveFromQueue={onRemove}
        onClearQueue={vi.fn()}
        onPlay={onPlay}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /Remove Beta Waves from queue/i });
    fireEvent.click(removeBtn);

    expect(onRemove).toHaveBeenCalledWith('q-track-beta-2-1');
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('DownloadsManager remove button deletes download without triggering onPlay', () => {
    const onRemoveDownload = vi.fn();
    const onPlay = vi.fn();
    const tracks = [
      {
        id: 'track-dl-1',
        title: 'Offline Echo',
        artist: 'Aria Nova',
        artistId: 'artist-1',
        album: 'Drift',
        coverUrl: 'a.jpg',
        duration: 180,
        plays: 10,
        isLiked: false,
        isDownloaded: true,
        isOfflineAvailable: true,
        downloadSize: '6.4 MB',
      },
    ];

    render(
      <DownloadsManager
        tracks={tracks}
        albums={[]}
        totalDownloadedSize="0.01"
        downloadQuality="Lossless"
        onChangeQuality={vi.fn()}
        onRemoveDownload={onRemoveDownload}
        onPlay={onPlay}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /Remove Offline Echo from downloads/i });
    fireEvent.click(removeBtn);

    expect(onRemoveDownload).toHaveBeenCalledWith('track-dl-1');
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('LibraryPage renders live queueCount, separates Recently Played from Queue, and clears empty search cleanly', () => {
    render(<LibraryPage />);

    // Real queue count passed to QuickActions
    expect(screen.getByText('2 tracks queued')).toBeDefined();

    // Recently Played shows historyTrack ("Past Horizon"), while QueueManager shows "Alpha Signal" / "Beta Waves"
    expect(screen.getAllByText('Past Horizon').length).toBeGreaterThan(0);
    expect(screen.getByText('Up Next & Queue')).toBeDefined();

    // Dead mock injector & fake telemetry footer removed
    expect(screen.queryByText(/Mock State Injector/i)).toBeNull();
    expect(screen.queryByText(/SECURE ledgers/i)).toBeNull();

    // Header search + empty state clear
    fireEvent.click(screen.getByRole('button', { name: /Open search in library/i }));
    const searchInput = screen.getByPlaceholderText(/Search tracks, albums, collections/i);
    fireEvent.change(searchInput, { target: { value: 'ZzzNoMatch999' } });

    expect(screen.getByText(/No matches for/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Clear Search/i }));
    expect(screen.queryByText(/No matches for/i)).toBeNull();
  });
});
