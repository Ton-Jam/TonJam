import React, { Suspense, lazy } from "react";
import { HomeSectionSkeleton } from "@/components/home/HomeSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";

// Core immediate components
import { HomeHero } from "@/components/home/HomeHero";
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
import { SponsoredPromoCarousel } from "@/components/home/SponsoredPromoCarousel";
import { ContinueListeningSection } from "@/components/home/ContinueListeningSection";
import { TrendingFeedSection } from "@/components/home/TrendingFeedSection";
import { RecentlyPlayedSection } from "@/components/home/RecentlyPlayedSection";

// Lazy-loaded components for optimal performance & chunking
const MoodAlignmentSection = lazy(() => import("@/components/home/MoodAlignmentSection"));
const NewDropsSection = lazy(() => import("@/components/home/NewDropsSection"));
const TrendingMusicSection = lazy(() => import("@/components/home/TrendingMusicSection").then(m => ({ default: m.TrendingMusicSection })));
const TopTrendingSongsSection = lazy(() => import("@/components/home/TopTrendingSongsSection"));
const FeaturedArtistsSection = lazy(() => import("@/components/home/FeaturedArtistsSection"));
const TrendingArtistsLeaderboardSection = lazy(() => import("@/components/home/TrendingArtistsLeaderboardSection"));
const TrendingNFTMusicSection = lazy(() => import("@/components/home/TrendingNFTMusicSection"));
const NFTExplorerSection = lazy(() => import("@/components/home/NFTExplorerSection"));
const MarketplacePicksSection = lazy(() => import("@/components/home/MarketplacePicksSection"));
const LiveSpacesSection = lazy(() => import("@/components/home/LiveSpacesSection"));
const RecommendedForYouSection = lazy(() => import("@/components/home/RecommendedForYouSection"));
const FavoriteArtistUpdatesSection = lazy(() => import("@/components/home/FavoriteArtistUpdatesSection"));
const CommunityActivitySection = lazy(() => import("@/components/home/CommunityActivitySection"));
const EarnTJSection = lazy(() => import("@/components/home/EarnTJSection"));
const Web3NewsSection = lazy(() => import("@/components/home/Web3NewsSection"));
const RecentlyMintedSection = lazy(() => import("@/components/home/RecentlyMintedSection"));
const HomeFooter = lazy(() => import("@/components/home/HomeFooter"));

const Home: React.FC = () => {
  return (
    <PageLayout 
      animate={true} 
      className="bg-black relative selection:bg-primary/30 select-none"
      containerClassName="space-y-6 sm:space-y-8"
      topSpacing="default"
    >
      {/* Subtle ambient lighting glows */}
      <div 
        className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full pointer-events-none -z-10" 
        style={{ filter: 'blur(100px)', transform: 'translateZ(0)' }} 
      />
      <div 
        className="absolute top-[900px] right-0 w-[350px] h-[350px] bg-primary/5 rounded-full pointer-events-none -z-10" 
        style={{ filter: 'blur(100px)', transform: 'translateZ(0)' }} 
      />

      {/* 1. Welcome Hero with greeting and Ton price chart */}
      <HomeHero />

      {/* Genre Filter Pills (Dynamic horizontal scroll) */}
      <HomeGenreFilterBar />

        {/* 2. Sponsored promo carousel */}
        <SponsoredPromoCarousel />

        {/* 3. Continue listening */}
        <ContinueListeningSection />

        {/* 4. Trending feed */}
        <TrendingFeedSection />

        {/* Recently played */}
        <RecentlyPlayedSection />

        {/* 5. Mood alignment quick access */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
          <MoodAlignmentSection />
        </Suspense>

        {/* 6. New drops */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
          <NewDropsSection />
        </Suspense>

        {/* 7. Trending music */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
          <TrendingMusicSection />
        </Suspense>

        {/* 8. Top trending songs */}
        <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={5} />}>
          <TopTrendingSongsSection />
        </Suspense>

        {/* 9. Featured artists */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
          <FeaturedArtistsSection />
        </Suspense>

        {/* 10. Trending artists leaderboard */}
        <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={5} />}>
          <TrendingArtistsLeaderboardSection />
        </Suspense>

        {/* 11. Trending NFT music */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
          <TrendingNFTMusicSection />
        </Suspense>

        {/* 12. NFT Explorer */}
        <Suspense fallback={<HomeSectionSkeleton type="banner" />}>
          <NFTExplorerSection />
        </Suspense>

        {/* 13. Top marketplace picks */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
          <MarketplacePicksSection />
        </Suspense>

        {/* 14. Live spaces */}
        <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={3} />}>
          <LiveSpacesSection />
        </Suspense>

        {/* 15. Recommended for you */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
          <RecommendedForYouSection />
        </Suspense>

        {/* 16. Favorite artist updates */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
          <FavoriteArtistUpdatesSection />
        </Suspense>

        {/* 17. Community activity */}
        <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={4} />}>
          <CommunityActivitySection />
        </Suspense>

        {/* 18. Earn TJ */}
        <Suspense fallback={<HomeSectionSkeleton type="banner" />}>
          <EarnTJSection />
        </Suspense>

        {/* 19. Web3 music news */}
        <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={3} />}>
          <Web3NewsSection />
        </Suspense>

        {/* 20. Recently minted NFTs */}
        <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
          <RecentlyMintedSection />
        </Suspense>

        {/* 21. Footer */}
        <Suspense fallback={null}>
          <HomeFooter />
        </Suspense>
    </PageLayout>
  );
};

export default Home;
