import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NFTPriceCard } from '@/components/nft/NFTPriceCard';
import TrackDetail from '@/pages/TrackDetail';
import NFTDetail from '@/pages/NFTDetail';
import HomePage from '@/pages/HomePage';
import MarketplacePage from '@/pages/Marketplace';
import { NFTItem, Track } from '@/types';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver as any;

const mockNavigate = vi.fn();
let mockRouteParams: Record<string, string> = { id: 'track-1' };
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  useParams: () => mockRouteParams,
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockPlayTrack = vi.fn();
const mockTogglePlay = vi.fn();
const mockToggleFollowUser = vi.fn();
const mockToggleLikeTrack = vi.fn();
const mockAddNotification = vi.fn();
const mockMintNFT = vi.fn();
const mockUpdateNFT = vi.fn();

const sampleTrack: Track = {
  id: 'track-1',
  songId: 'song-1',
  title: 'Midnight TON',
  artist: 'Aria Nova',
  artistId: 'artist-1',
  artistVerified: false,
  coverUrl: 'https://example.com/track.jpg',
  audioUrl: 'https://example.com/track.mp3',
  duration: 215,
  genre: 'Electronic',
  bpm: 124,
  key: 'F# min',
  isNFT: true,
  price: '2.5',
  minted: 3,
  editions: '25',
  playCount: 420,
  createdAt: '2026-02-01',
};

const sampleNFT: NFTItem = {
  id: 'nft-1',
  trackId: 'track-1',
  title: 'Midnight TON Edition',
  creator: 'Aria Nova',
  artist: 'Aria Nova',
  artistId: 'artist-1',
  artistVerified: false,
  owner: 'UQ_OWNER_ADDR',
  price: '2.5 TON',
  imageUrl: 'https://example.com/nft.jpg',
  audioUrl: 'https://example.com/track.mp3',
  edition: '1/25',
  supply: 25,
  listingType: 'fixed',
  offers: [],
  history: [],
};

let mockFollowedUserIds: string[] = [];

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    playTrack: mockPlayTrack,
    togglePlay: mockTogglePlay,
    jamTrack: vi.fn(),
    purchaseTrack: vi.fn(),
    mintNFT: mockMintNFT,
    currentTrack: sampleTrack,
    isPlaying: false,
    allTracks: [sampleTrack],
    allNFTs: [sampleNFT],
    artists: [
      {
        uid: 'artist-1',
        name: 'Aria Nova',
        verified: false,
        followers: 120,
        monthlyListeners: 550,
        walletAddress: 'UQ_ARTIST_WALLET',
      },
    ],
    collections: [],
    transactions: [],
    playlists: [],
    likedTrackIds: [],
    followedUserIds: mockFollowedUserIds,
    toggleLikeTrack: mockToggleLikeTrack,
    toggleFollowUser: mockToggleFollowUser,
    addNotification: mockAddNotification,
    setTrackToAddToPlaylist: vi.fn(),
    setOptionsTrack: vi.fn(),
    setFullPlayerOpen: vi.fn(),
    userProfile: { uid: 'user-99', walletAddress: 'UQ_COLLECTOR_ADDR', name: 'Listener' },
    setUserProfile: vi.fn(),
    updateNFT: mockUpdateNFT,
    isTrackCached: vi.fn().mockResolvedValue(false),
    downloadTrackForOffline: vi.fn(),
    deleteCachedTrack: vi.fn(),
    isAudioLoading: false,
    queue: [],
    recentlyPlayed: [],
  }),
  useUserRole: () => ({ role: 'listener', isArtist: false }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    userProfile: { uid: 'user-99', name: 'Listener', username: 'listener' },
  }),
}));

vi.mock('@/contexts/TonPriceContext', () => ({
  useTonPrice: () => ({
    price: 8.0,
    loading: false,
    error: null,
    lastUpdated: new Date(),
  }),
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    unreadCount: 0,
    priceAlerts: [],
    addPriceAlert: vi.fn(),
    removePriceAlert: vi.fn(),
    simulatePriceDrop: vi.fn(),
  }),
}));

vi.mock('@/contexts/ModalContext', () => ({
  useModal: () => ({ openModal: vi.fn() }),
}));

vi.mock('@/components/layout/ModalProvider', () => ({
  useModal: () => ({ openModal: vi.fn() }),
}));

vi.mock('@/contexts/WalletContext', () => ({
  useWallet: () => ({
    address: 'EQD__________________________________________0vo',
    isConnected: true,
    tonBalance: 14.5,
    network: 'mainnet',
    isTestnet: false,
    isMainnet: true,
    networkMismatch: false,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
  }),
  useOptionalWallet: () => ({
    address: 'EQD__________________________________________0vo',
    isConnected: true,
    tonBalance: 14.5,
    network: 'mainnet',
    isTestnet: false,
    isMainnet: true,
    networkMismatch: false,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
  }),
}));

