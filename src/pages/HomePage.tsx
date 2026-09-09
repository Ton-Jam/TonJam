import React, { Suspense, lazy } from "react";
import { HomeSectionSkeleton } from "@/components/home/HomeSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";

// Core immediate components
import { HomeHero } from "@/components/home/HomeHero";
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
import { SponsoredPromoCarousel } from "@/components/home/SponsoredPromoCarousel";
import { ContinueListeningSection } from "@/components/home/ContinueListeningSection";

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

export const HomePage: React.FC = () => {
  return (
    <PageLayout 
      animate={true} 
      maxWidth="full"
      noPadding={true}
      className="bg-black relative selection:bg-primary/30 select-none overflow-x-clip"
      containerClassName="w-full space-y-6 sm:space-y-8 pb-32 sm:pb-36"
      topSpacing="none"
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
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
        <MoodAlignmentSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 8. New Drops */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
        <NewDropsSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 9. Trending Music */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
        <TrendingMusicSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 10. Top Trending Songs */}
      <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={5} />}>
        <TopTrendingSongsSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 11. Featured Artists */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
        <FeaturedArtistsSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 12. Trending Artists Leaderboard */}
      <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={5} />}>
        <TrendingArtistsLeaderboardSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 13. Trending NFT Music */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
        <TrendingNFTMusicSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 14. NFT Explorer */}
      <Suspense fallback={<HomeSectionSkeleton type="banner" />}>
        <NFTExplorerSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 15. Top Marketplace Picks */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
        <MarketplacePicksSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 16. Live Audio Spaces */}
      <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={3} />}>
        <LiveSpacesSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 17. Recommended For You */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={5} />}>
        <RecommendedForYouSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 18. Favorite Artist Updates */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
        <FavoriteArtistUpdatesSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 19. Community Activity */}
      <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={4} />}>
        <CommunityActivitySection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 20. Earn TJ */}
      <Suspense fallback={<HomeSectionSkeleton type="banner" />}>
        <EarnTJSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 21. Web3 Music News */}
      <Suspense fallback={<HomeSectionSkeleton type="vertical-rows" count={3} />}>
        <Web3NewsSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 22. Recently Minted NFTs */}
      <Suspense fallback={<HomeSectionSkeleton type="horizontal-cards" count={4} />}>
        <RecentlyMintedSection />
      </Suspense>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent my-2 sm:my-3" />

      {/* 23. Home Footer */}
      <Suspense fallback={null}>
        <HomeFooter />
      </Suspense>
    </PageLayout>
  );
};

export default HomePage;
