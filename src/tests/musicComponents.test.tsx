import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlbumArtwork, TrackCard, NFTCard, PlaylistCard } from '@/components/music';
import { Track, NFTItem, Playlist } from '@/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AudioContext
const mockPlayTrack = vi.fn();
const mockTogglePlay = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockOpenAddToPlaylistModal = vi.fn();

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    currentTrack: { id: 'track-active' },
    isPlaying: true,
    playTrack: mockPlayTrack,
    togglePlay: mockTogglePlay,
    likedTrackIds: ['track-liked'],
    toggleLikeTrack: mockToggleLikeTrack,
    openAddToPlaylistModal: mockOpenAddToPlaylistModal,
    allTracks: [
      { id: 't1', coverUrl: 'https://example.com/t1.jpg' },
      { id: 't2', coverUrl: 'https://example.com/t2.jpg' },
      { id: 't3', coverUrl: 'https://example.com/t3.jpg' },
      { id: 't4', coverUrl: 'https://example.com/t4.jpg' },
    ],
  }),
}));

describe('TonJam Music Components Design System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================
     1. AlbumArtwork Component Tests
     ========================================================= */
  describe('AlbumArtwork', () => {
    it('renders with default rounded shape and standard size', () => {
      render(
        <AlbumArtwork
          src="https://example.com/album.jpg"
          alt="Test Album"
          shape="rounded"
          size="standard"
        />
      );

      const artwork = screen.getByTestId('album-artwork');
      expect(artwork).toBeInTheDocument();
      expect(artwork).toHaveAttribute('data-shape', 'rounded');
      expect(artwork).toHaveAttribute('data-size', 'standard');
      expect(artwork.className).toContain('rounded-[14px]');

      const img = screen.getByAltText('Test Album');
      expect(img).toHaveAttribute('src', 'https://example.com/album.jpg');
    });

    it('renders square and circular shapes correctly', () => {
      const { rerender } = render(
        <AlbumArtwork
          src="https://example.com/album.jpg"
          alt="Square"
          shape="square"
        />
      );
      expect(screen.getByTestId('album-artwork').className).toContain('rounded-none');

      rerender(
        <AlbumArtwork
          src="https://example.com/album.jpg"
          alt="Circle"
          shape="circle"
        />
      );
      expect(screen.getByTestId('album-artwork').className).toContain('rounded-full');
    });

    it('renders featured size with ambient glow and badge', () => {
      render(
        <AlbumArtwork
          src="https://example.com/hero.jpg"
          alt="Hero"
          size="featured"
          featuredBadge={<span data-testid="test-badge">Featured Drop</span>}
        />
      );

      const artwork = screen.getByTestId('album-artwork');
      expect(artwork).toHaveAttribute('data-size', 'featured');
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });

    it('handles image error by gracefully using local fallback', () => {
      render(
        <AlbumArtwork
          src="https://example.com/invalid-image.jpg"
          alt="Broken Art"
          fallbackType="album"
        />
      );

      const img = screen.getByAltText('Broken Art');
      fireEvent.error(img);

      expect(img.getAttribute('src')).toContain('/placeholders/album-placeholder.webp');
    });

    it('renders play overlay button when showPlayOverlay is true and triggers onPlayToggle', () => {
      const handlePlay = vi.fn();
      render(
        <AlbumArtwork
          src="https://example.com/album.jpg"
          alt="Interactive"
          showPlayOverlay={true}
          onPlayToggle={handlePlay}
        />
      );

      const playBtn = screen.getByTestId('artwork-play-button');
      expect(playBtn).toBeInTheDocument();
      fireEvent.click(playBtn);
      expect(handlePlay).toHaveBeenCalledTimes(1);
    });
  });

  /* =========================================================
     2. TrackCard Component Tests
     ========================================================= */
  describe('TrackCard', () => {
    const mockTrack: Track = {
      id: 'track-1',
      songId: 'song-1',
      title: 'Midnight Echo',
      artist: 'Tiwa Savage',
      artistId: 'tiwa-savage',
      coverUrl: 'https://example.com/midnight.jpg',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 215,
      genre: 'Afrobeats',
      isNFT: true,
      price: '2.5',
      artistVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    it('renders compact horizontal variant with title, artist, verified badge, and duration', () => {
      render(
        <TrackCard
          track={mockTrack}
          variant="compact"
          showVerifiedBadge={true}
          showDuration={true}
          showGenre={true}
        />
      );

      expect(screen.getByTestId('track-card-compact')).toBeInTheDocument();
      expect(screen.getByText('Midnight Echo')).toBeInTheDocument();
      expect(screen.getByText('Tiwa Savage')).toBeInTheDocument();
      expect(screen.getByText('Afrobeats')).toBeInTheDocument();
      expect(screen.getByText('3:35')).toBeInTheDocument();
    });

    it('renders expanded grid variant with square artwork', () => {
      render(
        <TrackCard
          track={mockTrack}
          variant="expanded"
        />
      );

      expect(screen.getByTestId('track-card-expanded')).toBeInTheDocument();
      expect(screen.getByText('Midnight Echo')).toBeInTheDocument();
      expect(screen.getByText('Tiwa Savage')).toBeInTheDocument();
      expect(screen.getByText('Afrobeats')).toBeInTheDocument();
    });

    it('handles play/pause toggle when clicked', () => {
      const onPlayToggle = vi.fn();
      render(
        <TrackCard
          track={mockTrack}
          variant="compact"
          onPlayToggle={onPlayToggle}
        />
      );

      const playButton = screen.getByLabelText(/Play Midnight Echo/i);
      fireEvent.click(playButton);
      expect(onPlayToggle).toHaveBeenCalledWith(mockTrack);
    });

    it('handles like toggle when heart button is clicked', () => {
      const onLikeToggle = vi.fn();
      render(
        <TrackCard
          track={mockTrack}
          variant="compact"
          onLikeToggle={onLikeToggle}
        />
      );

      const likeBtn = screen.getByLabelText(/Like track/i);
      fireEvent.click(likeBtn);
      expect(onLikeToggle).toHaveBeenCalledWith(mockTrack);
    });

    it('displays active equalizer bars when currently playing', () => {
      const activeTrack = { ...mockTrack, id: 'track-active' };
      render(
        <TrackCard
          track={activeTrack}
          variant="compact"
          isPlaying={true}
        />
      );

      expect(screen.getByLabelText('Playing equalizer')).toBeInTheDocument();
    });
  });

  /* =========================================================
     3. Music NFTCard Component Tests
     ========================================================= */
  describe('NFTCard', () => {
    const mockNFT: NFTItem = {
      id: 'nft-101',
      trackId: 'track-1',
      title: 'Solitude Beat #1',
      owner: 'EQCollector123',
      creator: 'Tiwa Savage',
      artist: 'Tiwa Savage',
      price: '5.0',
      imageUrl: 'https://example.com/nft.jpg',
      rarity: 'Legendary',
      edition: '1 of 25',
      artistVerified: true,
    };

    it('renders sale variant with TON price, edition, and View NFT action', () => {
      render(
        <NFTCard
          nft={mockNFT}
          variant="sale"
          showRarity={true}
          showEdition={true}
        />
      );

      expect(screen.getByTestId('music-nft-card')).toBeInTheDocument();
      expect(screen.getByText('Solitude Beat #1')).toBeInTheDocument();
      expect(screen.getByText('Tiwa Savage')).toBeInTheDocument();
      expect(screen.getByText('5.0 TON')).toBeInTheDocument();
      expect(screen.getByText('1 of 25')).toBeInTheDocument();
      expect(screen.getByText('Legendary')).toBeInTheDocument();
      expect(screen.getByText('View NFT')).toBeInTheDocument();
    });

    it('renders auction variant with active auction status and Place Bid action', () => {
      render(
        <NFTCard
          nft={{ ...mockNFT, isAuction: true, startingBid: '3.5' }}
          variant="auction"
        />
      );

      expect(screen.getByText('Auction Active')).toBeInTheDocument();
      expect(screen.getByText('3.5 TON')).toBeInTheDocument();
      expect(screen.getByText('Place Bid')).toBeInTheDocument();
    });

    it('renders owned variant with Owned by you status and Manage action', () => {
      render(
        <NFTCard
          nft={mockNFT}
          variant="owned"
        />
      );

      expect(screen.getByText('Owned by you')).toBeInTheDocument();
      expect(screen.getByText('Manage')).toBeInTheDocument();
    });

    it('renders sold variant with Sold Out status and Details action', () => {
      render(
        <NFTCard
          nft={{ ...mockNFT, price: '0' }}
          variant="sold"
        />
      );

      expect(screen.getByText('Sold Out')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('toggles favorite when heart button is clicked', () => {
      const handleFavToggle = vi.fn();
      render(
        <NFTCard
          nft={mockNFT}
          onFavoriteToggle={handleFavToggle}
          isFavorite={false}
        />
      );

      const favButton = screen.getByLabelText(/Add to favorites/i);
      fireEvent.click(favButton);
      expect(handleFavToggle).toHaveBeenCalledWith(mockNFT);
    });

    it('navigates to NFT detail on card click', () => {
      render(<NFTCard nft={mockNFT} />);
      const card = screen.getByTestId('music-nft-card');
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/nft/nft-101');
    });
  });

  /* =========================================================
     4. PlaylistCard Component Tests
     ========================================================= */
  describe('PlaylistCard', () => {
    const mockPlaylist: Playlist = {
      id: 'pl-genesis',
      title: 'TonJam Essentials',
      coverUrl: 'https://example.com/playlist.jpg',
      creator: 'TonJam Curators',
      trackCount: 16,
      trackIds: ['t1', 't2', 't3', 't4'],
      isPrivate: false,
    };

    it('renders single cover artwork style with title, curator, and track count', () => {
      render(
        <PlaylistCard
          playlist={mockPlaylist}
          artworkStyle="single"
          showStatusIndicator={true}
        />
      );

      expect(screen.getByTestId('playlist-card')).toBeInTheDocument();
      expect(screen.getByText('TonJam Essentials')).toBeInTheDocument();
      expect(screen.getByText('By TonJam Curators')).toBeInTheDocument();
      expect(screen.getByText('16 tracks')).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('renders 4-artwork collage style', () => {
      render(
        <PlaylistCard
          playlist={mockPlaylist}
          artworkStyle="collage"
        />
      );

      expect(screen.getByTestId('playlist-collage')).toBeInTheDocument();
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(4);
    });

    it('renders private status indicator when isPrivate is true', () => {
      render(
        <PlaylistCard
          playlist={{ ...mockPlaylist, isPrivate: true }}
          showStatusIndicator={true}
        />
      );

      expect(screen.getByText('Private')).toBeInTheDocument();
    });

    it('triggers play action on play button click', () => {
      const handlePlayToggle = vi.fn();
      render(
        <PlaylistCard
          playlist={mockPlaylist}
          onPlayToggle={handlePlayToggle}
        />
      );

      const playButton = screen.getByTestId('playlist-play-button');
      fireEvent.click(playButton);
      expect(handlePlayToggle).toHaveBeenCalledWith(mockPlaylist);
    });
  });
});
