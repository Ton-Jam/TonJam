import React from "react";
import { Wallet, Disc } from "lucide-react";
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
      <div className="space-y-0.5 mb-3">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#0088CC]" />
          Top Collectors Leaderboard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {buyers.slice(0, 8).map((buyer, idx) => {
          return (
            <div
              key={buyer.id}
              onClick={() => onSelectBuyer(buyer)}
              className="bg-[#0A0A0A] border border-white/12 rounded-[3px] p-2.5 flex items-center justify-between cursor-pointer transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Ranking Index */}
                <span className="font-mono text-white/40 font-semibold text-xs w-4">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={buyer.avatar}
                    alt={buyer.name}
                    className="w-9 h-9 rounded-full bg-[#101010] border border-white/10"
                    loading="lazy"
                  />
                </div>

                {/* Buyer Info */}
                <div className="min-w-0 text-left">
                  <span className="text-xs font-semibold text-[#F5F7FA] block truncate">{buyer.name}</span>
                  <span className="text-[9px] font-normal text-white/50 block">@{buyer.username}</span>
                  <span className="text-[8px] font-medium text-white/60 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Disc className="w-3 h-3 text-[#0088CC]" />
                    <span>{buyer.nftsOwnedCount} Music NFTs Owned</span>
                  </span>
                </div>
              </div>

              {/* Volume metrics */}
              <div className="text-right">
                <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block">TON Spent</span>
                <span className="text-xs font-semibold text-[#0088CC] font-mono">{buyer.tonSpent} TON</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
