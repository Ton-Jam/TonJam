import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Wallet, Sparkles } from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useOptionalWallet } from "@/contexts/WalletContext";
import { safeOpenTonConnectModal } from "@/lib/tonConnectGuard";
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
  const navigate = useNavigate();
  const wallet = useOptionalWallet();
  const tonAddressFallback = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const rawAddress = wallet?.address || tonAddressFallback || "";
  const isConnected = Boolean(wallet?.isConnected || rawAddress);

  const handleWalletClick = () => {
    if (isConnected) {
      navigate("/wallet");
      return;
    }
    if (wallet?.connectWallet) {
      wallet.connectWallet();
      return;
    }
    if (tonConnectUI) {
      try {
        safeOpenTonConnectModal(tonConnectUI);
      } catch (err) {
        console.warn("[MarketplaceHeader] TON Connect modal error:", err);
      }
    }
  };

  return (
    <header
      style={{
        background: "var(--tj-header-bg, transparent)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      className={cn(
        "space-y-3 pt-3 pb-3.5 border-none shadow-none bg-transparent backdrop-blur-none backdrop-filter-none",
        className
      )}
    >
      <div className="flex items-start sm:items-center justify-between gap-2.5 px-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-[var(--tj-color-text-primary,#FFFFFF)] leading-tight truncate">
            NFT Marketplace
          </h1>
          <p className="text-[11px] sm:text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] truncate mt-0.5">
            Discover, collect and trade music NFTs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleWalletClick}
            className={cn(
              "relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-[var(--tj-radius-pill,999px)] inline-flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--tj-color-border-focus,#00B4D8)] shrink-0",
              isConnected
                ? "text-[var(--tj-color-brand-primary,#00B4D8)]"
                : "text-[#FFFFFF]"
            )}
            aria-label={isConnected ? "TON Wallet Connected" : "Connect TON Wallet"}
            title={isConnected ? "TON Wallet Connected" : "Connect TON Wallet"}
          >
            <Wallet className="w-5 h-5 shrink-0" />
          </button>

          <NotificationBell />
        </div>
      </div>

      <div className="px-3 space-y-2.5">
        <div
          className="search-input-wrapper relative flex items-center w-full h-10 bg-[var(--tj-color-input-background,#0B1F36)] rounded-[var(--tj-radius-sm,8px)] border border-[var(--tj-color-border-subtle)] focus-within:border-[var(--tj-color-border-focus,#00B4D8)] transition-colors"
        >
          <Search className="ml-3 w-4 h-4 text-[var(--tj-color-text-secondary,#C2C7CD)] shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tracks, artists, collections, or genres..."
            aria-label="Search marketplace"
            className="w-full h-full bg-transparent text-xs sm:text-sm text-[var(--tj-color-text-primary,#FFFFFF)] placeholder:text-[var(--tj-color-input-placeholder,#8193A8)] px-2.5 pr-9 outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="mr-1.5 text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-[var(--tj-color-text-primary,#FFFFFF)] p-1.5 rounded-[var(--tj-radius-compact,5px)] cursor-pointer border-0 bg-transparent shrink-0"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onMintClick && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onMintClick}
              className="min-h-[36px] px-4 py-1.5 rounded-[var(--tj-radius-pill,999px)] bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] active:bg-[var(--tj-color-brand-pressed,#009CC0)] text-[var(--tj-color-text-primary,#FFFFFF)] border-none inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer outline-none whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Mint NFT</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default MarketplaceHeader;