vi.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: () => [{ connected: false, openModal: vi.fn() }],
  useTonAddress: () => 'EQD__________________________________________0vo',
  TonConnectButton: () => <button>Connect TON</button>,
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [], forEach: vi.fn() }),
    onSnapshot: vi.fn(() => vi.fn()),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    setDoc: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/hooks/useTokenGating', () => ({
  useTokenGating: () => ({ hasAccess: true, isLoading: false }),
}));

vi.mock('@/components/AudioVisualizer', () => ({
  default: () => <div data-testid="audio-visualizer" />,
}));

vi.mock('@/components/CommentsSection', () => ({
  default: () => <div data-testid="comments-section" />,
}));

vi.mock('@/components/ReactionsSection', () => ({
  default: () => <div data-testid="reactions-section" />,
}));

vi.mock('@/components/home/MadeForYouSection', () => ({ MadeForYouSection: () => <div /> }));
vi.mock('@/components/home/RecentlyPlayedSection', () => ({ RecentlyPlayedSection: () => <div /> }));
vi.mock('@/components/home/TrendingMusicSection', () => ({ TrendingMusicSection: () => <div /> }));
vi.mock('@/components/home/NewDropsSection', () => ({ NewDropsSection: () => <div /> }));
vi.mock('@/components/home/FeaturedArtistsSection', () => ({ FeaturedArtistsSection: () => <div /> }));
vi.mock('@/components/home/TrendingNFTMusicSection', () => ({ TrendingNFTMusicSection: () => <div /> }));
vi.mock('@/components/home/HomePlaylistsCollectionsSection', () => ({
  HomePlaylistsSection: () => <div />,
  HomeCollectionsSection: () => <div />,
}));
vi.mock('@/components/home/LiveSpacesSection', () => ({ LiveSpacesSection: () => <div /> }));
vi.mock('@/components/home/TrendingNowWidget', () => ({ TrendingNowWidget: () => <div /> }));
vi.mock('@/components/home/RecommendedNFTTracksSection', () => ({ RecommendedNFTTracksSection: () => <div /> }));
vi.mock('@/components/home/SponsoredBannerCarousel', () => ({ SponsoredBannerCarousel: () => <div /> }));
vi.mock('@/components/home/RecommendedTracksSection', () => ({ RecommendedTracksSection: () => <div /> }));

const mockSetSortBy = vi.fn();
const mockSetActiveCategory = vi.fn();
const mockSetActiveTab = vi.fn();
const mockSetActiveGenre = vi.fn();
const mockSetSearchTerm = vi.fn();
const mockHandleResetFilters = vi.fn();
const mockLoadMoreNFTs = vi.fn();
const mockRetryLoad = vi.fn();

let mockMarketplaceState: any = {
  activeTab: 'discover',
  setActiveTab: mockSetActiveTab,
  activeCategory: 'All',
  setActiveCategory: mockSetActiveCategory,
  activeGenre: 'All',
  setActiveGenre: mockSetActiveGenre,
  availableGenres: ['Afrobeats', 'Hip-Hop', 'Pop', 'R&B', 'Electronic', 'Amapiano', 'Gospel', 'Dancehall'],
  searchTerm: '',
  setSearchTerm: mockSetSearchTerm,
  sortBy: 'default',
  setSortBy: mockSetSortBy,
  filteredNFTs: [sampleNFT],
  paginatedNFTs: [sampleNFT],
  hasMoreNFTs: false,
  loadMoreNFTs: mockLoadMoreNFTs,
  myNFTs: [],
  allNFTs: [sampleNFT],
  featuredNFT: {
    ...sampleNFT,
    isFeatured: true,
    genre: 'Electronic',
  },
  liveAuctions: [],
  trendingCollections: [],
  recentSales: [],
  analyticsStats: {
    volumeTotal: '12.5 TON',
    volumeChange24h: '0%',
    dailySalesCount: 2,
    weeklySalesCount: 2,
    monthlySalesCount: 2,
    totalOwners: 3,
    floorPrice: '2.5 TON',
    highestSale: '10.0 TON',
  },
  genreCategories: [
    { id: 'g5', name: 'Electronic', count: '1 NFT', numericCount: 1, coverUrl: '', colorClass: '' },
  ],
  isLoading: false,
  error: null,
  retryLoad: mockRetryLoad,
  isOffline: false,
  isWalletConnected: true,
  collectionNFTCounts: {},
  likedTrackIds: [],
  toggleLikeTrack: mockToggleLikeTrack,
  handleResetFilters: mockHandleResetFilters,
};

vi.mock('@/pages/Marketplace/hooks/useMarketplace', () => ({
  useMarketplace: () => mockMarketplaceState,
}));

