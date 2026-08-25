import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Bookmark, Eye, Layers, Clock } from 'lucide-react';
import { NFTPlaceholder } from '../placeholders/NFTPlaceholder';
import { PriceSparkline } from '../PriceSparkline';
import { cardTokens } from '@/design';

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
  history?: any[];
  listingType?: 'fixed' | 'auction';
}

interface NFTCardProps {
  nft?: NFTData;
  isLoading?: boolean;
  onMint?: (nft: NFTData) => void;
  onBid?: (nft: NFTData) => void;
  onCollect?: (nft: NFTData) => void;
  onLike?: (nft: NFTData) => void;
  onBookmark?: (nft: NFTData) => void;
  className?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  isLoading = false,
  onMint,
  onBid,
  onCollect,
  onLike,
  onBookmark,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLikedState, setIsLikedState] = useState(nft?.isLiked || false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(nft?.isBookmarked || false);
  const [timeLeft, setTimeLeft] = useState('');

  const basePriceNum = React.useMemo(() => {
    if (!nft?.price) return 0;
    const num = parseFloat(nft.price.replace(' TON', '').trim());
    return isNaN(num) ? 0 : num;
  }, [nft?.price]);

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
      <div 
        style={{ width: cardTokens.nftTrack.width, minHeight: cardTokens.nftTrack.cardHeight, borderRadius: cardTokens.global.borderRadius }}
        className={`flex flex-col bg-transparent animate-pulse shrink-0 ${className}`}
      >
        <div className="w-full aspect-square bg-white/10 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
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

  const handleCollectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCollect) onCollect(nft);
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative cursor-pointer p-0 bg-transparent transition-all duration-200 flex flex-col w-[155px] shrink-0 select-none ${className}`}
      onClick={handleCollectClick}
    >
      {/* Artwork */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900/60 shadow-md">
        {imgFailed ? (
          <NFTPlaceholder size={28} />
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Floating Action Button */}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button
            onClick={nft.isLiveAuction ? handleBidClick : (nft.mintStatus === 'open' ? handleMintClick : handleCollectClick)}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all text-[10px] font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col w-full min-w-0 mt-2.5">
        <h4 className="text-[13px] font-semibold tracking-tight text-white/95 truncate w-full group-hover:text-blue-400 transition-colors">
          {nft.title}
        </h4>
        <p className="text-[11px] font-normal text-zinc-400 truncate w-full mt-0.5 hover:text-white transition-colors">
          {nft.creator}
        </p>
        <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-white/70 font-mono">
          <span className="text-blue-400 font-bold">{nft.price}</span>
          <span className="text-white/40">TON</span>
        </div>
      </div>
    </motion.div>
  );
};
export default NFTCard;
