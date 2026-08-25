import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import TrackCard from "@/components/TrackCard";
import { MOCK_TRACKS } from "@/constants";

export const NewDropsSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

  const newDrops = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    const repeated = [...list];
    while (repeated.length < 12) {
      repeated.push(...list.map((t, idx) => ({ ...t, id: `${t.id}-drop-${idx}` })));
    }
    return repeated.slice(0, 12);
  }, [allTracks]);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            New Drops
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=New+Drops&filter=new")} 
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
        {newDrops.map((track) => (
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

export default NewDropsSection;
