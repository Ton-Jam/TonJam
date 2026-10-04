import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePullToRefresh } from "@/components/home/HomePullToRefresh";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Pause, Sparkles, Coins, Radio } from "lucide-react";
import { TonPriceChart } from "@/components/TonPriceChart";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { getPlaceholderImage } from "@/lib/utils";

// Home Sections
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
import { MadeForYouSection } from "@/components/home/MadeForYouSection";
import { RecentlyPlayedSection } from "@/components/home/RecentlyPlayedSection";
import { TrendingMusicSection } from "@/components/home/TrendingMusicSection";
import { NewDropsSection } from "@/components/home/NewDropsSection";
import { FeaturedArtistsSection } from "@/components/home/FeaturedArtistsSection";
import { TrendingNFTMusicSection } from "@/components/home/TrendingNFTMusicSection";
import { HomePlaylistsSection, HomeCollectionsSection } from "@/components/home/HomePlaylistsCollectionsSection";
import { LiveSpacesSection } from "@/components/home/LiveSpacesSection";
import { HomeFooter } from "@/components/home/HomeFooter";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, togglePlay } = useAudio();
  const { userProfile } = useAuth();
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

  const userName = userProfile?.name || userProfile?.username;

  return (
    <PageLayout
      animate={true}
      maxWidth="full"
      noPadding={true}
      className="bg-transparent relative selection:bg-[#0088CC]/30 select-none overflow-x-clip"
      containerClassName="w-full"
      topSpacing="none"
      bottomSpacing="player"
    >
      <HomePullToRefresh onRefresh={handleRefresh}>
        <div key={refreshKey} className="w-full space-y-6 sm:space-y-8 pt-2">
          {/* 1. REFINED HEADER WITH GREETING & QUICK UTILITIES */}
          <div className="px-4 sm:px-6 lg:px-8 text-left pt-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white truncate">
                  What’s up TON, Let’s Jam Up!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal truncate">
                  {userName 
                    ? `Welcome back, ${userName} · Discover music & Music NFTs` 
                    : "Discover independent music, artists and Music NFTs on TON"}
                </p>
              </div>

              {/* Quick Actions (Tasks + Ton Price) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 transition-all text-white cursor-pointer border-none shadow-sm"
                  aria-label="Tasks & Rewards"
                  title="Earn TonJam Coins"
                >
                  <Coins className="w-3.5 h-3.5 text-[#0088CC]" />
                  <span className="text-xs font-bold text-zinc-200">Tasks</span>
                </button>
                <TonPriceChart />
              </div>
            </div>
          </div>

          {/* 2. CATEGORY / FILTER CHIPS */}
          <HomeGenreFilterBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* 3. QUICK "JUMP BACK IN" CARD (IF TRACK ACTIVE) */}
          {currentTrack && (
            <div className="px-4 sm:px-6 lg:px-8">
              <div 
                onClick={() => togglePlay()}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.99] shadow-md shadow-black/20"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePlay();
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 shadow-md">
                    <LazyArtworkImage 
                      src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
                      fallbackSrc={getPlaceholderImage(`track-${currentTrack.id}`)}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#0088CC]">
                        {isPlaying ? "Now Jamming" : "Paused"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white truncate mt-0.5">
                      {currentTrack.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-10 h-10 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0088CC]/30 transition-transform active:scale-95 border-none cursor-pointer"
                  aria-label={isPlaying ? "Pause track" : "Play track"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. MADE FOR YOU */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <MadeForYouSection />
          )}

          {/* 5. RECENTLY PLAYED */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <RecentlyPlayedSection />
          )}

          {/* 6. TRENDING ON TONJAM */}
          {(activeCategory === "All" || activeCategory === "Music" || activeCategory === "NFTs") && (
            <TrendingMusicSection />
          )}

          {/* 7. NEW RELEASES */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <NewDropsSection />
          )}

          {/* 8. POPULAR ARTISTS */}
          {(activeCategory === "All" || activeCategory === "Artists") && (
            <FeaturedArtistsSection />
          )}

          {/* 9. TRENDING MUSIC NFTS */}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <TrendingNFTMusicSection />
          )}

          {/* 10. PLAYLISTS & COLLECTIONS */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <HomePlaylistsSection />
          )}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <HomeCollectionsSection />
          )}

          {/* 11. JAMSPACE / COMMUNITY PREVIEW */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <LiveSpacesSection />
          )}

          {/* 12. HOME FOOTER */}
          <HomeFooter />
        </div>
      </HomePullToRefresh>
    </PageLayout>
  );
};

export default HomePage;
