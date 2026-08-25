import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SponsoredPromo {
  id: string;
  title: string;
  description: string;
  artwork: string;
  badge: "LAUNCH" | "NFT DROP" | "SPONSORED" | "LIVE";
  ctaText: string;
}

export const SPONSORED_PROMOS: SponsoredPromo[] = [
  { 
    id: "promo-1", 
    title: "Solar Pulse Reloaded", 
    description: "Collect the exclusive diamond release NFT drop by DJ Krupy.", 
    artwork: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=400&nologo=true", 
    badge: "NFT DROP", 
    ctaText: "Mint Now" 
  },
  { 
    id: "promo-2", 
    title: "TON Producers Summit", 
    description: "Tune in live with top audio architects & Web3 producers.", 
    artwork: "https://image.pollinations.ai/prompt/futuristic%20audio%20synthesizer%20control%20deck%20concert%20neon?width=600&height=400&nologo=true", 
    badge: "LIVE", 
    ctaText: "Join Room" 
  },
  { 
    id: "promo-3", 
    title: "Amapiano Wave 2026", 
    description: "Discover high volume soundscapes straight from Lagos to Miami.", 
    artwork: "https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=600&height=400&nologo=true", 
    badge: "LAUNCH", 
    ctaText: "Listen First" 
  },
  { 
    id: "promo-4", 
    title: "Retro Sound Lab Sponsor", 
    description: "Promoting next-gen digital instruments on TON Blockchain.", 
    artwork: "https://image.pollinations.ai/prompt/retro%20lofi%20cassette%20player%20floating%20in%20purple%20space?width=600&height=400&nologo=true", 
    badge: "SPONSORED", 
    ctaText: "Claim Free Box" 
  }
];

export const SponsoredPromoCarousel: React.FC<{ promos?: SponsoredPromo[] }> = ({ promos = SPONSORED_PROMOS }) => {
  const navigate = useNavigate();
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promos.length]);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Featured Spotlights & Launches
        </h2>
        <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
          TON Sponsored
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-zinc-950 h-[175px] sm:h-[190px]">
        <AnimatePresence mode="wait">
          {promos.map((item, idx) => {
            if (idx !== currentPromoIndex) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6"
              >
                <img 
                  src={item.artwork} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
                
                <div className="relative z-10 space-y-1">
                  <Badge variant="default" className="text-[8px] uppercase tracking-widest bg-primary text-black font-black px-2 py-0.5 rounded-md border-none">
                    {item.badge}
                  </Badge>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-1 max-w-sm sm:max-w-md">
                    {item.description}
                  </p>
                  
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (item.badge === "LIVE") {
                          confetti({ particleCount: 50, spread: 60 });
                          navigate("/jamspace");
                        } else {
                          navigate("/marketplace");
                        }
                      }}
                      className="h-7 text-[9px] font-black uppercase tracking-widest px-4 rounded-full bg-primary hover:bg-primary/90 text-black border-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      {item.ctaText}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pagination Indicators */}
        <div className="absolute bottom-4 right-5 z-10 flex gap-1.5 items-center">
          {promos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPromoIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer border-none p-0 outline-none ${
                idx === currentPromoIndex ? "bg-primary w-5" : "bg-white/20 w-1.5 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsoredPromoCarousel;
