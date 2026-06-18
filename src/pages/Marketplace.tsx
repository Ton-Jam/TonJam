import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  TrendingUp,
  Zap,
  Bell,
  Rocket,
  ArrowRight,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Users,
  Clock,
  Flame,
  Music,
  Disc,
  Play,
  Layers,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  Tag,
  BadgeCheck,
  ChevronLeft,
  DollarSign,
  Radio,
  FileMusic,
  ListRestart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

// Import custom reusable subcomponents
import { AnalyticsCard } from "@/components/marketplace/AnalyticsCard";
import { MarketplaceNFTCard } from "@/components/marketplace/MarketplaceNFTCard";
import { CollectionCard } from "@/components/marketplace/CollectionCard";
import { RankingCard } from "@/components/marketplace/RankingCard";

// Import App Audio/State Integrations
import { useAudio } from "@/context/AudioContext";
import { MOCK_ARTISTS, MOCK_TRACKS } from "@/constants";

// --- MOCK AND DATA INJECTION ---

const ANALYTICS_DATA = [
  { title: "Total Volume", value: "52,430 TON", change: "+12.4% vs last week", icon: <BarChart3 className="w-4 h-4" /> },
  { title: "Floor Price", value: "12 TON", change: "+2.5 TON today", icon: <Tag className="w-4 h-4" /> },
  { title: "NFT Owners", value: "4,812", change: "+85 new creators", icon: <Users className="w-4 h-4" /> },
  { title: "Verified Artists", value: "1,239", change: "+14 pending", icon: <Award className="w-4 h-4" /> },
  { title: "Sales Today", value: "+348", change: "2k TON active", icon: <TrendingUp className="w-4 h-4" /> },
];

const FILTER_PILLS = [
  "All",
  "Trending",
  "New Drops",
  "Music NFTs",
  "Albums",
  "Tracks",
  "Playlists",
  "Auctions",
];

const FEATURED_COLLECTIONS = [
  {
    id: "fc1",
    name: "TON Beats Odyssey",
    creator: "DJ Krupy",
    floorPrice: "15",
    volume: "1,200",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    itemCount: 24,
    verified: true,
  },
  {
    id: "fc2",
    name: "Supernova Symphonies",
    creator: "Lara Moon",
    floorPrice: "24",
    volume: "980",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60",
    itemCount: 12,
    verified: true,
  },
  {
    id: "fc3",
    name: "Golden Ether Anthems",
    creator: "Neon Pulse",
    floorPrice: "18",
    volume: "2,450",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    itemCount: 18,
    verified: true,
  },
];

const CATEGORY_ITEMS = [
  { label: "Tracks", count: "14,250 items", icon: <Music className="w-5 h-5 text-[#5B6BFF]" /> },
  { label: "Albums", count: "2,310 items", icon: <Disc className="w-5 h-5 text-[#00B4D8]" /> },
  { label: "Playlists", count: "890 items", icon: <Sparkles className="w-5 h-5 text-[#2BE08C]" /> },
  { label: "Artists", count: "1,239 verified", icon: <Users className="w-5 h-5 text-[#F5D547]" /> },
  { label: "Auctions", count: "42 live bid events", icon: <Zap className="w-5 h-5 text-[#FF3A5C]" /> },
  { label: "Trending", count: "Updated hourly", icon: <TrendingUp className="w-5 h-5 text-[#5B6BFF]" /> },
];

