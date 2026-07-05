import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Zap, Play, Pause, Heart, Gavel, Clock, Eye } from "lucide-react";
import { LiveAuction } from "../types";
import { useAudio } from "@/context/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";

interface LiveAuctionsProps {
  auctions: LiveAuction[];
  onPlaceBid: (auction: LiveAuction) => void;
  onSelectNFT: (nft: any) => void;
}

// Simple Countdown sub-component for LiveAuctions
const AuctionCountdown: React.FC<{ endsAt: string }> = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endsAt) - +new Date();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <span className="font-mono font-black text-white text-[10px]">
      {timeLeft.hours.toString().padStart(2, "0")}:
      {timeLeft.minutes.toString().padStart(2, "0")}:
      {timeLeft.seconds.toString().padStart(2, "0")}
    </span>
  );
};

export const LiveAuctions: React.FC<LiveAuctionsProps> = ({
  auctions,
  onPlaceBid,
  onSelectNFT
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [scrollIndex, setScrollIndex] = useState(0);
  const [watchedAuctions, setWatchedAuctions] = useState<Record<string, boolean>>({});

  const toggleWatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchedAuctions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full relative" id="marketplace-live-auctions">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF3A5C] fill-current animate-pulse" />
            Live Auctions
          </h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            Active real-time bidding on premium audio assets
          </p>
        </div>
      </div>

      {/* Grid of Auctions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {auctions.map((auc) => {
          const isCurrentPlaying = currentTrack?.id === auc.nft.id && isPlaying;
          const isWatched = !!watchedAuctions[auc.id];

          return (
            <motion.div
              key={auc.id}
              whileHover={{ y: -4 }}
              onClick={() => onSelectNFT(auc.nft)}
              className="bg-zinc-950 border border-zinc-900 rounded-[10px] overflow-hidden p-3 flex flex-col justify-between cursor-pointer select-none"
            >
              {/* Media Section */}
              <div className="relative aspect-square w-full rounded-[10px] bg-zinc-900 overflow-hidden mb-3">
                <img
                  src={auc.nft.coverUrl || getPlaceholderImage(auc.nft.title)}
                  alt={auc.nft.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                
                {/* Visual Overlays */}
                <div className="absolute top-2 left-2 flex gap-1 items-center">
                  <span className="flex items-center gap-1 text-[8px] font-black bg-[#FF3A5C] text-white px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    Live
                  </span>
                  <span className="text-[8px] font-black bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded-[4px] border border-zinc-800/40 uppercase tracking-widest">
                    {auc.bidsCount} Bids
                  </span>
                </div>

                <button
                  onClick={(e) => toggleWatch(auc.id, e)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-[4px] bg-zinc-950/80 border border-zinc-800/40 text-zinc-300 hover:text-[#FF3A5C] flex items-center justify-center transition-colors"
                  aria-label="Watch auction"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWatched ? "fill-[#FF3A5C] text-[#FF3A5C]" : ""}`} />
                </button>

                {/* Hover Play Button (Spotify style) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(auc.nft as any);
                    }}
                    className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                    aria-label="Play preview"
                  >
                    {isCurrentPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                </div>

                {/* Countdown display at bottom of image */}
                <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-zinc-950/90 rounded-[4px] border border-zinc-800/30 flex items-center justify-between">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF3A5C]" /> Ends In
                  </span>
                  <AuctionCountdown endsAt={auc.endsAt} />
                </div>
              </div>

              {/* Text Meta */}
              <div className="text-left space-y-1">
                <span className="text-xs font-black text-white uppercase block truncate">{auc.nft.title}</span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{auc.nft.artist}</span>
              </div>

              {/* Auction Bidding Metrics */}
              <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Current Bid</span>
                  <span className="text-xs font-black text-[#FF3A5C] font-mono">{auc.currentBid}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaceBid(auc);
                  }}
                  className="px-3.5 py-1.5 rounded-[6px] bg-white text-zinc-950 font-black text-[9px] uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Place Bid
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
