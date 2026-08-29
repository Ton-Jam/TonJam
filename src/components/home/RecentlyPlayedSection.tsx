import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, History } from "lucide-react";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAudio } from "@/contexts/AudioContext";
import TrackCard from "@/components/TrackCard";
import { MOCK_TRACKS } from "@/constants";

export const RecentlyPlayedSection: React.FC = () => {
  const navigate = useNavigate();
  const { recentlyPlayed } = useLibrary();
  const { allTracks } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayTracks = (recentlyPlayed && recentlyPlayed.length > 0)
    ? recentlyPlayed.slice(0, 5)
    : (allTracks && allTracks.length > 0 ? allTracks.slice(0, 5) : MOCK_TRACKS.slice(0, 5));

  if (!displayTracks || displayTracks.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Recently Played
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Recently+Played&filter=history")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-0.5 w-full snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayTracks.map((track) => (
          <TrackCard 
            key={track.id || track.songId} 
            track={track} 
            className="w-[140px] sm:w-[155px] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
