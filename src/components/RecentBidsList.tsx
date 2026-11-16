import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { NFTOffer } from "@/types";

interface RecentBidsListProps {
  offers: NFTOffer[] | undefined;
  highestOfferPrice: number;
}

const formatOfferer = (val?: string) => {
  if (!val) return "Anonymous";
  if (val.length > 14) return `${val.slice(0, 6)}...${val.slice(-4)}`;
  return val;
};

export const RecentBidsList: React.FC<RecentBidsListProps> = ({ offers, highestOfferPrice }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-8 text-xs font-semibold text-[var(--tj-color-text-secondary,#C2C7CD)]">
        No bids placed yet
      </div>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {sortedOffers.map((offer, i) => {
          const isTopBid = parseFloat(offer.price) === highestOfferPrice;
          return (
            <motion.div
              key={offer.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-[var(--tj-radius-sm,6px)] border-0 transition-colors",
                isTopBid
                  ? "bg-amber-500/15"
                  : "bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)]"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-default,#0D1628)] overflow-hidden shrink-0">
                  <img
                    src={getPlaceholderImage(`offerer-${offer.offerer || i}`)}
                    className="w-full h-full object-cover"
                    alt={formatOfferer(offer.offerer)}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                    {formatOfferer(offer.offerer)}
                  </span>
                  {isTopBid && (
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                      Highest Bid
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-white font-mono tabular-nums">
                  {offer.price} TON
                </span>
                <span className="block text-[10px] text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono mt-0.5">
                  {new Date(offer.timestamp || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
