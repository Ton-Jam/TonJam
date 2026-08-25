import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import TrackCard from "@/components/TrackCard";
import { MOCK_TRACKS } from "@/constants";

export const TrendingFeedSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const trendingTracks = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    return [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  }, [allTracks]);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Trending Feed
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Trending+Feed&filter=trending")} 
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
        {trendingTracks.map((track) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            variant="default"
            className="w-[140px] sm:w-[155px] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
};

export default TrendingFeedSection;
