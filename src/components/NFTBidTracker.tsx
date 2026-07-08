import React, { useState, useEffect, useRef } from "react";
import { Gavel, Clock, Sparkles, Activity, User, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { NFTItem, NFTOffer } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface NFTBidTrackerProps {
  nft: NFTItem;
  className?: string;
}

export const NFTBidTracker: React.FC<NFTBidTrackerProps> = ({ nft, className }) => {
  const [liveNft, setLiveNft] = useState<NFTItem>(nft);
  const [flash, setFlash] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isEndingSoon, setIsEndingSoon] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);
  
  const prevPriceRef = useRef<string>(nft.price);
  const prevOffersCountRef = useRef<number>(nft.offers?.length || 0);

  // Subscribe directly to this NFT in Firestore for instant, zero-refresh real-time updates
  useEffect(() => {
    if (!nft.id) return;
    
    // Set initial state
    setLiveNft(nft);
    prevPriceRef.current = nft.price;
    prevOffersCountRef.current = nft.offers?.length || 0;

    const docRef = doc(db, "nfts", nft.id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as NFTItem;
        setLiveNft(prev => ({
          ...prev,
          ...data
        }));

        // Detect new bids (price increase or new offer added) to trigger premium flash signal
        const newPrice = data.price;
        const newOffersCount = data.offers?.length || 0;
        
        if (
          newPrice !== prevPriceRef.current || 
          newOffersCount > prevOffersCountRef.current
        ) {
          setFlash(true);
          const timer = setTimeout(() => setFlash(false), 1200);
          prevPriceRef.current = newPrice;
          prevOffersCountRef.current = newOffersCount;
          
          // Trigger light haptic/audio pulse via console or notification if supported
          console.log(`[BidTracker] New bid detected: ${newPrice} TON`);
          return () => clearTimeout(timer);
        }
      }
    }, (err) => {
      console.warn("[BidTracker] Listener subscription error:", err);
    });

    return () => unsub();
  }, [nft.id]);

  // Visual countdown timer for ending auctions
  useEffect(() => {
    const isAuction = liveNft.listingType === "auction" || liveNft.isAuction;
    const endTimeStr = liveNft.auctionEndTime || liveNft.auctionEndDate;
    const startTimeStr = liveNft.auctionStartTime || liveNft.createdAt;

    if (!isAuction || !endTimeStr) {
      setTimeRemaining("");
      setProgressPercent(100);
      return;
    }

    const calculateTime = () => {
      const end = new Date(endTimeStr).getTime();
      const start = startTimeStr ? new Date(startTimeStr).getTime() : end - (24 * 60 * 60 * 1000);
      const now = Date.now();
      const totalDuration = end - start;
      const distance = end - now;

      if (distance <= 0) {
        setTimeRemaining("EXPIRED");
        setIsEndingSoon(false);
        setProgressPercent(0);
        return;
      }

      // Check if ending in less than 1 hour (3600000 ms)
      setIsEndingSoon(distance < 3600000);

      // Calculate progress percentage
      if (totalDuration > 0) {
        const percent = (distance / totalDuration) * 100;
        setProgressPercent(Math.max(0, Math.min(100, percent)));
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours.toString().padStart(2, "0")}h`);
      parts.push(`${minutes.toString().padStart(2, "0")}m`);
      parts.push(`${seconds.toString().padStart(2, "0")}s`);

      setTimeRemaining(parts.join(" "));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [liveNft.listingType, liveNft.isAuction, liveNft.auctionEndTime, liveNft.auctionEndDate, liveNft.auctionStartTime, liveNft.createdAt]);

  const isAuction = liveNft.listingType === "auction" || liveNft.isAuction;
  const endTimeStr = liveNft.auctionEndTime || liveNft.auctionEndDate;
  const sortedOffers = React.useMemo(() => {
    if (!liveNft.offers) return [];
    return [...liveNft.offers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }, [liveNft.offers]);

  const highestOfferPrice = sortedOffers[0] ? parseFloat(sortedOffers[0].price) : 0;
  const displayPrice = isAuction 
    ? highestOfferPrice > 0 ? highestOfferPrice : (parseFloat(liveNft.startingBid || liveNft.price) || 0)
    : parseFloat(liveNft.price) || 0;

  return (
    <div 
      className={cn(
        "bg-white/[0.02] backdrop-blur-2xl rounded-lg p-5 relative overflow-hidden transition-all duration-300 shadow-2xl",
        flash && "bg-amber-500/[0.08] shadow-[0_0_30px_rgba(245,158,11,0.15)]",
        className
      )}
    >
      {/* Visual scanning line for high tech feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />

      <div className="relative z-10 space-y-4">
        {/* Live status bar - Borderless */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                isAuction ? "bg-amber-400" : "bg-emerald-400"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isAuction ? "bg-amber-500" : "bg-emerald-500"
              )} />
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/90">
              {isAuction ? "Live Auction Tracker" : "Live Price Monitor"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-blue-400/80 animate-pulse" />
            <span className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              Secured Firestore Node
            </span>
          </div>
        </div>

        {/* Pricing Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.25em] block">
              {isAuction ? "Active Valuation" : "Current Listing Value"}
            </span>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={displayPrice}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "text-3xl md:text-4xl font-black tracking-tighter text-foreground font-sans",
                  flash && "text-amber-400"
                )}
              >
                {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 4 })}
              </motion.span>
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                TON
              </span>
            </div>
            <p className="text-[8.5px] font-mono text-zinc-500">
              ≈ ${(displayPrice * 5.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>

          {/* Auction Timer Column */}
          {isAuction && endTimeStr && (
            <div className="space-y-1.5 bg-white/[0.015] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.25em] flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500/70" /> Time Remaining
                </span>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                  isEndingSoon ? "bg-rose-500/10 text-rose-400 animate-pulse" : "bg-amber-500/10 text-amber-400"
                )}>
                  {timeRemaining === "EXPIRED" ? "Closed" : isEndingSoon ? "Ending Soon" : "Active"}
                </span>
              </div>
              
              <div className={cn(
                "text-lg font-black font-mono tracking-wider tabular-nums",
                timeRemaining === "EXPIRED" ? "text-rose-500" : isEndingSoon ? "text-rose-400 animate-pulse" : "text-amber-400"
              )}>
                {timeRemaining}
              </div>

              {/* Progress bar representing timeline */}
              {timeRemaining !== "EXPIRED" && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      isEndingSoon ? "bg-rose-500" : "bg-amber-500"
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Bid/Offer Streams */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[8.5px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {isAuction ? "Active Bid Stream" : "Offer Ledger"}
            </h5>
            <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              {sortedOffers.length} {sortedOffers.length === 1 ? "signal" : "signals"} online
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
            <AnimatePresence initial={false}>
              {sortedOffers.length > 0 ? (
                sortedOffers.slice(0, 3).map((offer, index) => {
                  const isTopBid = index === 0;
                  return (
                    <motion.div
                      key={offer.id || `offer-${index}-${offer.price}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-md transition-all",
                        isTopBid 
                          ? "bg-amber-500/[0.04]" 
                          : "bg-white/[0.01]"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-neutral-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <img
                            src={`https://picsum.photos/50/50?seed=${offer.offerer}`}
                            className="h-full w-full object-cover opacity-80"
                            alt=""
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-foreground font-mono truncate block">
                            @{offer.offerer.slice(0, 6)}...{offer.offerer.slice(-4)}
                          </span>
                          <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 block mt-0.5">
                            {isTopBid ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5 animate-pulse" /> CURRENT HIGHEST
                              </span>
                            ) : "INCOMING SIGNAL"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-black text-foreground font-mono">
                          {offer.price} TON
                        </span>
                        <span className="text-[6.5px] font-mono text-zinc-600 block mt-0.5 uppercase tracking-widest">
                          {offer.timestamp || "Active"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">
                  No active bid signals recorded
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
