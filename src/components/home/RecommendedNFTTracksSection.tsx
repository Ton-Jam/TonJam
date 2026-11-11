import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Gem, Music2, RefreshCw, X } from 'lucide-react';
import { NFTItem } from '@/types';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import VerifiedArtistBadge from '@/components/common/VerifiedArtistBadge';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { getPlaceholderImage } from '@/lib/utils';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

export const RecommendedNFTTracksSection: React.FC = () => {
  const navigate = useNavigate();
  const { recommendedNFTs, refreshRecommendations, hideNFT, isLoading } = useSmartRecommendations();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  if (!isLoading && (!recommendedNFTs || recommendedNFTs.length === 0)) {
    return (
      <section className="space-y-3 text-left w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-cyan-400" />
            <h2 className="text-section-title font-bold text-white tracking-tight">
              Recommended NFT Tracks
            </h2>
          </div>
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border-none bg-transparent"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
        <div className="p-6 rounded-[2px] border-2 border-[rgba(192,202,214,0.22)] bg-white/[0.02] text-center">
          <p className="text-xs text-zinc-400">No recommended NFT tracks available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-cyan-400" />
          <h2 className="text-section-title font-bold text-white tracking-tight">
            Recommended NFT Tracks
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
            title="Refresh recommendations"
            aria-label="Refresh NFT recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
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
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {recommendedNFTs.map((nft) => {
          const priceDisplay = nft.price ? `${nft.price} TON` : '5.5 TON';
          const artworkUrl = nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`);

          return (
            <div
              key={`rec-nft-${nft.id}`}
              style={{ width: '142px', scrollSnapAlign: 'start' }}
              className="w-[142px] shrink-0 snap-start"
            >
              <div
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="group relative flex flex-col justify-between p-2 rounded-[2px] border-2 border-[rgba(192,202,214,0.22)] hover:border-[rgba(105,175,255,0.65)] bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer w-full select-none"
              >
                {/* Artwork */}
                <div className="relative w-full aspect-square rounded-[2px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={artworkUrl}
                    fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Music NFT Indicator Badge */}
                  <div className="absolute top-1.5 left-1.5 z-10 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-[2px] flex items-center gap-1 border border-white/10">
                    <Music2 className="w-3 h-3 text-[#00B4D8]" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">NFT</span>
                  </div>

                  {/* Hide / Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideNFT(nft.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 text-zinc-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                    title="Hide this recommendation"
                    aria-label="Hide recommendation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-medium leading-tight text-white/95 truncate group-hover:text-blue-400 transition-colors">
                    {nft.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-zinc-400 truncate">{nft.artist || nft.creator || 'Independent Artist'}</span>
                    <VerifiedArtistBadge isVerified={nft.artistVerified ?? true} size="xs" />
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-[11px] font-bold text-cyan-400 font-mono">{priceDisplay}</span>
                    <span className="text-[9px] font-medium text-zinc-500 uppercase">Music NFT</span>
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
