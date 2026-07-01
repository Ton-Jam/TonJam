import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Bookmark, Eye, Layers, Clock, ArrowUpRight, 
  TrendingUp, Award, DollarSign, Wallet, ShieldAlert, CheckCircle, Flame 
} from 'lucide-react';
import { NFTPlaceholder } from '../../placeholders/NFTPlaceholder';
import { CollectionPlaceholder } from '../../placeholders/CollectionPlaceholder';

// --- TS INTERFACES ---

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
  auctionEndsAt?: string; // ISO date or string
  isLiked?: boolean;
  isBookmarked?: boolean;
  isLiveAuction?: boolean;
  isVerified?: boolean;
  volume24h?: string;
  volumeChange?: number; // e.g. 15.4 for +15.4%
  rarityScore?: number;
  bidderName?: string;
  bidTime?: string;
}

export interface CollectionData {
  id: string;
  name: string;
  creator: string;
  coverUrl: string;
  itemCount: number;
  floorPrice: string;
  totalVolume: string;
  isVerified?: boolean;
  previewImages?: string[];
}

// --- 1. BASE NFT CARD (190px Width) ---
export const NFTCard: React.FC<{
  nft?: NFTData;
  isLoading?: boolean;
  onMint?: (nft: NFTData) => void;
  onBid?: (nft: NFTData) => void;
  onLike?: (nft: NFTData) => void;
  onBookmark?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, isLoading, onMint, onBid, onLike, onBookmark, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(nft?.isLiked || false);
  const [bookmarked, setBookmarked] = useState(nft?.isBookmarked || false);

  if (isLoading || !nft) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-[190px] shrink-0 ${className}`}>
        <div className="w-full h-[150px] bg-white/10 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[190px] shrink-0 snap-start select-none group relative ${className}`}
    >
      <div className="relative w-full h-[150px] rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed ? (
          <NFTPlaceholder size={28} />
        ) : (
          <img src={nft.imageUrl} alt={nft.title} onError={() => setImgFailed(true)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] uppercase flex items-center gap-0.5 shadow-md">
            <Sparkles className="w-2.5 h-2.5 fill-current" /> NFT
          </span>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); onLike?.(nft); }} className="p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white">
            <Heart className={`w-3.5 h-3.5 ${liked ? 'text-red-500 fill-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-[13px] font-bold text-white truncate">{nft.title}</h4>
        <p className="text-[#9AA0AE] text-[11px] truncate mt-0.5">{nft.creator}</p>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-1">
        <div className="flex justify-between text-[10px] text-[#9AA0AE]">
          <span>Price</span>
          {nft.highestBid && <span>Highest Bid</span>}
        </div>
        <div className="flex justify-between items-baseline font-mono text-[12px] font-black text-white">
          <span className="text-emerald-400">{nft.price} TON</span>
          {nft.highestBid && <span className="text-blue-400">{nft.highestBid} TON</span>}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onMint?.(nft); }}
        className="mt-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-colors"
      >
        Mint NFT
      </button>
    </motion.div>
  );
};

// --- 2. MARKETPLACE CARD ---
export const MarketplaceCard: React.FC<{
  nft: NFTData;
  onBuy?: (nft: NFTData) => void;
  onOffer?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, onBuy, onOffer, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none ${className}`}>
      <NFTCard nft={nft} onMint={onBuy} className="bg-transparent p-0 hover:bg-transparent" />
      <div className="mt-3 flex gap-1.5 w-full">
        <button onClick={() => onBuy?.(nft)} className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-all">
          Buy Now
        </button>
        <button onClick={() => onOffer?.(nft)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-all">
          Offer
        </button>
      </div>
    </div>
  );
};

