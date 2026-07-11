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
    "All", "Music NFTs", "Albums", "Singles", "Collections", 
    "Auctions", "Fixed Price", "New", "Trending", "Highest Volume", 
    "Verified Artists", "Free Mint"
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
      <div className="w-full min-h-screen bg-[#07091E] text-white p-4 sm:p-8 space-y-8 select-none font-sans pb-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
          <div className="space-y-1 text-left">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#5B6BFF] animate-pulse" />
              TonJam Marketplace
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Premium decentralized Web3 audio trading floor
            </p>
          </div>
        </div>

        <HeroSkeleton />
        <div className="space-y-4">
          <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
          <CarouselSkeleton />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
          <CardGridSkeleton />
        </div>
      </div>
    );
  }

  // Render Offline State
  if (isOffline) {
    return (
      <div className="w-full min-h-screen bg-[#07091E] flex items-center justify-center p-4">
        <EmptyState type="offline" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#07091E] text-white p-4 sm:p-8 select-none font-sans pb-28 text-left">
      
      {/* Top Header Controls (Decoupled & Integrated) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900/60 mb-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#5B6BFF]" />
            TonJam NFT Marketplace
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Trading digital collectibles of master audio recordings on TON
          </p>
        </div>

        {/* Flat Compact Search Input inside Marketplace page to filter the 300 tracks */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search music, creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 hover:bg-zinc-900 border-zinc-900 text-xs font-semibold pl-9 pr-4 py-2 rounded-[10px] text-white focus:border-zinc-700/60 focus:ring-0 transition-colors"
          />
        </div>
      </div>

      {/* Main Grid Content & Modules */}
      <div className="space-y-10">
        
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

            {/* 10. Marketplace Analytics & Stats */}
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
