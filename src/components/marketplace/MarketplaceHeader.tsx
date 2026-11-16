import React from "react";
import { Search, X, Wallet, Sparkles } from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useOptionalWallet } from "@/contexts/WalletContext";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

interface MarketplaceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMintClick?: () => void;
  className?: string;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onMintClick,
  className,
}) => {
  const wallet = useOptionalWallet();
  const tonAddressFallback = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const rawAddress = wallet?.address || tonAddressFallback || "";
  const isConnected = Boolean(wallet?.isConnected || rawAddress);
  const tonBalance = wallet?.tonBalance ?? 0;
  const networkLabel = wallet?.isTestnet ? "Testnet" : "TON";

  const shortAddress = rawAddress
    ? `${rawAddress.slice(0, 4)}...${rawAddress.slice(-4)}`
    : "";

  const handleWalletClick = () => {
    if (wallet?.connectWallet) {
      wallet.connectWallet();
      return;
    }
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[MarketplaceHeader] TON Connect modal error:", err);
      }
    }
  };

  return (
    <header
      className={cn(
        "space-y-3 pt-3 pb-4 border-b border-[var(--tj-color-border-subtle)] bg-[var(--tj-color-bg-secondary,#0D1628)]/80 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-start sm:items-center justify-between gap-2.5 px-3 sm:px-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight truncate">
            NFT Marketplace
          </h1>
          <p className="text-[11px] sm:text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] truncate mt-0.5">
            Discover, collect and trade music NFTs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onMintClick && (
            <button
              type="button"
              onClick={onMintClick}
              className="h-9 px-2.5 sm:px-3 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border border-[var(--tj-color-border-subtle)] text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-white flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer outline-none"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mint NFT</span>
              <span className="sm:hidden">Mint</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleWalletClick}
            className={cn(
              "h-9 px-2.5 sm:px-3 rounded-[var(--tj-radius-sm,6px)] flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer border outline-none",
              isConnected
                ? "bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] border-[var(--tj-color-border-subtle)] text-[var(--tj-color-brand-primary,#00B4D8)]"
                : "bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] border-[var(--tj-color-brand-primary,#00B4D8)] text-white"
            )}
            aria-label="TON Wallet Status"
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-[11px] truncate max-w-[130px]">
              {isConnected
                ? tonBalance > 0
                  ? `${tonBalance.toFixed(1)} ${networkLabel}`
                  : shortAddress
                : "Connect Wallet"}
            </span>
          </button>

          <NotificationBell />
        </div>
      </div>

      <div className="px-3 sm:px-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tj-color-text-secondary,#C2C7CD)] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search NFTs, artists, collections, genres, or @creators..."
            aria-label="Search marketplace"
            className="w-full h-10 bg-[var(--tj-color-input-background,#0B1F36)] focus:bg-[var(--tj-color-surface-elevated,#111F36)] text-xs sm:text-sm text-white placeholder:text-[var(--tj-color-input-placeholder,#8193A8)] rounded-[var(--tj-radius-md,8px)] pl-9 pr-9 border border-[var(--tj-color-border-subtle)] focus:border-[var(--tj-color-brand-primary,#00B4D8)] transition-colors outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white p-1 rounded-[var(--tj-radius-xs,4px)] cursor-pointer border-0 bg-transparent"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MarketplaceHeader;
