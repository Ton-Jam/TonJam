import React, { useState, useMemo } from "react";
import { 
  X, 
  ArrowDownUp, 
  Sparkles, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Coins,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NFTItem } from "@/types";
import { TON_LOGO, TJ_COIN_ICON } from "@/constants";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface NFTSwapModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTSwapModal: React.FC<NFTSwapModalProps> = ({ nft, isOpen, onClose }) => {
  const [targetAsset, setTargetAsset] = useState<"TON" | "JAM" | "NOT">("TON");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  const nftPriceTon = parseFloat(nft.price || "12.5");

  const quote = useMemo(() => {
    if (targetAsset === "TON") {
      return {
        receiveAmount: nftPriceTon.toFixed(2),
        symbol: "TON",
        icon: TON_LOGO,
        usdVal: (nftPriceTon * 5.30).toFixed(2)
      };
    } else if (targetAsset === "JAM") {
      const jamAmount = Math.round((nftPriceTon * 5.30) / 0.12);
      return {
        receiveAmount: jamAmount.toString(),
        symbol: "JAM",
        icon: TJ_COIN_ICON,
        usdVal: (nftPriceTon * 5.30).toFixed(2)
      };
    } else {
      const notAmount = Math.round((nftPriceTon * 5.30) / 0.0095);
      return {
        receiveAmount: notAmount.toString(),
        symbol: "NOT",
        icon: "https://assets.coingecko.com/coins/images/33566/standard/NOT.png",
        usdVal: (nftPriceTon * 5.30).toFixed(2)
      };
    }
  }, [targetAsset, nftPriceTon]);

  if (!isOpen) return null;

  const handleConfirmSwap = async () => {
    setIsSwapping(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    setIsSwapping(false);

    confetti({ particleCount: 100, spread: 70 });
    toast.success(`Successfully swapped '${nft.title}' for ${quote.receiveAmount} ${quote.symbol}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0A113A] rounded-2xl p-5 space-y-4 text-white relative shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA0AE]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0098EA]/20 text-[#0098EA]">
            <ArrowDownUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Instant NFT Swap</h3>
            <p className="text-[10px] text-[#9AA0AE]">Trade Music NFT directly with DEX Liquidity</p>
          </div>
        </div>

        {/* NFT Box */}
        <div className="p-3 rounded-xl bg-[#050A24] flex items-center gap-3">
          <img 
            src={nft.coverUrl || nft.imageUrl} 
            alt={nft.title} 
            className="w-12 h-12 rounded-lg object-cover" 
          />
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-black text-[#0098EA] uppercase tracking-wider">Trading Item</span>
            <h4 className="text-xs font-bold text-white truncate">{nft.title}</h4>
            <p className="text-[10px] text-[#9AA0AE]">{nft.artist}</p>
          </div>
          <span className="text-xs font-black text-emerald-400">{nft.price || "12.5"} TON</span>
        </div>

        {/* Receive Token Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#9AA0AE]">Select Receive Token</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "TON", name: "TON", icon: TON_LOGO },
              { id: "JAM", name: "JAM", icon: TJ_COIN_ICON },
              { id: "NOT", name: "NOT", icon: "https://assets.coingecko.com/coins/images/33566/standard/NOT.png" }
            ].map((tok) => (
              <button
                key={tok.id}
                onClick={() => setTargetAsset(tok.id as any)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  targetAsset === tok.id
                    ? "bg-[#0098EA] text-white shadow-md"
                    : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                }`}
              >
                <img src={tok.icon} alt="" className="w-4 h-4 object-contain" />
                {tok.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Receive Summary */}
        <div className="p-3.5 rounded-xl bg-[#050A24] text-center space-y-1">
          <p className="text-[10px] text-[#9AA0AE] font-bold">Estimated Payout</p>
          <p className="text-xl font-black text-emerald-400">
            +{quote.receiveAmount} {quote.symbol}
          </p>
          <p className="text-[10px] text-[#9AA0AE]">≈ ${quote.usdVal} USD</p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmSwap}
          disabled={isSwapping}
          className="w-full py-3 rounded-xl bg-[#0098EA] text-white font-black text-xs uppercase tracking-wider hover:bg-[#0098EA]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Routing Swap...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Confirm Swap
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default NFTSwapModal;
