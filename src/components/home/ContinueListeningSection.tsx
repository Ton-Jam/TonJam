import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Disc } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import ContinueListeningCard from "@/components/ContinueListeningCard";
import { MOCK_TRACKS } from "@/constants";

export const ContinueListeningSection: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, recentlyPlayed, allTracks } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayTracks = (recentlyPlayed && recentlyPlayed.length > 0)
    ? recentlyPlayed.slice(0, 6)
    : (allTracks && allTracks.length > 0 ? allTracks.slice(0, 6) : MOCK_TRACKS.slice(0, 6));

  if (!displayTracks || displayTracks.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Jump Back In
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Continue+Listening&filter=recent")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef} 
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-0.5 w-full snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayTracks.map((track) => (
          <div key={track.id} className="w-[240px] sm:w-[280px] shrink-0 snap-start">
            <ContinueListeningCard
              title={track.title}
              artist={track.artist}
              coverUrl={track.coverUrl || (track as any).imageUrl || ""}
              onPlay={() => playTrack(track)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueListeningSection;