describe('Upgraded Screens Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFollowedUserIds = [];
    mockRouteParams = { id: 'track-1' };
  });

  it('NFTPriceCard uses live TON/USD rate and renders Stake button only once for owners', () => {
    render(
      <NFTPriceCard
        nft={sampleNFT}
        isAuction={false}
        isAuctionEnded={false}
        highestOfferPrice={0}
        isOwner={true}
        isPlacingBid={false}
        onAction={vi.fn()}
        onOffer={vi.fn()}
        onCancelListing={vi.fn()}
        onCancelBid={vi.fn()}
        onStake={vi.fn()}
        onTip={vi.fn()}
        onPriceAlert={vi.fn()}
        onShare={vi.fn()}
        onManage={vi.fn()}
        onSell={vi.fn()}
        onSend={vi.fn()}
        priceAlertEnabled={false}
        priceAlertPercent={10}
        onTogglePriceAlert={vi.fn()}
        onPercentChange={vi.fn()}
      />
    );

    expect(screen.getByText(/\$20\.00 USD/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Stake/i })).toHaveLength(1);
    expect(screen.queryByText(/\bGRAMS?\b/)).toBeNull();
  });

  it('TrackDetail renders Independent Artist when unverified, live TON/USD pricing, reactive Follow, and TON tips', () => {
    render(<TrackDetail />);

    expect(screen.getByText('Midnight TON')).toBeDefined();
    expect(screen.getByText('Independent Artist')).toBeDefined();
    expect(screen.getByText(/2\.5 TON/i)).toBeDefined();
    expect(screen.getByText(/\$20\.00/)).toBeDefined();
    expect(screen.queryByText(/\bGRAMS?\b/)).toBeNull();

    const followButtons = screen.getAllByRole('button', { name: /^Follow$/i });
    fireEvent.click(followButtons[0]);
    expect(mockToggleFollowUser).toHaveBeenCalledWith('artist-1');

    const tipButton = screen.getByRole('button', { name: /Tip artist/i });
    fireEvent.click(tipButton);
    expect(screen.getByText(/Tip Artist \(TON\)/i)).toBeDefined();
  });

  it('NFTDetail renders TonScan link, Favorite action, and opens TON tip dialog when Tip action is triggered', () => {
    mockRouteParams = { id: 'nft-1' };
    render(<NFTDetail />);

    expect(screen.getAllByText('Midnight TON Edition').length).toBeGreaterThan(0);
    expect(screen.getByText(/View on TonScan/i)).toBeDefined();

    const favBtn = screen.getAllByRole('button', { name: /Add to Favorites/i })[0];
    fireEvent.click(favBtn);
    expect(mockToggleLikeTrack).toHaveBeenCalledWith('track-1');

    const tipTrigger = screen.getByRole('button', { name: /^Tip$/i });
    fireEvent.click(tipTrigger);

    expect(screen.getByText(/Tip Aria Nova/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Send 1 TON Tip/i })).toBeDefined();
  });

  it('HomePage renders Studio and Marketplace quick actions and Spotlight track control', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('button', { name: /Marketplace/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/marketplace');

    fireEvent.click(screen.getByRole('button', { name: /Artist Studio/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/studio');

    expect(screen.getByText('Midnight TON')).toBeDefined();
  });

  it('MarketplacePage renders header, tabs, Featured NFT banner, genre pills, Sort dropdown, Mint CTA, and Reset Filters empty state', () => {
    const { rerender } = render(<MarketplacePage />);

    expect(screen.getByText('NFT Marketplace')).toBeDefined();
    expect(screen.getByText('Discover, collect and trade music NFTs.')).toBeDefined();
    expect(screen.getByText('Featured NFT')).toBeDefined();

    // Marketplace tabs
    const collectionsTab = screen.getByRole('tab', { name: /Collections/i });
    fireEvent.click(collectionsTab);
    expect(mockSetActiveTab).toHaveBeenCalledWith('collections');

    // Globally inclusive genre filter pill
    fireEvent.click(screen.getByRole('button', { name: 'Hip-Hop' }));
    expect(mockSetActiveGenre).toHaveBeenCalledWith('Hip-Hop');

    expect(screen.getAllByText('2.5 TON').length).toBeGreaterThan(0);
    expect(screen.getByText('12.5 TON')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Mint NFT/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/studio');

    const sortSelect = screen.getByLabelText(/Sort NFTs/i);
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });
    expect(mockSetSortBy).toHaveBeenCalledWith('price_asc');

    mockMarketplaceState = {
      ...mockMarketplaceState,
      searchTerm: 'NonexistentArtist',
      filteredNFTs: [],
      paginatedNFTs: [],
    };
    rerender(<MarketplacePage />);

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);
    expect(mockHandleResetFilters).toHaveBeenCalled();
  });
});
