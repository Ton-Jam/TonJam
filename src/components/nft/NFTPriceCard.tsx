import React from "react";
import { 
  Zap, Gavel, Handshake, Lock, Coins, Bell, BellOff, 
  TrendingDown, Share2, Send, Loader2 
} from "lucide-react";
import { motion } from "motion/react";
import { NFTItem, NFTOffer } from "@/types";
import { PriceSparkline } from "@/components/PriceSparkline";
import { AuctionCountdownTimer } from "@/components/AuctionCountdownTimer";

interface NFTPriceCardProps {
  nft: NFTItem;
  isAuction: boolean;
  isAuctionEnded: boolean;
  highestOfferPrice: number;
  isOwner: boolean;
  isPlacingBid: boolean;
  userOffer?: NFTOffer | null;
  onAction: () => void;
  onOffer: () => void;
  onCancelListing: () => void;
  onCancelBid: () => void;
  onStake: () => void;
  onTip: () => void;
  onPriceAlert: () => void;
  onShare: () => void;
  onManage: () => void;
  onSell: () => void;
  onSend: () => void;
  priceAlertEnabled: boolean;
  priceAlertPercent: number;
  onTogglePriceAlert: () => void;
  onPercentChange: (percent: number) => void;
  onSimulateDrop: () => void;
  showGlow?: boolean;
}

export const NFTPriceCard: React.FC<NFTPriceCardProps> = ({
  nft,
  isAuction,
  isAuctionEnded,
  highestOfferPrice,
  isOwner,
  isPlacingBid,
  userOffer,
  onAction,
  onOffer,
  onCancelListing,
  onCancelBid,
  onStake,
  onTip,
  onPriceAlert,
  onShare,
  onManage,
  onSell,
  onSend,
  priceAlertEnabled,
  priceAlertPercent,
  onTogglePriceAlert,
  onPercentChange,
  onSimulateDrop,
  showGlow,
}) => {
  const displayPrice = isAuction
    ? highestOfferPrice > 0
      ? highestOfferPrice
      : nft.startingBid || nft.price
    : nft.price;

  const usdEquivalent = (parseFloat(String(displayPrice || "0")) * 5.2).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className={`bg-white/[0.03] rounded-2xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-xl ${
        showGlow ? "shadow-[0_0_30px_rgba(0,82,255,0.25)]" : ""
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
        <Zap className="h-60 w-60 text-blue-500" />
      </div>

      {/* Main Pricing Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isAuction
                  ? "bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  : "bg-[#0052FF] shadow-[0_0_10px_rgba(0,82,255,0.6)]"
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {isAuction ? "Current Leading Bid" : "Instant Valuation"}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-mono tracking-tight leading-none"
            >
              {displayPrice}
            </motion.span>
            <span className="text-base sm:text-xl font-black text-[#0098EA] uppercase tracking-wider">
              TON
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 font-mono px-3 py-1 bg-white/[0.04] rounded-full">
              ≈ ${usdEquivalent} USD
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              +12.4% 24h Vol
            </span>
          </div>
        </div>

        {/* Sparkline & Auction Timer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 self-stretch md:self-end">
          <PriceSparkline basePrice={parseFloat(nft.price) || 0} history={nft.history} />

          {isAuction && (
            <div className="bg-white/[0.04] p-3 rounded-xl flex items-center justify-between gap-4 shadow-lg text-xs">
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Highest Bid
                </span>
                <span className="text-xs font-black font-mono text-white">
                  {highestOfferPrice} TON
                </span>
              </div>
              <AuctionCountdownTimer nft={nft} variant="compact" className="items-end" />
            </div>
          )}
        </div>
      </div>

      {/* Main Actions Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5 relative z-10">
        {isOwner ? (
          <>
            <button
              onClick={nft.listingType ? onManage : onSell}
              className="flex-1 py-3 px-4 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
            >
              {nft.listingType ? "Manage Listing" : "List For Sale"}
            </button>
            <button
              onClick={onManage}
              className="py-3 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Settings
            </button>
            <button
              onClick={onSend}
              className="py-3 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
            <button
              onClick={onStake}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                nft.isStaked
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-amber-300" />
              {nft.isStaked ? "Staked" : "Stake"}
            </button>
            {nft.listingType && (
              <button
                onClick={onCancelListing}
                className="py-3 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel Listing
              </button>
            )}
          </>
        ) : (
          <>
            <motion.button
              onClick={onAction}
              disabled={isPlacingBid || (isAuction && isAuctionEnded)}
              whileHover={!(isAuction && isAuctionEnded) && !isPlacingBid ? { scale: 1.02 } : undefined}
              whileTap={!(isAuction && isAuctionEnded) && !isPlacingBid ? { scale: 0.98 } : undefined}
              className={`flex-[2] py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
                isAuction && isAuctionEnded
                  ? "bg-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-[#0052FF] hover:bg-[#1a66ff] text-white shadow-blue-500/20"
              }`}
            >
              {isPlacingBid ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isAuction && isAuctionEnded ? (
                "Auction Expired"
              ) : isAuction ? (
                <>
                  <Gavel className="h-4 w-4" /> Place Bid
                </>
              ) : (
                "Acquire Asset"
              )}
            </motion.button>

            <motion.button
              onClick={onOffer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Handshake className="h-4 w-4" /> Make Offer
            </motion.button>

            {userOffer && (
              <button
                onClick={onCancelBid}
                className="py-3.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Retract Offer
              </button>
            )}
          </>
        )}

        <button
          onClick={onStake}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            nft.isStaked
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-amber-300" />
          {nft.isStaked ? "Staked" : "Stake"}
        </button>

        <button
          onClick={onTip}
          className="py-3.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Coins className="h-3.5 w-3.5 text-amber-400" /> Tip
        </button>

        <button
          onClick={onShare}
          className="py-3.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5 text-[#0098EA]" /> Share
        </button>
      </div>

      {/* Price Alert Protocol Controller */}
      <div className="mt-5 p-4 bg-white/[0.02] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                priceAlertEnabled ? "bg-[#0052FF]/20 text-[#0098EA]" : "bg-white/5 text-slate-400"
              }`}
            >
              {priceAlertEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Price Alert Protocol
              </h4>
              <p className="text-[10px] text-slate-400">
                Receive instant push signals when the floor price drops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {priceAlertEnabled && (
              <button
                onClick={onSimulateDrop}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                title="Simulate sudden drop"
              >
                <TrendingDown className="h-3 w-3" /> Test Alert
              </button>
            )}

            <button
              onClick={onTogglePriceAlert}
              className={`px-4 py-1.5 rounded-lg font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                priceAlertEnabled
                  ? "bg-[#0052FF] text-white shadow-md shadow-blue-500/20 hover:bg-[#1a66ff]"
                  : "bg-white/10 hover:bg-white/15 text-slate-300"
              }`}
            >
              {priceAlertEnabled ? "Alert Active" : "Enable Alert"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-400">
            Trigger alert if price dips by <strong className="text-white">{priceAlertPercent}%</strong>:
          </span>
          <div className="flex gap-1.5">
            {[5, 10, 15, 25, 40].map((percent) => (
              <button
                key={percent}
                onClick={() => onPercentChange(percent)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors cursor-pointer ${
                  priceAlertPercent === percent
                    ? "bg-[#0052FF] text-white font-black"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTPriceCard;
