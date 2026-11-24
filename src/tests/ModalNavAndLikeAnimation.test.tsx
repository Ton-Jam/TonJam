import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AnimatedHeart } from '@/components/common/AnimatedHeart';
import { FavouriteButton } from '@/components/marketplace/FavouriteButton';
import { TrackCard } from '@/components/music/TrackCard';
import LoadingScreen from '@/components/LoadingScreen';
import Layout from '@/components/Layout';
import { ModalProvider, useModal } from '@/components/layout/ModalProvider';
import { Track } from '@/types';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

const mockToggleLikeTrack = vi.fn();

const mockTrack: Track = {
  id: 'track-anim-1',
  songId: 'song-anim-1',
  title: 'Nebula Pulse',
  artist: 'TON Synth',
  artistId: 'artist-1',
  coverUrl: 'https://example.com/cover.png',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 185,
  genre: 'Electronic',
  isNFT: false,
  playCount: 420,
  likes: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
};

let mockAudioState = {
  currentTrack: mockTrack as Track | null,
  isPlaying: false,
  isFullPlayerOpen: false,
  userProfile: { uid: 'user-1', name: 'Listener', avatar: '', username: 'listener' },
  searchQuery: '',
  setSearchQuery: vi.fn(),
  allTracks: [mockTrack],
  allNFTs: [],
  artists: [],
  firestoreUsers: [],
  playTrack: vi.fn(),
  togglePlay: vi.fn(),
  progress: 25,
  seek: vi.fn(),
  setIsSeeking: vi.fn(),
  audioConnectionState: 'connected',
  likedTrackIds: [] as string[],
  toggleLikeTrack: mockToggleLikeTrack,
  setTrackToAddToPlaylist: vi.fn(),
  isCreatePlaylistModalOpen: false,
  setIsCreatePlaylistModalOpen: vi.fn(),
  isDiscoverFiltersOpen: false,
  setIsDiscoverFiltersOpen: vi.fn(),
  isHeaderSearchOpen: false,
  setIsHeaderSearchOpen: vi.fn(),
  playlists: [],
  marketplaceFilters: { genre: 'All', sortBy: 'newest', priceRange: [0, 1000], rarity: 'All', status: 'All' },
  setMarketplaceFilters: vi.fn(),
  jamspaceFilters: {},
  setJamspaceFilters: vi.fn(),
  discoverFilters: { genre: 'All', sortBy: 'newest', bpmRange: [60, 180], selectedMoods: [], onlyVerified: false },
  setDiscoverFilters: vi.fn(),
  trackToAddToPlaylist: null,
  optionsTrack: null,
  optionsCallbacks: null,
  setOptionsTrack: vi.fn(),
  createPost: vi.fn(),
  headerTitle: '',
  setFullPlayerOpen: vi.fn(),
  unreadCount: 0,
  tjBalance: 100,
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => mockAudioState,
  useUserRole: () => ({ role: 'listener', isArtist: false, isAdmin: false }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, userProfile: null, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
}));

vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock('@/contexts/TonPriceContext', () => ({
  useTonPrice: () => ({ price: 5.2, loading: false }),
}));

vi.mock('@/contexts/WalletContext', () => ({
  useWallet: () => ({ evmAddress: null, isEvmConnected: false, disconnectWallet: vi.fn() }),
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({ unreadCount: 0, notifications: [] }),
}));

vi.mock('@tonconnect/ui-react', () => ({
  TonConnectButton: () => <button>Connect</button>,
  useTonConnectUI: () => [{ openModal: vi.fn() }],
  useTonAddress: () => '',
  useTonWallet: () => null,
  useIsConnectionRestored: () => true,
  useTonConnectModal: () => ({ open: vi.fn(), close: vi.fn(), state: { status: 'closed' } }),
}));

vi.mock('@/services/tonService', () => ({
  getTonBalance: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/lib/color-utils', () => ({
  useCoverColor: () => undefined,
}));

