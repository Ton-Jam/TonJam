import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Gem, Music2, RefreshCw, X } from "lucide-react";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { getPlaceholderImage } from "@/lib/utils";
import { useSmartRecommendations } from "@/hooks/useSmartRecommendations";

export const RecommendedNFTTracksSection: React.FC = () => {
  const navigate = useNavigate();
  const { recommendedNFTs, refreshRecommendations, hideNFT, isLoading } =
    useSmartRecommendations();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  if (!isLoading && (!recommendedNFTs || recommendedNFTs.length === 0)) {
    return (
      <section className="space-y-3 text-left w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-section-title font-bold text-white tracking-tight">
              Recommended NFT Tracks
            </h2>
          </div>
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border-0 bg-transparent"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
        <div className="p-6 rounded-2xl bg-[#121824] text-center">
          <p className="text-xs text-slate-400">
            No recommended Music NFTs available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-[#38BDF8]" />
          <h2 className="text-section-title font-bold text-white tracking-tight">
            Recommended NFT Tracks
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer border-0 bg-transparent"
            title="Refresh recommendations"
            aria-label="Refresh NFT recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className="text-xs font-semibold text-[#38BDF8] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
            aria-label="See all recommended NFT tracks"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{
          scrollBehavior: "smooth",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {recommendedNFTs.map((nft) => {
          const priceDisplay = nft.price ? `${nft.price} TON` : "Not Listed";
          const artworkUrl =
            nft.imageUrl ||
            nft.coverUrl ||
            getPlaceholderImage(`nft-${nft.id}`);

          return (
            <div
              key={`rec-nft-${nft.id}`}
              style={{ width: "148px", scrollSnapAlign: "start" }}
              className="w-[148px] shrink-0 snap-start"
            >
              <div
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="group relative flex flex-col justify-between p-2.5 rounded-2xl bg-[#121824] hover:bg-[#182032] transition-all cursor-pointer w-full select-none"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#0B0F17] mb-2.5">
                  <LazyArtworkImage
                    src={artworkUrl}
                    fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1.5 left-1.5 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Music2 className="w-3 h-3 text-[#38BDF8]" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                      NFT
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideNFT(nft.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-0 cursor-pointer"
                    title="Hide this recommendation"
                    aria-label="Hide recommendation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-semibold leading-tight text-white truncate group-hover:text-[#38BDF8] transition-colors">
                    {nft.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-slate-400 truncate">
                      {nft.artist || nft.creator || "Independent Artist"}
                    </span>
                    <VerifiedArtistBadge
                      isVerified={Boolean(nft.artistVerified)}
                      size="xs"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 px-2 py-1 rounded-lg bg-[#182032]/70">
                    <span className="text-[11px] font-bold text-[#38BDF8] font-mono tabular-nums">
                      {priceDisplay}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase">
                      Music NFT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendedNFTTracksSection;
