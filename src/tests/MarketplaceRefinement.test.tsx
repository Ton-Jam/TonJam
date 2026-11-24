import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MusicNFTCard } from '@/components/marketplace/MusicNFTCard';
import { AuctionCard } from '@/components/marketplace/AuctionCard';
import { CollectionCard } from '@/components/marketplace/CollectionCard';
import { VerifiedArtistCard } from '@/components/marketplace/VerifiedArtistCard';
import { FeaturedDropBanner } from '@/components/marketplace/FeaturedDropBanner';
import { MarketplaceTransparency } from '@/components/marketplace/MarketplaceTransparency';
import { QuickBuyNFTModal } from '@/components/QuickBuyNFTModal';

const mockNavigate = vi.fn();
const mockBuyNFT = vi.fn();
const mockMonitorTransaction = vi.fn();
const mockPlayTrack = vi.fn();
const mockAddNotification = vi.fn();

let mockTonConnected = true;
let mockWalletAddress = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/marketplace' }),
}));

vi.mock('@/contexts/WalletContext', () => ({
  useOptionalWallet: () => ({
    address: mockTonConnected ? mockWalletAddress : null,
    isConnected: mockTonConnected,
    connectWallet: vi.fn(),
  }),
}));

vi.mock('@tonconnect/ui-react', () => ({
  useTonAddress: () => (mockTonConnected ? mockWalletAddress : ''),
  useTonConnectUI: () => [
    {
      connected: mockTonConnected,
      account: mockTonConnected ? { address: mockWalletAddress } : null,
      openModal: vi.fn(),
    },
  ],
}));

vi.mock('@/components/NotificationBell', () => ({
  default: () => <button type="button" aria-label="Notifications" data-testid="notification-bell" />,
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    currentTrack: null,
    isPlaying: false,
    playTrack: mockPlayTrack,
    togglePlay: vi.fn(),
    addNotification: mockAddNotification,
    allTracks: [],
    likedTrackIds: [],
    toggleLikeTrack: vi.fn(),
    userProfile: { uid: 'user-1', name: 'Listener', avatar: '' },
    artists: [],
    collections: [],
    transactions: [],
    allNFTs: [],
  }),
}));

vi.mock('@/contexts/TonPriceContext', () => ({
  useTonPrice: () => ({ price: 6.0 }),
}));

vi.mock('@/contexts/GramPriceContext', () => ({
  useGramPrice: () => ({
    convertPrice: (price: string | number) => `${price}`,
    gramPriceUsd: 0.005,
    fiatCurrency: 'USD',
  }),
}));

vi.mock('@/services/tonService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/tonService')>();
  return {
    ...actual,
    buyNFT: (...args: any[]) => mockBuyNFT(...args),
    monitorTransaction: (...args: any[]) => mockMonitorTransaction(...args),
  };
});

