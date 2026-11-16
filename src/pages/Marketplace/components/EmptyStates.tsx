import React from "react";
import {
  Wallet,
  Search,
  WifiOff,
  HelpCircle,
  Inbox,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no_nfts" | "wallet" | "offline" | "no_auctions" | "no_collections" | "error";
  onRetry?: () => void;
  onConnectWallet?: () => void;
  searchTerm?: string;
  errorMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onRetry,
  onConnectWallet,
  searchTerm,
  errorMessage,
}) => {
  switch (type) {
    case "error":
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-rose-400/40 rounded-[var(--tj-radius-md,8px)] min-h-[220px]">
          <div className="p-3 bg-rose-500/15 rounded-[var(--tj-radius-sm,6px)] text-rose-400 mb-3 border border-rose-400/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Failed to Load Marketplace Data
          </h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm mb-4 leading-relaxed">
            {errorMessage || "Unable to fetch listings from Firebase. Please try again."}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white font-bold rounded-[var(--tj-radius-sm,6px)] text-xs px-4 py-2 uppercase tracking-wider border border-[var(--tj-color-brand-primary,#00B4D8)] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          )}
        </div>
      );

    case "wallet":
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] min-h-[240px]">
          <div className="p-3 bg-[var(--tj-color-chip-active-background,#063C55)] rounded-[var(--tj-radius-sm,6px)] text-[var(--tj-color-brand-primary,#00B4D8)] mb-3 border border-[var(--tj-color-border-interactive,#245078)]">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Connect Wallet to View Owned NFTs
          </h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm mb-4 leading-relaxed">
            Connect your TON wallet or sign in to display verified music NFTs owned by your account.
          </p>
          {onConnectWallet && (
            <Button
              onClick={onConnectWallet}
              className="bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white font-bold rounded-[var(--tj-radius-sm,6px)] text-xs px-4 py-2 uppercase tracking-wider border border-[var(--tj-color-brand-primary,#00B4D8)] cursor-pointer"
            >
              Connect TON Wallet
            </Button>
          )}
        </div>
      );

    case "offline":
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] min-h-[240px]">
          <div className="p-3 bg-rose-500/15 rounded-[var(--tj-radius-sm,6px)] text-rose-400 mb-3 border border-rose-400/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Connection Lost</h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm mb-4 leading-relaxed">
            You are currently offline. Live listings and bids will resume when you reconnect.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border border-[var(--tj-color-border-subtle)] text-white font-semibold rounded-[var(--tj-radius-sm,6px)] text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" /> Try Reconnecting
            </Button>
          )}
        </div>
      );

    case "no_auctions":
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] min-h-[200px]">
          <div className="p-3 bg-amber-500/15 rounded-[var(--tj-radius-sm,6px)] text-amber-400 mb-3 border border-amber-400/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Auctions Available</h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm leading-relaxed">
            Live and upcoming music NFT auctions from verified creators will appear here.
          </p>
        </div>
      );

    case "no_collections":
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] min-h-[200px]">
          <div className="p-3 bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] text-[var(--tj-color-text-secondary,#C2C7CD)] mb-3 border border-[var(--tj-color-border-subtle)]">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Collections Found</h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm leading-relaxed">
            Published music NFT collections on TON will appear here.
          </p>
        </div>
      );

    case "no_nfts":
    default:
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[var(--tj-color-surface-default,#0D1628)] border border-[var(--tj-color-border-subtle)] rounded-[var(--tj-radius-md,8px)] min-h-[220px]">
          <div className="p-3 bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-sm,6px)] text-[var(--tj-color-brand-primary,#00B4D8)] mb-3 border border-[var(--tj-color-border-subtle)]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No NFTs Found</h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm mb-4 leading-relaxed">
            {searchTerm ? (
              <>
                No music NFTs matched{" "}
                <span className="text-[var(--tj-color-brand-primary,#00B4D8)] font-mono">"{searchTerm}"</span>. Try a different title, artist, genre, or collection.
              </>
            ) : (
              "No music NFTs match the active filters."
            )}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border border-[var(--tj-color-border-subtle)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white font-semibold rounded-[var(--tj-radius-sm,6px)] text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
              Reset Filters
            </Button>
          )}
        </div>
      );
  }
};

export default EmptyState;
