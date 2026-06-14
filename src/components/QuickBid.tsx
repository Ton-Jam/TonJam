import React, { useState, useEffect, useMemo } from "react";
import { Gavel, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { NFTItem } from "@/types";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { placeBid, getTonBalance } from "@/services/tonService";
import { cn } from "@/lib/utils";

interface QuickBidProps {
  nft: NFTItem;
  className?: string;
  onBidPlaced?: () => void;
}

export const QuickBid: React.FC<QuickBidProps> = ({ nft, className, onBidPlaced }) => {
  const { addNotification, updateNFT, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(userProfile.tonBalance || 0);

  // Calculate current watermark
  const currentBid = parseFloat(nft.price) || 0;
  // Standard 5% minimum bid increment
  const minBid = useMemo(() => {
    return (currentBid * 1.05).toFixed(2);
  }, [currentBid]);

  // Calculate distinct presets for quick bidding
  const increments = useMemo(() => {
    return [
      { label: "MIN (+5%)", value: (currentBid * 1.05).toFixed(2) },
      { label: "+10%", value: (currentBid * 1.10).toFixed(2) },
      { label: "+20%", value: (currentBid * 1.20).toFixed(2) },
      { label: "+50%", value: (currentBid * 1.50).toFixed(2) },
    ];
  }, [currentBid]);

  const [selectedBid, setSelectedBid] = useState<string>(minBid);

  // Sync selected bid if current bid updates
  useEffect(() => {
    setSelectedBid(minBid);
  }, [minBid]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (userAddress) {
        try {
          const balance = await getTonBalance(userAddress);
          setWalletBalance(balance);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchBalance();
  }, [userAddress]);

  const handlePlaceQuickBid = async () => {
    if (!userAddress) {
      addNotification("Connect wallet to broadcast bid stream.", "warning");
      tonConnectUI.openModal();
      return;
    }

    const value = parseFloat(selectedBid);
    if (isNaN(value) || value < parseFloat(minBid)) {
      addNotification(`Bid is below acceptable minimum of ${minBid} TON.`, "warning");
      return;
    }

    if (value > walletBalance) {
      addNotification("Insufficient wallet balance for this premium bid.", "warning");
      return;
    }

    setIsProcessing(true);
    addNotification(`Initiating Quick Bid of ${selectedBid} TON via connected wallet...`, "info");

    try {
      // Execute simulated wallet call standard for TON network
      await placeBid(tonConnectUI, nft.owner, selectedBid);

      const newOffer = {
        id: `quick-offer-${Date.now()}`,
        offerer: userAddress,
        price: selectedBid,
        timestamp: "Just now",
        duration: "24h",
      };

      // Update local context/state
      updateNFT(nft.id, {
        price: selectedBid,
        offers: [newOffer, ...(nft.offers || [])],
      });

      addNotification(`Quick Bid of ${selectedBid} TON successfully secured!`, "success");
      
      if (onBidPlaced) {
        onBidPlaced();
      }
    } catch (e) {
      console.error(e);
      addNotification("Quick bid sign transmission canceled or failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("bg-[#050a24]/40 backdrop-blur-3xl p-4 rounded-xl flex flex-col gap-3.5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
            QUICK BID CONSOLE
          </span>
        </div>
        {userAddress && (
          <span className="text-[8px] font-bold text-zinc-500 font-mono">
            BAL: {walletBalance.toFixed(2)} TON
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {increments.map((inc) => {
          const isSelected = selectedBid === inc.value;
          return (
            <button
              key={inc.label}
              onClick={() => setSelectedBid(inc.value)}
              disabled={isProcessing}
              className={cn(
                "py-2 px-1 rounded-lg text-center transition-all cursor-pointer active:scale-95 disabled:opacity-50",
                isSelected
                  ? "bg-blue-600/20 text-blue-400 font-black scale-[1.02]"
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground font-bold"
              )}
            >
              <div className="text-[8px] tracking-wide uppercase">{inc.label}</div>
              <div className="text-[10px] font-mono mt-0.5">{inc.value}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#050a24]/30 p-2.5 rounded-lg">
        <div className="text-left w-full sm:w-auto">
          <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest block">
            SELECTED ACTION STREAM
          </span>
          <span className="text-lg font-black font-mono text-zinc-100">
            {selectedBid} <span className="text-[10px] font-bold text-blue-400">TON</span>
          </span>
        </div>

        <button
          onClick={handlePlaceQuickBid}
          disabled={isProcessing}
          className={cn(
            "w-full sm:w-auto px-5 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.25em] text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 duration-150 shadow-md",
            isProcessing
              ? "bg-zinc-800 text-zinc-500"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-blue-500/20"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          ) : (
            <Gavel className="h-3 w-3 text-white" />
          )}
          {isProcessing ? "BROADCASTING..." : "CONFIRM QUICK BID"}
        </button>
      </div>
    </div>
  );
};
