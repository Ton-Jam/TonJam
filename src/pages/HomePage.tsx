import React, { useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePullToRefresh } from "@/components/home/HomePullToRefresh";

// 1. Transparent Header is provided by Layout
// 2. Greeting
import { HomeHero } from "@/components/home/HomeHero";
// 3. Category/Filter Chips
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
// 4. Made for You
import { MadeForYouSection } from "@/components/home/MadeForYouSection";
// 5. Recently Played
import { RecentlyPlayedSection } from "@/components/home/RecentlyPlayedSection";
// 6. Trending on TonJam
import { TrendingMusicSection } from "@/components/home/TrendingMusicSection";
// 7. New Releases
import { NewDropsSection } from "@/components/home/NewDropsSection";
// 8. Popular Artists
import { FeaturedArtistsSection } from "@/components/home/FeaturedArtistsSection";
// 9. Trending Music NFTs
import { TrendingNFTMusicSection } from "@/components/home/TrendingNFTMusicSection";
// 10. JamSpace/Community Preview
import { LiveSpacesSection } from "@/components/home/LiveSpacesSection";

// Existing Footer
import { HomeFooter } from "@/components/home/HomeFooter";

export const HomePage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleRefresh = useCallback(async () => {
    window.dispatchEvent(
      new CustomEvent("tonjam:refresh-home", {
        detail: { timestamp: Date.now() },
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 800));
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
        <div key={refreshKey} className="w-full space-y-7 sm:space-y-9 pt-1 sm:pt-2">
          {/* Subtle ambient lighting glows */}
          <div
            className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full pointer-events-none -z-10"
            style={{ filter: "blur(100px)", transform: "translateZ(0)" }}
          />
          <div
            className="absolute top-[900px] right-0 w-[350px] h-[350px] bg-primary/5 rounded-full pointer-events-none -z-10"
            style={{ filter: "blur(100px)", transform: "translateZ(0)" }}
          />

          {/* 2. Greeting */}
          <HomeHero />

          {/* 3. Category / Filter Chips */}
          <HomeGenreFilterBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* 4. Made for You */}
          {(activeCategory === "All" || activeCategory === "Music" || activeCategory === "Playlists") && (
            <MadeForYouSection />
          )}

          {/* 5. Recently Played */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <RecentlyPlayedSection />
          )}

          {/* 6. Trending on TonJam */}
          {(activeCategory === "All" || activeCategory === "Music" || activeCategory === "NFTs") && (
            <TrendingMusicSection />
          )}

          {/* 7. New Releases */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <NewDropsSection />
          )}

          {/* 8. Popular Artists */}
          {(activeCategory === "All" || activeCategory === "Artists") && (
            <FeaturedArtistsSection />
          )}

          {/* 9. Trending Music NFTs */}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <TrendingNFTMusicSection />
          )}

          {/* 10. JamSpace / Community Preview */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <LiveSpacesSection />
          )}

          {/* Home Footer */}
          <HomeFooter />
        </div>
      </HomePullToRefresh>
    </PageLayout>
  );
};

export default HomePage;
