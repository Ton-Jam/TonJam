import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, History } from "lucide-react";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAudio } from "@/contexts/AudioContext";
import { MOCK_TRACKS } from "@/constants";
import { Track } from "@/types";
import TrackCard from "@/components/TrackCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const RecentlyPlayedSection: React.FC = () => {
  const navigate = useNavigate();
  const { recentlyPlayed } = useLibrary();
  const { allTracks } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const displayTracks: Track[] = (recentlyPlayed && recentlyPlayed.length > 0)
    ? recentlyPlayed.slice(0, 8)
    : (allTracks && allTracks.length > 0 ? allTracks.slice(0, 8) : MOCK_TRACKS.slice(0, 8));

  if (!displayTracks || displayTracks.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0088CC]" />
          <h2 className="text-section-title font-bold text-white">
            Recently Played
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Recently+Played&filter=history")} 
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
        {displayTracks.map((track) => (
          <div
            key={track.id || track.songId}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <TrackCard 
              track={track} 
              variant="default" 
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
