import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { PlayerArtwork } from '@/components/player/PlayerArtwork';
import { LyricsSheet } from '@/components/player/LyricsSheet';
import { PlayerScreen } from '@/components/player/PlayerScreen';
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
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/marketplace' }),
}));

let mockWalletState: {
  address: string | null;
  isConnected: boolean;
  connectWallet: ReturnType<typeof vi.fn>;
} = {
  address: null,
  isConnected: false,
  connectWallet: vi.fn(),
};

let mockTonAddressFallback = '';

vi.mock('@/contexts/WalletContext', () => ({
  useOptionalWallet: () => mockWalletState,
  useWallet: () => mockWalletState,
}));

vi.mock('@tonconnect/ui-react', () => ({
  useTonAddress: () => mockTonAddressFallback,
  useTonConnectUI: () => [{ openModal: vi.fn() }],
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    unreadCount: 2,
    notifications: [],
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock('@/components/NotificationBell', () => ({
  default: () => <button type="button" aria-label="Notifications" data-testid="notification-bell" />,
}));

vi.mock('@/lib/color-utils', () => ({
  useCoverColor: () => '#00B4D8',
}));

const sampleTrack: Track = {
  id: 'track-real-1',
  songId: 'song-real-1',
  title: 'Real Signal',
  artist: 'Klara Synth',
  artistId: 'artist-real-1',
  artistVerified: true,
  coverUrl: 'https://example.com/real-cover.jpg',
  audioUrl: 'https://example.com/real-audio.mp3',
  duration: 200,
  genre: 'Ambient',
  isNFT: false,
  playCount: 350,
  likes: 42,
  lyrics: '[00:05.00] First real lyric line\n[00:10.00] Second real lyric line',
  createdAt: '2026-02-01',
};

const mockSetFullPlayerOpen = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockSeek = vi.fn();

let mockAudioState: any = {
  currentTrack: sampleTrack,
  isPlaying: false,
  togglePlay: vi.fn(),
  nextTrack: vi.fn(),
  prevTrack: vi.fn(),
  analyser: null,
  audioElement: null,
  progress: 25,
  seek: mockSeek,
  setFullPlayerOpen: mockSetFullPlayerOpen,
  isFullPlayerOpen: true,
  queue: [],
  setQueue: vi.fn(),
  playTrack: vi.fn(),
  likedTrackIds: [],
  toggleLikeTrack: mockToggleLikeTrack,
  setOptionsTrack: vi.fn(),
  recentlyPlayed: [],
  downloadTrackForOffline: vi.fn(),
  isTrackCached: vi.fn().mockResolvedValue(false),
  deleteCachedTrack: vi.fn(),
  isSeeking: false,
  setIsSeeking: vi.fn(),
  setTrackToAddToPlaylist: vi.fn(),
  isSmartRadio: false,
  createPost: vi.fn(),
  isShuffle: false,
  toggleShuffle: vi.fn(),
  repeatMode: 'off',
  cycleRepeat: vi.fn(),
  allTracks: [sampleTrack],
  allNFTs: [],
  artists: [],
};

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => mockAudioState,
}));

describe('MarketplaceHeader & Full Player Production Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletState = {
      address: null,
      isConnected: false,
      connectWallet: vi.fn(),
    };
    mockTonAddressFallback = '';
    mockAudioState = {
      ...mockAudioState,
      currentTrack: sampleTrack,
      isFullPlayerOpen: true,
      likedTrackIds: [],
    };
  });

  it('MarketplaceHeader renders icon-only white wallet button when disconnected alongside notification bell and pill Mint button below search bar', () => {
    const onMintClick = vi.fn();
    const { container } = render(
      <MarketplaceHeader searchTerm="" onSearchChange={vi.fn()} onMintClick={onMintClick} />
    );

    const walletBtn = screen.getByRole('button', { name: /Connect TON Wallet/i });
    expect(walletBtn.className).toContain('text-[#FFFFFF]');
    expect(walletBtn.textContent?.trim()).toBe('');
    expect(screen.queryByText(/EQ|UQ|Connect Wallet/i)).toBeNull();
    expect(screen.getByTestId('notification-bell')).toBeDefined();

    const searchWrapper = container.querySelector('.search-input-wrapper');
    const mintBtn = screen.getByRole('button', { name: /Mint NFT/i });
    expect(searchWrapper).not.toBeNull();
    expect(mintBtn.className).toContain('rounded-[var(--tj-radius-pill,999px)]');
    expect(mintBtn.className).toContain('bg-[var(--tj-color-brand-primary,#00B4D8)]');

    const relation = searchWrapper!.compareDocumentPosition(mintBtn);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(mintBtn);
    expect(onMintClick).toHaveBeenCalledTimes(1);
  });

  it('MarketplaceHeader turns wallet icon TonJam blue when connected without displaying wallet address and navigates to /wallet on click', () => {
    const connectWallet = vi.fn();
    mockWalletState = {
      address: 'EQD__________________________________________0vo',
      isConnected: true,
      connectWallet,
    };
    mockTonAddressFallback = 'EQD__________________________________________0vo';

    render(<MarketplaceHeader searchTerm="" onSearchChange={vi.fn()} onMintClick={vi.fn()} />);

    const walletBtn = screen.getByRole('button', { name: /TON Wallet Connected/i });
    expect(walletBtn.className).toContain('text-[var(--tj-color-brand-primary,#00B4D8)]');
    expect(walletBtn.textContent?.trim()).toBe('');
    expect(screen.queryByText(/EQD/i)).toBeNull();

    fireEvent.click(walletBtn);
    expect(connectWallet).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/wallet');
  });

  it('PlayerArtwork renders reduced border radius for cover frame and image', () => {
    const { container } = render(
      <PlayerArtwork track={sampleTrack} isPlaying={false} />
    );

    const coverImg = screen.getByAltText('Real Signal');
    expect(coverImg.className).toContain('rounded-[var(--tj-radius-sm,8px)]');
    expect(coverImg.className).not.toContain('rounded-[20px]');
    expect(container.innerHTML).not.toContain('rounded-[20px]');
  });

  it('PlayerScreen displays real track stats, closes on Escape, and LyricsSheet shows honest lyrics or empty state without demo copy', () => {
    render(<PlayerScreen />);

    expect(screen.getByText('350 Streams')).toBeDefined();
    expect(screen.getByText('Like 42')).toBeDefined();
    expect(screen.queryByText('1.4M Streams')).toBeNull();
    expect(screen.queryByText('18.4k')).toBeNull();
    expect(screen.queryByText('Comments (412)')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Lyrics/i }));
    expect(screen.getByText('First real lyric line')).toBeDefined();
    expect(screen.queryByText(/digital soundscape/i)).toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockSetFullPlayerOpen).toHaveBeenCalledWith(false);
  });

  it('LyricsSheet shows an honest empty state when track has no lyrics', () => {
    render(
      <LyricsSheet
        track={{ ...sampleTrack, lyrics: '' }}
        currentTime={10}
        duration={200}
        onSeek={vi.fn()}
      />
    );

    expect(screen.getByText(/No lyrics available for this track/i)).toBeDefined();
    expect(screen.queryByText(/digital soundscape/i)).toBeNull();
  });
});
