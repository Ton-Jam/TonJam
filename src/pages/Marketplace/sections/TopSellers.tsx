import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { LeaderboardUser } from "../types";

interface TopSellersProps {
  sellers: LeaderboardUser[];
  onSelectSeller: (seller: LeaderboardUser) => void;
}

export const TopSellers: React.FC<TopSellersProps> = ({
  sellers,
  onSelectSeller
}) => {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowing(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full text-left" id="marketplace-top-sellers">
      <div className="space-y-0.5 mb-3">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0088CC]" />
          Top Sellers Leaderboard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {sellers.slice(0, 8).map((seller, idx) => {
          const isFollowing = !!following[seller.id];
          return (
            <div
              key={seller.id}
              onClick={() => onSelectSeller(seller)}
              className="bg-[#0A0A0A] border border-white/12 rounded-[3px] p-2.5 flex items-center justify-between cursor-pointer transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Ranking Index */}
                <span className="font-mono text-white/40 font-semibold text-xs w-4">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>

                {/* Avatar with dynamic verified badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-9 h-9 rounded-full bg-[#101010] border border-white/10"
                    loading="lazy"
                  />
                  {seller.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0088CC] text-white flex items-center justify-center text-[7px] font-bold border border-[#0A0A0A]">
                      ✓
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="min-w-0 text-left">
                  <span className="text-xs font-semibold text-[#F5F7FA] block truncate">{seller.name}</span>
                  <span className="text-[9px] font-normal text-white/50 block">@{seller.username}</span>
                  <span className="text-[8px] font-medium text-white/60 uppercase tracking-wider block mt-0.5">
                    {seller.salesCount} Sales • {seller.followersCount.toLocaleString()} Followers
                  </span>
                </div>
              </div>

              {/* Volume + Follow */}
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="text-[8px] font-medium text-white/50 uppercase tracking-wider block">Revenue</span>
                  <span className="text-xs font-semibold text-[#0088CC] font-mono">{seller.revenueTON} TON</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleFollow(seller.id, e)}
                  aria-label={isFollowing ? `Unfollow ${seller.name}` : `Follow ${seller.name}`}
                  className={`px-3 py-1 rounded-[3px] text-[9px] font-semibold uppercase tracking-wider transition-colors duration-500 ease-in-out focus:outline-none ${
                    isFollowing
                      ? "bg-[#0088CC] text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
