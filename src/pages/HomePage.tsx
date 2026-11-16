import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePullToRefresh } from "@/components/home/HomePullToRefresh";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Pause, Sparkles, Compass, Disc, ChevronRight } from "lucide-react";
import { TonPriceChart } from "@/components/TonPriceChart";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { getPlaceholderImage } from "@/lib/utils";
import { TJ_COIN_ICON } from "@/constants";

// Home Sections
import { HomeGenreFilterBar } from "@/components/home/HomeGenreFilterBar";
import { MadeForYouSection } from "@/components/home/MadeForYouSection";
import { RecentlyPlayedSection } from "@/components/home/RecentlyPlayedSection";
import { TrendingMusicSection } from "@/components/home/TrendingMusicSection";
import { NewDropsSection } from "@/components/home/NewDropsSection";
import { FeaturedArtistsSection } from "@/components/home/FeaturedArtistsSection";
import { TrendingNFTMusicSection } from "@/components/home/TrendingNFTMusicSection";
import {
  HomePlaylistsSection,
  HomeCollectionsSection,
} from "@/components/home/HomePlaylistsCollectionsSection";
import { LiveSpacesSection } from "@/components/home/LiveSpacesSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { TrendingNowWidget } from "@/components/home/TrendingNowWidget";
import { RecommendedNFTTracksSection } from "@/components/home/RecommendedNFTTracksSection";
import { SponsoredBannerCarousel } from "@/components/home/SponsoredBannerCarousel";
import { RecommendedTracksSection } from "@/components/home/RecommendedTracksSection";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, togglePlay, allTracks, allNFTs, playTrack } =
    useAudio();
  const { userProfile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleRefresh = useCallback(async () => {
    window.dispatchEvent(
      new CustomEvent("tonjam:refresh-home", {
        detail: { timestamp: Date.now() },
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshKey((k) => k + 1);
  }, []);

  const userName = userProfile?.name || userProfile?.username;

  const spotlightTrack = useMemo(() => {
    if (currentTrack) return currentTrack;
    if (allTracks && allTracks.length > 0) {
      return [...allTracks].sort(
        (a, b) => (b.playCount || 0) - (a.playCount || 0)
      )[0];
    }
    return null;
  }, [currentTrack, allTracks]);

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
        <div
          key={refreshKey}
          className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pt-2"
        >
          {/* 1. UTILITY & QUICK NAVIGATION STRIP */}
          <div className="px-4 sm:px-6 lg:px-8 pt-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121824] hover:bg-[#182032] active:scale-95 transition-all text-white cursor-pointer border-0"
                  aria-label="Tasks & Rewards"
                  title="Earn TonJam Coins"
                >
                  <img
                    src={TJ_COIN_ICON}
                    alt="TJ Coin"
                    className="w-[18px] h-[18px] object-contain shrink-0"
                  />
                  <span className="text-xs font-bold text-slate-200">Tasks</span>
                </button>
                <TonPriceChart />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/marketplace")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121824] hover:bg-[#182032] active:scale-95 transition-all text-xs font-bold text-slate-200 hover:text-white cursor-pointer border-0"
                >
                  <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Marketplace</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/studio")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0088CC]/20 hover:bg-[#0088CC]/30 active:scale-95 transition-all text-xs font-bold text-[#38BDF8] hover:text-white cursor-pointer border-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Artist Studio</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. HERO GREETING & ACTIVE/SPOTLIGHT PLAYER CARD */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-default,#0D1628)] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[110px] opacity-15 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, #0088CC 0%, transparent 70%)",
                }}
              />

              <div className="space-y-1.5 relative z-10 text-left max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
                  TON Music & Collectibles
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  What’s up TON, Let’s Jam Up!
                </h1>
                <p className="text-xs sm:text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] leading-relaxed">
                  {userName
                    ? `Welcome back, ${userName} · Stream releases and collect music NFTs (${allNFTs.length} listed).`
                    : "Stream independent artists, collect verified editions, and trade Music NFTs on TON."}
                </p>
              </div>

              {spotlightTrack && (
                <div
                  onClick={() =>
                    currentTrack
                      ? togglePlay()
                      : playTrack(spotlightTrack)
                  }
                  className="relative z-10 w-full lg:w-[360px] flex items-center justify-between p-3 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] transition-all cursor-pointer select-none active:scale-[0.99] shrink-0"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      currentTrack ? togglePlay() : playTrack(spotlightTrack);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <div className="relative w-12 h-12 rounded-[var(--tj-radius-sm,6px)] overflow-hidden shrink-0 bg-[#0B0F17]">
                      <LazyArtworkImage
                        src={
                          spotlightTrack.coverUrl ||
                          getPlaceholderImage(`track-${spotlightTrack.id}`)
                        }
                        fallbackSrc={getPlaceholderImage(
                          `track-${spotlightTrack.id}`
                        )}
                        alt={spotlightTrack.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#38BDF8] block">
                        {currentTrack
                          ? isPlaying
                            ? "Now Jamming"
                            : "Resume Track"
                          : "Top Trending"}
                      </span>
                      <p className="text-sm font-bold text-white truncate">
                        {spotlightTrack.title}
                      </p>
                      <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] truncate">
                        {spotlightTrack.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/track/${spotlightTrack.id}`);
                      }}
                      className="w-9 h-9 rounded-full bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[#0B0F17] text-slate-300 hover:text-white flex items-center justify-center transition-colors border-0 cursor-pointer"
                      title="Open Track Details"
                      aria-label="Open Track Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        currentTrack ? togglePlay() : playTrack(spotlightTrack);
                      }}
                      className="w-10 h-10 rounded-full bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white flex items-center justify-center transition-transform active:scale-95 border-0 cursor-pointer shadow-none"
                      aria-label={
                        currentTrack && isPlaying ? "Pause track" : "Play track"
                      }
                    >
                      {currentTrack && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. CATEGORY FILTER CHIPS */}
          <HomeGenreFilterBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* 4. RECOMMENDED NFT TRACKS */}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <RecommendedNFTTracksSection />
          )}

          {/* 5. SPONSORED BANNER CAROUSEL */}
          {(activeCategory === "All" ||
            activeCategory === "Music" ||
            activeCategory === "NFTs") && <SponsoredBannerCarousel />}

          {/* 6. RECOMMENDED TRACKS */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <RecommendedTracksSection />
          )}

          {/* 7. MADE FOR YOU */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <MadeForYouSection />
          )}

          {/* 8. RECENTLY PLAYED */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <RecentlyPlayedSection />
          )}

          {/* 9. TRENDING ON TONJAM */}
          {(activeCategory === "All" ||
            activeCategory === "Music" ||
            activeCategory === "NFTs") && <TrendingMusicSection />}

          {/* 10. NEW RELEASES */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <NewDropsSection />
          )}

          {/* 11. POPULAR ARTISTS */}
          {(activeCategory === "All" || activeCategory === "Artists") && (
            <FeaturedArtistsSection />
          )}

          {/* 12. TRENDING MUSIC NFTS */}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <>
              <TrendingNowWidget />
              <TrendingNFTMusicSection />
            </>
          )}

          {/* 13. PLAYLISTS & COLLECTIONS */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <HomePlaylistsSection />
          )}
          {(activeCategory === "All" || activeCategory === "NFTs") && (
            <HomeCollectionsSection />
          )}

          {/* 14. LIVE SPACES */}
          {(activeCategory === "All" || activeCategory === "Music") && (
            <LiveSpacesSection />
          )}

          {/* 15. HOME FOOTER */}
          <HomeFooter />
        </div>
      </HomePullToRefresh>
    </PageLayout>
  );
};

export default HomePage;
