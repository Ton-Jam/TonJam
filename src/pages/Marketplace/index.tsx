import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { useTonPrice } from "@/contexts/TonPriceContext";
import { useOptionalWallet } from "@/contexts/WalletContext";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { ArrowUpDown, RotateCcw, ChevronDown } from "lucide-react";
import {
  MarketplaceHeader,
  FilterPill,
  MusicNFTCard,
  AuctionCard,
  CollectionCard,
  FeaturedDropBanner,
  MarketplaceSectionHeader,
  MarketplaceTransparency,
  MusicNFTData,
  AuctionData,
  CollectionData,
  CarouselSkeletonList,
} from "@/components/marketplace";
import {
  QuickBuyNFTModal,
  QuickBuyNFTData,
} from "@/components/marketplace/QuickBuyNFTModal";
import { EmptyState } from "./components/EmptyStates";
import { useMarketplace } from "./hooks/useMarketplace";
import { MarketplaceNFT, MarketplaceTab } from "./types";
import { getPlaceholderImage, cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Trending",
  "New Releases",
  "Featured",
  "Music",
  "Collections",
  "Auctions",
  "Listed NFTs",
];

const MARKETPLACE_TABS: Array<{ id: MarketplaceTab; label: string }> = [
  { id: "discover", label: "Discover" },
  { id: "collections", label: "Collections" },
  { id: "auctions", label: "Auctions" },
  { id: "my-nfts", label: "My NFTs" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "trending", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "recent", label: "Newest" },
];

