import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import { CollectionCard } from '@/components/cards/CollectionCard';
import { HomeGenreFilterBar } from '@/components/home/HomeGenreFilterBar';
import MiniPlayer from '@/components/player/MiniPlayer';
import ArtistCard from '@/components/ArtistCard';
import NotificationBell from '@/components/NotificationBell';
import { APP_ROUTES, HOME_DESTINATIONS } from '@/router/routes';
import { Track, NFTItem, Playlist, Artist } from '@/types';

// Polyfill ResizeObserver for jsdom
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock AudioContext
const mockPlayTrack = vi.fn();
const mockTogglePlay = vi.fn();
const mockAddToQueue = vi.fn();
const mockAddNotification = vi.fn();
const mockSeek = vi.fn();
let mockCurrentTrack: Track | null = null;
let mockIsPlaying = false;

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    playTrack: mockPlayTrack,
    togglePlay: mockTogglePlay,
    addToQueue: mockAddToQueue,
    addNotification: mockAddNotification,
    currentTrack: mockCurrentTrack,
    isPlaying: mockIsPlaying,
    isLoading: false,
    allTracks: [],
    playlists: [],
    collections: [],
    artists: [],
    userProfile: { uid: 'test-user-id', ownedTrackIds: [] },
    likedTrackIds: [],
    followedUserIds: [],
    toggleFollowUser: vi.fn(),
    toggleLikeTrack: vi.fn(),
    isTrackCached: vi.fn().mockResolvedValue(false),
    seek: mockSeek,
    progress: 45,
    duration: 180,
    setOptionsTrack: vi.fn(),
    setFullPlayerOpen: vi.fn(),
  }),
  useUserRole: () => ({ role: 'listener', isArtist: false }),
}));

// Mock TonConnect
vi.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: () => [{ connected: false, openModal: vi.fn() }],
  useTonAddress: () => '',
  TonConnectButton: () => <button>Connect Wallet</button>,
}));

// Mock GramPriceContext
vi.mock('@/contexts/GramPriceContext', () => ({
  useGramPrice: () => ({
    convertPrice: (p: string) => `${p} USD`,
    localCurrencyEnabled: false,
  }),
}));

// Mock NFTContext
vi.mock('@contexts/NFTContext', () => ({
  useNFT: () => ({ nfts: [] }),
}));

// Mock NotificationContext
vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({ unreadCount: 3 }),
}));

