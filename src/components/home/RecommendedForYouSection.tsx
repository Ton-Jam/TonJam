import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import TrackCard from "@/components/TrackCard";
import NFTCard from "@/components/NFTCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const RecommendedForYouSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks, allNFTs } = useAudio();
  const { nfts } = useNFT();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const recommendedTracks = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    return allTracks.slice(0, 6);
  }, [allTracks]);

  const recommendedNFTs = useMemo(() => {
    const source = (allNFTs && allNFTs.length > 0) ? allNFTs : (nfts || []);
    return source.slice(0, 4);
  }, [allNFTs, nfts]);

  if (recommendedTracks.length === 0 && recommendedNFTs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            Recommended For Your Vibe
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Recommended+For+You&filter=recommended")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
      >
        {recommendedTracks.map((rec) => (
          <div
            key={rec.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <TrackCard 
              track={rec} 
              variant="default" 
              className="w-full" 
            />
          </div>
        ))}

        {recommendedNFTs.map((nft) => (
          <div
            key={nft.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <NFTCard 
              nft={nft} 
              variant="default" 
              className="w-full" 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedForYouSection;
