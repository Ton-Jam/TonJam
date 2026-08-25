import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronRight } from "lucide-react";
import NFTCard from "@/components/NFTCard";

export interface MarketplacePick {
  id: string;
  title: string;
  artist: string;
  price: string;
  likes: number;
  image: string;
  badge: string;
}

const STATIC_MARKETPLACE_PICKS: MarketplacePick[] = [
  { id: "pick-1", title: "Aura Beat Legendary #02", artist: "Luna Ray", price: "25.0 TON", likes: 340, image: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves%20artwork?width=300&height=300&nologo=true", badge: "Trending" },
  { id: "pick-2", title: "Cybernetic Echo Synth", artist: "Dr. Osc", price: "9.0 TON", likes: 112, image: "https://image.pollinations.ai/prompt/cybernetic%20abstract%20holographic%20music%20key?width=300&height=300&nologo=true", badge: "Highest Volume" },
  { id: "pick-3", title: "Amapiano Golden Sceptre #01", artist: "Major Sound", price: "45.0 TON", likes: 780, image: "https://image.pollinations.ai/prompt/gold%20african%20tribal%20future%20crown%20shield?width=300&height=300&nologo=true", badge: "Live Auction" }
];

export const MarketplacePicksSection: React.FC<{ picks?: MarketplacePick[] }> = ({ picks = STATIC_MARKETPLACE_PICKS }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Top Marketplace Picks
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/nfts?title=Top+Marketplace+Picks&filter=top_nfts")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-0.5 w-full snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {picks.map((pick) => (
          <NFTCard 
            key={pick.id}
            nft={{
              id: pick.id,
              trackId: pick.id,
              title: pick.title,
              owner: pick.artist,
              creator: pick.artist,
              artist: pick.artist,
              price: pick.price,
              imageUrl: pick.image,
              edition: 'Limited Edition',
              description: '',
              isAuction: false
            } as any}
            className="w-[140px] sm:w-[155px] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
};

export default MarketplacePicksSection;
