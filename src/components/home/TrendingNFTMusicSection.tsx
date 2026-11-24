import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Gem } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import NFTCard from "@/components/NFTCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { TrendingNFTVolumeChart } from "@/components/home/TrendingNFTVolumeChart";
import VerticalSectionListModal from "@/components/common/VerticalSectionListModal";

export const TrendingNFTMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const { allNFTs } = useAudio();
  const { nfts } = useNFT();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayNFTs = useMemo(() => {
    const list = (allNFTs && allNFTs.length > 0)
      ? allNFTs
      : (nfts && nfts.length > 0 ? nfts : []);
    return list;
  }, [allNFTs, nfts]);

  const shelfNFTs = useMemo(() => {
    return displayNFTs.slice(0, 10);
  }, [displayNFTs]);

  return (
    <section className="space-y-6 text-left w-full">
      <div className="w-full">
        <TrendingNFTVolumeChart />
      </div>

      {shelfNFTs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3">
            <div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-cyan-400" />
                <h2 className="text-section-title font-bold text-white">
                  Trending Music NFTs
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-normal mt-0.5">Verified digital audio collectibles and drops on TON</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            {...handlers}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2 after:content-[''] after:shrink-0 after:w-2 w-full snap-x snap-mandatory overscroll-x-contain select-none"
            style={{ scrollBehavior: "smooth", overscrollBehaviorX: "contain", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {shelfNFTs.map((nft) => (
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
        </div>
      )}

      <VerticalSectionListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Trending Music NFTs"
        subtitle="Verified digital audio collectibles and drops on TON"
        items={displayNFTs}
        renderItem={(nft) => (
          <div className="w-[168px]">
            <NFTCard nft={nft} variant="default" className="w-full" />
          </div>
        )}
      />
    </section>
  );
};

export default TrendingNFTMusicSection;
