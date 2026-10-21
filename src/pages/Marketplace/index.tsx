import React from "react";
import { Sparkles, TrendingUp, Flame, Music, Radio, ShieldCheck, Search, RefreshCw } from "lucide-react";
import { useMarketplace } from "./hooks/useMarketplace";
import { MarketplaceHero } from "./sections/MarketplaceHero";
import { CategoryFilters } from "./sections/CategoryFilters";
import { FeaturedMusicNFTs } from "./sections/FeaturedMusicNFTs";
import { LiveAuctions } from "./sections/LiveAuctions";
import { RecentlyMinted } from "./sections/RecentlyMinted";
import { MarketplaceStatistics } from "./sections/MarketplaceStatistics";
import { TrendingCollections } from "./sections/TrendingCollections";
import { TopArtists } from "./sections/TopArtists";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    filteredNFTs,
    featuredNFT,
    liveAuctions,
    trendingCollections,
    topArtists,
    allNFTs,
    analyticsStats,
    isLoading,
    isOffline,
    handleResetFilters
  } = useMarketplace();

  return (
    <div className="min-h-screen bg-[#07111F] text-white pb-32 pt-4 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Header Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            TonJam Decentralized Audio & NFT Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Music NFT Marketplace</h1>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <Input
              type="text"
              placeholder="Search tracks, artists, NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A1628] border-[#22374D] focus:border-[#00B4D8] text-white placeholder-[#8C8C8C] pl-10 pr-4 py-2 rounded-xl text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetFilters}
            className="bg-[#0A1628] border-[#22374D] text-[#C2C7CD] hover:bg-[#0F1C32] hover:text-white rounded-xl"
            title="Reset filters"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00B4D8]" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Hero Featured Drop Banner */}
      <MarketplaceHero featuredNFT={featuredNFT} onOpenDetails={() => {}} />

      {/* Marketplace Statistics Strip */}
      <MarketplaceStatistics stats={analyticsStats} />

      {/* Category Pills Filter */}
      <CategoryFilters
        categories={[
          "All",
          "Tracks",
          "Albums",
          "Artist Shares",
          "Live Auctions",
          "Newly Minted"
        ]}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Live Auctions Section */}
      {liveAuctions.length > 0 && activeCategory !== "Tracks" && activeCategory !== "Albums" && (
        <div className="my-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live Music Auctions</h2>
                <p className="text-xs text-[#8C8C8C]">Place your bids in TON before the clock runs out</p>
              </div>
            </div>
          </div>
          <LiveAuctions auctions={liveAuctions} onPlaceBid={() => {}} onSelectNFT={() => {}} />
        </div>
      )}

      {/* Trending / Filtered Music NFTs Grid */}
      <div className="my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeCategory === "All" ? "Trending Music NFTs" : `${activeCategory}`}
              </h2>
              <p className="text-xs text-[#8C8C8C]">
                {filteredNFTs.length} verified audio assets available for instant collection
              </p>
            </div>
          </div>
        </div>

        <FeaturedMusicNFTs nfts={filteredNFTs} />
      </div>

      {/* Trending Collections */}
      <div className="my-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trending Collections</h2>
              <p className="text-xs text-[#8C8C8C]">Top music albums and EP drops this week</p>
            </div>
          </div>
        </div>
        <TrendingCollections collections={trendingCollections} onSelectCollection={() => {}} />
      </div>

      {/* Top Artists */}
      <div className="my-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Top Verified Artists</h2>
              <p className="text-xs text-[#8C8C8C]">Leading creators shaping the TonJam ecosystem</p>
            </div>
          </div>
        </div>
        <TopArtists artists={topArtists} onSelectArtist={() => {}} />
      </div>

      {/* Recently Listed / Minted */}
      <div className="my-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recently Listed Music</h2>
              <p className="text-xs text-[#8C8C8C]">Fresh audio drops from the TonJam community</p>
            </div>
          </div>
        </div>
        <RecentlyMinted nfts={allNFTs.slice(0, 8)} />
      </div>
    </div>
  );
}
