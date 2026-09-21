import React from "react";
import { motion } from "motion/react";
import { Wallet, Search, WifiOff, HelpCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no_nfts" | "wallet" | "offline" | "no_auctions" | "no_collections";
  onRetry?: () => void;
  onConnectWallet?: () => void;
  searchTerm?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onRetry,
  onConnectWallet,
  searchTerm
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  switch (type) {
    case "wallet":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-[#0A0A0A] border border-white/12 rounded-[3px] min-h-[280px]"
        >
          <div className="p-3 bg-[#0088CC]/10 rounded-[3px] text-[#0088CC] mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wider mb-1.5">
            Wallet Not Connected
          </h3>
          <p className="text-xs text-white/60 max-w-sm mb-5 leading-relaxed">
            Connect your TON Wallet to unlock bidding, listing, trading, and instant settlement features of the TonJam Music NFT ecosystem.
          </p>
          {onConnectWallet && (
            <Button
              onClick={onConnectWallet}
              className="bg-[#0088CC] hover:bg-[#0077b3] text-white font-medium rounded-[3px] text-xs px-5 py-2 uppercase tracking-wider shadow-none"
            >
              Connect TON Wallet
            </Button>
          )}
        </motion.div>
      );

    case "offline":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-[#0A0A0A] border border-white/12 rounded-[3px] min-h-[280px]"
        >
          <div className="p-3 bg-rose-500/10 rounded-[3px] text-rose-400 mb-3">
            <WifiOff className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wider mb-1.5">
            Connection Lost
          </h3>
          <p className="text-xs text-white/60 max-w-sm mb-5 leading-relaxed">
            You are currently offline. Bidding, transactions, and real-time prices cannot be synchronized without an internet connection.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-white/10 hover:bg-white/20 text-white font-medium rounded-[3px] text-xs px-5 py-2 uppercase tracking-wider flex items-center gap-2 shadow-none border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Reconnecting
            </Button>
          )}
        </motion.div>
      );

    case "no_auctions":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-[#0A0A0A] border border-white/12 rounded-[3px] min-h-[220px]"
        >
          <div className="p-3 bg-amber-500/10 rounded-[3px] text-amber-400 mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wider mb-1.5">
            No Live Auctions
          </h3>
          <p className="text-xs text-white/60 max-w-sm leading-relaxed">
            There are currently no active bidding events happening right now. Be sure to check back soon or host your own auction.
          </p>
        </motion.div>
      );

    case "no_collections":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-[#0A0A0A] border border-white/12 rounded-[3px] min-h-[220px]"
        >
          <div className="p-3 bg-white/5 rounded-[3px] text-white/50 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wider mb-1.5">
            No Collections Found
          </h3>
          <p className="text-xs text-white/60 max-w-sm leading-relaxed">
            No trending collections matched your current criteria. Broaden your filters to see more.
          </p>
        </motion.div>
      );

    case "no_nfts":
    default:
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-[#0A0A0A] border border-white/12 rounded-[3px] min-h-[280px]"
        >
          <div className="p-3 bg-white/5 rounded-[3px] text-white/50 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wider mb-1.5">
            No NFTs Found
          </h3>
          <p className="text-xs text-white/60 max-w-sm mb-5 leading-relaxed">
            {searchTerm ? (
              <>We couldn't find any Music NFTs matching <span className="text-[#0088CC] font-mono">"{searchTerm}"</span>. Try checking spelling or using broader search terms.</>
            ) : (
              "No Music NFTs are currently listed matching your selected filters. Try adjusting your category search."
            )}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-white/12 hover:bg-white/10 text-[#F5F7FA] font-medium rounded-[3px] text-xs px-5 py-2 uppercase tracking-wider shadow-none"
            >
              Reset Filters
            </Button>
          )}
        </motion.div>
      );
  }
};
