import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { resolveEndedAuctions } from '@/services/auctionService';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface NFTAuctionTimerProps {
  nftId: string;
  initialAuctionEndTime?: string;
  variant?: 'default' | 'compact' | 'badge' | 'mini';
  className?: string;
  onEnded?: () => void;
}

export const NFTAuctionTimer: React.FC<NFTAuctionTimerProps> = ({
  nftId,
  initialAuctionEndTime,
  variant = 'default',
  className = '',
  onEnded
}) => {
  const [auctionEndTime, setAuctionEndTime] = useState<string | null>(initialAuctionEndTime || null);
  const [listingType, setListingType] = useState<string | null>('auction');
  const [loading, setLoading] = useState<boolean>(true);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  const [isEndingSoon, setIsEndingSoon] = useState(false);

  // Subscribe to Firebase Firestore to match real-time doc updates
  useEffect(() => {
    if (!nftId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'nfts', nftId);
    
    // Set up snapshot listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAuctionEndTime(data.auctionEndTime || null);
        setListingType(data.listingType || null);
      } else {
        setAuctionEndTime(null);
        setListingType(null);
      }
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, `nfts/${nftId}`);
    });

    return () => unsubscribe();
  }, [nftId]);

  // Handle countdown calculation and trigger callback & event on reach zero
  useEffect(() => {
    if (loading) return;

    if (!auctionEndTime || listingType !== 'auction') {
      setTimeLeft(prev => ({ ...prev, isEnded: true }));
      return;
    }

    const calculateTime = () => {
      const endTime = new Date(auctionEndTime).getTime();
      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        });
        setIsEndingSoon(false);
        return true; // flag ended
      }

      // Ending soon if less than 1 hour remains
      setIsEndingSoon(difference < 3600000);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isEnded: false,
      });
      return false;
    };

    const triggerEndedFlow = () => {
      resolveEndedAuctions().then(() => {
        if (onEnded) onEnded();
        // Dispatch custom refresh event as required
        window.dispatchEvent(new CustomEvent('refresh-nft-data', { detail: { nftId } }));
      });
    };

    const hasEndedInitially = calculateTime();
    if (hasEndedInitially) {
      triggerEndedFlow();
      return;
    }

    const interval = setInterval(() => {
      const ended = calculateTime();
      if (ended) {
        clearInterval(interval);
        triggerEndedFlow();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionEndTime, listingType, loading, nftId, onEnded]);

  if (loading) {
    return (
      <span className={cn("text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono animate-pulse", className)}>
        Syncing...
      </span>
    );
  }

  if (timeLeft.isEnded) {
    return (
      <span className={cn("text-[10px] font-bold text-red-500 uppercase tracking-wider font-mono", className)}>
        Auction Ended
      </span>
    );
  }

  const formattedHours = timeLeft.hours.toString().padStart(2, '0');
  const formattedMinutes = timeLeft.minutes.toString().padStart(2, '0');
  const formattedSeconds = timeLeft.seconds.toString().padStart(2, '0');

  if (variant === 'mini') {
    return (
      <span className={cn(
        "font-mono text-[10px] tracking-tight tabular-nums font-semibold",
        isEndingSoon ? "text-red-500 animate-pulse" : "text-amber-500",
        className
      )}>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {formattedHours}:{formattedMinutes}:{formattedSeconds}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-full select-none font-mono text-[9px] font-bold tracking-wider",
        isEndingSoon 
          ? "bg-red-500/10 text-red-500 animate-pulse" 
          : "bg-amber-500/10 text-amber-500",
        className
      )}>
        <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: isEndingSoon ? '4s' : '10s' }} />
        <span className="tabular-nums">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {formattedHours}:{formattedMinutes}:{formattedSeconds}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-col text-right", className)}>
        <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
          TIME REMAINING
        </span>
        <span className={cn(
          "text-[10px] sm:text-[12px] font-black uppercase tracking-wider font-mono transition-all duration-300 tabular-nums",
          isEndingSoon 
            ? "text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
            : "text-amber-500"
        )}>
          {timeLeft.days > 0 ? `${timeLeft.days}D ` : ''}
          {formattedHours}H {formattedMinutes}M {formattedSeconds}S
        </span>
      </div>
    );
  }

  // Default block style (usually inside dedicated cards etc.)
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl bg-[#0a113a]/40 dark:bg-black/20 backdrop-blur-md shadow-sm",
      isEndingSoon && "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
      className
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isEndingSoon ? "bg-red-500 animate-ping" : "bg-green-500 animate-pulse"
        )} />
        <span className="text-[9px] font-black text-foreground uppercase tracking-widest">
          Active Auction
        </span>
      </div>
      <div className="text-right">
        <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
          Time Remaining
        </span>
        <span className={cn(
          "text-[12px] font-black font-mono tracking-wider transition-colors duration-300 tabular-nums",
          isEndingSoon ? "text-red-500 animate-pulse" : "text-amber-500"
        )}>
          {timeLeft.days > 0 ? `${timeLeft.days}D : ` : ''}
          {formattedHours}H : {formattedMinutes}M : {formattedSeconds}S
        </span>
      </div>
    </div>
  );
};