describe('Subtle Heart Animation on Track & NFT Like', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioState.likedTrackIds = [];
  });

  it('triggers subtle heart animation immediately when liked state changes', () => {
    const { rerender } = render(<AnimatedHeart liked={false} className="w-4 h-4" />);
    const heartEl = screen.getByTestId('animated-heart');

    expect(heartEl.getAttribute('data-liked')).toBe('false');
    expect(heartEl.getAttribute('data-animating')).toBe('idle');

    rerender(<AnimatedHeart liked={true} className="w-4 h-4 fill-current" />);
    expect(heartEl.getAttribute('data-liked')).toBe('true');
    expect(heartEl.getAttribute('data-animating')).toBe('like');

    rerender(<AnimatedHeart liked={false} className="w-4 h-4" />);
    expect(heartEl.getAttribute('data-liked')).toBe('false');
    expect(heartEl.getAttribute('data-animating')).toBe('unlike');
  });

  it('triggers subtle heart animation when clicking like on an NFT FavouriteButton', () => {
    const onToggle = vi.fn();
    render(<FavouriteButton initialFavourited={false} onToggle={onToggle} />);

    const btn = screen.getByRole('button', { name: /Add to favourites/i });
    const heartEl = screen.getByTestId('animated-heart');
    expect(heartEl.getAttribute('data-liked')).toBe('false');

    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(heartEl.getAttribute('data-liked')).toBe('true');
    expect(heartEl.getAttribute('data-animating')).toBe('like');
  });

  it('triggers subtle heart animation when liking a TrackCard', () => {
    const { rerender } = render(<TrackCard track={mockTrack} variant="compact" showLike={true} />);

    const likeBtn = screen.getByRole('button', { name: 'Like track' });
    fireEvent.click(likeBtn);
    expect(mockToggleLikeTrack).toHaveBeenCalledWith(mockTrack.id);

    mockAudioState.likedTrackIds = [mockTrack.id];
    rerender(<TrackCard track={mockTrack} variant="compact" showLike={true} />);

    const heartEl = screen.getByTestId('animated-heart');
    expect(heartEl.getAttribute('data-liked')).toBe('true');
    expect(heartEl.getAttribute('data-animating')).toBe('like');
  });
});

describe('LoadingScreen positioning and sizing', () => {
  it('renders TonJam spinning logo and title with updated up-shift, +2px logo, and -1px title size CSS', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector('.protected-route-loading-overlay')).toBeTruthy();
    expect(container.querySelector('.loader-container')).toBeTruthy();
    expect(container.querySelector('.spinning-logo')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'TonJam' })).toBeTruthy();

    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');
    expect(css).toMatch(/\.protected-route-loading-overlay \.loader-container\s*\{[^}]*transform:\s*translateY\(-1\.5rem\)/s);
    expect(css).toMatch(/\.protected-route-loading-overlay \.spinning-logo\s*\{[^}]*width:\s*102px;\s*height:\s*102px;/s);
    expect(css).toMatch(/\.protected-route-loading-overlay \.pulsing-title\s*\{[^}]*font-size:\s*29px;/s);
  });
});

describe('Hide BottomNavigation and MiniPlayer while any modal displays', () => {
  beforeEach(() => {
    mockAudioState.currentTrack = mockTrack;
    mockAudioState.isFullPlayerOpen = false;
  });

  it('hides BottomNavigation and MiniPlayer when a ModalProvider modal opens and restores when closed', async () => {
    const ModalHarness = () => {
      const { openModal, closeModal } = useModal();
      return (
        <div>
          <button type="button" onClick={() => openModal('wallet', 'Wallet Modal')}>
            Open Wallet Modal
          </button>
          <button type="button" onClick={closeModal}>
            Close Wallet Modal
          </button>
        </div>
      );
    };

    const { container } = render(
      <ModalProvider>
        <Layout>
          <ModalHarness />
        </Layout>
      </ModalProvider>
    );

    expect(container.querySelector('#tonjam-bottom-navigation')).toBeTruthy();
    expect(container.querySelector('#tonjam-mini-player')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open Wallet Modal' }));

    await waitFor(() => {
      expect(container.querySelector('#tonjam-bottom-navigation')).toBeNull();
      expect(container.querySelector('#tonjam-mini-player')).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close Wallet Modal' }));

    await waitFor(() => {
      expect(container.querySelector('#tonjam-bottom-navigation')).toBeTruthy();
      expect(container.querySelector('#tonjam-mini-player')).toBeTruthy();
    });
  });

  it('hides BottomNavigation and MiniPlayer when a DOM role="dialog" modal displays', async () => {
    const DomDialogHarness = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Open Dialog
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Close Dialog
          </button>
          {open && (
            <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70">
              <span>Modal Content</span>
            </div>
          )}
        </div>
      );
    };

    const { container } = render(
      <ModalProvider>
        <Layout>
          <DomDialogHarness />
        </Layout>
      </ModalProvider>
    );

    expect(container.querySelector('#tonjam-bottom-navigation')).toBeTruthy();
    expect(container.querySelector('#tonjam-mini-player')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open Dialog' }));

    await waitFor(() => {
      expect(container.querySelector('#tonjam-bottom-navigation')).toBeNull();
      expect(container.querySelector('#tonjam-mini-player')).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }));

    await waitFor(() => {
      expect(container.querySelector('#tonjam-bottom-navigation')).toBeTruthy();
      expect(container.querySelector('#tonjam-mini-player')).toBeTruthy();
    });
  });
});
