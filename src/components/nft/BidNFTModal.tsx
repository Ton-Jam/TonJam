import React, { useState, useEffect } from "react";
import { X, Loader2, Gavel, AlertCircle, Check, Clock, Wallet, ArrowUpRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { NFTItem } from "@/types";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { placeBid, getTonPrice, getTonBalance } from "@/services/tonService";
import { getPlaceholderImage } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArtistVerificationBadge } from "@/components/ArtistVerificationBadge";

interface BidNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
  onBidPlaced?: () => void;
}

export const BidNFTModal: React.FC<BidNFTModalProps> = ({
  isOpen,
  onClose,
  nft,
  onBidPlaced,
}) => {
  const { addNotification, updateNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentBid = parseFloat(nft.price) || 0;
  const minBid = (currentBid * 1.05).toFixed(2);
  const [bidAmount, setBidAmount] = useState(minBid);
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(userProfile?.tonBalance || 0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auction countdown state
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);

  useEffect(() => {
    if (!nft.auctionEndTime) {
      setTimeRemaining("Open Auction");
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(nft.auctionEndTime!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsAuctionEnded(true);
        setTimeRemaining("Auction Ended");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nft.auctionEndTime]);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      return;
    }

    const fetchData = async () => {
      try {
        const price = await getTonPrice();
        setTonPrice(price);

        if (userAddress) {
          const balance = await getTonBalance(userAddress);
          setWalletBalance(balance);
        }
      } catch (err) {
        console.warn("Failed to fetch TON market price", err);
      }
    };
    fetchData();
  }, [isOpen, userAddress]);

  useEffect(() => {
    setBidAmount(minBid);
  }, [minBid]);

  useEffect(() => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError("Please enter a valid bid amount.");
    } else if (amount < parseFloat(minBid)) {
      setValidationError(`Minimum allowable bid is ${minBid} TON.`);
    } else if (walletBalance > 0 && amount > walletBalance) {
      setValidationError("Bid amount exceeds available TON wallet balance.");
    } else {
      setValidationError(null);
    }
  }, [bidAmount, minBid, walletBalance]);

  const bidInUsd = tonPrice ? (parseFloat(bidAmount || "0") * tonPrice).toFixed(2) : (parseFloat(bidAmount || "0") * 5.2).toFixed(2);
  const totalBidsCount = (nft.offers?.length || 0) + (nft.history?.filter(h => h.event === 'Bid').length || 0);

  const handleQuickAdd = (multiplier: number) => {
    const base = parseFloat(minBid);
    const newAmount = (base * multiplier).toFixed(2);
    setBidAmount(newAmount);
  };

  const handleConnectWallet = () => {
    try {
      tonConnectUI.openModal();
    } catch (err) {
      console.error("Wallet modal trigger failed", err);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress) {
      toast.error("Please connect your TON wallet to place a bid.");
      addNotification("Connect your TON wallet to place bids.", "warning");
      handleConnectWallet();
      return;
    }

    if (isAuctionEnded) {
      toast.error("This auction has ended. No more bids are accepted.");
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);
    addNotification(`Broadcasting bid of ${bidAmount} TON to TonJam protocol...`, "info");

    try {
      await placeBid(tonConnectUI, nft.owner || "", bidAmount);

      const newOffer = {
        id: `offer-${Date.now()}`,
        offerer: userAddress,
        price: bidAmount,
        timestamp: new Date().toISOString(),
        duration: "24h",
      };

      const newHistoryItem = {
        id: `hist-${Date.now()}`,
        event: "Bid",
        price: `${bidAmount} TON`,
        from: userAddress,
        to: nft.owner || "Auction Contract",
        date: new Date().toISOString(),
      };

      updateNFT(nft.id, {
        price: bidAmount,
        offers: [newOffer, ...(nft.offers || [])],
        history: [newHistoryItem, ...(nft.history || [])],
      });

      setIsSuccess(true);
      toast.success(`Bid of ${bidAmount} TON placed successfully!`);
      addNotification(`Your bid of ${bidAmount} TON is now leading!`, "success");

      if (onBidPlaced) {
        onBidPlaced();
      }

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("Bid placement failed:", err);
      toast.error(err?.message || "Bid transaction failed or was rejected.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-[#050A24] text-white p-6 rounded-2xl shadow-2xl overflow-hidden sm:max-w-lg">
        {/* Subtle background ambient blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0052FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0052FF]/20 flex items-center justify-center text-[#0098EA]">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">Place Auction Bid</h2>
              <p className="text-xs text-slate-400">Compete for on-chain music NFT ownership</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NFT Asset Summary */}
        <div className="relative flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.04] mt-3">
          <img
            src={nft.imageUrl || (nft as any).image || getPlaceholderImage(`nft-${nft.id}`)}
            alt={nft.title}
            className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0 shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">{nft.title}</h3>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-xs text-slate-400 truncate">{nft.creator || nft.artist}</span>
              <ArtistVerificationBadge 
                isVerified={true} 
                artistName={nft.creator || nft.artist} 
                size="sm" 
                showLabel={false} 
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Bid:</span>
              <span className="text-xs font-mono font-black text-amber-300">{nft.price} TON</span>
            </div>
          </div>
        </div>

        {/* Auction Status Bar */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-white/[0.03] p-2.5 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Remaining</span>
              <span className="text-xs font-bold text-white font-mono">{timeRemaining}</span>
            </div>
          </div>
          <div className="bg-white/[0.03] p-2.5 rounded-xl flex items-center gap-2">
            <Gavel className="w-4 h-4 text-[#0098EA] shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Bids</span>
              <span className="text-xs font-bold text-white font-mono">{totalBidsCount} bids</span>
            </div>
          </div>
        </div>

        {/* Connected TON Wallet State */}
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${userAddress ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'}`} />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                {userAddress ? "TON Wallet Connected" : "TON Wallet Disconnected"}
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "No wallet linked"}
              </span>
            </div>
          </div>
          {!userAddress ? (
            <button
              type="button"
              onClick={handleConnectWallet}
              className="px-3 py-1.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Wallet className="w-3.5 h-3.5" /> Connect
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Balance</span>
              <span className="text-xs font-mono font-bold text-white">{walletBalance.toFixed(2)} TON</span>
            </div>
          )}
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white">Bid Confirmed</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Your bid of <strong className="text-emerald-300 font-mono">{bidAmount} TON</strong> is now active on the TonJam ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitBid} className="space-y-4 mt-3">
            {/* Bid Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Your Bid Magnitude</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Min: <strong className="text-white">{minBid} TON</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={isProcessing}
                  placeholder={minBid}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.05] text-white font-mono text-lg font-bold focus:outline-none focus:bg-white/[0.08] transition-all pr-20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-wider text-[#0098EA]">
                  TON
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>≈ ${bidInUsd} USD</span>
                {walletBalance > 0 && (
                  <span>Available: <strong className="text-slate-300 font-mono">{walletBalance.toFixed(2)} TON</strong></span>
                )}
              </div>
            </div>

            {/* Quick Bid Presets */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: "Min (+5%)", mult: 1.0 },
                { label: "+10%", mult: 1.1 },
                { label: "+25%", mult: 1.25 },
                { label: "+50%", mult: 1.5 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleQuickAdd(preset.mult)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-bold text-slate-300 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {validationError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || Boolean(validationError) || isAuctionEnded}
                className="flex-[2] py-3 rounded-xl bg-[#0052FF] hover:bg-[#1a66ff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Bid...</span>
                  </>
                ) : isAuctionEnded ? (
                  <span>Auction Closed</span>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Place {bidAmount} TON Bid</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BidNFTModal;
