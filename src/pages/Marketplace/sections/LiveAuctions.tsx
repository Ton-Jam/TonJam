import React, { useState } from "react";
import { Zap, Play, Pause, Heart, Clock } from "lucide-react";
import { LiveAuction } from "../types";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import { AuctionCountdownTimer } from "@/components/AuctionCountdownTimer";

interface LiveAuctionsProps {
  auctions: LiveAuction[];
  onPlaceBid: (auction: LiveAuction) => void;
  onSelectNFT: (nft: any) => void;
}

export const LiveAuctions: React.FC<LiveAuctionsProps> = ({
  auctions,
  onPlaceBid,
  onSelectNFT
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [watchedAuctions, setWatchedAuctions] = useState<Record<string, boolean>>({});

  const toggleWatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchedAuctions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full relative text-left" id="marketplace-live-auctions">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0088CC] fill-current" />
            Live Auctions
          </h2>
        </div>
      </div>

      {/* Grid of Auctions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {auctions.map((auc) => {
          const isCurrentPlaying = currentTrack?.id === auc.nft.id && isPlaying;
          const isWatched = !!watchedAuctions[auc.id];

          return (
            <div
              key={auc.id}
              onClick={() => onSelectNFT(auc.nft)}
              className="bg-[#0A0A0A] border border-white/12 rounded-[3px] overflow-hidden p-3 flex flex-col justify-between cursor-pointer select-none transition-colors hover:border-white/20"
            >
              {/* Media Section */}
              <div className="relative aspect-square w-full rounded-[3px] bg-[#101010] border border-white/10 overflow-hidden mb-2.5">
                <img
                  src={auc.nft.coverUrl || getPlaceholderImage(auc.nft.title)}
                  alt={auc.nft.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-103"
                  loading="lazy"
                />
                
                {/* Visual Overlays */}
                <div className="absolute top-2 left-2 flex gap-1 items-center">
                  <span className="flex items-center gap-1 text-[8px] font-semibold bg-rose-500/90 text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    Live
                  </span>
                  <span className="text-[8px] font-medium bg-black/70 text-white/80 px-1.5 py-0.5 rounded-[3px] border border-white/10 uppercase tracking-wider">
                    {auc.bidsCount} Bids
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleWatch(auc.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-[3px] bg-black/60 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
                  aria-label={isWatched ? `Remove ${auc.nft.title} from watchlist` : `Watch ${auc.nft.title} auction`}
                >
                  <Heart className={`w-3 h-3 ${isWatched ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden="true" />
                </button>

                {/* Hover Play Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(auc.nft as any);
                    }}
                    className="w-10 h-10 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white flex items-center justify-center transition-colors focus:outline-none"
                    aria-label={isCurrentPlaying ? `Pause preview for ${auc.nft.title}` : `Play preview for ${auc.nft.title}`}
                  >
                    {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Countdown display at bottom of image */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 p-1.5 bg-black/80 rounded-[3px] flex items-center justify-between border border-white/5">
                  <span className="text-[8px] font-medium text-white/60 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0088CC]" /> Ends In
                  </span>
                  <AuctionCountdownTimer nft={{ ...auc.nft, endsAt: auc.endsAt } as any} variant="mini" />
                </div>
              </div>

              {/* Text Meta */}
              <div className="text-left space-y-0.5">
                <span className="text-xs font-semibold text-[#F5F7FA] block truncate">{auc.nft.title}</span>
                <span className="text-[11px] font-normal text-white/60 block truncate">{auc.nft.artist}</span>
              </div>

              {/* Auction Bidding Metrics */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block">Current Bid</span>
                  <span className="text-xs font-semibold text-[#0088CC] font-mono">{auc.currentBid}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaceBid(auc);
                  }}
                  aria-label={`Place bid on ${auc.nft.title}`}
                  className="px-3 py-1 rounded-[3px] bg-[#0088CC] text-white font-medium text-[10px] uppercase tracking-wider hover:bg-[#0077b3] transition-colors focus:outline-none"
                >
                  Place Bid
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
