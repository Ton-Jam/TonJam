import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { NFTItem } from '@/types';
import { AuctionCountdownTimer } from '@/components/AuctionCountdownTimer';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Clock, Sparkles, TrendingUp, AlertCircle, Cpu } from 'lucide-react';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { useTonAddress } from '@tonconnect/ui-react';
import { cn } from '@/lib/utils';

const AnimatedPrice: React.FC<{ price: string }> = ({ price }) => {
  const [prevPrice, setPrevPrice] = useState(price);
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (price !== prevPrice) {
      const currentVal = parseFloat(price) || 0;
      const prevVal = parseFloat(prevPrice) || 0;
      if (currentVal > prevVal) {
        setIsHighlighting(true);
        const timer = setTimeout(() => setIsHighlighting(false), 2000);
        setPrevPrice(price);
        return () => clearTimeout(timer);
      }
      setPrevPrice(price);
    }
  }, [price, prevPrice]);

  return (
    <motion.span
      animate={isHighlighting ? {
        color: ['rgba(255, 255, 255, 1)', 'rgba(16, 185, 129, 1)', 'rgba(255, 255, 255, 1)'],
        scale: [1, 1.1, 1],
        textShadow: [
          '0 0 0px rgba(16, 185, 129, 0)',
          '0 0 10px rgba(16, 185, 129, 0.6)',
          '0 0 0px rgba(16, 185, 129, 0)'
        ]
      } : {}}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="text-sm font-black text-white font-mono leading-none inline-block origin-left"
    >
      {price} TON
    </motion.span>
  );
};

