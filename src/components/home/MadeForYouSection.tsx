import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import PlaylistCard from "@/components/PlaylistCard";
import { Playlist } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";

export const MadeForYouSection: React.FC = () => {
  const navigate = useNavigate();
  const { playlists, allTracks } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const displayPlaylists: Playlist[] = useMemo(() => {
    if (!playlists || playlists.length === 0) return [];
    return playlists.slice(0, 8).map((pl) => ({
      ...pl,
      coverUrl: pl.coverUrl || getPlaceholderImage(`playlist-${pl.id}`),
      trackCount: pl.trackCount || pl.trackIds?.length || 0,
    }));
  }, [playlists]);

  if (displayPlaylists.length === 0 && (!allTracks || allTracks.length === 0)) {
    return null;
  }

  if (displayPlaylists.length === 0) {
    return null;
  }

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
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {displayPlaylists.map((playlistObj) => (
          <div
            key={playlistObj.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <PlaylistCard
              playlist={playlistObj}
              variant="default"
              className="w-full"
              onClick={() => navigate(`/playlist/${playlistObj.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MadeForYouSection;
