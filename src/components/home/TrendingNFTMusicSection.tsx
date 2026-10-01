import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Gem } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import { MOCK_NFTS } from "@/constants";
import NFTCard from "@/components/NFTCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const TrendingNFTMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const { allNFTs } = useAudio();
  const { nfts } = useNFT();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const displayNFTs = useMemo(() => {
    const list = (allNFTs && allNFTs.length > 0) 
      ? allNFTs 
      : (nfts && nfts.length > 0 ? nfts : MOCK_NFTS);
    return list.slice(0, 10);
  }, [allNFTs, nfts]);

  if (!displayNFTs || displayNFTs.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-cyan-400" />
          <h2 className="text-section-title font-bold text-white">
            Trending Music NFTs
          </h2>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
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
        {displayNFTs.map((nft) => (
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

export default TrendingNFTMusicSection;
