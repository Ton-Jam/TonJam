import React, { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Users, Plus, Check } from "lucide-react";
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
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2BE08C]" />
          Top Sellers Leaderboard
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          Highest commercial volume generated this week
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sellers.slice(0, 8).map((seller, idx) => {
          const isFollowing = !!following[seller.id];
          return (
            <motion.div
              key={seller.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelectSeller(seller)}
              className="bg-zinc-950 border border-zinc-900 rounded-[10px] p-3 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Ranking Index */}
                <span className="font-mono text-zinc-600 font-black text-xs w-4">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>

                {/* Avatar with dynamic verified badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800"
                    loading="lazy"
                  />
                  {seller.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-black border border-zinc-950">
                      ✓
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="min-w-0 text-left">
                  <span className="text-xs font-black text-white uppercase block truncate">{seller.name}</span>
                  <span className="text-[8px] font-bold text-zinc-500 block">@{seller.username}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mt-0.5">
                    {seller.salesCount} Sales • {seller.followersCount.toLocaleString()} Followers
                  </span>
                </div>
              </div>

              {/* Volume + Follow */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Revenue</span>
                  <span className="text-xs font-black text-[#2BE08C] font-mono">{seller.revenueTON} TON</span>
                </div>

                <button
                  onClick={(e) => toggleFollow(seller.id, e)}
                  className={`px-3 py-1.5 rounded-[6px] text-[8px] font-black uppercase tracking-widest transition-all ${
                    isFollowing
                      ? "bg-[#00B4D8]/10 text-[#00B4D8]"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800/40"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
