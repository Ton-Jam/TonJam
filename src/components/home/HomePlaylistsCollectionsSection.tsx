import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ListMusic, Layers, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import PlaylistCard from "@/components/PlaylistCard";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { getPlaceholderImage } from "@/lib/utils";

export const HomePlaylistsSection: React.FC = () => {
  const navigate = useNavigate();
  const { playlists } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const displayPlaylists = useMemo(() => {
    return (playlists && playlists.length > 0) ? playlists.slice(0, 8) : [];
  }, [playlists]);

  if (!displayPlaylists || displayPlaylists.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[#0088CC]" />
          <h2 className="text-section-title font-bold text-white">
            Featured Playlists
          </h2>
        </div>
        <button
          onClick={() => navigate('/explore/playlists?title=Featured+Playlists')}
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
        {displayPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <PlaylistCard
              playlist={playlist}
              variant="default"
              className="w-full"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export const HomeCollectionsSection: React.FC = () => {
  const navigate = useNavigate();
  const { collections } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const curatedCollections = useMemo(() => {
    if (!collections || collections.length === 0) return [];
    return collections.slice(0, 8).map(c => ({
      id: c.id,
      name: c.name,
      itemCount: c.nftIds?.length || (c as any).trackIds?.length || (c as any).itemCount || 0,
      coverUrl: c.coverUrl || getPlaceholderImage(`collection-${c.id}`),
    }));
  }, [collections]);

  if (curatedCollections.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-section-title font-bold text-white">
            Top Collections
          </h2>
        </div>
        <button
          onClick={() => navigate('/collections')}
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
        {curatedCollections.map((col) => (
          <div
            key={col.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <CollectionCard
              id={col.id}
              name={col.name}
              itemCount={col.itemCount}
              coverUrl={col.coverUrl}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
