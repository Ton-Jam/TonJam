import React, { useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePullToRefresh } from "@/components/home/HomePullToRefresh";

// 2. Greeting
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
// 10. Playlists & Collections
import { HomePlaylistsSection, HomeCollectionsSection } from "@/components/home/HomePlaylistsCollectionsSection";
// 11. JamSpace/Community Preview
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
      className="bg-transparent relative selection:bg-primary/30 select-none overflow-x-clip"
      containerClassName="w-full"
      topSpacing="none"
      bottomSpacing="player"
    >
      <HomePullToRefresh onRefresh={handleRefresh}>
        <div key={refreshKey} className="w-full space-y-6 sm:space-y-8 pt-1 sm:pt-2">
          {/* Greeting */}
          <div className="px-4 sm:px-6 lg:px-8 text-left pt-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              What’s up TON, Let’s Jam Up!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-0.5">
              Discover music, artists and Music NFTs.
            </p>
          </div>

          {/* Category / Filter Chips */}
          <HomeGenreFilterBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Made for You */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <MadeForYouSection />
          )}

          {/* Recently Played */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <RecentlyPlayedSection />
          )}

          {/* Trending on TonJam */}
          {(activeCategory === "All" || activeCategory === "Music" || activeCategory === "NFTs") && (
            <TrendingMusicSection />
          )}

          {/* New Releases */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <NewDropsSection />
          )}

          {/* Popular Artists */}
          {(activeCategory === "All" || activeCategory === "Artists") && (
            <FeaturedArtistsSection />
          )}

          {/* Trending Music NFTs */}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <TrendingNFTMusicSection />
          )}

          {/* Playlists & Collections */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <HomePlaylistsSection />
          )}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <HomeCollectionsSection />
          )}

          {/* JamSpace / Community Preview */}
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
