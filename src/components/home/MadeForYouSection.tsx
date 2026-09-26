import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Sparkles, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { CURATED_PLAYLISTS, MOCK_TRACKS } from "@/constants";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { triggerHaptic } from "@/lib/haptics";

interface MadeForYouItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds?: string[];
  type: "playlist" | "mix";
}

export const MadeForYouSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks, currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const trackPool = useMemo(() => {
    return allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
  }, [allTracks]);

  const items: MadeForYouItem[] = useMemo(() => {
    const list: MadeForYouItem[] = [
      {
        id: "curated-1",
        title: "GRAM Top 50",
        description: "The most streamed tracks on the GRAM network this week.",
        coverUrl: "https://image.pollinations.ai/prompt/playlist%20cover%20GRAM%20Top%2050%20gold%20futuristic%20audio?width=600&height=600&nologo=true",
        trackIds: CURATED_PLAYLISTS[0]?.trackIds || ["1", "2", "3", "4"],
        type: "playlist",
      },
      {
        id: "daily-mix-1",
        title: "Daily Mix 1",
        description: "Afrobeats, energetic vibes, and modern TON rhythms.",
        coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=600&nologo=true",
        trackIds: trackPool.slice(0, 5).map((t) => t.id),
        type: "mix",
      },
      {
        id: "curated-2",
        title: "NFT Alpha",
        description: "Rare music NFTs currently trending in the marketplace.",
        coverUrl: "https://image.pollinations.ai/prompt/playlist%20cover%20NFT%20Alpha%20cyber%20crystal%20sound?width=600&height=600&nologo=true",
        trackIds: CURATED_PLAYLISTS[1]?.trackIds || ["3", "6", "8"],
        type: "playlist",
      },
      {
        id: "daily-mix-2",
        title: "Chill Frequency",
        description: "Mellow ambient, lofi, and downtempo frequencies.",
        coverUrl: "https://image.pollinations.ai/prompt/dreamy%20pink%20and%20purple%20sky%20with%20clouds%20pop%20music%20cover?width=600&height=600&nologo=true",
        trackIds: trackPool.slice(4, 9).map((t) => t.id),
        type: "mix",
      },
      {
        id: "discover-weekly",
        title: "Discover TON Weekly",
        description: "Your weekly dose of fresh underground Web3 creators.",
        coverUrl: "https://image.pollinations.ai/prompt/abstract%20triangular%20prism%20refracting%20light%20techno%20music%20art?width=600&height=600&nologo=true",
        trackIds: trackPool.slice(2, 7).map((t) => t.id),
        type: "mix",
      },
    ];
    return list;
  }, [trackPool]);

  const handleItemClick = (item: MadeForYouItem) => {
    if (item.type === "playlist") {
      navigate(`/playlist/${item.id}`);
    } else {
      // Find tracks for this mix and play the first one
      const mixTracks = (item.trackIds || [])
        .map((id) => trackPool.find((t) => t.id === id))
        .filter(Boolean) as typeof trackPool;
      if (mixTracks.length > 0) {
        playTrack(mixTracks[0]);
      }
    }
  };

  const handlePlayAffordance = (e: React.MouseEvent, item: MadeForYouItem) => {
    e.stopPropagation();
    triggerHaptic("medium");

    const mixTracks = (item.trackIds || [])
      .map((id) => trackPool.find((t) => t.id === id))
      .filter(Boolean) as typeof trackPool;

    if (mixTracks.length === 0) return;

    const isCurrentMixPlaying =
      isPlaying && currentTrack && mixTracks.some((t) => t.id === currentTrack.id);

    if (isCurrentMixPlaying) {
      togglePlay();
    } else {
      playTrack(mixTracks[0]);
    }
  };

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0088CC]" />
          <h2 className="text-section-title font-bold text-white">
            Made for You
          </h2>
        </div>
        <button
          onClick={() => navigate("/explore/playlists?title=Made+for+You")}
          className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        {...handlers}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain" }}
      >
        {items.map((item) => {
          const itemTracks = (item.trackIds || [])
            .map((id) => trackPool.find((t) => t.id === id))
            .filter(Boolean);
          const isItemActive =
            isPlaying &&
            currentTrack &&
            itemTracks.some((t) => t?.id === currentTrack.id);

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-[170px] sm:w-[190px] shrink-0 snap-start group cursor-pointer flex flex-col gap-2.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 select-none border-0"
            >
              {/* Artwork container */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow-lg">
                <LazyArtworkImage
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Spotify-style play button affordance */}
                <button
                  onClick={(e) => handlePlayAffordance(e, item)}
                  className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-[#0088CC] text-white flex items-center justify-center shadow-lg shadow-black/50 transition-all duration-300 border-0 ${
                    isItemActive
                      ? "opacity-100 scale-100"
                      : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105"
                  }`}
                  aria-label={isItemActive ? "Pause" : "Play"}
                >
                  {isItemActive ? (
                    <Pause className="w-5 h-5 fill-current text-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-current text-white ml-0.5" />
                  )}
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 text-left min-w-0">
                <h3 className="text-sm font-bold text-white truncate tracking-tight group-hover:text-[#0088CC] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MadeForYouSection;
