import React from "react";
import { motion } from "motion/react";
import { Award, Wallet, Disc } from "lucide-react";
import { LeaderboardUser } from "../types";

interface TopBuyersProps {
  buyers: LeaderboardUser[];
  onSelectBuyer: (buyer: LeaderboardUser) => void;
}

export const TopBuyers: React.FC<TopBuyersProps> = ({
  buyers,
  onSelectBuyer
}) => {
  return (
    <div className="w-full text-left" id="marketplace-top-buyers">
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-500" />
          Top Collectors Leaderboard
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          The biggest on-chain supporters of independent sound on TON
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buyers.slice(0, 8).map((buyer, idx) => {
          return (
            <motion.div
              key={buyer.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelectBuyer(buyer)}
              className="bg-zinc-950 border border-zinc-900 rounded-[10px] p-3 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Ranking Index */}
                <span className="font-mono text-zinc-600 font-black text-xs w-4">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={buyer.avatar}
                    alt={buyer.name}
                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800"
                    loading="lazy"
                  />
                </div>

                {/* Buyer Info */}
                <div className="min-w-0 text-left">
                  <span className="text-xs font-black text-white uppercase block truncate">{buyer.name}</span>
                  <span className="text-[8px] font-bold text-zinc-500 block">@{buyer.username}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                    <Disc className="w-3 h-3 text-amber-500" />
                    <span>{buyer.nftsOwnedCount} Music NFTs Owned</span>
                  </span>
                </div>
              </div>

              {/* Volume metrics */}
              <div className="text-right">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">TJ Spent</span>
                <span className="text-xs font-black text-amber-500 font-mono">{buyer.tonSpent} TON</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
