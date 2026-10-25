import React from "react";
import { Search, X, Wallet } from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { cn } from "@/lib/utils";

interface MarketplaceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  searchTerm,
  onSearchChange,
  className,
}) => {
  const rawAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const isConnected = Boolean(rawAddress);

  // Shorten TON address for clean mobile display
  const shortAddress = rawAddress
    ? `${rawAddress.slice(0, 4)}...${rawAddress.slice(-4)}`
    : "";

  const handleWalletClick = () => {
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[MarketplaceHeader] TON Connect modal error:", err);
      }
    }
  };

  return (
    <header className={cn("space-y-4 pt-2 pb-2", className)}>
      {/* Top Row: Page Title + Wallet */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-0">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F8FF] leading-tight">
            Marketplace
          </h1>
          <p className="text-xs text-[#9BAAC5] truncate">
            Own the music you love.
          </p>
        </div>

        {/* Right Actions: TON Wallet */}
        <div className="flex items-center gap-2 shrink-0">
          {/* TON Wallet Connection Pill */}
          <button
            type="button"
            onClick={handleWalletClick}
            className={cn(
              "h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer border-none outline-none",
              isConnected
                ? "bg-[#101A32] hover:bg-[#152440] text-[#65B8FF]"
                : "bg-[#3390EC] hover:bg-[#2879c7] text-[#F5F8FF] shadow-sm shadow-[#3390EC]/30"
            )}
            aria-label="TON Wallet Status"
          >
            {/* Wallet Icon */}
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-[11px]">
              {isConnected ? shortAddress : "Connect TON"}
            </span>
          </button>
        </div>
      </div>

      {/* Compact Search Field */}
      <div className="px-4 sm:px-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BAAC5]/60 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tracks, artists, collections"
            className="w-full h-11 bg-[#101A32] focus:bg-[#152440] text-sm text-[#F5F8FF] placeholder-[#9BAAC5]/60 rounded-xl pl-10 pr-9 transition-colors outline-none border-none focus:ring-1 focus:ring-[#3390EC]/40"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BAAC5] hover:text-[#F5F8FF] p-1 rounded-full cursor-pointer border-none bg-transparent"
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
