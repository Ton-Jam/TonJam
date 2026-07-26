import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NFTOffer } from "@/types";

interface RecentBidsListProps {
  offers: NFTOffer[] | undefined;
  highestOfferPrice: number;
}

export const RecentBidsList: React.FC<RecentBidsListProps> = ({ offers, highestOfferPrice }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
        No bids placed yet
      </div>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {sortedOffers.map((offer, i) => {
          const isTopBid = parseFloat(offer.price) === highestOfferPrice;
          return (
            <motion.div
              key={offer.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex items-center justify-between p-4 rounded-[4px] border transition-all hover:bg-white/[0.04]",
                isTopBid
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-white/[0.02] border-white/5",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      src={`https://picsum.photos/100/100?seed=${offer.offerer}`}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      alt=""
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">
                    @{(offer.offerer || "").slice(0, 8)}
                    ...
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {isTopBid && (
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="h-2 w-2" /> Highest Bidder
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-foreground">
                  {offer.price} TON
                </span>
                <span className="block text-[8px] text-muted-foreground uppercase tracking-widest mt-1">
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