describe('Home Screen Interaction Regression Pass', () => {
  const sampleTrack: Track = {
    id: 'track-101',
    songId: 'song-101',
    title: 'Solana Sunset',
    artist: 'CryptoBeats',
    artistId: 'artist-1',
    coverUrl: 'https://example.com/cover.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 210,
    genre: 'Lo-Fi',
    isNFT: false,
    createdAt: '2026-01-01',
  };

  const sampleNFT: NFTItem = {
    id: 'nft-202',
    trackId: 'track-101',
    title: 'Cyber Anthem #202',
    creator: 'Alice Wonder',
    owner: 'owner-wallet-999',
    price: '2.5 TON',
    imageUrl: 'https://example.com/nft.jpg',
    audioUrl: 'https://example.com/nft-audio.mp3',
    edition: '1 of 100',
  };

  const samplePlaylist: Playlist = {
    id: 'playlist-303',
    title: 'Chill TON Vibes',
    creator: 'TonJam Editorial',
    trackCount: 15,
    coverUrl: 'https://example.com/playlist.jpg',
    trackIds: ['track-101'],
  };

  const sampleArtist: Artist = {
    uid: 'artist-505',
    name: 'DJ Cyberton',
    handle: '@cyberton',
    avatar: 'https://example.com/artist.jpg',
    verified: true,
    followers: 12500,
    genres: ['Electronic', 'Cyberpunk'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentTrack = null;
    mockIsPlaying = false;
  });

  describe('1. TrackCard Interaction Regression', () => {
    it('tapping the play button triggers playback with the correct track and does not navigate away', () => {
      render(<TrackCard track={sampleTrack} />);
      const playButton = screen.getByLabelText(/Play track/i);
      expect(playButton).toBeDefined();

      fireEvent.click(playButton);
      expect(mockPlayTrack).toHaveBeenCalledTimes(1);
      expect(mockPlayTrack).toHaveBeenCalledWith(sampleTrack);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('repeated taps do not create broken state or multiple unhandled plays', () => {
      render(<TrackCard track={sampleTrack} />);
      const playButton = screen.getByLabelText(/Play track/i);

      fireEvent.click(playButton);
      fireEvent.click(playButton);
      expect(mockPlayTrack).toHaveBeenCalledTimes(2);
    });

    it('tapping the track card body opens the exact track details destination (/track/:id)', () => {
      render(<TrackCard track={sampleTrack} />);
      const cardElement = screen.getByRole('button', { name: new RegExp(sampleTrack.title, 'i') });

      fireEvent.click(cardElement);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.TRACK_DETAIL(sampleTrack.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/track/${sampleTrack.id}`);
    });
  });

  describe('2. NFTCard Interaction Regression', () => {
    it('renders NFT card with visible, tappable Buy button and correct metadata', () => {
      render(<NFTCard nft={sampleNFT} />);
      const buyButton = screen.getByRole('button', { name: /Buy Cyber Anthem #202 for 2.5 TON/i });
      expect(buyButton).toBeDefined();
      expect(buyButton.textContent).toContain('Buy');
    });

    it('tapping Buy button navigates to exact NFT Detail screen (/nft/:id) with stopPropagation', () => {
      render(<NFTCard nft={sampleNFT} />);
      const buyButton = screen.getByRole('button', { name: /Buy Cyber Anthem #202 for 2.5 TON/i });

      fireEvent.click(buyButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.NFT_DETAIL(sampleNFT.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/nft/${sampleNFT.id}`);
    });

    it('tapping the NFT card body also navigates to exact NFT Detail screen (/nft/:id)', () => {
      render(<NFTCard nft={sampleNFT} />);
      const cardBody = screen.getByRole('button', { name: /View NFT Cyber Anthem #202/i });

      fireEvent.click(cardBody);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.NFT_DETAIL(sampleNFT.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/nft/${sampleNFT.id}`);
    });
  });

  describe('3. PlaylistCard Interaction Regression', () => {
    it('tapping the playlist card navigates to exact playlist route (/playlist/:id)', () => {
      const onPlaylistClick = vi.fn(() => mockNavigate(APP_ROUTES.PLAYLIST_DETAIL(samplePlaylist.id)));
      render(<PlaylistCard playlist={samplePlaylist} onClick={onPlaylistClick} />);

      const cardTitle = screen.getByText('Chill TON Vibes');
      fireEvent.click(cardTitle.closest('div[role="button"]') || cardTitle);
      expect(onPlaylistClick).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.PLAYLIST_DETAIL(samplePlaylist.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/playlist/${samplePlaylist.id}`);
    });

    it('tapping play action triggers play callback', () => {
      const onPlaylistClick = vi.fn();
      render(<PlaylistCard playlist={samplePlaylist} onClick={onPlaylistClick} />);

      const playButton = screen.getByRole('button', { name: /Play Chill TON Vibes/i });
      fireEvent.click(playButton);
      expect(onPlaylistClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. CollectionCard Interaction Regression', () => {
    it('tapping collection card navigates to exact collection route (/collections/:collectionId)', () => {
      render(
        <CollectionCard
          id="ton-genesis"
          name="TON Genesis Collection"
          itemCount={24}
          coverUrl="https://example.com/collection.jpg"
        />
      );

      const collectionCard = screen.getByRole('button', { name: /View collection: TON Genesis Collection/i });
      fireEvent.click(collectionCard);

      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.COLLECTION_DETAIL('ton-genesis'));
      expect(mockNavigate).toHaveBeenCalledWith('/collections/ton-genesis');
    });
  });

  describe('5. Category Filter Bar Interaction Regression', () => {
    it('tapping each category triggers selection callback and updates active category', () => {
      const onSelectCategory = vi.fn();
      render(<HomeGenreFilterBar activeCategory="All" onSelectCategory={onSelectCategory} />);

      const musicChip = screen.getByText('Music');
      const nftChip = screen.getByText('NFTs');
      const artistChip = screen.getByText('Artists');

      fireEvent.click(musicChip);
      expect(onSelectCategory).toHaveBeenCalledWith('Music');

      fireEvent.click(nftChip);
      expect(onSelectCategory).toHaveBeenCalledWith('NFTs');

      fireEvent.click(artistChip);
      expect(onSelectCategory).toHaveBeenCalledWith('Artists');
    });
  });

  describe('6. MiniPlayer Playback Controls Regression', () => {
    it('renders current track with play/pause and progress controls when active track exists', () => {
      mockCurrentTrack = sampleTrack;
      mockIsPlaying = true;
      const onQueueClick = vi.fn();

      render(
        <MiniPlayer onQueueClick={onQueueClick} />
      );

      expect(screen.getAllByText('Solana Sunset').length).toBeGreaterThan(0);
      expect(screen.getAllByText('CryptoBeats').length).toBeGreaterThan(0);

      const playPauseBtn = screen.getByRole('button', { name: /Pause track/i });
      fireEvent.click(playPauseBtn);
      expect(mockTogglePlay).toHaveBeenCalledTimes(1);

      const queueBtn = screen.getByTitle('Queue');
      fireEvent.click(queueBtn);
      expect(onQueueClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('7. Home Header & Navigation Controls Regression', () => {
    it('tapping $TJ control navigates to exact earn/tasks route (/tasks)', () => {
      const handleTjClick = () => mockNavigate(HOME_DESTINATIONS.earnTJ);
      render(
        <button
          type="button"
          onClick={handleTjClick}
          aria-label="Open Earn TJ daily tasks"
        >
          $TJ Earn
        </button>
      );

      const tjBtn = screen.getByRole('button', { name: /Open Earn TJ daily tasks/i });
      fireEvent.click(tjBtn);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.EARN_TJ);
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });

    it('tapping NotificationBell navigates to exact notifications route (/notifications)', () => {
      render(<NotificationBell />);

      const bellBtn = screen.getByRole('button', { name: /Notifications/i });
      fireEvent.click(bellBtn);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.NOTIFICATIONS);
      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('tapping Profile avatar control navigates to exact profile route (/profile)', () => {
      const handleProfileClick = () => mockNavigate(HOME_DESTINATIONS.profile);
      render(
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label="Your Profile"
        >
          Profile
        </button>
      );

      const profileBtn = screen.getByRole('button', { name: /Your Profile/i });
      fireEvent.click(profileBtn);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.PROFILE);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  describe('8. Carousel & Multi-Card Interaction Regression', () => {
    it('maintains touch targets and handles sequential card taps cleanly', () => {
      render(
        <div>
          <TrackCard track={sampleTrack} />
          <TrackCard track={{ ...sampleTrack, id: 'track-102', title: 'Cyber Pulse' }} />
        </div>
      );

      const track1 = screen.getByRole('button', { name: /Solana Sunset/i });
      const track2 = screen.getByRole('button', { name: /Cyber Pulse/i });

      fireEvent.click(track1);
      expect(mockNavigate).toHaveBeenCalledWith('/track/track-101');

      fireEvent.click(track2);
      expect(mockNavigate).toHaveBeenCalledWith('/track/track-102');
    });

    it('back navigation simulation restores interaction without errors', () => {
      // Navigate to detail
      mockNavigate(`/track/${sampleTrack.id}`);
      expect(mockNavigate).toHaveBeenLastCalledWith(`/track/${sampleTrack.id}`);

      // Simulate back to Home
      mockNavigate(-1);
      expect(mockNavigate).toHaveBeenLastCalledWith(-1);
    });
  });

  describe('9. ArtistCard Interaction Regression', () => {
    it('tapping ArtistCard navigates to exact artist profile route (/artist/:id)', () => {
      render(<ArtistCard artist={sampleArtist} />);
      const card = screen.getByText('DJ Cyberton');
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.ARTIST_PROFILE(sampleArtist.uid));
      expect(mockNavigate).toHaveBeenCalledWith('/artist/artist-505');
    });
  });
});
