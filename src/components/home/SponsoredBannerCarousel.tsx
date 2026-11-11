import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Sparkles, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlaceholderImage } from '@/lib/utils';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';

export interface CampaignItem {
  id: string;
  title: string;
  description: string;
  bannerImageUrl: string;
  destinationUrl: string;
  sponsorName: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority?: number;
  ctaText?: string;
}

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    title: 'TON Music Fest 2026',
    description: 'Stream exclusive live performances and claim limited on-chain commemorative NFTs.',
    bannerImageUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20festival%20stage%20neon%20lights%20banner?width=1200&height=500&nologo=true',
    destinationUrl: '/marketplace',
    sponsorName: 'TON Foundation',
    isActive: true,
    ctaText: 'Explore Now'
  },
  {
    id: 'camp-2',
    title: 'JamSpace Creator Grants',
    description: 'Launch your audio NFT collection with zero gas minting fees on TonJam.',
    bannerImageUrl: 'https://image.pollinations.ai/prompt/futuristic%20recording%20studio%20neon%20blue%20audio%20waves%20banner?width=1200&height=500&nologo=true',
    destinationUrl: '/mint',
    sponsorName: 'TonJam Guild',
    isActive: true,
    ctaText: 'Start Minting'
  },
  {
    id: 'camp-3',
    title: 'GRAM Liquid Staking Vaults',
    description: 'Stake your JAM tokens and earn high yield streaming rewards automatically.',
    bannerImageUrl: 'https://image.pollinations.ai/prompt/gold%20and%20cyan%20crypto%20staking%20vault%20abstract%20banner?width=1200&height=500&nologo=true',
    destinationUrl: '/staking',
    sponsorName: 'TON DeFi Alliance',
    isActive: true,
    ctaText: 'Stake Now'
  }
];

export const SponsoredBannerCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEFAULT_CAMPAIGNS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active campaigns from Firestore 'sponsoredCampaigns'
  useEffect(() => {
    let isMounted = true;
    async function fetchCampaigns() {
      try {
        const q = query(collection(db, 'sponsoredCampaigns'), where('isActive', '==', true));
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const fetched: CampaignItem[] = [];
          const now = new Date().toISOString();
          snap.forEach((docSnap) => {
            const data = docSnap.data() as CampaignItem;
            // Check dates if present
            const isAfterStart = !data.startDate || data.startDate <= now;
            const isBeforeEnd = !data.endDate || data.endDate >= now;
            if (data.isActive !== false && isAfterStart && isBeforeEnd) {
              fetched.push({ ...data, id: docSnap.id });
            }
          });
          if (fetched.length > 0) {
            // Sort by priority descending
            fetched.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            setCampaigns(fetched);
          }
        }
      } catch (err) {
        console.warn('[SponsoredBannerCarousel] Using curated default campaigns:', err);
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

  const prevCampaign = useCallback(() => {
    if (campaigns.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  }, [campaigns.length]);

  // Auto advance every 5-6 seconds unless paused
  useEffect(() => {
    if (isPaused || campaigns.length <= 1) return;
    timerRef.current = setInterval(() => {
      nextCampaign();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, campaigns.length, nextCampaign]);

  if (!campaigns || campaigns.length === 0) {
    return null; // Graceful empty state without fake advertising
  }

  const currentCampaign = campaigns[currentIndex] || campaigns[0];

  const handleBannerClick = () => {
    if (!currentCampaign.destinationUrl) return;
    if (currentCampaign.destinationUrl.startsWith('http')) {
      window.open(currentCampaign.destinationUrl, '_blank');
    } else {
      navigate(currentCampaign.destinationUrl);
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full">
      <div
        className="relative w-full h-[150px] sm:h-[165px] md:h-[175px] rounded-[4px] border-2 border-[rgba(192,202,214,0.22)] bg-[var(--tj-color-surface-elevated,#111F36)] overflow-hidden group select-none shadow-lg cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onClick={handleBannerClick}
        role="region"
        aria-label="Sponsored Campaign Carousel"
      >
        {/* Background Promotional Artwork with Lazy Loading */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCampaign.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 0.65, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <LazyArtworkImage
                src={currentCampaign.bannerImageUrl || getPlaceholderImage(currentCampaign.title)}
                alt={currentCampaign.title}
                className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080D1A] via-[#080D1A]/80 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 text-left">
          {/* Top Row: Sponsored Badge & Sponsor Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#00B4D8] text-[9px] font-extrabold uppercase tracking-widest">
                Sponsored
              </span>
              <span className="text-[10px] font-medium text-zinc-300">
                {currentCampaign.sponsorName}
              </span>
            </div>
            
            {/* Pagination dots */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {campaigns.map((camp, idx) => (
                <button
                  key={`dot-${camp.id}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer border-0 ${
                    idx === currentIndex ? 'w-4 bg-[#00B4D8]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Middle/Bottom Row: Title, Description & CTA */}
          <div className="space-y-1 sm:space-y-1.5 max-w-lg">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-[#00B4D8] transition-colors">
              {currentCampaign.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              {currentCampaign.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B4D8] text-[#080D1A] hover:bg-[#21C2E8] font-bold text-[11px] sm:text-xs transition-transform active:scale-95 shadow-md">
              <span>{currentCampaign.ctaText || 'Explore Now'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            <span className="text-[9px] font-mono text-zinc-400 hidden sm:inline-block">
              TON Blockchain Verified Partner
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsoredBannerCarousel;