// --- 3. FEATURED NFT CARD (Full Bleed Header style) ---
export const FeaturedNFTCard: React.FC<{
  nft: NFTData;
  onMint?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, onMint, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-[10px] overflow-hidden bg-[#0A113A] aspect-[16/10] w-full select-none ${className}`}
    >
      <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] via-[#050A24]/30 to-transparent p-5 flex flex-col justify-end" />
      <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
        <div className="min-w-0">
          <span className="bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-2">Featured Collectible</span>
          <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{nft.title}</h3>
          <p className="text-xs text-[#9AA0AE] mt-1">Creator: {nft.creator}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-[#9AA0AE] uppercase tracking-wider">Mint Price</p>
            <p className="text-base font-black text-emerald-400 font-mono">{nft.price} TON</p>
          </div>
          <button onClick={() => onMint?.(nft)} className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-transform">
            Mint Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- 4. TRENDING NFT CARD (Includes Sparkline metrics) ---
export const TrendingNFTCard: React.FC<{
  nft: NFTData;
  rank: number;
  className?: string;
}> = ({ nft, rank, className = '' }) => {
  const isUp = (nft.volumeChange || 0) >= 0;
  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: '#101A3B' }}
      className={`flex items-center p-3 rounded-[10px] bg-[#0A113A] cursor-pointer select-none gap-3 ${className}`}
    >
      <span className="font-mono text-base font-black text-white/40 w-6 text-center">{rank}</span>
      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950">
        <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-[13px] font-bold text-white truncate">{nft.title}</h4>
        <div className="flex items-center gap-1 text-[11px] text-[#9AA0AE]">
          <span>{nft.price} TON floor</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] font-mono font-bold text-white">{nft.volume24h || '0.00'} TON</p>
        <span className={`text-[9px] font-mono font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}{nft.volumeChange?.toFixed(1) || '0.0'}%
        </span>
      </div>
    </motion.div>
  );
};

// --- 5. AUCTION CARD (With Countdown Timer) ---
export const AuctionCard: React.FC<{
  nft: NFTData;
  onBid?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, onBid, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    if (!nft.auctionEndsAt) return;
    const interval = setInterval(() => {
      const diff = +new Date(nft.auctionEndsAt!) - +new Date();
      if (diff <= 0) {
        setTimeLeft('CLOSED');
        clearInterval(interval);
        return;
      }
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nft.auctionEndsAt]);

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none ${className}`}>
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
        <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1 shadow-md">
          <Flame className="w-3 h-3 text-white fill-current animate-bounce" /> LIVE AUCTION
        </span>
      </div>
      <h4 className="text-[14px] font-bold text-white truncate">{nft.title}</h4>
      <div className="mt-3 flex justify-between items-center bg-white/[0.02] p-2.5 rounded-[6px]">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] block">Current Bid</span>
          <span className="text-sm font-black text-blue-400 font-mono">{nft.highestBid || nft.price} TON</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] block">Time Left</span>
          <span className="text-sm font-black text-red-400 font-mono">{timeLeft}</span>
        </div>
      </div>
      <button onClick={() => onBid?.(nft)} className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-[6px] transition-all">
        Place Quick Bid
      </button>
    </div>
  );
};

// --- 6. FLOOR PRICE CARD ---
export const FloorPriceCard: React.FC<{
  title: string;
  floorPrice: string;
  change24h: number;
  volume24h: string;
  className?: string;
}> = ({ title, floorPrice, change24h, volume24h, className = '' }) => {
  const isUp = change24h >= 0;
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none flex flex-col justify-between h-28 ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">{title}</span>
        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(change24h).toFixed(1)}%
        </span>
      </div>
      <div className="mt-2 flex justify-between items-baseline">
        <span className="text-lg font-black text-white font-mono">{floorPrice} TON</span>
        <span className="text-[10px] text-[#9AA0AE] font-mono">Vol: {volume24h} TON</span>
      </div>
    </div>
  );
};

