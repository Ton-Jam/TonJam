import React from "react";
import { motion } from "motion/react";
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
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-zinc-400" />
          Recent Sales Timeline
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          Live stream of settled secondary transactions on TON
        </p>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
        {sales.slice(0, 10).map((sale) => (
          <motion.div
            key={sale.id}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            onClick={() => onSelectNFT(sale.nftId)}
            className="bg-zinc-950 border border-zinc-900 rounded-[10px] p-3 flex items-center justify-between gap-4 cursor-pointer"
          >
            {/* Left Section: Artwork + NFT Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={sale.nftCoverUrl}
                alt={sale.nftTitle}
                className="w-10 h-10 rounded-[6px] object-cover bg-zinc-900 flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <span className="text-xs font-black text-white uppercase block truncate">
                  {sale.nftTitle}
                </span>
                
                {/* Flow: Seller -> Buyer */}
                <div className="flex items-center gap-1.5 text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-0.5 truncate">
                  <span className="text-zinc-400">{sale.sellerName}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[#00B4D8]">{sale.buyerName}</span>
                </div>
              </div>
            </div>

            {/* Right Section: Price + Time */}
            <div className="text-right flex-shrink-0 flex items-center gap-4">
              <div>
                <span className="text-xs font-black text-[#2BE08C] font-mono block">
                  {sale.price}
                </span>
                <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wide">
                  {sale.timestamp}
                </span>
              </div>
              
              <div className="w-7 h-7 rounded-[4px] bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center transition-colors">
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
