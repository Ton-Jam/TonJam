import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlaceholderImage } from '@/lib/utils';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { SponsoredContent } from '@/types';

export const SponsoredBannerCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<SponsoredContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch approved, active campaigns strictly from authoritative 'sponsoredContent' collection
  useEffect(() => {
    let isMounted = true;
    async function fetchCampaigns() {
      try {
        const q = query(
          collection(db, 'sponsoredContent'), 
          where('status', '==', 'approved')
        );
        const snap = await getDocs(q);
        if (isMounted) {
          if (!snap.empty) {
            const fetched: SponsoredContent[] = [];
            const now = new Date().toISOString();
            snap.forEach((docSnap) => {
              const data = docSnap.data() as SponsoredContent;
              // Validate start and end dates strictly
              const isAfterStart = !data.startDate || data.startDate <= now;
              const isBeforeEnd = !data.endDate || data.endDate >= now;
              if (isAfterStart && isBeforeEnd) {
                fetched.push({ ...data, id: docSnap.id });
              }
            });
            setCampaigns(fetched);
          } else {
            setCampaigns([]);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[SponsoredBannerCarousel] Failed to load sponsoredContent:', err);
        if (isMounted) {
          setCampaigns([]);
          setIsLoading(false);
        }
      }
    }
    fetchCampaigns();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextCampaign = useCallback(() => {
    if (campaigns.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  }, [campaigns.length]);

  // Auto advance every 6 seconds unless paused
  useEffect(() => {
    if (isPaused || campaigns.length <= 1) return;
    timerRef.current = setInterval(() => {
      nextCampaign();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, campaigns.length, nextCampaign]);

  // Empty state when no genuine approved paid campaigns exist (no fake sponsor placeholders)
  if (!isLoading && campaigns.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 w-full select-none">
        <div
          onClick={() => navigate('/partnerships')}
          className="relative w-full h-[120px] sm:h-[135px] rounded-2xl bg-gradient-to-r from-[#0e285a]/70 via-[#11244e]/60 to-[#0e285a]/70 p-5 flex items-center justify-between cursor-pointer group shadow-lg transition-all hover:bg-white/[0.04]"
        >
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#00B4D8]/15 text-[#00B4D8] text-[9px] font-black uppercase tracking-widest">
                Partner Spotlight
              </span>
              <span className="text-[10px] text-slate-400">
                TonJam Verified Sponsorship
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-[#00B4D8] transition-colors">
              Promote Your Music & NFT Releases
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1">
              Reach thousands of Web3 music fans and TON collectors across the decentralized ecosystem.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00B4D8] hover:bg-[#0098EA] active:scale-95 text-[#080D1A] font-bold text-xs transition-all shadow-md">
            <span>Apply Now</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  const currentCampaign = campaigns[currentIndex] || campaigns[0];

  const handleBannerClick = () => {
    const dest = currentCampaign.link || (currentCampaign.targetId ? `/track/${currentCampaign.targetId}` : '/marketplace');
    if (dest.startsWith('http')) {
      window.open(dest, '_blank');
    } else {
      navigate(dest);
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full select-none">
      <div
        className="relative w-full h-[150px] sm:h-[165px] md:h-[175px] rounded-2xl bg-[#0e285a]/90 overflow-hidden group shadow-xl cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onClick={handleBannerClick}
        role="region"
        aria-label="Sponsored Campaign Carousel"
      >
        {/* Background Promotional Artwork */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCampaign.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <LazyArtworkImage
                src={currentCampaign.imageUrl || getPlaceholderImage(currentCampaign.title)}
                alt={currentCampaign.title}
                className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080D1A] via-[#080D1A]/85 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 text-left">
          {/* Top Row: Sponsored Badge & Sponsor Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-[9px] font-black uppercase tracking-widest">
                Sponsored
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                {currentCampaign.artistName}
              </span>
            </div>
            
            {/* Pagination dots */}
            {campaigns.length > 1 && (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {campaigns.map((camp, idx) => (
                  <button
                    key={`dot-${camp.id}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer border-none ${
                      idx === currentIndex ? 'w-4 bg-[#00B4D8]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Middle/Bottom Row: Title & Description */}
          <div className="space-y-1 max-w-lg">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-[#00B4D8] transition-colors">
              {currentCampaign.title}
            </h3>
            {currentCampaign.description && (
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {currentCampaign.description}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00B4D8] text-[#080D1A] hover:bg-[#21C2E8] font-bold text-[11px] sm:text-xs transition-transform active:scale-95 shadow-md">
              <span>View Release</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline-block">
              Verified TON Music Campaign
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsoredBannerCarousel;
