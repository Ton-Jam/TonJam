import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchResults } from '@/components/search/SearchResults';
import { Discover } from '@/pages/Discover';
import { Track } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/discover' }),
}));

vi.mock('@/hooks/use-debounce', () => ({
  default: (value: string) => value,
}));

vi.mock('@/hooks/useSearchHistory', () => ({
  useSearchHistory: () => ({
    history: [],
    saveQuery: vi.fn(),
    clearHistory: vi.fn(),
    removeQuery: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTrendingSearches', () => ({
  useTrendingSearches: () => ({
    trending: [],
    recordSearchTerm: vi.fn(),
  }),
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

vi.mock('@/components/QRScanner', () => ({
  default: () => null,
}));

vi.mock('@/components/ArtistLeaderboard', () => ({
  ArtistLeaderboard: () => <div data-testid="artist-leaderboard" />,
}));

vi.mock('@/components/FeaturedArtistCard', () => ({
  FeaturedArtistCard: () => <div data-testid="featured-artist-card" />,
}));

const sampleTrack: Track = {
  id: 'track-discover-1',
  songId: 'song-discover-1',
  title: 'Lagos Midnight',
  artist: 'Tems Wave',
  artistId: 'artist-1',
  artistVerified: true,
  coverUrl: 'https://example.com/lagos.jpg',
  audioUrl: 'https://example.com/lagos.mp3',
  duration: 185,
  genre: 'Afro-TON',
  isNFT: false,
  playCount: 120,
  likes: 18,
  createdAt: '2026-03-01',
};

const mockPlayTrack = vi.fn();
const mockToggleFollowUser = vi.fn();

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    allTracks: [sampleTrack],
    allNFTs: [],
    artists: [],
    firestoreUsers: [],
    playlists: [],
    recentlyPlayed: [],
    clearRecentlyPlayed: vi.fn(),
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    playTrack: mockPlayTrack,
    playAll: vi.fn(),
    followedUserIds: [],
    likedTrackIds: [],
    toggleLikeTrack: vi.fn(),
    toggleFollowUser: mockToggleFollowUser,
    setOptionsTrack: vi.fn(),
  }),
}));

describe('Discover Screen No Results Found Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders borderless no-results fallback with recovery actions, query suggestions, and recommended tracks', () => {
    const onClearQuery = vi.fn();
    const onSelectSuggestion = vi.fn();
    const onPlayTrack = vi.fn();

    render(
      <SearchResults
        query="nonexistent xyz"
        activeFilter="all"
        results={{
          tracks: [],
          artists: [],
          albums: [],
          playlists: [],
          nfts: [],
          users: [],
        }}
        onPlayTrack={onPlayTrack}
        followedUserIds={[]}
        onToggleFollow={vi.fn()}
        onClearQuery={onClearQuery}
        onResetFilter={vi.fn()}
        onSelectSuggestion={onSelectSuggestion}
        suggestedQueries={[
          { label: 'Afrobeats', query: 'Afro-TON' },
          { label: 'Amapiano', query: 'Amapiano' },
        ]}
        suggestedTracks={[sampleTrack]}
      />
    );

    const fallback = screen.getByTestId('discover-no-results');
    expect(fallback).toBeDefined();
    expect(screen.getByText('No results found for "nonexistent xyz"')).toBeDefined();

    // Ensure no border lines are added inside the fallback
    const allElements = [fallback, ...Array.from(fallback.querySelectorAll('*'))];
    const elementsWithBorderLine = allElements.filter((el) => {
      const cls = typeof el.className === 'string' ? el.className : '';
      return /\bborder(?:-(?:t|b|l|r|x|y|slate|white|zinc|gray|neutral|silver|\[|2))?\b/.test(cls) && !/\bborder-0\b/.test(cls);
    });
    expect(elementsWithBorderLine.length).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: /Clear Search/i }));
    expect(onClearQuery).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Browse NFT Marketplace/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/marketplace');

    fireEvent.click(screen.getByRole('button', { name: 'Afrobeats' }));
    expect(onSelectSuggestion).toHaveBeenCalledWith('Afro-TON');

    fireEvent.click(screen.getByText('Lagos Midnight'));
    expect(onPlayTrack).toHaveBeenCalledWith(sampleTrack);
  });

  it('shows category-specific no-results fallback and Show All Results action when activeFilter has zero matches but other categories match', () => {
    const onResetFilter = vi.fn();

    render(
      <SearchResults
        query="Lagos"
        activeFilter="playlists"
        results={{
          tracks: [sampleTrack],
          artists: [],
          albums: [],
          playlists: [],
          nfts: [],
          users: [],
        }}
        onPlayTrack={vi.fn()}
        followedUserIds={[]}
        onToggleFollow={vi.fn()}
        onClearQuery={vi.fn()}
        onResetFilter={onResetFilter}
      />
    );

    expect(screen.getByText('No playlists found for "Lagos"')).toBeDefined();
    const showAllBtn = screen.getByRole('button', { name: /Show All Results \(1\)/i });
    fireEvent.click(showAllBtn);
    expect(onResetFilter).toHaveBeenCalledTimes(1);
  });

  it('renders no-results fallback inside Discover screen for unmatched search and recovers on Clear Search or filter reset', () => {
    render(<Discover />);

    const searchInput = screen.getByLabelText('Search TonJam');
    fireEvent.change(searchInput, { target: { value: 'zzzzzunknown' } });

    const fallback = screen.getByTestId('discover-no-results');
    expect(fallback).toBeDefined();
    expect(screen.getByText('No results found for "zzzzzunknown"')).toBeDefined();
    expect(screen.getByText('Recommended to stream instead')).toBeDefined();

    fireEvent.click(within(fallback).getByRole('button', { name: 'Clear Search' }));
    expect(screen.queryByTestId('discover-no-results')).toBeNull();
    expect(screen.getByText('Explore All Genres')).toBeDefined();
  });

  it('recovers from empty filtered tab back to matching All results inside Discover', () => {
    render(<Discover />);

    const searchInput = screen.getByLabelText('Search TonJam');
    fireEvent.change(searchInput, { target: { value: 'Lagos' } });

    fireEvent.click(screen.getByRole('button', { name: 'Playlists' }));
    expect(screen.getByText('No playlists found for "Lagos"')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Show All Results \(1\)/i }));
    expect(screen.queryByTestId('discover-no-results')).toBeNull();
    expect(screen.getByText('Top Result')).toBeDefined();
  });
});
