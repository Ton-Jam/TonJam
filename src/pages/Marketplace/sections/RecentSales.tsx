import React from "react";
import { Clock, ArrowRight, ExternalLink } from "lucide-react";
import { RecentSale } from "../types";

interface RecentSalesProps {
  sales: RecentSale[];
  onSelectNFT: (id: string) => void;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  sales,
  onSelectNFT
}) => {
  return (
    <div className="w-full text-left" id="marketplace-recent-sales">
      <div className="space-y-0.5 mb-3">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0088CC]" />
          Recent Sales Timeline
        </h2>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
        {sales.slice(0, 10).map((sale) => (
          <div
            key={sale.id}
            onClick={() => onSelectNFT(sale.nftId)}
            className="bg-[#0A0A0A] border border-white/12 rounded-[3px] p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:border-white/20"
          >
            {/* Left Section: Artwork + NFT Name */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={sale.nftCoverUrl}
                alt={sale.nftTitle}
                className="w-9 h-9 rounded-[3px] object-cover bg-[#101010] border border-white/10 flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#F5F7FA] block truncate">
                  {sale.nftTitle}
                </span>
                
                {/* Flow: Seller -> Buyer */}
                <div className="flex items-center gap-1.5 text-[8px] font-medium text-white/50 uppercase tracking-wider mt-0.5 truncate">
                  <span className="text-white/70">{sale.sellerName}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-white/40" />
                  <span className="text-[#0088CC]">{sale.buyerName}</span>
                </div>
              </div>
            </div>

            {/* Right Section: Price + Time */}
            <div className="text-right flex-shrink-0 flex items-center gap-3">
              <div>
                <span className="text-xs font-semibold text-[#0088CC] font-mono block">
                  {sale.price}
                </span>
                <span className="text-[8px] font-medium text-white/50 block">
                  {sale.timestamp}
                </span>
              </div>
              
              <div className="w-6 h-6 rounded-[3px] bg-white/5 border border-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors shadow-none">
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
