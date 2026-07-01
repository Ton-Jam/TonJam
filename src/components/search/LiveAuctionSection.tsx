import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Gem } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LiveAuctionSectionProps {
  auctions: NFTItem[];
}

const CountdownTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const total = Date.parse(endTime) - Date.now();
    if (total <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
      expired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.expired) {
    return <span className="text-[8px] font-mono text-red-500 font-bold uppercase tracking-wider">EXPIRED</span>;
  }

  return (
    <span className="text-[8.5px] font-mono text-amber-500 font-bold tracking-widest flex items-center gap-1">
      <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
      {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
    </span>
  );
};

export const LiveAuctionSection: React.FC<LiveAuctionSectionProps> = ({ auctions }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">Ending Soon</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Live Auctions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {auctions.map((auction) => {
          const imageSrc = auction.imageUrl || auction.coverUrl || getPlaceholderImage(auction.title);
          // Standard end time fallback if none defined
          const dummyEndTime = auction.auctionEndTime || new Date(Date.now() + 1000 * 60 * 60 * 4.5).toISOString();

          return (
            <motion.div
              key={`auction-${auction.id}`}
              whileHover={{ y: -3 }}
              className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 flex gap-4 cursor-pointer group"
              onClick={() => navigate(`/nft/${auction.id}`)}
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                <img
                  src={imageSrc}
                  alt={auction.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(auction.title); }}
                />
                <div className="absolute top-1.5 left-1.5 bg-red-600 text-[6.5px] font-mono font-bold text-white px-1 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 animate-pulse">
                  <span>LIVE</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                    {auction.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">by {auction.artist || auction.creator}</p>
                </div>

                <div className="flex items-center gap-4 py-1.5 border-t border-b border-white/5">
                  <div>
                    <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider">TOP BID</p>
                    <p className="text-xs font-mono font-extrabold text-white flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{auction.price} TON</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider">CLOSING</p>
                    <CountdownTimer endTime={dummyEndTime} />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full py-1 text-[8px] font-bold uppercase tracking-widest rounded-lg h-7 bg-[#0052FF] text-white hover:bg-[#0052FF]/85 active:scale-95 transition-all mt-1"
                >
                  PLACE BID
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