function mapNFTToCard(item: MarketplaceNFT): MusicNFTData {
  return {
    id: item.id,
    trackId: item.trackId,
    title: item.title || "Untitled NFT",
    artist: item.artist || item.creator || "TonJam Artist",
    artistVerified: Boolean(item.artistVerified),
    price: item.price
      ? String(item.price).includes("TON")
        ? item.price
        : `${item.price} TON`
      : "0 TON",
    edition: item.edition || "1/1",
    genre: item.genre || "",
    badge:
      item.rarity === "Legendary"
        ? "EXCLUSIVE"
        : item.rarity === "Rare"
        ? "LIMITED"
        : undefined,
    imageUrl: item.imageUrl || item.coverUrl || "",
    audioUrl: item.audioUrl || "",
    status: item.listingType === "auction" ? "On Auction" : "Listed",
    listingType: item.listingType,
    auctionEndTime: item.auctionEndTime,
    owner: item.owner,
    collectionName: item.collectionName,
  };
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const wallet = useOptionalWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { price: tonUsdRate } = useTonPrice();

  const {
    activeTab = "discover",
    setActiveTab,
    activeCategory,
    setActiveCategory,
    activeGenre = "All",
    setActiveGenre,
    availableGenres = [],
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredNFTs = [],
    paginatedNFTs,
    hasMoreNFTs = false,
    loadMoreNFTs,
    myNFTs = [],
    allNFTs = [],
    featuredNFT,
    liveAuctions: rawLiveAuctions = [],
    trendingCollections: rawCollections = [],
    recentSales = [],
    analyticsStats,
    isLoading,
    error = null,
    retryLoad,
    isOffline = false,
    isWalletConnected,
    collectionNFTCounts = {},
    likedTrackIds = [],
    toggleLikeTrack,
    handleResetFilters,
  } = useMarketplace() as any;

  const [quickBuyNFT, setQuickBuyNFT] = useState<QuickBuyNFTData | null>(null);

  const visibleSourceNFTs = paginatedNFTs ?? filteredNFTs;

  const hasActiveFilter =
    searchTerm.trim() !== "" ||
    activeCategory !== "All" ||
    activeGenre !== "All" ||
    sortBy !== "default";

  const discoveryNFTs: MusicNFTData[] = useMemo(
    () => (visibleSourceNFTs || []).map(mapNFTToCard),
    [visibleSourceNFTs]
  );

  const ownedNFTs: MusicNFTData[] = useMemo(
    () => (myNFTs || []).map(mapNFTToCard),
    [myNFTs]
  );

  const liveAuctions: AuctionData[] = useMemo(() => {
    return (rawLiveAuctions || []).map((auc: any) => ({
      id: auc.id,
      title: auc.nft.title,
      artist: auc.nft.artist || auc.nft.creator || "TonJam Artist",
      artistVerified: Boolean(auc.nft.artistVerified),
      highestBid: auc.currentBid,
      minimumNextBid: auc.minimumNextBid,
      bidsCount: auc.bidsCount,
      endTime: auc.endsAt,
      startsAt: auc.startsAt,
      status: auc.status || "active",
      imageUrl: auc.nft.imageUrl || auc.nft.coverUrl || "",
      genre: auc.nft.genre,
      recentBids: auc.recentBids,
    }));
  }, [rawLiveAuctions]);

  const exclusiveCollections: CollectionData[] = useMemo(() => {
    return (rawCollections || []).map((col: any) => {
      const dynamicTotal = collectionNFTCounts[col.id] ?? col.itemCount ?? 0;
      return {
        id: col.id,
        name: col.name,
        creator: col.creator,
        creatorVerified: Boolean(col.verified),
        itemCount: dynamicTotal,
        totalNFTs: dynamicTotal,
        imageUrl: col.imageUrl,
        floorPrice: col.floorPrice || undefined,
        volume: col.volume || undefined,
      };
    });
  }, [rawCollections, collectionNFTCounts]);

  const handlePlayPreview = (nft: MusicNFTData) => {
    const targetId = nft.trackId || nft.id;
    if (currentTrack?.id === targetId || currentTrack?.id === nft.id) {
      togglePlay();
    } else if (nft.audioUrl) {
      playTrack({
        id: targetId,
        title: nft.title,
        artist: nft.artist,
        artwork: nft.imageUrl,
        coverUrl: nft.imageUrl,
        audioUrl: nft.audioUrl,
        duration: 180,
        isNFT: true,
        price: typeof nft.price === "number" ? `${nft.price} TON` : nft.price,
      } as any);
    }
  };

  const handleToggleFavourite = (nft: MusicNFTData) => {
    if (!toggleLikeTrack) return;
    toggleLikeTrack(nft.trackId || nft.id);
  };

  const handleConnectWallet = () => {
    if (wallet?.connectWallet) {
      wallet.connectWallet();
      return;
    }
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[MarketplacePage] TON Connect modal error:", err);
      }
    }
  };

  const floorNumeric =
    parseFloat(analyticsStats.floorPrice.replace(/[^\d.]/g, "")) || 0;
  const floorUsd = (floorNumeric * (tonUsdRate ?? 7.5)).toFixed(2);
  const activeAuctionCount = liveAuctions.filter((a) => a.status === "active").length;

  const genrePills = ["All", ...(availableGenres || [])];

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-[var(--tj-color-text-primary,#FFFFFF)] pb-36 pt-1 px-0 sm:px-4 md:px-6 max-w-7xl mx-auto space-y-5">
      <MarketplaceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onMintClick={() => navigate("/studio")}
      />

      {/* Marketplace KPI Strip */}
      <section
        aria-label="Marketplace statistics"
        className="px-3 sm:px-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5"
      >
        <div className="rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)] p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
            Listed NFTs
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-white">
              {allNFTs.length}
            </span>
            <span className="text-[10px] text-[var(--tj-color-brand-primary,#00B4D8)] font-medium truncate">
              {analyticsStats.totalOwners} holders
            </span>
          </div>
        </div>

        <div className="rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)] p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
            Floor Price
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-[var(--tj-color-brand-primary,#00B4D8)]">
              {analyticsStats.floorPrice}
            </span>
            <span className="text-[10px] font-mono tabular-nums text-[var(--tj-color-text-secondary,#C2C7CD)]">
              ≈ ${floorUsd}
            </span>
          </div>
        </div>

        <div className="rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)] p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
            Active Auctions
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-white">
              {activeAuctionCount}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              Live bids
            </span>
          </div>
        </div>

        <div className="rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)] p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--tj-color-text-secondary,#C2C7CD)] uppercase tracking-wider">
            Sales Volume
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-emerald-400">
              {analyticsStats.volumeTotal}
            </span>
            <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono">
              {analyticsStats.dailySalesCount} trades
            </span>
          </div>
        </div>
      </section>

      {/* Primary Marketplace Tabs */}
      <nav
        aria-label="Marketplace sections"
        className="px-3 sm:px-0 border-b border-[var(--tj-color-border-subtle)]"
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {MARKETPLACE_TABS.map((tab) => {
            const isTabActive = activeTab === tab.id;
            const tabCount =
              tab.id === "collections"
                ? exclusiveCollections.length
                : tab.id === "auctions"
                ? liveAuctions.length
                : tab.id === "my-nfts"
                ? ownedNFTs.length
                : filteredNFTs.length;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                onClick={() => setActiveTab?.(tab.id)}
                className={cn(
                  "px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer bg-transparent border-0 border-b -mb-px flex items-center gap-1.5 outline-none",
                  isTabActive
                    ? "border-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "border-transparent text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                    isTabActive
                      ? "bg-[var(--tj-color-chip-active-background,#063C55)] text-[var(--tj-color-brand-primary,#00B4D8)]"
                      : "bg-white/5 text-[var(--tj-color-text-secondary,#C2C7CD)]"
                  )}
                >
                  {tabCount}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Featured NFT Banner (Discover tab only, hidden if none exist in Firebase) */}
      {activeTab === "discover" && featuredNFT && (
        <div className="px-3 sm:px-0">
          <FeaturedDropBanner
            dropInfo={{
              id: featuredNFT.id,
              title: featuredNFT.title,
              artist: featuredNFT.artist || featuredNFT.creator || "TonJam Artist",
              artistVerified: Boolean(featuredNFT.artistVerified),
              price: featuredNFT.price || "0 TON",
              edition: featuredNFT.edition,
              genre: featuredNFT.genre,
              imageUrl: featuredNFT.imageUrl || featuredNFT.coverUrl || "",
              hasAudio: Boolean(featuredNFT.audioUrl),
            }}
            isPlaying={
              Boolean(
                featuredNFT.audioUrl &&
                  (currentTrack?.id === featuredNFT.trackId ||
                    currentTrack?.id === featuredNFT.id) &&
                  isPlaying
              )
            }
            onPlayPreview={
              featuredNFT.audioUrl
                ? () => handlePlayPreview(mapNFTToCard(featuredNFT))
                : undefined
            }
            onExploreDrop={() => navigate(`/nft/${featuredNFT.id}`)}
          />
        </div>
      )}

      {/* Search Filters & Genre Pills */}
      {(activeTab === "discover" || activeTab === "auctions") && (
        <div className="px-3 sm:px-0 space-y-2.5">
          {activeTab === "discover" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div
                aria-label="Category filters"
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
              >
                {CATEGORIES.map((cat) => (
                  <FilterPill
                    key={cat}
                    label={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-sm,6px)] px-2.5 py-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0" />
                  <label htmlFor="marketplace-sort" className="sr-only">
                    Sort NFTs
                  </label>
                  <select
                    id="marketplace-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white outline-none border-0 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-[var(--tj-color-surface-default,#0D1628)] text-white"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1.5 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border border-[var(--tj-color-border-subtle)] text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Globally Inclusive Genre Filter Bar */}
          <div
            aria-label="Genre filters"
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
          >
            {genrePills.map((genre) => (
              <FilterPill
                key={genre}
                label={genre === "All" ? "All Genres" : genre}
                active={activeGenre === genre}
                onClick={() => setActiveGenre?.(genre)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Offline or Backend Error Banner */}
      {isOffline && (
        <div className="px-3 sm:px-0">
          <EmptyState type="offline" onRetry={retryLoad} />
        </div>
      )}

      {!isOffline && error && (
        <div className="px-3 sm:px-0">
          <EmptyState type="error" errorMessage={error} onRetry={retryLoad} />
        </div>
      )}

      {/* TAB 1: DISCOVER */}
      {activeTab === "discover" && !error && (
        <>
          <section aria-labelledby="discovery-grid-heading" className="space-y-3">
            <MarketplaceSectionHeader
              title={activeCategory === "All" ? "Discover Music NFTs" : activeCategory}
              supportingLabel={`${filteredNFTs.length} ${
                filteredNFTs.length === 1 ? "collectible" : "collectibles"
              } available on TON`}
            />

            {isLoading ? (
              <CarouselSkeletonList type="nft" count={4} />
            ) : discoveryNFTs.length === 0 ? (
              <div className="px-3 sm:px-0">
                <EmptyState
                  type="no_nfts"
                  searchTerm={searchTerm}
                  onRetry={hasActiveFilter ? handleResetFilters : undefined}
                />
              </div>
            ) : (
              <>
                <div className="px-3 sm:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {discoveryNFTs.map((nft) => (
                    <MusicNFTCard
                      key={nft.id}
                      layout="grid"
                      nft={nft}
                      isPlaying={Boolean(
                        (currentTrack?.id === nft.trackId || currentTrack?.id === nft.id) &&
                          isPlaying
                      )}
                      isFavourited={likedTrackIds.includes(nft.trackId || nft.id)}
                      onToggleFavourite={handleToggleFavourite}
                      onPlayPreview={handlePlayPreview}
                      onQuickBuy={(item) => setQuickBuyNFT(item)}
                      onCollect={(item) => setQuickBuyNFT(item)}
                      onViewNFT={(item) => navigate(`/nft/${item.id}`)}
                    />
                  ))}
                </div>

                {hasMoreNFTs && (
                  <div className="px-3 sm:px-0 pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMoreNFTs}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border border-[var(--tj-color-border-subtle)] text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-colors"
                    >
                      <span>Load More NFTs</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Compact Collections Shelf inside Discover */}
          {!isLoading && exclusiveCollections.length > 0 && (
            <section className="pt-4 border-t border-[var(--tj-color-border-subtle)]">
              <MarketplaceSectionHeader
                title="Featured Collections"
                supportingLabel="Verified music series and album editions"
                actionText="View all"
                onAction={() => setActiveTab?.("collections")}
              />
              <div className="overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-0 pb-2">
                {exclusiveCollections.slice(0, 8).map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    layout="shelf"
                    collection={collection}
                    onView={(col) => navigate(`/collections/${col.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Compact Auctions Shelf inside Discover */}
          {!isLoading && liveAuctions.length > 0 && activeCategory !== "Auctions" && (
            <section className="pt-4 border-t border-[var(--tj-color-border-subtle)]">
              <MarketplaceSectionHeader
                title="Auctions"
                supportingLabel="On-chain bidding from TonJam artists"
                actionText="View all"
                onAction={() => setActiveTab?.("auctions")}
              />
              <div className="overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-0 pb-2">
                {liveAuctions.slice(0, 6).map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    layout="shelf"
                    auction={auction}
                    onPlaceBid={(auc) => navigate(`/nft/${auc.id}`)}
                    onView={(auc) => navigate(`/nft/${auc.id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* TAB 2: COLLECTIONS */}
      {activeTab === "collections" && !error && (
        <section aria-labelledby="collections-heading" className="space-y-3">
          <MarketplaceSectionHeader
            title="Collections"
            supportingLabel={`${exclusiveCollections.length} curated collections`}
          />

          {isLoading ? (
            <CarouselSkeletonList type="collection" count={4} />
          ) : exclusiveCollections.length === 0 ? (
            <div className="px-3 sm:px-0">
              <EmptyState type="no_collections" />
            </div>
          ) : (
            <div className="px-3 sm:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {exclusiveCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  layout="grid"
                  collection={collection}
                  onView={(col) => navigate(`/collections/${col.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: AUCTIONS */}
      {activeTab === "auctions" && !error && (
        <section aria-labelledby="auctions-heading" className="space-y-3">
          <MarketplaceSectionHeader
            title="Music NFT Auctions"
            supportingLabel="Real-time bid status and closing schedules"
          />

          {isLoading ? (
            <CarouselSkeletonList type="nft" count={4} />
          ) : liveAuctions.length === 0 ? (
            <div className="px-3 sm:px-0">
              <EmptyState type="no_auctions" />
            </div>
          ) : (
            <div className="px-3 sm:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  layout="grid"
                  auction={auction}
                  onPlaceBid={(auc) => navigate(`/nft/${auc.id}`)}
                  onView={(auc) => navigate(`/nft/${auc.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: MY NFTs */}
      {activeTab === "my-nfts" && !error && (
        <section aria-labelledby="my-nfts-heading" className="space-y-3">
          <MarketplaceSectionHeader
            title="My Owned NFTs"
            supportingLabel="Verified holdings linked to your wallet or account"
          />

          {!isWalletConnected && ownedNFTs.length === 0 ? (
            <div className="px-3 sm:px-0">
              <EmptyState type="wallet" onConnectWallet={handleConnectWallet} />
            </div>
          ) : ownedNFTs.length === 0 ? (
            <div className="px-3 sm:px-0">
              <EmptyState type="no_nfts" searchTerm={searchTerm} />
            </div>
          ) : (
            <div className="px-3 sm:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {ownedNFTs.map((nft) => (
                <MusicNFTCard
                  key={nft.id}
                  layout="grid"
                  nft={nft}
                  isPlaying={Boolean(
                    (currentTrack?.id === nft.trackId || currentTrack?.id === nft.id) &&
                      isPlaying
                  )}
                  isFavourited={likedTrackIds.includes(nft.trackId || nft.id)}
                  onToggleFavourite={handleToggleFavourite}
                  onPlayPreview={handlePlayPreview}
                  onViewNFT={(item) => navigate(`/nft/${item.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recent Trades */}
      {recentSales.length > 0 && activeTab === "discover" && (
        <section className="px-3 sm:px-0 pt-4 border-t border-[var(--tj-color-border-subtle)] space-y-3">
          <MarketplaceSectionHeader
            title="Recent Trades"
            supportingLabel="Completed collector transfers on TonJam"
            className="px-0"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentSales.slice(0, 6).map((sale: any) => (
              <div
                key={sale.id}
                onClick={() => sale.nftId && navigate(`/nft/${sale.nftId}`)}
                className="p-2.5 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border border-[var(--tj-color-border-subtle)] transition-colors flex items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={
                      sale.nftCoverUrl ||
                      getPlaceholderImage(`sale-${sale.nftId || sale.id}`, 120, 120)
                    }
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(
                        `sale-${sale.nftId || sale.id}`,
                        120,
                        120
                      );
                    }}
                    alt={sale.nftTitle}
                    className="w-10 h-10 rounded-[var(--tj-radius-sm,6px)] object-cover shrink-0 bg-[var(--tj-color-bg-secondary,#0D1628)] border border-[var(--tj-color-border-subtle)]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {sale.nftTitle}
                    </p>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)] truncate">
                      {sale.sellerName} &rarr; {sale.buyerName}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-emerald-400 block">
                    {sale.price}
                  </span>
                  <span className="text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono">
                    {sale.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="px-3 sm:px-0 pt-2">
        <MarketplaceTransparency
          onConnectWallet={handleConnectWallet}
          isWalletConnected={isWalletConnected}
        />
      </div>

      <QuickBuyNFTModal
        isOpen={Boolean(quickBuyNFT)}
        onClose={() => setQuickBuyNFT(null)}
        nft={quickBuyNFT}
      />
    </div>
  );
}
