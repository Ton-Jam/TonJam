import React from "react";
import { BarChart3, TrendingUp, Users, Tag, Award, Zap, Activity } from "lucide-react";
import { MarketplaceStats } from "../types";

interface MarketplaceStatisticsProps {
  stats: MarketplaceStats;
}

export const MarketplaceStatistics: React.FC<MarketplaceStatisticsProps> = ({ stats }) => {
  const statItems = [
    {
      title: "Marketplace Vol",
      value: stats.volumeTotal,
      change: stats.volumeChange24h,
      icon: <BarChart3 className="w-3.5 h-3.5 text-[#0088CC]" />
    },
    {
      title: "Daily Sales",
      value: `${stats.dailySalesCount} Sold`,
      change: "+8.4% today",
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      title: "Weekly Vol",
      value: `${stats.weeklySalesCount} Deals`,
      change: "+24 creators",
      icon: <Activity className="w-3.5 h-3.5 text-[#0088CC]" />
    },
    {
      title: "Monthly Vol",
      value: `${stats.monthlySalesCount} Deals`,
      change: "Active protocol",
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      title: "Unique Owners",
      value: stats.totalOwners.toLocaleString(),
      change: "+112 today",
      icon: <Users className="w-3.5 h-3.5 text-purple-400" />
    },
    {
      title: "Floor Price",
      value: stats.floorPrice,
      change: "+0.2 TON / hr",
      icon: <Tag className="w-3.5 h-3.5 text-[#0088CC]" />
    },
    {
      title: "Top Sale",
      value: stats.highestSale,
      change: "Verified TON",
      icon: <Award className="w-3.5 h-3.5 text-rose-400" />
    }
  ];

  return (
    <div className="w-full text-left" id="marketplace-statistics">
      <div className="space-y-0.5 mb-3">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#0088CC]" />
          Marketplace Stats
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="bg-[#0A0A0A] border border-white/12 rounded-[3px] p-2.5 flex flex-col justify-between transition-colors hover:border-white/20 shadow-none"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[8px] font-medium text-white/60 uppercase tracking-wide truncate">
                {item.title}
              </span>
              <div className="p-1 rounded-[3px] bg-white/5 shadow-none">
                {item.icon}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-[#F5F7FA] font-mono block truncate">
                {item.value}
              </span>
              <span className="text-[8px] font-medium text-white/50 block truncate">
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceStatistics;
