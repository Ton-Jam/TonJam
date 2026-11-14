import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

export interface SponsoredPromo {
  id: string;
  title: string;
  description: string;
  artwork: string;
  badge: "LAUNCH" | "NFT DROP" | "SPONSORED" | "LIVE";
  ctaText: string;
  link?: string;
}

export const SponsoredPromoCarousel: React.FC<{ promos?: SponsoredPromo[] }> = ({ promos }) => {
  const navigate = useNavigate();
  const [livePromos, setLivePromos] = useState<SponsoredPromo[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (promos !== undefined) return;

    const q = query(collection(db, "sponsoredContent"), where("isActive", "==", true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: SponsoredPromo[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "",
            description: data.description || data.subtitle || "",
            artwork: data.artwork || data.imageUrl || data.bannerUrl || "",
            badge: (data.badge || "SPONSORED") as SponsoredPromo["badge"],
            ctaText: data.ctaText || "Explore",
            link: data.link || data.ctaLink,
          };
        }).filter((p) => Boolean(p.title));
        setLivePromos(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "sponsoredContent");
      }
    );

    return () => unsub();
  }, [promos]);

  const activePromos = promos !== undefined ? promos : livePromos;

  useEffect(() => {
    if (isPaused || activePromos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % activePromos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activePromos.length, isPaused]);

  if (activePromos.length === 0) return null;

  const safeIndex = currentPromoIndex % activePromos.length;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Featured Spotlights & Launches
        </h2>
        <span className="text-[10px] font-semibold text-primary tracking-wider uppercase">
          TON Sponsored
        </span>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div 
          className="relative rounded-2xl overflow-hidden bg-zinc-950 h-[175px] sm:h-[190px] lg:h-[210px] w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
        <AnimatePresence mode="wait">
          {activePromos.map((item, idx) => {
            if (idx !== safeIndex) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pr-16 sm:pr-24"
              >
                {item.artwork && (
                  <LazyArtworkImage 
                    src={item.artwork} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 transition-transform duration-700" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                
                <div className="relative z-10 space-y-1 min-w-0">
                  <Badge variant="default" className="text-[8px] uppercase tracking-widest bg-primary text-black font-semibold px-2 py-0.5 rounded-md border-none">
                    {item.badge}
                  </Badge>
                  <h3 className="text-base sm:text-lg font-semibold text-white mt-1 leading-tight tracking-tight truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-1 max-w-sm sm:max-w-md">
                    {item.description}
                  </p>
                  
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (item.link) {
                          navigate(item.link);
                        } else if (item.badge === "LIVE") {
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
        <div className="absolute bottom-3.5 right-4 sm:bottom-4 sm:right-5 z-10 flex gap-1.5 items-center">
          {activePromos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPromoIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer border-none p-0 outline-none ${
                idx === safeIndex ? "bg-primary w-5" : "bg-white/20 w-1.5 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);
};

export default SponsoredPromoCarousel;
