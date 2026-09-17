import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gavel, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  Check, 
  TrendingUp, 
  Flame,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NFTItem, NFTOffer } from "@/types";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { MOCK_ARTISTS } from "@/constants";

interface RecentBidsSidebarProps {
  nft: NFTItem;
  className?: string;
  onPlaceBid?: () => void;
  isAuction?: boolean;
}

interface NormalizedBid {
  id: string;
  offerer: string;
  price: number;
  timestamp: string | number;
  isSimulated?: boolean;
}

function formatTimeAgo(timestamp: string | number): string {
  const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(time)) return "recently";
  const now = Date.now();
  const diffSec = Math.floor((now - time) / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const RecentBidsSidebar: React.FC<RecentBidsSidebarProps> = ({
  nft,
  className,
  onPlaceBid,
  isAuction = true,
}) => {
  const [liveOffers, setLiveOffers] = useState<NFTOffer[]>(nft.offers || []);
  const [newlyAddedIds, setNewlyAddedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"latest" | "highest">("latest");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [, setTick] = useState<number>(0);

  const prevOffersRef = useRef<NFTOffer[]>(nft.offers || []);
  const knownIdsRef = useRef<Set<string>>(new Set((nft.offers || []).map(o => o.id)));

  // Periodic tick for live relative time updates every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync with prop updates
  useEffect(() => {
    if (nft.offers) {
      const incomingIds = nft.offers.map(o => o.id);
      const newIds = incomingIds.filter(id => !knownIdsRef.current.has(id));

      if (newIds.length > 0) {
        newIds.forEach(id => knownIdsRef.current.add(id));
        setNewlyAddedIds(prev => [...prev, ...newIds]);

        // Clear pulse after animation runs
        setTimeout(() => {
          setNewlyAddedIds(prev => prev.filter(id => !newIds.includes(id)));
        }, 2200);
      }

      setLiveOffers(nft.offers);
      prevOffersRef.current = nft.offers;
    }
  }, [nft.offers]);

  // Firestore real-time listener for remote bids updates
  useEffect(() => {
    if (!nft.id) return;

    try {
      const docRef = doc(db, "nfts", nft.id);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as NFTItem;
          if (data.offers && data.offers.length > 0) {
            const incoming = data.offers;
            const newIds = incoming
              .map(o => o.id)
              .filter(id => !knownIdsRef.current.has(id));

            if (newIds.length > 0) {
              newIds.forEach(id => knownIdsRef.current.add(id));
              setNewlyAddedIds(prev => [...prev, ...newIds]);

              setTimeout(() => {
                setNewlyAddedIds(prev => prev.filter(id => !newIds.includes(id)));
              }, 2200);
            }

            setLiveOffers(incoming);
          }
        }
      }, (err) => {
        console.warn("[RecentBidsSidebar] Firestore listener fallback:", err);
      });

      return () => unsub();
    } catch (e) {
      console.warn("[RecentBidsSidebar] Snapshot setup error:", e);
    }
  }, [nft.id]);

  // Normalize and sort bids
  const normalizedBids: NormalizedBid[] = useMemo(() => {
    const directOffers: NormalizedBid[] = (liveOffers || []).map((offer, idx) => ({
      id: offer.id || `offer-${idx}`,
      offerer: offer.offerer || "Anonymous",
      price: parseFloat(offer.price) || 0,
      timestamp: offer.timestamp || Date.now(),
    }));

    // Also include any 'Bid' events from history if not already in offers
    if (nft.history) {
      const bidEvents = nft.history.filter(h => h.event?.toLowerCase() === 'bid');
      bidEvents.forEach((h, idx) => {
        const id = (h as any).id || `hist-bid-${idx}`;
        const exists = directOffers.some(o => o.id === id || (o.price === parseFloat(h.price || "0") && Math.abs(new Date(o.timestamp).getTime() - new Date(h.date).getTime()) < 2000));
        if (!exists) {
          directOffers.push({
            id,
            offerer: h.from || "Collector",
            price: parseFloat((h.price || "0").replace(/[^\d.]/g, '')) || 0,
            timestamp: h.date || Date.now(),
          });
        }
      });
    }

    if (sortOrder === "highest") {
      return directOffers.sort((a, b) => b.price - a.price);
    }
    // Default to latest first
    return directOffers.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [liveOffers, nft.history, sortOrder]);

  const highestBidValue = useMemo(() => {
    if (normalizedBids.length === 0) return parseFloat(nft.price) || 0;
    return Math.max(...normalizedBids.map(b => b.price));
  }, [normalizedBids, nft.price]);

  return (
    <div 
      id="recent-bids-sidebar"
      className={cn(
        "bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300",
        className
      )}
    >
      {/* Header with Live Indicator and Controls */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400">
            <Gavel className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white">
                Recent Bids
              </h3>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[8px] font-bold tracking-wider uppercase">
                Live Feed
              </span>
            </div>
            <p className="text-[8px] font-medium text-muted-foreground/70 tracking-wider uppercase mt-0.5">
              {normalizedBids.length} {normalizedBids.length === 1 ? "Bid Placed" : "Bids Placed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sort Filter Toggle */}
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setSortOrder("latest")}
              className={cn(
                "px-2 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider transition-all",
                sortOrder === "latest"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("highest")}
              className={cn(
                "px-2 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider transition-all",
                sortOrder === "highest"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              Top
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all"
            aria-label={isExpanded ? "Collapse recent bids" : "Expand recent bids"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Top Banner: Highest Bid Highlight */}
      <div className="mb-3 px-3.5 py-2.5 bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-neutral-900/40 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[7.5px] font-bold text-muted-foreground/80 uppercase tracking-widest block">
              Leading Valuation
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold text-white font-mono tracking-tight">
                {highestBidValue.toFixed(2)}
              </span>
              <span className="text-[9px] font-semibold text-blue-400 font-mono uppercase">
                GRAM
              </span>
              <span className="text-[8px] font-medium text-muted-foreground/60 font-mono ml-1">
                ≈ ${(highestBidValue * 5.2).toFixed(1)} USD
              </span>
            </div>
          </div>
        </div>

        {onPlaceBid && (
          <button
            type="button"
            onClick={onPlaceBid}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-1 shrink-0"
          >
            <ArrowUpRight className="w-3 h-3" />
            Bid
          </button>
        )}
      </div>

      {/* Real-time Bid Feed List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {normalizedBids.length === 0 ? (
              <div className="py-8 text-center bg-white/[0.01] rounded-xl flex flex-col items-center justify-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center text-muted-foreground/50">
                  <Gavel className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  No bids recorded yet
                </p>
                <p className="text-[8px] text-muted-foreground/40 max-w-[200px]">
                  Place an offer to kickstart the live auction stream
                </p>
                {onPlaceBid && (
                  <button
                    type="button"
                    onClick={onPlaceBid}
                    className="mt-2 px-3 py-1 rounded-lg bg-blue-600 text-white text-[8px] font-bold uppercase tracking-widest shadow-sm hover:bg-blue-500 transition-all"
                  >
                    Place Opening Bid
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pr-0.5">
                <AnimatePresence initial={false}>
                  {normalizedBids.map((bid, index) => {
                    const isTopBid = bid.price === highestBidValue;
                    const isPulsing = newlyAddedIds.includes(bid.id);
                    const matchedArtist = MOCK_ARTISTS.find(
                      a => a.walletAddress === bid.offerer || a.name === bid.offerer
                    );

                    return (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                          "relative rounded-xl p-3 transition-all duration-300 flex items-center justify-between gap-3 group",
                          isTopBid
                            ? "bg-amber-500/[0.08] hover:bg-amber-500/[0.12]"
                            : "bg-white/[0.025] hover:bg-white/[0.05]",
                          isPulsing && "animate-bid-pulse"
                        )}
                      >
                        {/* Left: Bidder Info & Avatar */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                            <img
                              src={
                                matchedArtist?.avatarUrl || 
                                `https://picsum.photos/80/80?seed=${bid.offerer}`
                              }
                              alt=""
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              loading="lazy"
                            />
                            {matchedArtist?.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-1.5 h-1.5 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[110px] sm:max-w-[130px]">
                                {bid.offerer.startsWith("UQ")
                                  ? `${bid.offerer.slice(0, 6)}...${bid.offerer.slice(-3)}`
                                  : `@${bid.offerer.slice(0, 10)}`}
                              </span>

                              {isTopBid && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[7.5px] font-black uppercase tracking-wider shrink-0">
                                  <Sparkles className="w-2 h-2" /> Top
                                </span>
                              )}

                              {isPulsing && (
                                <span className="px-1 py-0.2 bg-blue-500/25 text-blue-300 rounded text-[7px] font-bold uppercase tracking-wider animate-pulse shrink-0">
                                  New
                                </span>
                              )}
                            </div>

                            <span className="text-[7.5px] font-medium text-muted-foreground/60 tracking-wider uppercase flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5 opacity-60" />
                              {formatTimeAgo(bid.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Right: Price & Valuation */}
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                              {bid.price.toFixed(2)}
                            </span>
                            <span className="text-[8px] font-bold text-blue-400 font-mono uppercase">
                              GRAM
                            </span>
                          </div>
                          <span className="text-[7.5px] font-medium text-muted-foreground/60 font-mono block">
                            ≈ ${(bid.price * 5.2).toFixed(1)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Status Footer */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-[7.5px] font-bold uppercase tracking-wider text-muted-foreground/60">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Syncing with Relay</span>
        </div>
        <span className="font-mono text-[7px] text-muted-foreground/40">
          Neural Pulse v2
        </span>
      </div>
    </div>
  );
};
