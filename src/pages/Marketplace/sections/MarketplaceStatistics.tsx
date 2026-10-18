import React from "react";
import { BarChart3, TrendingUp, Users, Tag, Award } from "lucide-react";
import { MarketplaceStats } from "../types";

interface MarketplaceStatisticsProps {
  stats: MarketplaceStats;
}

export const MarketplaceStatistics: React.FC<MarketplaceStatisticsProps> = ({ stats }) => {
  const statItems = [
    {
      title: "Active Listings",
      value: stats.dailySalesCount.toString(),
      subtext: "Master audio collectibles",
      icon: <Tag className="w-4 h-4 text-[#00B4D8]" />
    },
    {
      title: "Floor Price",
      value: stats.floorPrice,
      subtext: "Lowest active listing",
      icon: <TrendingUp className="w-4 h-4 text-[#00B4D8]" />
    },
    {
      title: "Total Volume",
      value: stats.volumeTotal,
      subtext: stats.volumeChange24h,
      icon: <BarChart3 className="w-4 h-4 text-[#00B4D8]" />
    },
    {
      title: "Active Collectors",
      value: stats.totalOwners.toLocaleString(),
      subtext: "Verified on TON",
      icon: <Users className="w-4 h-4 text-[#00B4D8]" />
    }
  ];

  return (
    <div className="w-full text-left" id="marketplace-statistics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="bg-[#0A1628] border border-[#22374D] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors hover:border-[#38516B]"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wider truncate">
                {item.title}
              </span>
              <div className="p-1.5 rounded-lg bg-[#0F1C32] border border-[#22374D]/50">
                {item.icon}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-base sm:text-xl font-bold text-[#FFFFFF] font-mono block truncate">
                {item.value}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-[#C2C7CD] block truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceStatistics;
