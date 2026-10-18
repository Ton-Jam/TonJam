import React from "react";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { LiveAuction } from "../types";
import { getPlaceholderImage } from "@/lib/utils";
import { AuctionCountdownTimer } from "@/components/AuctionCountdownTimer";
import { useGramPrice } from "@/contexts/GramPriceContext";

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
  const { convertPrice } = useGramPrice();

  if (!auctions || auctions.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative text-left" id="marketplace-live-auctions">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00B4D8] fill-current" />
            Live Auctions
          </h2>
          <p className="text-xs text-[#8C8C8C]">
            Real-time on-chain auctions for rare music editions
          </p>
        </div>
      </div>

      {/* Grid of Auctions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {auctions.map((auc) => {
          const artwork = auc.nft.coverUrl || auc.nft.imageUrl || getPlaceholderImage(auc.nft.title);
          const currentBidFormatted = auc.currentBid.includes("TON") ? auc.currentBid : `${auc.currentBid} TON`;

          return (
            <div
              key={auc.id}
              onClick={() => onSelectNFT(auc.nft)}
              className="bg-[#0A1628] hover:bg-[#0F1C32] border border-[#22374D] hover:border-[#38516B] rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between cursor-pointer select-none transition-all duration-200"
            >
              {/* Media Section */}
              <div className="relative aspect-square w-full rounded-xl bg-[#07111F] overflow-hidden mb-3">
                <img
                  src={artwork}
                  alt={auc.nft.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(auc.nft.title);
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                
                {/* Visual Overlays */}
                <div className="absolute top-2 left-2 flex gap-1.5 items-center">
                  <span className="flex items-center gap-1 text-[9px] font-bold bg-[#00B4D8] text-[#07111F] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#07111F] rounded-full" />
                    Live
                  </span>
                  {auc.bidsCount !== undefined && (
                    <span className="text-[9px] font-medium bg-[#07111F]/80 backdrop-blur-sm text-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#22374D] uppercase tracking-wider">
                      {auc.bidsCount} Bids
                    </span>
                  )}
                </div>

                {/* Countdown display */}
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-[#07111F]/85 backdrop-blur-md rounded-lg flex items-center justify-between border border-[#22374D]">
                  <span className="text-[10px] font-medium text-[#C2C7CD] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00B4D8]" /> Ends In
                  </span>
                  <AuctionCountdownTimer nft={{ ...auc.nft, endsAt: auc.endsAt } as any} variant="mini" />
                </div>
              </div>

              {/* Title & Artist */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-[#FFFFFF] truncate">
                  {auc.nft.title}
                </h3>
                <span className="text-xs text-[#C2C7CD] block truncate">
                  {auc.nft.artist || auc.nft.creator}
                </span>
              </div>

              {/* Auction Bidding Metrics */}
              <div className="mt-3 pt-2.5 border-t border-[#22374D]/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider block">
                    Current Bid
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#00B4D8] font-mono">
                    {convertPrice(currentBidFormatted)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaceBid(auc);
                  }}
                  aria-label={`Place bid on ${auc.nft.title}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00B4D8] text-[#07111F] font-bold text-xs uppercase tracking-wider hover:bg-[#009CC0] transition-colors focus:outline-none flex items-center gap-1"
                >
                  Place Bid
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveAuctions;
