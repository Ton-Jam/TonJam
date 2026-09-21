import React, { useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePullToRefresh } from "@/components/home/HomePullToRefresh";

// Home section components
import { HomeHero } from "@/components/home/HomeHero";
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
import { SponsoredPromoCarousel } from "@/components/home/SponsoredPromoCarousel";
import { ContinueListeningSection } from "@/components/home/ContinueListeningSection";
import { MoodAlignmentSection } from "@/components/home/MoodAlignmentSection";
import { NewDropsSection } from "@/components/home/NewDropsSection";
import { TrendingMusicSection } from "@/components/home/TrendingMusicSection";
import { TopTrendingSongsSection } from "@/components/home/TopTrendingSongsSection";
import { FeaturedArtistsSection } from "@/components/home/FeaturedArtistsSection";
import { TrendingArtistsLeaderboardSection } from "@/components/home/TrendingArtistsLeaderboardSection";
import { TrendingNFTMusicSection } from "@/components/home/TrendingNFTMusicSection";
import { NFTExplorerSection } from "@/components/home/NFTExplorerSection";
import { MarketplacePicksSection } from "@/components/home/MarketplacePicksSection";
import { LiveSpacesSection } from "@/components/home/LiveSpacesSection";
import { RecommendedForYouSection } from "@/components/home/RecommendedForYouSection";
import { FavoriteArtistUpdatesSection } from "@/components/home/FavoriteArtistUpdatesSection";
import { CommunityActivitySection } from "@/components/home/CommunityActivitySection";
import { EarnTJSection } from "@/components/home/EarnTJSection";
import { Web3NewsSection } from "@/components/home/Web3NewsSection";
import { RecentlyMintedSection } from "@/components/home/RecentlyMintedSection";
import { HomeFooter } from "@/components/home/HomeFooter";

export const HomePage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    // Broadcast refresh event across the app
    window.dispatchEvent(
      new CustomEvent("tonjam:refresh-home", {
        detail: { timestamp: Date.now() },
      })
    );

    // Provide a natural delay for network settling
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Force re-render of dynamic content
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <PageLayout 
      animate={true} 
      maxWidth="full"
      noPadding={true}
      className="bg-black relative selection:bg-primary/30 select-none overflow-x-clip"
      containerClassName="w-full"
      topSpacing="none"
      bottomSpacing="player"
    >
      <HomePullToRefresh onRefresh={handleRefresh}>
        <div key={refreshKey} className="w-full space-y-6 sm:space-y-8">
          {/* Subtle ambient lighting glows */}
          <div 
            className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full pointer-events-none -z-10" 
            style={{ filter: 'blur(100px)', transform: 'translateZ(0)' }} 
          />
          <div 
            className="absolute top-[900px] right-0 w-[350px] h-[350px] bg-primary/5 rounded-full pointer-events-none -z-10" 
            style={{ filter: 'blur(100px)', transform: 'translateZ(0)' }} 
          />

          {/* 1. Welcome Hero */}
          <HomeHero />

          {/* 2. Genre Filter Pills (Native CSS scroll snap carousel) */}
          <HomeGenreFilterBar />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 3. Sponsored Promo Carousel */}
          <SponsoredPromoCarousel />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 4. Continue Listening */}
          <ContinueListeningSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 5. Mood Alignment */}
          <MoodAlignmentSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 8. New Drops */}
          <NewDropsSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 9. Trending Music */}
          <TrendingMusicSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 10. Top Trending Songs */}
          <TopTrendingSongsSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 11. Featured Artists */}
          <FeaturedArtistsSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 12. Trending Artists Leaderboard */}
          <TrendingArtistsLeaderboardSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 13. Trending NFT Music */}
          <TrendingNFTMusicSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 14. NFT Explorer */}
          <NFTExplorerSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 15. Top Marketplace Picks */}
          <MarketplacePicksSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 16. Live Audio Spaces */}
          <LiveSpacesSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 17. Recommended For You */}
          <RecommendedForYouSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 18. Favorite Artist Updates */}
          <FavoriteArtistUpdatesSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 19. Community Activity */}
          <CommunityActivitySection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 20. Earn TJ */}
          <EarnTJSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 21. Web3 Music News */}
          <Web3NewsSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 22. Recently Minted NFTs */}
          <RecentlyMintedSection />

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

          {/* 23. Home Footer */}
          <HomeFooter />
        </div>
      </HomePullToRefresh>
    </PageLayout>
  );
};

export default HomePage;