// --- 7. BID CARD ---
export const BidCard: React.FC<{
  nft: NFTData;
  onAccept?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, onAccept, className = '' }) => {
  return (
    <div className={`p-3 rounded-[10px] bg-[#0A113A] select-none flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-950">
          <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[13px] font-bold text-white truncate">{nft.title}</h4>
          <p className="text-[10px] text-[#9AA0AE] truncate">Bid from {nft.bidderName || 'Anonymous'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right font-mono">
          <span className="block text-[11px] font-black text-emerald-400">{nft.highestBid} TON</span>
          <span className="text-[9px] text-[#9AA0AE]/70">{nft.bidTime || 'Just now'}</span>
        </div>
        {onAccept && (
          <button onClick={() => onAccept?.(nft)} className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded-[4px] transition-transform active:scale-95">
            Accept
          </button>
        )}
      </div>
    </div>
  );
};

// --- 8. COLLECTION CARD ---
export const CollectionCard: React.FC<{
  collection?: CollectionData;
  isLoading?: boolean;
  className?: string;
}> = ({ collection, isLoading, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading || !collection) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-[190px] shrink-0 ${className}`}>
        <div className="w-full h-[120px] bg-white/10 rounded-lg mb-3" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  const preImages = collection.previewImages || [];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-all cursor-pointer w-[190px] shrink-0 select-none ${className}`}
    >
      {/* 3 Grid Images layout representing a collection pack */}
      <div className="relative w-full h-[120px] rounded-lg overflow-hidden mb-3 bg-slate-950 flex gap-1">
        <div className="flex-1 h-full">
          {imgFailed ? <CollectionPlaceholder size={24} /> : <img src={collection.coverUrl} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />}
        </div>
        {preImages.length > 0 && (
          <div className="w-14 h-full flex flex-col gap-1">
            <div className="flex-1 bg-white/5 overflow-hidden rounded-tr-md">
              <img src={preImages[0]} className="w-full h-full object-cover" />
            </div>
            {preImages.length > 1 && (
              <div className="flex-1 bg-white/5 overflow-hidden rounded-br-md">
                <img src={preImages[1]} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}
      </div>

      <h4 className="text-[13px] font-bold text-white truncate">{collection.name}</h4>
      <div className="flex items-center gap-1 text-[11px] text-[#9AA0AE] mt-0.5">
        <span className="truncate">by {collection.creator}</span>
        {collection.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between font-mono text-[10px] text-[#9AA0AE]">
        <div>
          <span>Floor</span>
          <span className="block font-black text-white mt-0.5">{collection.floorPrice} TON</span>
        </div>
        <div className="text-right">
          <span>Volume</span>
          <span className="block font-black text-blue-400 mt-0.5">{collection.totalVolume} TON</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- 9. MINT CARD (With launching metrics progress bar) ---
export const MintCard: React.FC<{
  nft: NFTData;
  onMint?: (nft: NFTData) => void;
  className?: string;
}> = ({ nft, onMint, className = '' }) => {
  const minted = nft.supplyMinted || 0;
  const total = nft.supplyTotal || 1000;
  const percent = Math.min(100, Math.round((minted / total) * 100));

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none relative ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-950">
          <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[8px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full inline-block">MINTING LAUNCHPAD</span>
          <h4 className="text-[14px] font-bold text-white mt-1 truncate">{nft.title}</h4>
          <p className="text-[11px] text-emerald-400 font-mono font-black mt-0.5">{nft.price} TON</p>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-center text-[10px] text-[#9AA0AE] font-mono">
          <span>Progress</span>
          <span className="font-bold text-white">{percent}% ({minted}/{total})</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <button
        onClick={() => onMint?.(nft)}
        disabled={nft.mintStatus === 'sold_out'}
        className={`mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-[6px] transition-transform active:scale-95 ${
          nft.mintStatus === 'sold_out' ? 'opacity-50 cursor-not-allowed bg-slate-800' : ''
        }`}
      >
        {nft.mintStatus === 'sold_out' ? 'SOLD OUT' : 'MINT NOW'}
      </button>
    </div>
  );
};

// --- 10. MARKETPLACE ANALYTICS CARD ---
export const MarketplaceAnalyticsCard: React.FC<{
  totalVolume: string;
  totalSales: number;
  activeListings: number;
  ownersRatio: string;
  className?: string;
}> = ({ totalVolume, totalSales, activeListings, ownersRatio, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Market Metrics</span>
      </div>
      <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-[#9AA0AE]">
        <div>
          <span>Total volume</span>
          <span className="block text-sm font-black text-white mt-1">{totalVolume} TON</span>
        </div>
        <div>
          <span>Sales count</span>
          <span className="block text-sm font-black text-white mt-1">{totalSales.toLocaleString()}</span>
        </div>
        <div>
          <span>Active listings</span>
          <span className="block text-sm font-black text-blue-400 mt-1">{activeListings} items</span>
        </div>
        <div>
          <span>Owners ratio</span>
          <span className="block text-sm font-black text-emerald-400 mt-1">{ownersRatio}</span>
        </div>
      </div>
    </div>
  );
};
