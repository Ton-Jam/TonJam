import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { NFTItem } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import { useGramPrice } from "@/contexts/GramPriceContext";

interface RecentlyMintedProps {
  nfts: NFTItem[];
}

export const RecentlyMinted: React.FC<RecentlyMintedProps> = ({ nfts }) => {
  const navigate = useNavigate();
  const { convertPrice } = useGramPrice();

  if (!nfts || nfts.length === 0) {
    return null;
  }

  return (
    <div className="w-full text-left" id="marketplace-recently-minted">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00B4D8]" />
            Recently Listed
          </h2>
          <p className="text-xs text-[#8C8C8C]">
            New audio collectibles recently added to the marketplace
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Section */}
      <div className="-mx-3 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 px-3 sm:mx-0 sm:px-0 scroll-smooth">
        {nfts.slice(0, 8).map((nft) => {
          const artwork = nft.coverUrl || nft.imageUrl || getPlaceholderImage(nft.title);
          const priceFormatted = nft.price ? (nft.price.includes("TON") ? nft.price : `${nft.price} TON`) : "2.0 TON";

          return (
            <div
              key={nft.id}
              onClick={() => navigate(`/nft/${nft.id}`)}
              className="w-[220px] sm:w-[250px] shrink-0 bg-[#0A1628] hover:bg-[#0F1C32] border border-[#22374D] hover:border-[#38516B] rounded-2xl p-3 flex items-center gap-3 cursor-pointer select-none transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#07111F] shrink-0 border border-[#22374D]">
                <img
                  src={artwork}
                  alt={nft.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(nft.title);
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-[#FFFFFF] truncate group-hover:text-[#00B4D8] transition-colors">
                  {nft.title}
                </h3>
                <p className="text-[11px] text-[#C2C7CD] truncate mt-0.5">
                  {nft.artist || nft.creator}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-bold text-[#00B4D8] font-mono">
                    {convertPrice(priceFormatted)}
                  </span>
                  <span className="text-[10px] text-[#8C8C8C] flex items-center gap-0.5">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyMinted;
