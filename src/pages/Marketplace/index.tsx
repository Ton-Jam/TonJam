import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "./hooks/useMarketplace";
import { MarketplaceHero } from "./sections/MarketplaceHero";
import { CategoryFilters } from "./sections/CategoryFilters";
import { TrendingCollections } from "./sections/TrendingCollections";
import { FeaturedMusicNFTs } from "./sections/FeaturedMusicNFTs";
import { LiveAuctions } from "./sections/LiveAuctions";
import { RecentlyMinted } from "./sections/RecentlyMinted";
import { MarketplaceStatistics } from "./sections/MarketplaceStatistics";
import { EmptyState } from "./components/EmptyStates";
import { 
  HeroSkeleton, 
  CardGridSkeleton, 
  CarouselSkeleton 
} from "./components/Skeletons";
import BidModal from "@/components/BidModal";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Wallet, X, LogOut, CheckCircle2 } from "lucide-react";
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
    walletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    filteredNFTs,
    featuredNFT,
    liveAuctions,
    trendingCollections,
    analyticsStats,
    handleResetFilters
  } = useMarketplace();

  // Active BidModal state
  const [biddingNFT, setBiddingNFT] = useState<any | null>(null);

  // TonJam Category filters matching specification
  const filterCategories = [
    "All", 
    "Tracks", 
    "Albums", 
    "Artist Shares", 
    "Live Auctions", 
    "Newly Minted", 
    "Verified Artists"
  ];

  const handleSelectNFT = (nft: any) => {
    navigate(`/nft/${nft.id}`);
  };

  const handleSelectCollection = (col: any) => {
    navigate(`/collections/${col.id}`);
  };

  const handleOpenBid = (auc: any) => {
    setBiddingNFT(auc.nft);
  };

  // Render Skeletons when Loading
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#07111F] text-[#FFFFFF] px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-6 select-none font-sans pb-36">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1 text-left">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B4D8]" />
              Music NFT Marketplace
            </h1>
            <p className="text-xs text-[#8C8C8C]">
              Discover, collect, and trade exclusive master audio NFTs on TON
            </p>
          </div>
        </div>

        <HeroSkeleton />
        <div className="space-y-3">
          <div className="h-5 w-40 bg-[#0A1628] rounded-lg animate-pulse" />
          <CarouselSkeleton />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-40 bg-[#0A1628] rounded-lg animate-pulse" />
          <CardGridSkeleton />
        </div>
      </div>
    );
  }

  // Render Offline State
  if (isOffline) {
    return (
      <div className="w-full min-h-screen bg-[#07111F] flex items-center justify-center px-4 py-8">
        <EmptyState type="offline" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#07111F] text-[#FFFFFF] px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto select-none font-sans pb-36 text-left">
      
      {/* 1. Header Section: Title, Subtitle, Real Wallet Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00B4D8]" />
            Music NFT Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8C8C] max-w-lg">
            Discover, collect, and trade exclusive master audio NFTs on TON
          </p>
        </div>

        {/* Real TON Wallet Indicator */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          {isWalletConnected ? (
            <div className="flex items-center gap-2 bg-[#0A1628] border border-[#22374D] rounded-xl px-3 py-1.5 text-xs text-[#FFFFFF]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-semibold text-[#00B4D8]">
                {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "TON Connected"}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                title="Disconnect TON wallet"
                className="ml-1 p-1 rounded-md text-[#8C8C8C] hover:text-rose-400 hover:bg-[#0F1C32] transition-colors focus:outline-none cursor-pointer"
                aria-label="Disconnect wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={connectWallet}
              className="bg-[#00B4D8] hover:bg-[#009CC0] text-[#07111F] font-bold rounded-xl text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm shadow-[#00B4D8]/20 transition-all cursor-pointer border-none"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Search Field: 12px radius, subtle #22374D border, #0A1628 surface */}
      <div className="mb-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" aria-hidden="true" />
          <input
            type="text"
            id="marketplace-search-input"
            aria-label="Search music, artists, and collections in marketplace"
            placeholder="Search by track, artist, or collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A1628] hover:bg-[#0F1C32] border border-[#22374D] text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl text-[#FFFFFF] placeholder-[#8C8C8C] focus:outline-none focus:border-[#00B4D8] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8C8C] hover:text-[#FFFFFF] focus:outline-none"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Modules */}
      <div className="space-y-8">
        
        {/* 3. Featured NFT Drop Banner */}
        {!searchTerm && featuredNFT && (
          <MarketplaceHero
            featuredNFT={featuredNFT}
            onOpenDetails={handleSelectNFT}
          />
        )}

        {/* 4. Category Filters (Interactive Horizontal Scroll 999px Pills) */}
        <CategoryFilters
          categories={filterCategories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* 5. Marketplace Statistics (When not actively searching) */}
        {!searchTerm && (
          <MarketplaceStatistics stats={analyticsStats} />
        )}

        {/* Condition Grid: If no matching items, show Empty State */}
        {filteredNFTs.length === 0 ? (
          <EmptyState 
            type="no_nfts" 
            searchTerm={searchTerm} 
            onRetry={handleResetFilters} 
          />
        ) : (
          <>
            {/* 6. Trending NFT Grid (Mobile 2-column, Desktop 3-4 column) */}
            <FeaturedMusicNFTs
              nfts={filteredNFTs}
              title={activeCategory === "All" ? "Trending Music NFTs" : `${activeCategory}`}
              subtitle={searchTerm ? `Results matching "${searchTerm}"` : `Curated audio collectibles on TON`}
            />

            {/* 7. Live Auctions (If auctions available) */}
            {liveAuctions.length > 0 && !searchTerm && (
              <LiveAuctions
                auctions={liveAuctions.slice(0, 4)}
                onPlaceBid={handleOpenBid}
                onSelectNFT={handleSelectNFT}
              />
            )}

            {/* 8. Recently Listed NFTs */}
            {!searchTerm && (
              <RecentlyMinted nfts={filteredNFTs.slice(0, 8)} />
            )}

            {/* 9. Trending Collections */}
            {trendingCollections.length > 0 && !searchTerm && (
              <TrendingCollections
                collections={trendingCollections.slice(0, 6)}
                onSelectCollection={handleSelectCollection}
              />
            )}
          </>
        )}
      </div>

      {/* Bid Modal Integration */}
      {biddingNFT && (
        <BidModal
          nft={biddingNFT}
          onClose={() => setBiddingNFT(null)}
          onBidPlaced={() => {
            setBiddingNFT(null);
            if (addNotification) {
              addNotification("Your bid has been submitted on TON.", "success");
            }
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
