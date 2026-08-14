import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Play, Pause, Gavel, Sparkles, Volume2, History, ChevronDown, X, Share2 } from 'lucide-react';
import { NFTItem, Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import ShareNFTDialog from '@/components/ShareNFTDialog';
import BidModal from '@/components/BidModal';

export interface FeaturedAuctionCardProps {
  nft?: Partial<NFTItem> & {
    floorPrice?: string;
    currentBid?: string;
    auctionEndsAt?: string;
    auctionEndTime?: string;
    isLiveAuction?: boolean;
  };
  onPlaceBid?: (nft: NFTItem) => void;
  className?: string;
}

// Fixed 28 vector bar heights for the audio preview waveform graphic
const WAVEFORM_BARS = [
  25, 40, 65, 30, 85, 95, 50, 75, 35, 90, 60, 45, 100, 80,
  70, 40, 90, 55, 30, 85, 65, 40, 95, 75, 50, 35, 60, 30
];

export const FeaturedAuctionCard: React.FC<FeaturedAuctionCardProps> = ({
  nft,
  onPlaceBid,
  className = '',
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // Fallback defaults matching prompt spec
  const cardData = useMemo(() => {
    return {
      id: nft?.id || 'featured-auction-1',
      title: nft?.title || 'Ethereal Harmonics #042',
      creator: nft?.creator || nft?.artist || 'Aura Synth Labs',
      imageUrl: nft?.imageUrl || nft?.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      audioUrl: nft?.audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      currentBid: nft?.currentBid || nft?.price || '42 Grams',
      floorPrice: nft?.floorPrice || '35 Grams',
      endTime: nft?.auctionEndTime || nft?.auctionEndsAt || '2026-12-31T23:59:59.000Z',
      owner: nft?.owner || 'EQD_FeaturedAuctionOwner_Wallet_Address_777777777',
      price: nft?.price || nft?.currentBid || '42',
    };
  }, [nft]);

  // Countdown Timer State
  const [timeLeftStr, setTimeLeftStr] = useState<string>('02h : 45m : 12s');
  // Tooltip State for Bid History
  const [showHistory, setShowHistory] = useState<boolean>(false);
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  // Smart Contract Bid Modal State
  const [showBidModal, setShowBidModal] = useState<boolean>(false);

  // Real-time bid pulse animation trigger
  const [isBidPulsing, setIsBidPulsing] = useState<boolean>(false);
  const prevBidRef = useRef<string>(nft?.currentBid || nft?.price || '42 Grams');

  useEffect(() => {
    const newBid = nft?.currentBid || nft?.price || '42 Grams';
    if (newBid !== prevBidRef.current) {
      prevBidRef.current = newBid;
      setIsBidPulsing(true);
      const timer = setTimeout(() => {
        setIsBidPulsing(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [nft?.currentBid, nft?.price]);

  // Dynamic Live Auction & Timer State based on Metadata
  const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(true);

  useEffect(() => {
    const endTime = nft?.auctionEndTime || nft?.auctionEndsAt || cardData.endTime;
    if (endTime) {
      const targetTime = new Date(endTime).getTime();
      const ended = targetTime <= Date.now();
      setIsAuctionEnded(ended);
      setIsLive(!ended && (nft?.isLiveAuction !== false));
    } else {
      setIsLive(nft?.isLiveAuction !== false);
    }
  }, [nft?.auctionEndTime, nft?.auctionEndsAt, cardData.endTime, nft?.isLiveAuction]);

  // Compute Last Three Bids
  const recentBids = useMemo(() => {
    if (nft?.offers && nft.offers.length > 0) {
      return nft.offers.slice(0, 3).map((offer, idx) => ({
        amount: `${offer.price} Grams`,
        bidder: offer.offerer ? `${offer.offerer.slice(0, 4)}...${offer.offerer.slice(-4)}` : `@bidder${idx + 1}`,
        time: offer.timestamp || `${(idx + 1) * 18}m ago`,
      }));
    }
    const val = parseFloat(cardData.currentBid.replace(/[^0-9.]/g, '')) || 42;
    return [
      { amount: `${val} Grams`, bidder: 'EQB3...9x2A', time: '12m ago' },
      { amount: `${(val * 0.92).toFixed(1)} Grams`, bidder: 'EQC7...1m4P', time: '45m ago' },
      { amount: `${(val * 0.85).toFixed(1)} Grams`, bidder: 'EQD9...8k3L', time: '2h ago' },
    ];
  }, [nft?.offers, cardData.currentBid]);

  useEffect(() => {
    const updateTimer = () => {
      const targetTime = new Date(cardData.endTime).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeftStr('00h : 00m : 00s');
        setIsAuctionEnded(true);
        setIsLive(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      const ss = seconds.toString().padStart(2, '0');

      setTimeLeftStr(`${hh}h : ${mm}m : ${ss}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cardData.endTime]);

  // Track playing state logic
  const isThisPlaying = useMemo(() => {
    return isPlaying && currentTrack?.id === cardData.id;
  }, [isPlaying, currentTrack?.id, cardData.id]);

  const handleTogglePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisPlaying) {
      togglePlay();
    } else {
      playTrack({
        id: cardData.id,
        songId: cardData.id,
        title: cardData.title,
        artist: cardData.creator,
        artistId: 'artist_featured',
        coverUrl: cardData.imageUrl,
        audioUrl: cardData.audioUrl,
        duration: 180,
        genre: 'Electronic',
        playCount: 1000,
        likes: 100,
        createdAt: new Date().toISOString(),
      } as unknown as Track);
    }
  };

  const handleCardClick = () => {
    navigate(`/nft/${cardData.id}`);
  };

  const handleBidClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlaceBid) {
      onPlaceBid(cardData as unknown as NFTItem);
    } else {
      setShowBidModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-zinc-950/90 hover:bg-zinc-900 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:shadow-blue-950/20 transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* 1. Asset Window (Square vinyl/album artwork container) */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 group/img shadow-md">
        <img
          src={cardData.imageUrl}
          alt={cardData.title}
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Vinyl Grooves Texture Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Right Overlay Badge: "Live Auction" with red glowing dot or "Auction Ended" / "Fixed Price" */}
        {isLive ? (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md shadow-lg text-[11px] font-extrabold text-white uppercase tracking-wider">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            </span>
            <span>Live Auction</span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md shadow-lg text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500" />
            <span>{isAuctionEnded ? 'Auction Ended' : 'Fixed Price'}</span>
          </div>
        )}

        {/* Play Preview Quick Overlay on image hover */}
        <button
          onClick={handleTogglePreview}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 cursor-pointer"
          title={isThisPlaying ? 'Pause Preview' : 'Play Audio Preview'}
        >
          <div className="p-3.5 rounded-full bg-blue-600/90 text-white shadow-xl hover:scale-110 transition-transform">
            {isThisPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </div>
        </button>

        {/* 2. Countdown Timer: Semi-transparent black pill element pinned to bottom-center */}
        {isLive ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-mono font-black text-white flex items-center gap-2 shadow-2xl tracking-wider whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{timeLeftStr}</span>
          </div>
        ) : (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-mono font-bold text-zinc-400 flex items-center gap-2 shadow-2xl tracking-wider whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>{isAuctionEnded ? 'Auction Concluded' : 'Available Now'}</span>
          </div>
        )}
      </div>

      {/* 3. Content Details */}
      <div className="mt-4 flex flex-col space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white truncate group-hover:text-blue-400 transition-colors">
              {cardData.title}
            </h3>
            <p className="text-xs font-semibold text-zinc-400 truncate mt-0.5">
              by <span className="text-zinc-200">{cardData.creator}</span>
            </p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 rounded-md shrink-0">
            Audio NFT
          </span>
        </div>

        {/* Audio Preview Waveform Vector Thumbnail Graphic */}
        <div 
          onClick={handleTogglePreview}
          className="flex items-center gap-2 py-2 px-3 bg-zinc-900/80 hover:bg-zinc-800/80 rounded-xl transition-all cursor-pointer group/wave"
          title="Click to preview audio waveform"
        >
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover/wave:scale-105 transition-transform shrink-0">
            {isThisPlaying ? (
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
            )}
          </div>

          {/* SVG Vector Waveform Bars */}
          <div className="flex-1 flex items-center justify-between gap-[2px] h-5 px-1 overflow-hidden">
            {WAVEFORM_BARS.map((height, idx) => (
              <span
                key={idx}
                className={`w-[3px] rounded-full transition-all duration-300 ${
                  isThisPlaying
                    ? 'bg-gradient-to-t from-blue-500 to-indigo-300 animate-pulse'
                    : idx % 2 === 0
                    ? 'bg-blue-500/80'
                    : 'bg-zinc-700'
                }`}
                style={{
                  height: isThisPlaying
                    ? `${Math.max(20, (height + (idx % 3 === 0 ? 30 : -15)) % 100)}%`
                    : `${height}%`,
                  animationDelay: `${(idx % 8) * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bid Metrics: Split metadata footer with dark glass aesthetic */}
      <div className={`mt-4 pt-3 px-3.5 pb-3 flex items-center justify-between rounded-xl border transition-all duration-700 ${
        isBidPulsing 
          ? 'bg-blue-950/40 border-blue-500/65 shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-[1.01]' 
          : 'bg-zinc-950/60 backdrop-blur-md border-zinc-800/80 shadow-inner'
      }`}>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">
            Current Bid
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-all duration-500 ${isBidPulsing ? 'bg-blue-400 scale-125 shadow-[0_0_12px_rgba(59,130,246,1)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'} animate-pulse`} />
            <span className={`text-sm font-black font-mono tracking-tight transition-colors duration-500 ${isBidPulsing ? 'text-blue-200' : 'text-white'}`}>
              {cardData.currentBid}
            </span>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-zinc-800" />

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-0.5">
            Floor Price
          </span>
          <span className="text-xs font-bold text-zinc-300 font-mono tracking-tight block">
            {cardData.floorPrice}
          </span>
        </div>
      </div>

      {/* View History Text Link & Tooltip */}
      <div className="relative mt-2.5 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowHistory((prev) => !prev);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group/link"
        >
          <History className="w-3.5 h-3.5" />
          <span>View History</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
        </button>

        {/* Small Tooltip Popover Showing Last Three Bids */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl z-30 space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  Last 3 Bids
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-zinc-500 hover:text-white transition-colors p-0.5 cursor-pointer"
                  title="Close tooltip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {recentBids.map((bid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-zinc-950/70"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                      <span className="font-mono font-bold text-zinc-200 text-[11px] truncate">
                        {bid.bidder}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-blue-400 text-[11px] block">
                        {bid.amount}
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-500 block">
                        {bid.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Interaction: Primary action buttons (Place Bid & Share) */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBidClick}
          className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-[0_0_22px_rgba(0,136,204,0.7)] hover:ring-2 hover:ring-blue-400/60 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Gavel className="w-4 h-4" />
          <span>Place a Bid</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title: cardData.title,
                text: `Check out "${cardData.title}" by ${cardData.creator} on TonJam!`,
                url: `${window.location.origin}/#/nft/${cardData.id}`,
              }).catch(() => setShowShareModal(true));
            } else {
              setShowShareModal(true);
            }
          }}
          className="py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer border border-white/5 flex items-center justify-center gap-2"
          title="Share on Twitter, Telegram & more"
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          <span>Share</span>
        </button>
      </div>

      <ShareNFTDialog
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        nft={cardData as unknown as NFTItem}
      />

      {showBidModal && (
        <BidModal
          nft={cardData as unknown as NFTItem}
          onClose={() => setShowBidModal(false)}
        />
      )}
    </motion.div>
  );
};

export default FeaturedAuctionCard;
