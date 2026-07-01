import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Bookmark, Eye, Layers, Clock } from 'lucide-react';
import { NFTPlaceholder } from '../placeholders/NFTPlaceholder';

export interface NFTData {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  price: string; // Floor Price in TON
  highestBid?: string; // Highest Bid in TON
  ownersCount?: number;
  supplyTotal?: number;
  supplyMinted?: number;
  mintStatus?: 'open' | 'sold_out' | 'paused';
  auctionEndsAt?: string; // ISO date or descriptive string
  isLiked?: boolean;
  isBookmarked?: boolean;
  isLiveAuction?: boolean;
  isVerified?: boolean;
}

interface NFTCardProps {
  nft?: NFTData;
  isLoading?: boolean;
  onMint?: (nft: NFTData) => void;
  onBid?: (nft: NFTData) => void;
  onLike?: (nft: NFTData) => void;
  onBookmark?: (nft: NFTData) => void;
  className?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  isLoading = false,
  onMint,
  onBid,
  onLike,
  onBookmark,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLikedState, setIsLikedState] = useState(nft?.isLiked || false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(nft?.isBookmarked || false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate live countdown
  useEffect(() => {
    if (!nft?.auctionEndsAt) return;

    const updateTimer = () => {
      const difference = +new Date(nft.auctionEndsAt!) - +new Date();
      if (difference <= 0) {
        setTimeLeft('ENDED');
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nft?.auctionEndsAt]);

  if (isLoading || !nft) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] animate-pulse w-[190px] shrink-0 ${className}`}>
        <div className="w-full h-[150px] bg-white/10 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-5 bg-white/10 rounded w-full mt-2" />
        </div>
      </div>
    );
  }

  const handleMintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMint) onMint(nft);
  };

  const handleBidClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBid) onBid(nft);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikedState(!isLikedState);
    if (onLike) onLike(nft);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarkedState(!isBookmarkedState);
    if (onBookmark) onBookmark(nft);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[190px] shrink-0 snap-start select-none group relative ${className}`}
    >
      {/* Visual Asset Container */}
      <div className="relative w-full h-[150px] rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed ? (
          <NFTPlaceholder size={28} />
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Action badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-0.5 shadow-md">
            <Sparkles className="w-2.5 h-2.5 fill-current" /> NFT
          </span>
          {nft.isLiveAuction && (
            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              LIVE
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlays */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLikeClick}
            className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors active:scale-90"
          >
            <Heart className={`w-3.5 h-3.5 ${isLikedState ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>
          <button
            onClick={handleBookmarkClick}
            className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors active:scale-90"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarkedState ? 'text-blue-400 fill-blue-400' : 'text-white'}`} />
          </button>
        </div>

        {/* Countdown Overlay for Live Auctions */}
        {nft.isLiveAuction && timeLeft && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-[4px] px-2 py-1 flex items-center justify-between text-[9px] font-mono text-white/90">
            <div className="flex items-center gap-1 text-red-400">
              <Clock className="w-3 h-3 animate-pulse" />
              <span className="font-bold">ENDS:</span>
            </div>
            <span className="font-black text-blue-300">{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Title and Creator */}
      <div className="min-w-0">
        <h4 className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
          {nft.title}
        </h4>
        <div className="flex items-center gap-1 mt-0.5 text-[#9AA0AE] text-[11px] truncate">
          <span className="truncate">{nft.creator}</span>
          {nft.isVerified && (
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </span>
          )}
        </div>
      </div>

      {/* Market Indicators */}
      <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
        <div className="flex justify-between text-[10px] text-[#9AA0AE]">
          <span>Floor Price</span>
          {nft.highestBid && <span>Highest Bid</span>}
        </div>
        <div className="flex justify-between items-baseline font-mono text-[12px] font-black text-white">
          <span className="text-emerald-400">{nft.price} TON</span>
          {nft.highestBid && <span className="text-blue-400">{nft.highestBid} TON</span>}
        </div>
      </div>

      {/* Ownership & Mint Supply Metas */}
      {nft.supplyTotal !== undefined && (
        <div className="mt-2 flex items-center justify-between text-[9px] text-[#9AA0AE] font-mono">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-white/40" />
            <span>Supply: {nft.supplyMinted || 0}/{nft.supplyTotal}</span>
          </div>
          {nft.ownersCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-white/40" />
              <span>{nft.ownersCount} Owners</span>
            </div>
          )}
        </div>
      )}

      {/* Interactive Web3 buttons depending on Mint/Auction status */}
      <div className="mt-3 flex gap-1.5 w-full">
        {nft.mintStatus === 'open' ? (
          <button
            onClick={handleMintClick}
            className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-all shadow-md active:scale-95 text-center"
          >
            Mint NFT
          </button>
        ) : nft.isLiveAuction ? (
          <button
            onClick={handleBidClick}
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-all active:scale-95 text-center"
          >
            Place Bid
          </button>
        ) : (
          <div className="flex-1 py-1.5 bg-white/5 text-[#9AA0AE] font-black text-[10px] uppercase tracking-widest rounded-[6px] text-center">
            {nft.mintStatus === 'sold_out' ? 'Sold Out' : 'Unavailable'}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default NFTCard;