const TICKER_ITEMS = [
  "DJ Krupy sold Track NFT #12 for 15 TON",
  "Lara Moon sold Album NFT #4 for 22 TON",
  "Neon Pulse sold Cosmic Vibe #88 for 45 TON",
  "Astro Vibe sold Solar Echoes #2 for 30 TON",
  "Serum Beats sold Acid Loop #19 for 12 TON",
  "Satoshi's Jam sold Mint Pass #5 for 180 TON",
];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { allNFTs, isLoading, playTrack, currentTrack, isPlaying } = useAudio();

  // Selected State variables
  const [activeTab, setActiveTab] = useState("All");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [rankingTab, setRankingTab] = useState("collections");

  // Fallback state populated when firebase/MOCK list is loading
  const safeNFTs = useMemo(() => {
    if (allNFTs && allNFTs.length > 0) {
      return allNFTs.map((nft) => ({
        id: nft.id,
        trackId: nft.trackId || "",
        title: nft.title,
        creator: nft.creator || "TonJam Creator",
        price: nft.price || "10",
        imageUrl: nft.imageUrl || nft.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=50",
        edition: nft.edition || "1/100",
        artistVerified: nft.artistVerified || true,
      }));
    }
    // High premium fallback items if allNFTs is empty
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `nft-fb-${i}`,
      trackId: MOCK_TRACKS[i % MOCK_TRACKS.length]?.id || "",
      title: `${MOCK_TRACKS[i % MOCK_TRACKS.length]?.title || `Epic TON Track #${i + 1}`}`,
      creator: MOCK_ARTISTS[i % MOCK_ARTISTS.length]?.name || "Premium Musician",
      price: (12 + (i * 3.5)).toFixed(1),
      imageUrl: `https://images.unsplash.com/photo-${1511671782779 + i}?w=400&auto=format&fit=crop&q=50`,
      edition: `Premium #${i + 1}`,
      artistVerified: true,
    }));
  }, [allNFTs]);

  // Featured Banner slide loop (Section 4)
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % FEATURED_COLLECTIONS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Filter strategy based on navigation tab selection (Section 3)
  const filteredNewDrops = useMemo(() => {
    switch (activeTab) {
      case "All":
        return safeNFTs;
      case "Trending":
        return safeNFTs.slice(0, 8);
      case "New Drops":
        return safeNFTs.slice().reverse();
      case "Music NFTs":
        return safeNFTs.filter((n) => n.title.toLowerCase().includes("beat") || n.title.toLowerCase().includes("mix"));
      case "Albums":
        return safeNFTs.filter((n) => n.edition?.toLowerCase().includes("album") || n.id.charCodeAt(0) % 2 === 0);
      case "Tracks":
        return safeNFTs.filter((n) => !n.edition?.toLowerCase().includes("album"));
      case "Auctions":
        return safeNFTs.filter((n, index) => index % 3 === 0);
      default:
        return safeNFTs;
    }
  }, [activeTab, safeNFTs]);

  // Top Collections mock list (Section 7)
  const top10Collections = useMemo(() => {
    return Array.from({ length: 10 }).map((_, idx) => {
      const isUp = idx % 2 === 0;
      const chg = isUp ? `+${(15 - idx * 1.2).toFixed(1)}%` : `-${(2 + idx * 0.4).toFixed(1)}%`;
      return {
        id: `coll-rank-${idx}`,
        name: idx === 0 ? "TON Beats Odyssey" : idx === 1 ? "Supernova Symphonies" : idx === 2 ? "Golden Ether Anthems" : `Echoes Collection v${idx}`,
        creator: idx === 0 ? "DJ Krupy" : idx === 1 ? "Lara Moon" : idx === 2 ? "Neon Pulse" : `Artist #${idx}`,
        volume: (5430 - idx * 450).toLocaleString(),
        floorPrice: (12 + idx * 4).toFixed(1),
        imageUrl: idx < FEATURED_COLLECTIONS.length ? FEATURED_COLLECTIONS[idx].imageUrl : `https://images.unsplash.com/photo-${1514525253161 + idx}?w=150&auto=format&fit=crop&q=40`,
        change: chg,
      };
    });
  }, []);

  // Marketplace Rankings Tabs source (Section 8)
  const rankingsData = useMemo(() => {
    return {
      artists: Array.from({ length: 6 }).map((_, idx) => ({
        rank: idx + 1,
        name: idx < MOCK_ARTISTS.length ? MOCK_ARTISTS[idx].name : `Sound Designer ${idx}`,
        imageUrl: idx < MOCK_ARTISTS.length ? MOCK_ARTISTS[idx].avatarUrl : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=40`,
        metricValue: `${(45200 - idx * 6200).toLocaleString()} TON`,
        metricLabel: "Creator Royalties Volume",
        change: `+${(24 - idx * 3.5).toFixed(1)}%`,
      })),
      collections: top10Collections.slice(0, 6).map((item, idx) => ({
        rank: idx + 1,
        name: item.name,
        creator: item.creator,
        imageUrl: item.imageUrl,
        metricValue: `${item.volume} TON`,
        metricLabel: "Volume",
        change: item.change,
      })),
      tracks: safeNFTs.slice(0, 6).map((item, idx) => ({
        rank: idx + 1,
        name: item.title,
        creator: item.creator,
        imageUrl: item.imageUrl,
        metricValue: `${item.price} TON`,
        metricLabel: "Floor Ask",
        change: `+${(12 + idx * 1.8).toFixed(1)}%`,
        trackId: item.trackId,
      })),
    };
  }, [top10Collections, safeNFTs]);

  // Framer Motion parent view configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050A24] text-white font-sans pb-28 select-none overflow-x-hidden">
      
      {/* Background visual halo glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#5B6BFF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#00B4D8]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- SECTION 1: MARKETPLACE HERO --- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 md:px-8 pt-8 pb-4 text-center sm:text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00B4D8] mb-1.5 inline-block">
          TonJam Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">
          NFT Marketplace
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#9AA0AE] tracking-wide mt-1">
          Discover, stream and own music NFTs
        </p>
      </motion.div>

      {/* --- SECTION 9: LIVE SALES FEED (Ticker placed on top for high context) --- */}
      <div className="w-full bg-[#0A113A]/60 py-2.5 border-y border-white/[0.04] mb-6 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050A24] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#050A24] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
          className="flex gap-12 whitespace-nowrap px-4"
        >
          {Array.from({ length: 3 }).map((_, repIdx) => (
            <React.Fragment key={`rep-${repIdx}`}>
              {TICKER_ITEMS.map((item, idx) => (
                <div key={`${repIdx}-${idx}`} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#2BE08C] animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase font-mono text-white/90">
                    {item}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* --- SECTION 2: MARKETPLACE ANALYTICS --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {ANALYTICS_DATA.map((card, idx) => (
              <AnalyticsCard
                key={`analytics-${idx}`}
                title={card.title}
                value={card.value}
                change={card.change}
                icon={card.icon}
                className="snap-start"
              />
            ))}
          </div>
        </motion.section>

        {/* --- SECTION 3: MARKETPLACE FILTER PILLS --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8 sticky top-0 z-30 py-2.5 bg-[#050A24]/90 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <LayoutGroup id="marketFilters">
              {FILTER_PILLS.map((pill) => {
                const isActive = activeTab === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => setActiveTab(pill)}
                    className="relative flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-200 focus:outline-none"
                    style={{
                      color: isActive ? "#FFFFFF" : "#9AA0AE",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-[#5B6BFF] rounded-full z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{pill}</span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
        </motion.section>

        {/* --- SECTION 4: FEATURED COLLECTION CAROUSEL --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="relative rounded-2xl bg-[#0A113A] border border-white/[0.04] overflow-hidden min-h-[220px] sm:min-h-[280px] flex flex-col justify-end p-6 md:p-8">
            <AnimatePresence mode="wait">
              {FEATURED_COLLECTIONS.map((col, idx) => {
                if (idx !== carouselIndex) return null;
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-0"
                  >
                    {/* Shadow bleed backdrops */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                    <img
                      src={col.imageUrl}
                      alt={col.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Floating Hero tags */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-[#5B6BFF] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Featured Drop
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-6 md:left-8 right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-1 mb-1">
                          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                            {col.name}
                          </h2>
                          <BadgeCheck className="w-4 h-4 text-[#5B6BFF] fill-current" />
                        </div>
                        <p className="text-xs text-[#9AA0AE] font-semibold tracking-wider uppercase mb-3">
                          Curated by <span className="text-white font-bold">{col.creator}</span>
                        </p>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[8px] text-[#9AA0AE] uppercase tracking-widest font-black block">
                              Floor Ask
                            </span>
                            <span className="text-sm font-black text-[#00B4D8]">
                              {col.floorPrice} <span className="text-[10px] text-zinc-400">TON</span>
                            </span>
                          </div>
                          <div className="w-[1px] h-6 bg-white/[0.08]" />
                          <div>
                            <span className="text-[8px] text-[#9AA0AE] uppercase tracking-widest font-black block">
                              Total Volume
                            </span>
                            <span className="text-sm font-black text-white">
                              {col.volume} <span className="text-[10px] text-zinc-400">TON</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/artist/dj-krupy`)}
                        className="bg-white hover:bg-white/95 text-black text-[10px] font-black uppercase tracking-widest rounded-xl py-5 px-6 self-start sm:self-auto shrink-0 transition-transform duration-200 transform hover:scale-103"
                      >
                        View Collection
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="absolute bottom-4 left-6 md:left-8 z-30 flex items-center gap-1.5">
              {FEATURED_COLLECTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === carouselIndex ? "w-6 bg-[#00B4D8]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* --- SECTION 5: TRENDING NFTS --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF3A5C]" />
              Trending Audio Assets
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5B6BFF] cursor-pointer hover:underline" onClick={() => setActiveTab("Trending")}>
              View All
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {safeNFTs.slice(0, 8).map((nft) => (
              <MarketplaceNFTCard
                key={`trending-${nft.id}`}
                nft={nft}
                className="w-52 flex-shrink-0 snap-start"
              />
            ))}
          </div>
        </motion.section>

        {/* --- SECTION 6: NEW DROPS --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F5D547]" />
              New Drops Grid
            </h2>
            <Badge className="bg-[#2BE08C]/15 text-[#2BE08C] uppercase tracking-widest text-[8px] font-black">
              Just Added
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredNewDrops.slice(0, 8).map((nft) => (
              <MarketplaceNFTCard key={`drop-${nft.id}`} nft={nft} />
            ))}
          </div>
        </motion.section>

        {/* --- SECTION 7: TOP COLLECTIONS (Leaderboard) --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="bg-[#0A113A] rounded-2xl border border-white/[0.04] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-[#00B4D8]" />
                  Top Music Collections
                </h2>
                <p className="text-[9px] text-[#9AA0AE] tracking-wide font-medium">
                  Ranked by trading volume inside TON Blockchain over last 3 days
                </p>
              </div>
              <Badge className="bg-[#5B6BFF]/15 text-[#5B6BFF] uppercase tracking-widest text-[8px] font-black border-none">
                Live Data
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {top10Collections.map((col, idx) => (
                <div
                  key={col.id}
                  onClick={() => navigate(`/artist/dj-krupy`)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] duration-200 text-xs text-white/90 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 font-black font-mono text-[#9AA0AE] text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={col.imageUrl}
                      alt={col.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-black/30"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#FFFFFF] tracking-tight truncate max-w-[130px] uppercase">
                        {col.name}
                      </p>
                      <p className="text-[9px] text-[#9AA0AE] font-semibold tracking-wider uppercase truncate">
                        Floor: <span className="text-[#00B4D8] font-bold">{col.floorPrice} TON</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-white">{col.volume} TON</p>
                    <span
                      className={`text-[8.5px] font-mono font-black ${
                        col.change.startsWith("+") ? "text-[#2BE08C]" : "text-[#FF3A5C]"
                      }`}
                    >
                      {col.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* --- SECTION 8: MARKETPLACE RANKINGS --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <Tabs value={rankingTab} onValueChange={setRankingTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Marketplace Rankings
              </h2>
              <TabsList className="bg-[#0A113A] border-none p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <TabsTrigger
                  value="artists"
                  className="rounded-lg text-[9px] font-black uppercase tracking-wider text-[#9AA0AE] data-[state=active]:bg-[#5B6BFF] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2"
                >
                  Artists
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="rounded-lg text-[9px] font-black uppercase tracking-wider text-[#9AA0AE] data-[state=active]:bg-[#5B6BFF] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2"
                >
                  Collections
                </TabsTrigger>
                <TabsTrigger
                  value="tracks"
                  className="rounded-lg text-[9px] font-black uppercase tracking-wider text-[#9AA0AE] data-[state=active]:bg-[#5B6BFF] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2"
                >
                  Tracks
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="artists" className="mt-0 space-y-2">
              {rankingsData.artists.map((item) => (
                <RankingCard
                  key={`rank-art-${item.rank}`}
                  rank={item.rank}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  metricValue={item.metricValue}
                  metricLabel={item.metricLabel}
                  change={item.change}
                  type="artist"
                  onClick={() => navigate(`/artist/dj-krupy`)}
                />
              ))}
            </TabsContent>

            <TabsContent value="collections" className="mt-0 space-y-2">
              {rankingsData.collections.map((item) => (
                <RankingCard
                  key={`rank-coll-${item.rank}`}
                  rank={item.rank}
                  name={item.name}
                  creator={item.creator}
                  imageUrl={item.imageUrl}
                  metricValue={item.metricValue}
                  metricLabel={item.metricLabel}
                  change={item.change}
                  type="collection"
                  onClick={() => navigate(`/artist/dj-krupy`)}
                />
              ))}
            </TabsContent>

            <TabsContent value="tracks" className="mt-0 space-y-2">
              {rankingsData.tracks.map((item) => (
                <RankingCard
                  key={`rank-tr-${item.rank}`}
                  rank={item.rank}
                  name={item.name}
                  creator={item.creator}
                  imageUrl={item.imageUrl}
                  metricValue={item.metricValue}
                  metricLabel={item.metricLabel}
                  change={item.change}
                  type="track"
                  onClick={() => {
                    const track = MOCK_TRACKS.find((t) => t.id === item.trackId);
                    if (track) playTrack(track);
                  }}
                  onPlayTrack={() => {
                    const track = MOCK_TRACKS.find((t) => t.id === item.trackId);
                    if (track) playTrack(track);
                  }}
                />
              ))}
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* --- SECTION 10: RECOMMENDED FOR YOU --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2BE08C]" />
              Recommended For You
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8] opacity-80 decoration-dotted">
              Selected via AI
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {safeNFTs.slice(3, 9).map((nft) => (
              <MarketplaceNFTCard
                key={`rec-${nft.id}`}
                nft={nft}
                className="w-52 flex-shrink-0 snap-start"
              />
            ))}
          </div>
        </motion.section>

        {/* --- SECTION 11: RECENTLY VIEWED --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#9AA0AE]" />
              Recently Viewed History
            </h2>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
              Cleared on Exit
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {safeNFTs.slice(6, 12).reverse().map((nft) => (
              <MarketplaceNFTCard
                key={`recent-${nft.id}`}
                nft={nft}
                className="w-48 flex-shrink-0 snap-start"
              />
            ))}
          </div>
        </motion.section>

        {/* --- SECTION 12: CATEGORIES (Responsive Grid) --- */}
        <motion.section variants={itemVariants} className="w-full px-4 md:px-8">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white mb-4">
            Marketplace Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {CATEGORY_ITEMS.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cat.label === "Auctions" || cat.label === "Trending") {
                    setActiveTab(cat.label);
                  } else if (cat.label === "Tracks" || cat.label === "Albums" || cat.label === "Playlists") {
                    setActiveTab("Music NFTs");
                  } else {
                    setActiveTab("All");
                  }
                }}
                className="p-4 rounded-2xl bg-[#0A113A] border border-white/[0.04] flex flex-col items-center text-center justify-center cursor-pointer transition-colors"
              >
                <div className="p-3 rounded-full bg-white/[0.03] mb-3">
                  {cat.icon}
                </div>
                <h4 className="text-xs font-black uppercase text-white tracking-tight mb-1">
                  {cat.label}
                </h4>
                <p className="text-[8.5px] text-[#9AA0AE] font-semibold tracking-wide uppercase">
                  {cat.count}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};

export default Marketplace;
