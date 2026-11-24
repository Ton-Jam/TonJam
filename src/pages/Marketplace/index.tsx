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
  VerifiedArtistCard,
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
import VerticalSectionListModal from "@/components/common/VerticalSectionListModal";

const CATEGORIES = [
  "All NFTs",
  "Trending",
  "New Releases",
  "Auctions",
  "Buy Now",
  "Collections",
];

const MARKETPLACE_TABS: Array<{ id: MarketplaceTab; label: string }> = [
  { id: "discover", label: "Discover" },
  { id: "collections", label: "Collections" },
  { id: "auctions", label: "Auctions" },
  { id: "my-nfts", label: "My NFTs" },
];

const BASE_SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "recent", label: "Recently Listed" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
];

const PRICE_RANGE_OPTIONS = [
  { value: "all", label: "All Prices" },
  { value: "under_5", label: "Under 5 TON" },
  { value: "5_to_25", label: "5 – 25 TON" },
  { value: "25_plus", label: "25+ TON" },
];

const EDITION_TYPE_OPTIONS = [
  { value: "all", label: "All Editions" },
  { value: "single", label: "1/1 Single" },
  { value: "limited", label: "Limited (2–100)" },
  { value: "open", label: "Open Edition" },
];

const NETWORK_OPTIONS = [
  { value: "all", label: "All Networks" },
  { value: "mainnet", label: "TON Mainnet" },
  { value: "testnet", label: "TON Testnet" },
];

