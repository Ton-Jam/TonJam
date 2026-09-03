import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import TrackCard from "@/components/TrackCard";
import { MOCK_TRACKS } from "@/constants";

export const TopTrendingSongsSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();

  const topSongs = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    return list.slice(0, 5);
  }, [allTracks]);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Top Trending Songs
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Top+Trending+Songs&filter=trending")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1 w-full">
        {topSongs.map((track, idx) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            variant="row" 
            index={idx} 
            className="w-full" 
          />
        ))}
      </div>
    </section>
  );
};

export default TopTrendingSongsSection;