export const BidDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, updateNFT } = useAudio();
  const userAddress = useTonAddress();

  const [auctions, setAuctions] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentBidEvent, setRecentBidEvent] = useState<{
    title: string;
    price: string;
    bidder: string;
    nftId: string;
  } | null>(null);

  // Auto-bid configuration state: Record of nftId to config
  const [autoBids, setAutoBids] = useState<Record<string, { enabled: boolean; maxPrice: number }>>(() => {
    try {
      const saved = localStorage.getItem('tonjam_autobids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep refs of configurations and user address to prevent closure staleness
  const autoBidsRef = useRef(autoBids);
  const userAddressRef = useRef(userAddress);
  const processingAutoBids = useRef<Record<string, boolean>>({});

  useEffect(() => {
    autoBidsRef.current = autoBids;
    localStorage.setItem('tonjam_autobids', JSON.stringify(autoBids));
  }, [autoBids]);

  useEffect(() => {
    userAddressRef.current = userAddress;
  }, [userAddress]);

  useEffect(() => {
    const q = query(
      collection(db, 'nfts'),
      where('listingType', '==', 'auction')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activeAuctions: NFTItem[] = [];
        let newestBid: typeof recentBidEvent = null;
        let lastTimestamp = 0;

        snapshot.forEach((doc) => {
          const nft = { id: doc.id, ...doc.data() } as NFTItem;
          // Check if it hasn't ended on the client
          if (nft.auctionEndTime) {
            const isEnded = new Date(nft.auctionEndTime).getTime() <= Date.now();
            if (!isEnded) {
              activeAuctions.push(nft);
              
              const currentNFTOffers = nft.offers || [];
              const highOffer = currentNFTOffers.length > 0
                ? [...currentNFTOffers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))[0]
                : null;

              // Check the highest/newest offer for real-time bid highlight
              if (currentNFTOffers.length > 0) {
                // Find highest bid offer
                const sortedOffers = [...currentNFTOffers].sort((a, b) => {
                  const timeA = parseFloat(a.id.replace('offer-', '')) || 0;
                  const timeB = parseFloat(b.id.replace('offer-', '')) || 0;
                  return timeB - timeA;
                });
                
                const newestOffer = sortedOffers[0];
                const offerTime = parseFloat(newestOffer.id.replace('offer-', '')) || 0;
                if (offerTime > lastTimestamp) {
                  lastTimestamp = offerTime;
                  newestBid = {
                    title: nft.title,
                    price: newestOffer.price,
                    bidder: newestOffer.offerer,
                    nftId: nft.id
                  };
                }
              }

              // AUTO-BID ENGINE INTEGRATION
              const currentWallet = userAddressRef.current;
              if (currentWallet) {
                const config = autoBidsRef.current[nft.id];
                if (config && config.enabled && config.maxPrice > 0) {
                  const leadingBidder = highOffer ? highOffer.offerer : nft.owner;
                  const isUserLeading = leadingBidder?.toLowerCase() === currentWallet.toLowerCase();
                  
                  if (!isUserLeading && !processingAutoBids.current[nft.id]) {
                    const currentPrice = parseFloat(nft.price) || 0;
                    const nextBidAmountStr = (currentPrice * 1.05).toFixed(2);
                    const nextBidAmount = parseFloat(nextBidAmountStr);
                    
                    if (nextBidAmount <= config.maxPrice) {
                      // Lock execution to prevent duplicate transactions
                      processingAutoBids.current[nft.id] = true;
                      
                      // Notify that auto-bid rule matches
                      addNotification(`[Auto-Bid Engine] Matching current price on "${nft.title}" ... placing next increment of ${nextBidAmountStr} TON`, "info");
                      
                      // Execute placement
                      const autoOffer = {
                        id: `offer-${Date.now()}`,
                        offerer: currentWallet,
                        price: nextBidAmountStr,
                        timestamp: 'Just now',
                        duration: '24h'
                      };
                      
                      setTimeout(async () => {
                        try {
                          await updateNFT(nft.id, {
                            price: nextBidAmountStr,
                            offers: [autoOffer, ...currentNFTOffers]
                          }, true);
                          addNotification(`[Auto-Bid Engine] Bid registered successfully at ${nextBidAmountStr} TON!`, "success");
                        } catch (err) {
                          console.error("[Auto-Bid Engine] failed:", err);
                        } finally {
                          processingAutoBids.current[nft.id] = false;
                        }
                      }, 1000);
                    }
                  }
                }
              }
            }
          }
        });

        // Track highest bid order
        activeAuctions.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        setAuctions(activeAuctions);
        setLoading(false);

        if (newestBid) {
          setRecentBidEvent(newestBid);
          const timer = setTimeout(() => setRecentBidEvent(null), 8000);
          return () => clearTimeout(timer);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'nfts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleAutoBid = (nftId: string, enabled: boolean) => {
    setAutoBids((prev) => {
      const current = prev[nftId] || { enabled: false, maxPrice: 0 };
      return {
        ...prev,
        [nftId]: {
          ...current,
          enabled,
        },
      };
    });
    addNotification(
      enabled 
        ? "Auto-Bid protocol armed for this frequency stream" 
        : "Auto-Bid protocol offline for this frequency stream", 
      enabled ? "success" : "warning"
    );
  };

  const handleMaxPriceChange = (nftId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setAutoBids((prev) => {
      const current = prev[nftId] || { enabled: false, maxPrice: 0 };
      return {
        ...prev,
        [nftId]: {
          ...current,
          maxPrice: num,
        },
      };
    });
  };

  // Format shorter version of TON address (e.g., EQD4...3ab1)
  const formatAddress = (addr?: string) => {
    if (!addr) return 'Anon';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing live feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.25em] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE TRANSACTIONS RELAY
          </span>
          <h2 className="text-xl font-black uppercase tracking-tighter mt-1">Real-time Bid Dashboard</h2>
        </div>

        {/* Real-time Ticker Event Notify */}
        <AnimatePresence mode="wait">
          {recentBidEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-emerald-500/10 text-emerald-400 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 max-w-sm self-start cursor-pointer transition-all hover:bg-emerald-500/20"
              onClick={() => navigate(`/nft/${recentBidEvent.nftId}`)}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                New bid of <span className="text-white font-black">{recentBidEvent.price} TON</span> placed on &quot;{recentBidEvent.title}&quot; by {formatAddress(recentBidEvent.bidder)}!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {auctions.length === 0 ? (
        <div className="bg-card/30 backdrop-blur-md rounded-2xl p-10 text-center space-y-3">
          <div className="p-3 bg-white/5 rounded-full inline-flex text-muted-foreground">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wider">No Active Bids Found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">Be the first to mint a Genesis track or create an auction from your inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctions.slice(0, 3).map((nft, index) => {
            const currentNFTOffers = nft.offers || [];
            const highOffer = currentNFTOffers.length > 0
              ? [...currentNFTOffers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))[0]
              : null;

            const userHasBid = userAddress && currentNFTOffers.some(o => o.offerer?.toLowerCase() === userAddress.toLowerCase());
            const isUserLeading = userAddress && highOffer && highOffer.offerer?.toLowerCase() === userAddress.toLowerCase();
            const isOutbid = userHasBid && !isUserLeading;

            return (
              <motion.div
                key={nft.id}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-card/40 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-xl cursor-pointer"
                onClick={() => navigate(`/nft/${nft.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={nft.imageUrl}
                      alt={nft.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        SPOTLIGHT #{index + 1}
                      </span>
                      <h3 className="font-black uppercase tracking-tight text-[12px] text-white truncate m-0">
                        {nft.title}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground truncate m-0">
                        By @{nft.creator}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block">
                        HIGH BID
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5" />
                        <AnimatedPrice price={nft.price} />
                      </div>
                    </div>
                    {highOffer && (
                      <div className="text-right">
                        <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block">
                          LEAD BIDDER
                        </span>
                        <span className="text-[10px] font-bold text-blue-400 font-mono block mt-0.5">
                          {formatAddress(highOffer.offerer)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Outbid Warning Badge */}
                {isOutbid && (
                  <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse flex-shrink-0" />
                    <span>Outbid! Raise your bid or arm the Auto-Bid level below</span>
                  </div>
                )}

                {/* Real-time Inline Auto-Bid Manager */}
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-white/[0.02] p-3 rounded-xl space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Cpu className={cn("w-3.5 h-3.5", autoBids[nft.id]?.enabled ? "text-emerald-400 stroke-[2.5px]" : "text-muted-foreground/60")} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                        Auto-Bid Protocol
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAutoBid(nft.id, !(autoBids[nft.id]?.enabled))}
                      className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md transition-all cursor-pointer",
                        autoBids[nft.id]?.enabled
                          ? "bg-emerald-500/10 text-emerald-400 animate-pulse"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {autoBids[nft.id]?.enabled ? "ARMED" : "OFFLINE"}
                    </button>
                  </div>

                  {autoBids[nft.id]?.enabled && (
                    <div className="space-y-2 duration-300 animate-in fade-in slide-in-from-top-1">
                      {!userAddress ? (
                        <div className="text-[8px] font-bold uppercase tracking-wide text-amber-500/80 bg-amber-500/5 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                          Connect TON Wallet to activate relay
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted-foreground/50">MATCH LIMIT</span>
                            <input 
                              type="number" 
                              placeholder="Max TON price"
                              value={autoBids[nft.id]?.maxPrice || ''}
                              onChange={(ev) => handleMaxPriceChange(nft.id, ev.target.value)}
                              className="w-full bg-zinc-950/80 text-white placeholder-muted-foreground/30 rounded-lg py-1.5 pl-20 pr-3.5 text-[10px] font-mono font-black focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-400/80">TON</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <AuctionCountdownTimer nft={nft} variant="mini" />
                  </div>
                  
                  <span className="text-[8px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <span>VIEW LIVE AUCTION</span>
                    <Gavel className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