function mapNFTToCard(item: MarketplaceNFT): MusicNFTData {
  const numericPrice = parseFloat(String(item.price || "0").replace(/[^\d.]/g, "")) || 0;
  const rawStatus = String(item.listingStatus || "").toLowerCase();
  const variant =
    rawStatus === "sold" || rawStatus === "ended"
      ? "sold"
      : rawStatus === "unlisted"
      ? "unlisted"
      : item.listingType === "auction"
      ? "auction"
      : numericPrice > 0
      ? "buy_now"
      : "unlisted";

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
    edition: item.edition || undefined,
    remainingEditions: item.remainingEditions,
    totalEditions: item.totalEditions || item.supply,
    genre: item.genre || "",
    imageUrl: item.imageUrl || item.coverUrl || "",
    audioUrl: item.audioUrl || "",
    status:
      variant === "sold"
        ? "Sold"
        : variant === "auction"
        ? "On Auction"
        : variant === "buy_now"
        ? "Buy Now"
        : "Unlisted",
    listingStatus: item.listingStatus,
    listingType: item.listingType,
    auctionEndTime: item.auctionEndTime,
    owner: item.owner,
    collectionName: item.collectionName,
    network: item.network,
    variant,
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
    activeCategory = "All NFTs",
    setActiveCategory,
    activeGenre = "All",
    setActiveGenre,
    availableGenres = [],
    priceRange = "all",
    setPriceRange,
    editionType = "all",
    setEditionType,
    networkFilter = "all",
    setNetworkFilter,
    searchTerm = "",
    setSearchTerm,
    sortBy = "default",
    setSortBy,
    filteredNFTs = [],
    paginatedNFTs,
    hasMoreNFTs = false,
    loadMoreNFTs,
    myNFTs = [],
    allNFTs = [],
    featuredNFT,
    featuredNFTs = [],
    trendingNFTs,
    recentlyListedNFTs,
    recommendedNFTs,
    newlyVerifiedArtists = [],
    hasAuctions: hookHasAuctions,
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
  const isAllCategory = activeCategory === "All NFTs" || activeCategory === "All";

  const hasActiveFilter =
    searchTerm.trim() !== "" ||
    !isAllCategory ||
    activeGenre !== "All" ||
    priceRange !== "all" ||
    editionType !== "all" ||
    networkFilter !== "all" ||
    sortBy !== "default";

  const discoveryNFTs: MusicNFTData[] = useMemo(
    () => (visibleSourceNFTs || []).map(mapNFTToCard),
    [visibleSourceNFTs]
  );

  const ownedNFTs: MusicNFTData[] = useMemo(
    () => (myNFTs || []).map(mapNFTToCard),
    [myNFTs]
  );

  const featuredShelfNFTs: MusicNFTData[] = useMemo(
    () =>
      ((featuredNFTs && featuredNFTs.length > 0 ? featuredNFTs : allNFTs.slice(0, 12)) || []).map(
        mapNFTToCard
      ),
    [featuredNFTs, allNFTs]
  );

  const trendingShelfNFTs: MusicNFTData[] = useMemo(
    () =>
      ((trendingNFTs && trendingNFTs.length > 0 ? trendingNFTs : allNFTs.slice(0, 12)) || []).map(
        mapNFTToCard
      ),
    [trendingNFTs, allNFTs]
  );

  const recentlyListedShelfNFTs: MusicNFTData[] = useMemo(
    () =>
      (
        (recentlyListedNFTs && recentlyListedNFTs.length > 0
          ? recentlyListedNFTs
          : allNFTs.slice(0, 12)) || []
      ).map(mapNFTToCard),
    [recentlyListedNFTs, allNFTs]
  );

  const recommendedShelfNFTs: MusicNFTData[] = useMemo(
    () =>
      (
        (recommendedNFTs && recommendedNFTs.length > 0
          ? recommendedNFTs
          : allNFTs.slice(0, 12)) || []
      ).map(mapNFTToCard),
    [recommendedNFTs, allNFTs]
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

  const hasAuctions = Boolean(
    hookHasAuctions ||
      liveAuctions.length > 0 ||
      allNFTs.some((item: MarketplaceNFT) => item.listingType === "auction")
  );

  const sortOptions = useMemo(
    () =>
      hasAuctions
        ? [...BASE_SORT_OPTIONS, { value: "ending_soon", label: "Ending Soon" }]
        : BASE_SORT_OPTIONS,
    [hasAuctions]
  );

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
    parseFloat(analyticsStats?.floorPrice?.replace(/[^\d.]/g, "") || "0") || 0;
  const floorUsd = (floorNumeric * (tonUsdRate ?? 7.5)).toFixed(2);
  const activeAuctionCount = liveAuctions.filter((a) => a.status === "active").length;

  const [selectedShelfModal, setSelectedShelfModal] = useState<{
    title: string;
    subtitle: string;
    items: MusicNFTData[];
  } | null>(null);

  const genrePills = ["All", ...(availableGenres || [])];

  const renderNFTShelf = (
    title: string,
    supportingLabel: string,
    items: MusicNFTData[],
    _onViewAll?: () => void
  ) => {
    if (!isLoading && items.length === 0) return null;

    return (
      <section className="pt-2">
        <MarketplaceSectionHeader
          title={title}
          supportingLabel={supportingLabel}
          actionText="See All"
          onAction={() =>
            setSelectedShelfModal({
              title,
              subtitle: supportingLabel,
              items,
            })
          }
        />
        {isLoading ? (
          <CarouselSkeletonList type="nft" layout="shelf" count={4} />
        ) : (
          <div className="overflow-x-auto no-scrollbar scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-4 pb-2 touch-pan-x">
            {items.map((nft) => (
              <MusicNFTCard
                key={`${title}-${nft.id}`}
                layout="shelf"
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
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-[var(--tj-color-text-primary,#F8FAFC)] pb-36 pt-1 px-0 w-full max-w-full space-y-4">
      <MarketplaceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onMintClick={() => navigate("/mint")}
      />

      {/* Marketplace KPI Strip */}
      <section
        aria-label="Marketplace statistics"
        className="px-3 sm:px-4 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5"
      >
        <div className="rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] backdrop-blur-none p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)]">
            Listed NFTs
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--tj-color-text-primary,#F8FAFC)]">
              {allNFTs.length}
            </span>
            <span className="text-[10px] text-[var(--tj-color-brand-primary,#229ED9)] font-medium truncate">
              {analyticsStats?.totalOwners ?? 0} holders
            </span>
          </div>
        </div>

        <div className="rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] backdrop-blur-none p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)]">
            Floor Price
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--tj-color-brand-primary,#229ED9)]">
              {analyticsStats?.floorPrice ?? "0.0 TON"}
            </span>
            <span className="text-[10px] font-mono tabular-nums text-[var(--tj-color-text-secondary,#A8B7CC)]">
              ≈ ${floorUsd}
            </span>
          </div>
        </div>

        <div className="rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] backdrop-blur-none p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)]">
            Active Auctions
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--tj-color-text-primary,#F8FAFC)]">
              {activeAuctionCount}
            </span>
            <span className="text-[10px] text-[var(--tj-color-state-warning,#FFC857)] font-medium">
              Live bids
            </span>
          </div>
        </div>

        <div className="rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] backdrop-blur-none p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)]">
            Sales Volume
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-[var(--tj-color-state-success,#34D399)]">
              {analyticsStats?.volumeTotal ?? "0.0 TON"}
            </span>
            <span className="text-[10px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-mono tabular-nums">
              {analyticsStats?.dailySalesCount ?? 0} trades
            </span>
          </div>
        </div>
      </section>

      {/* Primary Marketplace Tabs */}
      <nav
        aria-label="Marketplace sections"
        className="px-3 sm:px-4"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4 after:content-[''] after:shrink-0 after:w-1 touch-pan-x">
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
                  "min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-[8px] border-2 flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]",
                  isTabActive
                    ? "bg-[var(--tj-color-chip-active-background,#063C55)] border-[var(--tj-color-brand-primary,#00B4D8)] text-[var(--tj-color-text-primary,#F8FAFC)]"
                    : "bg-[var(--tj-color-surface-default,#0B1424)] border-[rgba(192,192,192,0.22)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:text-[var(--tj-color-text-primary,#F8FAFC)]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-[8px]",
                    isTabActive
                      ? "bg-[#229ED9]/20 text-[var(--tj-color-brand-primary,#229ED9)]"
                      : "bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-secondary,#A8B7CC)]"
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
        <div className="px-3 sm:px-4 w-full">
          <FeaturedDropBanner
            dropInfo={{
              id: featuredNFT.id,
              title: featuredNFT.title,
              artist: featuredNFT.artist || featuredNFT.creator || "TonJam Artist",
              artistVerified: Boolean(featuredNFT.artistVerified),
              collectionName: featuredNFT.collectionName,
              price: featuredNFT.price || "0 TON",
              edition: featuredNFT.edition,
              remainingEditions: featuredNFT.remainingEditions,
              totalEditions: featuredNFT.totalEditions || featuredNFT.supply,
              listingType: featuredNFT.listingType,
              auctionEndTime: featuredNFT.auctionEndTime,
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

      {/* Discovery Pill Row, Secondary Filter Controls & Genre Pills */}
      {(activeTab === "discover" || activeTab === "auctions") && (
        <div className="px-3 sm:px-4 space-y-2.5">
          {activeTab === "discover" && (
            <div
              aria-label="Category filters"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4 py-0.5 after:content-[''] after:shrink-0 after:w-1 touch-pan-x"
            >
              {CATEGORIES.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  active={
                    activeCategory === cat ||
                    (cat === "All NFTs" && activeCategory === "All")
                  }
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>
          )}

          {/* Secondary Filters: Genre, Price Range, Edition Type, Network, Sort By */}
          <div
            aria-label="Secondary discovery filters"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4 py-0.5 after:content-[''] after:shrink-0 after:w-1 touch-pan-x"
          >
            <div className="min-h-[38px] shrink-0 flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0B1424)] border border-[rgba(192,192,192,0.22)] rounded-[8px] px-2.5 py-1">
              <label htmlFor="marketplace-genre-select" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Genre
              </label>
              <select
                id="marketplace-genre-select"
                value={activeGenre}
                onChange={(e) => setActiveGenre?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] outline-none border-0 cursor-pointer"
              >
                <option value="All" className="bg-[#0B1424] text-white">All</option>
                {(availableGenres || []).map((g: string) => (
                  <option key={g} value={g} className="bg-[#0B1424] text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-[38px] shrink-0 flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0B1424)] border border-[rgba(192,192,192,0.22)] rounded-[8px] px-2.5 py-1">
              <label htmlFor="marketplace-price-select" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Price
              </label>
              <select
                id="marketplace-price-select"
                value={priceRange}
                onChange={(e) => setPriceRange?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] outline-none border-0 cursor-pointer"
              >
                {PRICE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0B1424] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-[38px] shrink-0 flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0B1424)] border border-[rgba(192,192,192,0.22)] rounded-[8px] px-2.5 py-1">
              <label htmlFor="marketplace-edition-select" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Edition
              </label>
              <select
                id="marketplace-edition-select"
                value={editionType}
                onChange={(e) => setEditionType?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] outline-none border-0 cursor-pointer"
              >
                {EDITION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0B1424] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-[38px] shrink-0 flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0B1424)] border border-[rgba(192,192,192,0.22)] rounded-[8px] px-2.5 py-1">
              <label htmlFor="marketplace-network-select" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Network
              </label>
              <select
                id="marketplace-network-select"
                value={networkFilter}
                onChange={(e) => setNetworkFilter?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] outline-none border-0 cursor-pointer"
              >
                {NETWORK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0B1424] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-[38px] shrink-0 flex items-center gap-1.5 bg-[var(--tj-color-surface-default,#0B1424)] border border-[rgba(192,192,192,0.22)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[8px] px-2.5 py-1 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#229ED9)] shrink-0" />
              <label htmlFor="marketplace-sort" className="sr-only">
                Sort NFTs
              </label>
              <select
                id="marketplace-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] outline-none border-0 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[var(--tj-color-surface-default,#0B1424)] text-[var(--tj-color-text-primary,#F8FAFC)]"
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
                className="min-h-[38px] shrink-0 px-3 py-1 rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-xs font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-[var(--tj-color-text-primary,#F8FAFC)] flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Globally Inclusive Edge-to-Edge Genre Pill Bar */}
          <div
            aria-label="Genre filters"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4 py-0.5 after:content-[''] after:shrink-0 after:w-1 touch-pan-x"
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
        <div className="px-3 sm:px-4">
          <EmptyState type="offline" onRetry={retryLoad} />
        </div>
      )}

      {!isOffline && error && (
        <div className="px-3 sm:px-4">
          <EmptyState type="error" errorMessage={error} onRetry={retryLoad} />
        </div>
      )}

      {/* TAB 1: DISCOVER */}
      {activeTab === "discover" && !error && (
        <>
          {/* 7 Curated Edge-to-Edge Horizontal Shelves */}
          {!hasActiveFilter && (
            <>
              {renderNFTShelf(
                "Featured Music NFTs",
                "Spotlight releases and verified editions on TON",
                featuredShelfNFTs,
                () => setActiveCategory("Featured")
              )}

              {renderNFTShelf(
                "Trending Music NFTs",
                "Most played & collected across TonJam",
                trendingShelfNFTs,
                () => setActiveCategory("Trending")
              )}

              {renderNFTShelf(
                "Recently Listed",
                "Fresh releases listed on TON",
                recentlyListedShelfNFTs,
                () => {
                  setActiveCategory("All NFTs");
                  setSortBy("recent");
                }
              )}

              {!isLoading && liveAuctions.length > 0 && (
                <section className="pt-2">
                  <MarketplaceSectionHeader
                    title="Live Auctions"
                    supportingLabel="On-chain bidding from TonJam artists"
                    actionText="See All"
                    onAction={() => setActiveTab?.("auctions")}
                  />
                  <div className="overflow-x-auto no-scrollbar scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-4 pb-2 touch-pan-x">
                    {liveAuctions.slice(0, 8).map((auction) => (
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

              {renderNFTShelf(
                "Recommended for You",
                "Curated from your listening taste and verified creators",
                recommendedShelfNFTs,
                () => setActiveCategory("Trending")
              )}

              {!isLoading && exclusiveCollections.length > 0 && (
                <section className="pt-2">
                  <MarketplaceSectionHeader
                    title="Popular Collections"
                    supportingLabel="Verified music series and album editions"
                    actionText="See All"
                    onAction={() => setActiveTab?.("collections")}
                  />
                  <div className="overflow-x-auto no-scrollbar scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-4 pb-2 touch-pan-x">
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

              {!isLoading && newlyVerifiedArtists.length > 0 && (
                <section className="pt-2">
                  <MarketplaceSectionHeader
                    title="Newly Verified Artists"
                    supportingLabel="Verified music creators minting on TON"
                    actionText="See All"
                    onAction={() =>
                      navigate("/explore/artists?title=Newly%20Verified%20Artists")
                    }
                  />
                  <div className="overflow-x-auto no-scrollbar scrollbar-none snap-x snap-mandatory flex gap-2.5 sm:gap-3 px-3 sm:px-4 pb-2 touch-pan-x">
                    {newlyVerifiedArtists.map((artist: any) => (
                      <VerifiedArtistCard
                        key={artist.id}
                        layout="shelf"
                        artist={{
                          id: artist.id,
                          name: artist.name,
                          username: artist.username,
                          avatar: artist.avatar,
                          isVerified: Boolean(artist.isVerified),
                          followersCount: artist.followersCount,
                          salesCount: artist.salesCount,
                        }}
                        onView={(a) => navigate(`/artist/${a.id}`)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Full Catalog Grid or Active Search/Filter Results */}
          <section
            aria-labelledby="discovery-grid-heading"
            className={cn(
              "space-y-3",
              !hasActiveFilter && "pt-2"
            )}
          >
            <MarketplaceSectionHeader
              title={
                hasActiveFilter
                  ? searchTerm.trim()
                    ? `Results for "${searchTerm.trim()}"`
                    : isAllCategory
                    ? "Filtered Music NFTs"
                    : activeCategory
                  : "All Music NFTs"
              }
              supportingLabel={`${filteredNFTs.length} ${
                filteredNFTs.length === 1 ? "collectible" : "collectibles"
              } available on TON`}
              actionText={hasActiveFilter ? "Clear Filters" : undefined}
              onAction={hasActiveFilter ? handleResetFilters : undefined}
            />

            {isLoading ? (
              <CarouselSkeletonList type="nft" count={4} />
            ) : discoveryNFTs.length === 0 ? (
              <div className="px-3 sm:px-4">
                <EmptyState
                  type="no_nfts"
                  searchTerm={searchTerm}
                  onRetry={hasActiveFilter ? handleResetFilters : undefined}
                />
              </div>
            ) : (
              <>
                <div className="px-3 sm:px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
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
                  <div className="px-3 sm:px-4 pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMoreNFTs}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-5 py-2 rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] cursor-pointer transition-colors"
                    >
                      <span>Load More NFTs</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#229ED9)]" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}

      {/* TAB 2: COLLECTIONS */}
      {activeTab === "collections" && !error && (
        <section aria-labelledby="collections-heading" className="space-y-3">
          <MarketplaceSectionHeader
            title="Music Collections"
            supportingLabel={`${exclusiveCollections.length} curated collections`}
          />

          {isLoading ? (
            <CarouselSkeletonList type="collection" count={4} />
          ) : exclusiveCollections.length === 0 ? (
            <div className="px-3 sm:px-4">
              <EmptyState type="no_collections" />
            </div>
          ) : (
            <div className="px-3 sm:px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
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
            title="Live Auctions"
            supportingLabel="Real-time bid status and closing schedules"
          />

          {isLoading ? (
            <CarouselSkeletonList type="nft" count={4} />
          ) : liveAuctions.length === 0 ? (
            <div className="px-3 sm:px-4">
              <EmptyState type="no_auctions" />
            </div>
          ) : (
            <div className="px-3 sm:px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
            <div className="px-3 sm:px-4">
              <EmptyState type="wallet" onConnectWallet={handleConnectWallet} />
            </div>
          ) : ownedNFTs.length === 0 ? (
            <div className="px-3 sm:px-4">
              <EmptyState type="no_nfts" searchTerm={searchTerm} />
            </div>
          ) : (
            <div className="px-3 sm:px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
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
        <section id="marketplace-recent-trades" className="pt-2 space-y-3">
          <MarketplaceSectionHeader
            title="Recent Trades"
            supportingLabel="Completed collector transfers on TonJam"
          />
          <div className="px-3 sm:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentSales.slice(0, 6).map((sale: any) => (
              <div
                key={sale.id}
                role="button"
                tabIndex={0}
                onClick={() => sale.nftId && navigate(`/nft/${sale.nftId}`)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && sale.nftId) {
                    e.preventDefault();
                    navigate(`/nft/${sale.nftId}`);
                  }
                }}
                className="p-3 rounded-[8px] border border-[rgba(192,192,192,0.22)] bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-colors flex items-center justify-between gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]"
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
                    className="w-10 h-10 rounded-[8px] object-cover shrink-0 bg-[var(--tj-color-surface-elevated,#111C30)]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
                      {sale.nftTitle}
                    </p>
                    <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                      {sale.sellerName} &rarr; {sale.buyerName}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold font-mono tabular-nums text-[var(--tj-color-state-success,#34D399)] block">
                    {sale.price}
                  </span>
                  <span className="text-[10px] text-[var(--tj-color-text-secondary,#A8B7CC)] font-mono tabular-nums">
                    {sale.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="px-3 sm:px-4 w-full pt-2">
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

      <VerticalSectionListModal
        isOpen={Boolean(selectedShelfModal)}
        onClose={() => setSelectedShelfModal(null)}
        title={selectedShelfModal?.title || ""}
        subtitle={selectedShelfModal?.subtitle}
        items={selectedShelfModal?.items || []}
        renderItem={(nft) => (
          <div className="w-[168px]">
            <MusicNFTCard
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
          </div>
        )}
      />
    </div>
  );
}