describe('NFT Marketplace UI Refinement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTonConnected = true;
  });

  it('defines 8px marketplace card radius token in src/styles/tonjam-tokens.css', () => {
    const tokensPath = path.resolve(process.cwd(), 'src/styles/tonjam-tokens.css');
    const tokensCss = fs.readFileSync(tokensPath, 'utf-8');
    expect(tokensCss).toContain('--tj-mkt-card-radius: 8px;');
  });

  it('renders MarketplaceHeader with activity shortcut, 2px silver-bordered search field, and icon-only wallet button', () => {
    const onActivityClick = vi.fn();
    const { container } = render(
      <MarketplaceHeader
        searchTerm=""
        onSearchChange={vi.fn()}
        onMintClick={vi.fn()}
        onActivityClick={onActivityClick}
      />
    );

    const searchWrapper = container.querySelector('.search-input-wrapper');
    expect(searchWrapper).not.toBeNull();
    expect(searchWrapper!.className).toContain('rounded-[8px]');
    expect(searchWrapper!.className).toContain('border-2');

    const activityBtn = screen.getByRole('button', { name: /Marketplace Activity/i });
    fireEvent.click(activityBtn);
    expect(onActivityClick).toHaveBeenCalledTimes(1);
  });

  it('renders MusicNFTCard with 8px corner radius, 2px silver border, and all 4 variants (buy_now, auction, sold, unlisted)', () => {
    const onQuickBuy = vi.fn();
    const onViewNFT = vi.fn();

    const { rerender, container } = render(
      <MusicNFTCard
        nft={{
          id: 'nft-1',
          title: 'Neon Frequencies',
          artist: 'Aether Wave',
          artistVerified: true,
          price: '12 TON',
          imageUrl: 'https://example.com/cover.jpg',
          remainingEditions: 3,
          totalEditions: 10,
          listingType: 'fixed',
          collectionName: 'Echoes',
        }}
        onQuickBuy={onQuickBuy}
        onViewNFT={onViewNFT}
      />
    );

    const card = screen.getByRole('button', { name: /View NFT: Neon Frequencies/i });
    expect(card.className).toContain('rounded-[8px]');
    expect(card.className).toContain('border-2');
    expect(card.getAttribute('data-card-variant')).toBe('buy_now');
    expect(screen.getByText('3/10 left')).toBeInTheDocument();

    const buyBtn = screen.getByRole('button', { name: /Buy Now: Neon Frequencies/i });
    fireEvent.click(buyBtn);
    expect(onQuickBuy).toHaveBeenCalledTimes(1);

    rerender(
      <MusicNFTCard
        nft={{
          id: 'nft-2',
          title: 'Midnight Echo',
          artist: 'Klara Synth',
          artistVerified: true,
          price: '24 TON',
          imageUrl: 'https://example.com/cover2.jpg',
          listingType: 'auction',
          auctionEndTime: new Date(Date.now() + 3600_000).toISOString(),
        }}
        onQuickBuy={onQuickBuy}
        onViewNFT={onViewNFT}
      />
    );
    expect(container.querySelector('[data-card-variant="auction"]')).not.toBeNull();
    const bidBtn = screen.getByRole('button', { name: /Place Bid: Midnight Echo/i });
    fireEvent.click(bidBtn);
    expect(onViewNFT).toHaveBeenCalledTimes(1);

    rerender(
      <MusicNFTCard
        nft={{
          id: 'nft-3',
          title: 'Sold Edition',
          artist: 'Mira',
          price: '18 TON',
          imageUrl: 'https://example.com/cover3.jpg',
          listingStatus: 'sold',
        }}
        onViewNFT={onViewNFT}
      />
    );
    expect(container.querySelector('[data-card-variant="sold"]')).not.toBeNull();
    expect(screen.getByText('Sold')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Details: Sold Edition/i })).toBeInTheDocument();

    rerender(
      <MusicNFTCard
        nft={{
          id: 'nft-4',
          title: 'Private Archive',
          artist: 'Taro',
          price: '0 TON',
          imageUrl: 'https://example.com/cover4.jpg',
          listingStatus: 'unlisted',
        }}
        onViewNFT={onViewNFT}
      />
    );
    expect(container.querySelector('[data-card-variant="unlisted"]')).not.toBeNull();
    expect(screen.getByText('Not Listed')).toBeInTheDocument();
  });

  it('renders AuctionCard, CollectionCard, VerifiedArtistCard, FeaturedDropBanner, and MarketplaceTransparency with 8px radii and 2px borders', () => {
    const { container: aucContainer } = render(
      <AuctionCard
        auction={{
          id: 'auc-1',
          title: 'Midnight Bassline',
          artist: 'SubZero',
          artistVerified: true,
          highestBid: '25 TON',
          minimumNextBid: '26 TON',
          bidsCount: 4,
          endTime: new Date(Date.now() + 3600_000).toISOString(),
          status: 'active',
          imageUrl: 'https://example.com/auc.jpg',
        }}
        onPlaceBid={vi.fn()}
        onView={vi.fn()}
      />
    );
    expect((aucContainer.firstElementChild as HTMLElement).className).toContain('rounded-[8px]');
    expect((aucContainer.firstElementChild as HTMLElement).className).toContain('border-2');

    const { container: colContainer } = render(
      <CollectionCard
        collection={{
          id: 'col-1',
          name: 'TON Acoustics',
          creator: 'Klara Synth',
          verified: true,
          itemCount: 8,
          imageUrl: 'https://example.com/col.jpg',
          floorPrice: '5 TON',
          volume: '120 TON',
        }}
        onView={vi.fn()}
      />
    );
    expect((colContainer.firstElementChild as HTMLElement).className).toContain('rounded-[8px]');
    expect((colContainer.firstElementChild as HTMLElement).className).toContain('border-2');

    const { container: artistContainer } = render(
      <VerifiedArtistCard
        artist={{
          id: 'artist-1',
          name: 'Klara Synth',
          username: 'klarasynth',
          avatar: 'https://example.com/avatar.jpg',
          isVerified: true,
          followersCount: 1200,
        }}
        onView={vi.fn()}
      />
    );
    expect((artistContainer.firstElementChild as HTMLElement).className).toContain('rounded-[8px]');
    expect((artistContainer.firstElementChild as HTMLElement).className).toContain('border-2');

    render(
      <FeaturedDropBanner
        dropInfo={{
          id: 'drop-1',
          title: 'Solstice Master',
          artist: 'Klara Synth',
          artistVerified: true,
          price: '18 TON',
          remainingEditions: 2,
          totalEditions: 5,
          listingType: 'auction',
          auctionEndTime: new Date(Date.now() + 7200_000).toISOString(),
          imageUrl: 'https://example.com/drop.jpg',
          hasAudio: true,
        }}
        onExploreDrop={vi.fn()}
        onPlayPreview={vi.fn()}
      />
    );
    const bannerSection = screen.getByLabelText('Featured NFT');
    expect(bannerSection.className).toContain('rounded-[8px]');
    expect(bannerSection.className).toContain('border-2');
    expect(screen.getByText(/2 of 5 left/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View NFT/i })).toBeInTheDocument();

    const { container: transContainer } = render(
      <MarketplaceTransparency onConnectWallet={vi.fn()} isWalletConnected={false} />
    );
    expect((transContainer.firstElementChild as HTMLElement).className).toContain('rounded-[8px]');
    expect((transContainer.firstElementChild as HTMLElement).className).toContain('border-2');
  });

  it('displays purchase breakdown (NFT price, 5% platform fee, network fee, total payable) and enforces on-chain confirmation before showing Transaction Successful', async () => {
    let resolveMonitor!: (val: boolean) => void;
    mockBuyNFT.mockResolvedValueOnce('tx-hash-123');
    mockMonitorTransaction.mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          resolveMonitor = resolve;
        })
    );

    render(
      <QuickBuyNFTModal
        isOpen={true}
        onClose={vi.fn()}
        nft={{
          id: 'nft-buy-1',
          title: 'Horizon Pulse',
          artist: 'Sora Audio',
          price: '10 TON',
          imageUrl: 'https://example.com/horizon.jpg',
          owner: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        }}
      />
    );

    expect(screen.getByText('NFT Price')).toBeInTheDocument();
    expect(screen.getByText('10.00 TON')).toBeInTheDocument();
    expect(screen.getByText('Platform Fee (5%)')).toBeInTheDocument();
    expect(screen.getByText('+0.50 TON')).toBeInTheDocument();
    expect(screen.getByText('Network Fee')).toBeInTheDocument();
    expect(screen.getByText('Total Payable')).toBeInTheDocument();
    expect(screen.getByText('10.55 TON')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));

    await waitFor(() => {
      expect(mockBuyNFT).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText('Transaction Successful')).toBeNull();
    expect(screen.getAllByText(/Transaction Pending/i).length).toBeGreaterThan(0);

    resolveMonitor(true);

    await waitFor(() => {
      expect(screen.getAllByText('Transaction Successful').length).toBeGreaterThan(0);
    });
  });

  it('handles Transaction Failed cleanly and shows Connect Wallet when disconnected', async () => {
    mockTonConnected = false;
    const { rerender } = render(
      <QuickBuyNFTModal
        isOpen={true}
        onClose={vi.fn()}
        nft={{
          id: 'nft-buy-2',
          title: 'Driftwave',
          artist: 'Noa',
          price: '5 TON',
          imageUrl: 'https://example.com/drift.jpg',
          owner: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        }}
      />
    );

    expect(screen.getAllByText('Connect Wallet').length).toBeGreaterThan(0);

    mockTonConnected = true;
    mockBuyNFT.mockRejectedValueOnce(new Error('User rejected wallet signature'));

    rerender(
      <QuickBuyNFTModal
        isOpen={true}
        onClose={vi.fn()}
        nft={{
          id: 'nft-buy-3',
          title: 'Driftwave II',
          artist: 'Noa',
          price: '5 TON',
          imageUrl: 'https://example.com/drift2.jpg',
          owner: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Transaction Failed').length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/User rejected wallet signature/i)).toBeInTheDocument();
  });

  it('removes sci-fi checkout jargon from BuyNFTModal and defines all 7 shelves + primary & secondary filters in MarketplacePage', () => {
    const buyModalSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/BuyNFTModal.tsx'),
      'utf-8'
    );
    expect(buyModalSrc).not.toContain('Signal_Value');
    expect(buyModalSrc).not.toContain('Relay_Premium');
    expect(buyModalSrc).not.toContain('Gas_Load');
    expect(buyModalSrc).not.toContain('Execute.Acquisition');
    expect(buyModalSrc).not.toContain('Recalibrating...');

    const mktSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/Marketplace/index.tsx'),
      'utf-8'
    );
    for (const pill of ['All NFTs', 'Trending', 'New Releases', 'Auctions', 'Buy Now', 'Collections']) {
      expect(mktSrc).toContain(`"${pill}"`);
    }
    for (const shelf of [
      'Featured Music NFTs',
      'Trending Music NFTs',
      'Recently Listed',
      'Live Auctions',
      'Recommended for You',
      'Popular Collections',
      'Newly Verified Artists',
    ]) {
      expect(mktSrc).toContain(`"${shelf}"`);
    }
    expect(mktSrc).toContain('See All');
    expect(mktSrc).toContain('marketplace-price-select');
    expect(mktSrc).toContain('marketplace-edition-select');
    expect(mktSrc).toContain('marketplace-network-select');
  });
});
