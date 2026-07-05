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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  switch (type) {
    case "wallet":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 border border-zinc-800/40 rounded-[10px] min-h-[300px]"
        >
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
            Connect your TON Wallet to unlock bidding, listing, trading, and instant settlement features of the TonJam Music NFT ecosystem.
          </p>
          {onConnectWallet && (
            <Button
              onClick={onConnectWallet}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-[10px] text-xs px-6 py-2 uppercase tracking-wider"
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
          className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 border border-zinc-800/40 rounded-[10px] min-h-[300px]"
        >
          <div className="p-4 bg-rose-500/10 rounded-full text-rose-400 mb-4">
            <WifiOff className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
            Connection Lost
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
            You are currently offline. Bidding, transactions, and real-time prices cannot be synchronized without an internet connection.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-[10px] text-xs px-6 py-2 uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Reconnecting
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
          className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 border border-zinc-800/40 rounded-[10px] min-h-[250px]"
        >
          <div className="p-4 bg-amber-500/10 rounded-full text-amber-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
            No Live Auctions
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
            There are currently no active bidding events happening right now. Be sure to check back soon or host your own auction!
          </p>
        </motion.div>
      );

    case "no_collections":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 border border-zinc-800/40 rounded-[10px] min-h-[250px]"
        >
          <div className="p-4 bg-zinc-500/10 rounded-full text-zinc-400 mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
            No Collections Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
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
          className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 border border-zinc-800/40 rounded-[10px] min-h-[300px]"
        >
          <div className="p-4 bg-zinc-500/10 rounded-full text-zinc-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
            No NFTs Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
            {searchTerm ? (
              <>We couldn't find any Music NFTs matching <span className="text-blue-400 font-mono">"{searchTerm}"</span>. Try checking spelling or using broader search terms.</>
            ) : (
              "No Music NFTs are currently listed matching your selected filters. Try adjusting your category search."
            )}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-[10px] text-xs px-6 py-2 uppercase tracking-wider"
            >
              Reset Filters
            </Button>
          )}
        </motion.div>
      );
  }
};
