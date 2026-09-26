import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "./hooks/useMarketplace";
import { MarketplaceHero } from "./sections/MarketplaceHero";
import { CategoryFilters } from "./sections/CategoryFilters";
import { TrendingCollections } from "./sections/TrendingCollections";
import { FeaturedMusicNFTs } from "./sections/FeaturedMusicNFTs";
import { LiveAuctions } from "./sections/LiveAuctions";
import { RecentlyMinted } from "./sections/RecentlyMinted";
import { TopArtists } from "./sections/TopArtists";
import { TopSellers } from "./sections/TopSellers";
import { TopBuyers } from "./sections/TopBuyers";
import { MarketplaceStatistics } from "./sections/MarketplaceStatistics";
import { RecentSales } from "./sections/RecentSales";
import { DiscoverGenres } from "./sections/DiscoverGenres";
import { FloorPriceHistoryTracker } from "@/components/marketplace/FloorPriceHistoryTracker";
import { MarketTrendsChart } from "@/components/MarketTrendsChart";
import { EmptyState } from "./components/EmptyStates";
import { 
  HeroSkeleton, 
  CardGridSkeleton, 
  CarouselSkeleton, 
  LeaderboardSkeleton 
} from "./components/Skeletons";
import BidModal from "@/components/BidModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ArrowUpRight, Sparkles } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAudio();
  const {
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    isLoading,
    isOffline,
    isWalletConnected,
    filteredNFTs,
    featuredNFT,
    liveAuctions,
    trendingCollections,
    topArtists,
    topSellers,
    topBuyers,
    recentSales,
    analyticsStats,
    genreCategories,
    handleResetFilters
  } = useMarketplace();

  // Active BidModal state
  const [biddingNFT, setBiddingNFT] = useState<any | null>(null);

  // Filters categories list
  const filterCategories = [
    "All", "Live Auctions", "Buy Now", "Newly Minted", "Verified Artists", 
    "Music NFTs", "Albums", "Singles", "Collections", 
    "Trending", "Highest Volume", "Free Mint"
  ];

  const handleSelectNFT = (nft: any) => {
    navigate(`/nft/${nft.id}`);
  };

  const handleSelectCollection = (col: any) => {
    navigate(`/album/${col.id}`);
  };

  const handleSelectArtist = (art: any) => {
    navigate(`/artist/${art.id}`);
  };

  const handleSelectBuyer = (buyer: any) => {
    navigate(`/user/${buyer.id}`);
  };

  const handleOpenBid = (auc: any) => {
    setBiddingNFT(auc.nft);
  };

  const handleConnectWallet = () => {
    navigate("/wallet");
  };

  // Render Skeletons when Loading
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-[#F5F7FA] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-6 select-none font-sans pb-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1 text-left">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#F5F7FA] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0088CC]" />
              TonJam Marketplace
            </h1>
            <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
              Decentralized Web3 audio collectibles on TON
            </p>
          </div>
        </div>

        <HeroSkeleton />
        <div className="space-y-3">
          <div className="h-5 w-40 bg-white/5 rounded-[4px] animate-pulse" />
          <CarouselSkeleton />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-40 bg-white/5 rounded-[4px] animate-pulse" />
          <CardGridSkeleton />
        </div>
      </div>
    );
  }

  // Render Offline State
  if (isOffline) {
    return (
      <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center px-4 py-8">
        <EmptyState type="offline" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#F5F7FA] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto select-none font-sans pb-28 text-left">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 mb-5">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#F5F7FA] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0088CC]" />
            TonJam NFT Marketplace
          </h1>
          <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
            Trading digital collectibles of master audio recordings on TON
          </p>
        </div>

        {/* Flat Compact Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
          <Input
            type="text"
            id="marketplace-search-input"
            aria-label="Search music and creators in marketplace"
            placeholder="Search music, creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0A0A] hover:bg-[#101010] border-white/12 text-xs font-normal pl-9 pr-4 py-1.5 rounded-[6px] text-[#F5F7FA] focus:border-[#0088CC] focus:ring-0 transition-colors"
          />
        </div>
      </div>

      {/* Main Grid Content & Modules */}
      <div className="space-y-8">
        
        {/* 1. Marketplace Hero (Featured Launch) */}
        {!searchTerm && (
          <MarketplaceHero
            featuredNFT={featuredNFT}
            onOpenDetails={handleSelectNFT}
            onMintSuccess={() => {
              if (addNotification) {
                addNotification(
                  "Summer Anthem digital audio is stored in your personal Web3 collection.",
                  "success"
                );
              }
            }}
          />
        )}

        {/* 2. Category Filters (Interactive Horizontal Scroll Chips) */}
        <CategoryFilters
          categories={filterCategories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* Condition Grid: If no matching items, show Empty State */}
        {filteredNFTs.length === 0 ? (
          <EmptyState 
            type="no_nfts" 
            searchTerm={searchTerm} 
            onRetry={handleResetFilters} 
          />
        ) : (
          <>
            {/* 3. Trending Collections (Carousel) */}
            {trendingCollections.length > 0 && !searchTerm && (
              <TrendingCollections
                collections={trendingCollections}
                onSelectCollection={handleSelectCollection}
              />
            )}

            {/* 4. Featured Music NFTs (Primary slider of currently filtered tracks) */}
            <FeaturedMusicNFTs
              nfts={filteredNFTs}
              title={activeCategory === "All" ? "Featured Music NFTs" : `${activeCategory} List`}
              subtitle={`Curated selections matching your "${activeCategory}" filter`}
            />

            {/* 5. Live Auctions (Interactive Countdown bidding) */}
            {liveAuctions.length > 0 && (
              <LiveAuctions
                auctions={liveAuctions.slice(0, 8)}
                onPlaceBid={handleOpenBid}
                onSelectNFT={handleSelectNFT}
              />
            )}

            {/* 6. Recently Minted Tracks */}
            {!searchTerm && (
              <RecentlyMinted nfts={filteredNFTs.slice(0, 8)} />
            )}

            {/* 7. Top Verified Artists */}
            {topArtists.length > 0 && !searchTerm && (
              <TopArtists
                artists={topArtists.slice(0, 10)}
                onSelectArtist={handleSelectArtist}
              />
            )}

            {/* 8. Top Sellers Leaderboard */}
            {topSellers.length > 0 && !searchTerm && (
              <TopSellers
                sellers={topSellers}
                onSelectSeller={handleSelectArtist}
              />
            )}

            {/* 9. Top Buyers/Collectors Leaderboard */}
            {topBuyers.length > 0 && !searchTerm && (
              <TopBuyers
                buyers={topBuyers}
                onSelectBuyer={handleSelectBuyer}
              />
            )}

            {/* 10. Floor Price History Tracker */}
            {!searchTerm && (
              <FloorPriceHistoryTracker collections={trendingCollections as any} />
            )}

            {/* Market Trends Visualization */}
            {!searchTerm && (
              <MarketTrendsChart />
            )}

            {/* 11. Marketplace Analytics & Stats */}
            {!searchTerm && (
              <MarketplaceStatistics stats={analyticsStats} />
            )}

            {/* 11. Recent Sales Live Timeline */}
            {recentSales.length > 0 && !searchTerm && (
              <RecentSales
                sales={recentSales}
                onSelectNFT={(nftId) => navigate(`/nft/${nftId}`)}
              />
            )}

            {/* 12. Discover Genres Board */}
            {!searchTerm && (
              <DiscoverGenres
                genres={genreCategories}
                onSelectGenre={(gen) => {
                  setActiveCategory("Music NFTs");
                  setSearchTerm(gen.name);
                }}
              />
            )}
          </>
        )}

        {/* Footer spacer */}
        <div className="h-10" />
      </div>

      {/* Bid Modal Integration */}
      {biddingNFT && (
        <BidModal
          nft={biddingNFT}
          onClose={() => setBiddingNFT(null)}
          onBidPlaced={() => {
            setBiddingNFT(null);
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
