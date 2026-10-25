import React from "react";
import { ShieldCheck, Zap, Percent, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceTransparencyProps {
  className?: string;
  onConnectWallet?: () => void;
  isWalletConnected?: boolean;
}

export const MarketplaceTransparency: React.FC<MarketplaceTransparencyProps> = ({
  className,
  onConnectWallet,
  isWalletConnected = false,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#101A32] p-5 sm:p-6 shadow-lg shadow-black/20 text-left space-y-4",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* TON Gem Logo */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 text-[#3390EC] shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 2L3 8L12 22L21 8L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M3 8L12 13L21 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M12 13V22" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <h3 className="text-base font-bold text-[#F5F8FF]">
              Built on TON
            </h3>
          </div>
          <p className="text-xs text-[#9BAAC5] leading-relaxed">
            Connect your TON wallet to collect music NFTs, support creators directly, and unlock master audio rights.
          </p>
        </div>

        {!isWalletConnected && onConnectWallet && (
          <button
            type="button"
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3390EC]/15 hover:bg-[#3390EC] text-[#65B8FF] hover:text-white transition-all text-xs font-semibold shrink-0 cursor-pointer border-none outline-none"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {/* Feature Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#152440]/60">
          <Percent className="w-4 h-4 text-[#3390EC] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#F5F8FF]">5% Platform Fee</h4>
            <p className="text-[11px] text-[#9BAAC5]">
              95% goes directly to music artists and rightsholders.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#152440]/60">
          <Zap className="w-4 h-4 text-[#65B8FF] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#F5F8FF]">Instant & Low Cost</h4>
            <p className="text-[11px] text-[#9BAAC5]">
              Sub-second finality with average gas fees under 0.005 TON.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#152440]/60">
          <ShieldCheck className="w-4 h-4 text-[#3390EC] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#F5F8FF]">Immutable Royalties</h4>
            <p className="text-[11px] text-[#9BAAC5]">
              Decentralized smart contracts enforce secondary trade splits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceTransparency;
