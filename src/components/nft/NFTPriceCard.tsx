import React from "react";
import {
  Zap,
  Gavel,
  Handshake,
  Lock,
  Coins,
  Bell,
  BellOff,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { NFTItem, NFTOffer } from "@/types";
import { PriceSparkline } from "@/components/PriceSparkline";
import { AuctionCountdownTimer } from "@/components/AuctionCountdownTimer";
import { useTonPrice } from "@/contexts/TonPriceContext";
import {
  TON_NETWORK_MODE,
  TONJAM_MARKETPLACE_ADDRESS,
  validateTonAddress,
} from "@/services/tonService";

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
  onPriceAlert?: () => void;
  onShare?: () => void;
  onManage: () => void;
  onSell: () => void;
  onSend: () => void;
  priceAlertEnabled: boolean;
  priceAlertPercent: number;
  onTogglePriceAlert: () => void;
  onPercentChange: (percent: number) => void;
  onSimulateDrop?: () => void;
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
  onManage,
  onSell,
  onSend,
  priceAlertEnabled,
  priceAlertPercent,
  onTogglePriceAlert,
  onPercentChange,
}) => {
  const { price: liveTonUsd } = useTonPrice();
  const hasUsdRate = typeof liveTonUsd === "number" && liveTonUsd > 0;

  const displayPrice = isAuction
    ? highestOfferPrice > 0
      ? highestOfferPrice
      : nft.startingBid || nft.price
    : nft.price;

  const numericTon = parseFloat(String(displayPrice || "0").replace(/[^\d.]/g, "")) || 0;
  const formattedTon = String(displayPrice || "0").replace(/\s*TON\s*$/i, "").trim() || "0";

  const usdEquivalent = hasUsdRate
    ? (numericTon * liveTonUsd!).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  // Honest contract & seller wallet verification for Buy & Bid actions
  const hasValidSeller = Boolean(nft.owner && validateTonAddress(nft.owner, TON_NETWORK_MODE));
  const hasValidContract = Boolean(
    nft.contractAddress && validateTonAddress(nft.contractAddress, TON_NETWORK_MODE)
  );
  const hasMarketplaceContract = Boolean(
    TONJAM_MARKETPLACE_ADDRESS && validateTonAddress(TONJAM_MARKETPLACE_ADDRESS, TON_NETWORK_MODE)
  );

  const isSold =
    String((nft as any).listingStatus || "").toLowerCase() === "sold" ||
    String((nft as any).status || "").toLowerCase() === "sold";

  const canBuyVerified =
    !isOwner &&
    !isAuction &&
    !isSold &&
    numericTon > 0 &&
    ((hasValidContract && hasMarketplaceContract) || hasValidSeller);

  const canBidVerified =
    !isOwner &&
    !isSold &&
    isAuction &&
    !isAuctionEnded &&
    (hasValidContract || hasMarketplaceContract);

  const primaryActionUnavailable =
    !isOwner && (isSold || (isAuction ? !isAuctionEnded && !canBidVerified : !canBuyVerified));

  const unavailableReason = isSold
    ? "This NFT edition has already been sold."
    : isAuction
    ? "Auction contract is not verified for bidding on this release."
    : numericTon <= 0
    ? "This NFT is not currently listed with a price."
    : "Seller wallet or marketplace contract address is unverified for on-chain settlement.";

  const priceHeading = isSold
    ? "Last Sale Price"
    : isAuction
    ? isAuctionEnded
      ? "Winning Bid"
      : "Current Leading Bid"
    : numericTon > 0
    ? "Buy Now Price"
    : "Not Currently Listed";

  return (
    <div className="bg-[var(--tj-color-surface-default,#0D1628)] border-2 border-[rgba(192,192,192,0.22)] rounded-[8px] p-4 sm:p-6 relative overflow-hidden transition-colors text-left">
      {/* Main Pricing Header & Sparkline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 relative z-10">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)] block">
            {priceHeading}
          </span>

          <div className="flex items-baseline gap-2">
            <motion.span
              key={formattedTon}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums tracking-tight leading-none"
            >
              {formattedTon}
            </motion.span>
            <span className="text-base sm:text-lg font-black text-[var(--tj-color-brand-primary,#00B4D8)] uppercase tracking-wider">
              TON
            </span>
          </div>

          {usdEquivalent && (
            <div className="flex items-center gap-2 text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-mono tabular-nums">
              <span>≈ ${usdEquivalent} USD</span>
              <span className="text-slate-600">·</span>
              <span>@ ${liveTonUsd!.toFixed(2)} / TON</span>
            </div>
          )}
        </div>

        {/* Sparkline & Auction Timer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 self-stretch md:self-end">
          <PriceSparkline basePrice={numericTon} history={nft.history} />

          {isAuction && (
              <div className="bg-[var(--tj-color-surface-elevated,#111F36)] border-2 border-[rgba(192,192,192,0.22)] p-3 rounded-[8px] flex items-center justify-between gap-4 text-xs">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tj-color-text-secondary,#C2C7CD)]">
                    Highest Bid
                  </span>
                  <span className="text-sm font-black font-mono tabular-nums text-white">
                    {highestOfferPrice > 0 ? `${highestOfferPrice} TON` : `${formattedTon} TON`}
                  </span>
                </div>
                <AuctionCountdownTimer nft={nft} variant="compact" className="items-end" />
              </div>
            )}
          </div>
        </div>

      {/* Main Actions Bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2 relative z-10">
        {isOwner ? (
          <>
            <button
              type="button"
              onClick={nft.listingType ? onManage : onSell}
              className="flex-1 min-w-[140px] py-3 px-4 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white rounded-[8px] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none"
            >
              {nft.listingType ? "Manage Listing" : "List For Sale"}
            </button>
            <button
              type="button"
              onClick={onManage}
              className="py-3 px-3.5 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer outline-none"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={onSend}
              className="py-3 px-3.5 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer outline-none"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
            {nft.listingType && (
              <button
                type="button"
                onClick={onCancelListing}
                className="py-3 px-3.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-[8px] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none"
              >
                Cancel Listing
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onAction}
              disabled={isPlacingBid || (isAuction && isAuctionEnded) || primaryActionUnavailable}
              title={primaryActionUnavailable ? unavailableReason : undefined}
              className={`flex-[2] min-w-[160px] py-3 px-5 rounded-[8px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-0 outline-none transition-colors ${
                (isAuction && isAuctionEnded) || primaryActionUnavailable
                  ? "bg-[var(--tj-color-surface-elevated,#111F36)] text-slate-400 cursor-not-allowed"
                  : "bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white cursor-pointer"
              }`}
            >
              {isPlacingBid ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isSold ? (
                "Sold"
              ) : isAuction && isAuctionEnded ? (
                "Auction Ended"
              ) : primaryActionUnavailable ? (
                isAuction ? (
                  "Bidding Unavailable"
                ) : numericTon <= 0 ? (
                  "Not Listed"
                ) : (
                  "Buy Unavailable"
                )
              ) : isAuction ? (
                <>
                  <Gavel className="h-4 w-4" /> Place Bid
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" /> Buy Now
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOffer}
              className="flex-1 min-w-[125px] py-3 px-4 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[8px] border-2 border-[rgba(192,192,192,0.22)] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer outline-none"
            >
              <Handshake className="h-4 w-4 text-[var(--tj-color-brand-primary,#00B4D8)]" /> Make Offer
            </button>

            {userOffer && (
              <button
                type="button"
                onClick={onCancelBid}
                className="py-3 px-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-[var(--tj-radius-sm,6px)] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none"
              >
                Retract Offer
              </button>
            )}
          </>
        )}

        {/* Shared Utility Actions */}
        <button
          type="button"
          onClick={onStake}
          className={`py-3 px-3.5 rounded-[var(--tj-radius-sm,6px)] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0 outline-none ${
            nft.isStaked
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-[var(--tj-color-surface-elevated,#111F36)] text-purple-300 hover:bg-[var(--tj-color-surface-hover,#132B49)]"
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-amber-300" />
          {nft.isStaked ? "Staked" : "Stake"}
        </button>

        {!isOwner && (
          <button
            type="button"
            onClick={onTip}
            className="py-3 px-3.5 bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white rounded-[var(--tj-radius-sm,6px)] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0 outline-none"
          >
            <Coins className="h-3.5 w-3.5 text-amber-400" /> Tip
          </button>
        )}
      </div>

      {primaryActionUnavailable && (
        <div className="mt-3 p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] border-0 flex items-center gap-2 text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{unavailableReason}</span>
        </div>
      )}

      {/* Price Drop Alert Settings */}
      <div className="mt-4 p-3.5 bg-[var(--tj-color-surface-elevated,#111F36)] border-0 rounded-[var(--tj-radius-sm,6px)] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-[var(--tj-radius-xs,4px)] border-0 ${
                priceAlertEnabled
                  ? "bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-brand-primary,#00B4D8)]"
                  : "bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)]"
              }`}
            >
              {priceAlertEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Price Drop Alert
              </h4>
              <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
                Get notified when listing price drops below threshold
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTogglePriceAlert}
            className={`px-3.5 py-2 rounded-[var(--tj-radius-xs,4px)] font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none shrink-0 ${
              priceAlertEnabled
                ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white hover:bg-[var(--tj-color-brand-hover,#21C2E8)]"
                : "bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-slate-200"
            }`}
          >
            {priceAlertEnabled ? "Alert Active" : "Enable Alert"}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <span className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
            Notify if price dips by <strong className="text-white font-mono">{priceAlertPercent}%</strong>
          </span>
          <div className="flex gap-1.5">
            {[5, 10, 15, 25, 40].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => onPercentChange(percent)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-[var(--tj-radius-xs,4px)] transition-colors cursor-pointer border-0 outline-none ${
                  priceAlertPercent === percent
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white"
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
