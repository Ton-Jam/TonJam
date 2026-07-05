import React from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, Users, Tag, Award, Zap, Activity } from "lucide-react";
import { MarketplaceStats } from "../types";

interface MarketplaceStatisticsProps {
  stats: MarketplaceStats;
}

export const MarketplaceStatistics: React.FC<MarketplaceStatisticsProps> = ({ stats }) => {
  const statItems = [
    {
      title: "Marketplace Volume",
      value: stats.volumeTotal,
      change: stats.volumeChange24h,
      isPositive: true,
      icon: <BarChart3 className="w-4 h-4 text-[#5B6BFF]" />
    },
    {
      title: "Daily Active Sales",
      value: `${stats.dailySalesCount} Sold`,
      change: "+8.4% today",
      isPositive: true,
      icon: <TrendingUp className="w-4 h-4 text-[#2BE08C]" />
    },
    {
      title: "Weekly Vol. Count",
      value: `${stats.weeklySalesCount} Deals`,
      change: "+24 new creators",
      isPositive: true,
      icon: <Activity className="w-4 h-4 text-[#00B4D8]" />
    },
    {
      title: "Monthly Volume",
      value: `${stats.monthlySalesCount} Deals`,
      change: "Active smart protocol",
      isPositive: true,
      icon: <Zap className="w-4 h-4 text-amber-500" />
    },
    {
      title: "Total Unique Owners",
      value: stats.totalOwners.toLocaleString(),
      change: "+112 today",
      isPositive: true,
      icon: <Users className="w-4 h-4 text-purple-400" />
    },
    {
      title: "Network Floor Price",
      value: stats.floorPrice,
      change: "+0.2 TON last hr",
      isPositive: true,
      icon: <Tag className="w-4 h-4 text-blue-400" />
    },
    {
      title: "Highest On-Chain Sale",
      value: stats.highestSale,
      change: "Verified on TON",
      isPositive: true,
      icon: <Award className="w-4 h-4 text-rose-400" />
    }
  ];

  return (
    <div className="w-full text-left" id="marketplace-statistics">
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#5B6BFF]" />
          Marketplace Statistics
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          Comprehensive real-time on-chain data overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -2 }}
            className="bg-zinc-950 border border-zinc-900 rounded-[10px] p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider truncate">
                {item.title}
              </span>
              <div className="p-1 rounded-[4px] bg-zinc-900 border border-zinc-800">
                {item.icon}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-sm font-black text-white font-mono block">
                {item.value}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wide">
                {item.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
