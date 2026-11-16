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
        "rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-surface-default,#0D1628)] backdrop-blur-md border border-[var(--tj-color-border-subtle)] p-4 sm:p-5 text-left space-y-4",
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
              className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0"
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
            <h3 className="text-base font-bold text-[var(--tj-color-text-primary,#FFFFFF)]">
              Built on TON
            </h3>
          </div>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] leading-relaxed">
            Connect your TON wallet to collect music NFTs, support creators directly, and unlock master audio rights.
          </p>
        </div>

        {!isWalletConnected && onConnectWallet && (
          <button
            type="button"
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white transition-colors text-xs font-semibold shrink-0 cursor-pointer border border-[var(--tj-color-brand-primary,#00B4D8)] outline-none"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {/* Feature Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--tj-color-border-subtle)]">
        <div className="flex items-start gap-2.5 p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80 border border-[var(--tj-color-border-subtle)]">
          <Percent className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--tj-color-text-primary,#FFFFFF)]">5% Platform Fee</h4>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
              95% goes directly to music artists and rightsholders.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80 border border-[var(--tj-color-border-subtle)]">
          <Zap className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--tj-color-text-primary,#FFFFFF)]">Instant & Low Cost</h4>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
              Sub-second finality with average gas fees under 0.005 TON.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)]/80 border border-[var(--tj-color-border-subtle)]">
          <ShieldCheck className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--tj-color-text-primary,#FFFFFF)]">Immutable Royalties</h4>
            <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)]">
              Decentralized smart contracts enforce secondary trade splits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceTransparency;
