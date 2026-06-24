import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  ChevronRight, 
  Zap, 
  TrendingUp, 
  Music, 
  ShoppingBag, 
  Sparkles, 
  Activity, 
  Flame, 
  Clock, 
  Award, 
  Radio, 
  Disc, 
  Plus, 
  UserCheck, 
  UserPlus,
  Coins, 
  ArrowUpRight, 
  MessageSquare,
  FlameKindling,
  Users,
  CheckCircle,
  HelpCircle,
  Volume2,
  Mic2,
  Headphones,
  Guitar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import { TJ_COIN_ICON, TON_LOGO, MOCK_TRACKS } from "@/constants";
import confetti from "canvas-confetti";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import FilterPills from "@/components/FilterPills";
import ContinueListeningCard from "@/components/ContinueListeningCard";

// Import custom card components and types
import ArtistCard from "@/components/ArtistCard";
import UserCard from "@/components/UserCard";
import NFTCard from "@/components/NFTCard";
import TrackCard from "@/components/TrackCard";
import GenreCard from "@/components/GenreCard";
import CommunityFeedCard from "@/components/CommunityFeedCard";
import { Artist, Track, NFTItem } from "@/types";

// ==========================================
// MOCK DATA & INTERFACES FOR HOME "JAM UP"
// ==========================================

interface NFTCollection {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  floorPrice: string;
  mintedCount: number;
  totalLimit: number;
}

interface SponsoredPromo {
  id: string;
  title: string;
  description: string;
  artwork: string;
  badge: "LAUNCH" | "NFT DROP" | "SPONSORED" | "LIVE";
  ctaText: string;
}

interface TopicPill {
  id: string;
  label: string;
  count: string;
}

interface MarketplacePick {
  id: string;
  title: string;
  artist: string;
  price: string;
  likes: number;
  image: string;
  badge: string;
}

interface CommunityActivity {
  id: string;
  username: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  accentColor: string;
  createdAt?: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playTrack, 
    userProfile, 
    allTracks,
    artists: globalArtists,
    currentTrack,
    isPlaying,
    followedUserIds,
    toggleFollowUser,
    tasks
  } = useAudio();

  // Real active tasks and follow status calculations
  const realTasks = tasks || [];
  const completedCount = realTasks.filter(t => t.completed).length;
  const totalCount = realTasks.length || 11;
  const nextUpTask = realTasks.find(t => !t.completed) || { title: "Complete all missions", reward: "Bonus TJ" };
  const dailyEarnable = realTasks.filter(t => !t.completed).reduce((acc, current) => {
    // extract points number or use default
    const pts = current.points || 50; 
    return acc + pts;
  }, 0);

  // Real followed state mapped directly from AudioContext
  const getIsFollowing = (artId: string) => {
    if (!followedUserIds) return ["art-1", "art-4", "art-9"].includes(artId);
    if (followedUserIds.length === 0 && ["art-1", "art-4", "art-9"].includes(artId)) {
      return true;
    }
    return followedUserIds.includes(artId);
  };

  const toggleFollow = (artId: string) => {
    if (toggleFollowUser) {
      toggleFollowUser(artId);
    }
    confetti({
      particleCount: 15,
      spread: 30,
      origin: { y: 0.8 },
      colors: ["#5B6BFF", "#2BE08C"]
    });
  };

  // ------------------------------------------
  // GLOBAL FILTER STATE
  // ------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ------------------------------------------
  // 10 MOCK TRENDING NFT COLLECTIONS
  // ------------------------------------------
  const mockCollections: NFTCollection[] = [
    { id: "col-1", name: "Genesis Beats Vol. 1", artist: "DJ Krupy", coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20genesis%20beats%20neon%20orange?width=300&height=300&nologo=true", floorPrice: "12.5", mintedCount: 420, totalLimit: 500 },
    { id: "col-2", name: "Neon Nights Dubstep", artist: "Byte Beat", coverUrl: "https://image.pollinations.ai/prompt/dubstep%20music%20album%20cover%20neon%20green%20laser%20retro?width=300&height=300&nologo=true", floorPrice: "4.8", mintedCount: 180, totalLimit: 300 },
    { id: "col-3", name: "Deep Abyssal Audio", artist: "Echo Phase", coverUrl: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true", floorPrice: "8.0", mintedCount: 95, totalLimit: 120 },
    { id: "col-4", name: "Dreamweaver Velvet", artist: "Luna Ray", coverUrl: "https://image.pollinations.ai/prompt/dreamy%20pink%20clouds%20golden%20moon%20synthesizer%20art?width=300&height=300&nologo=true", floorPrice: "15.0", mintedCount: 220, totalLimit: 250 },
    { id: "col-5", name: "Ghost City Records", artist: "City Ghost", coverUrl: "https://image.pollinations.ai/prompt/futuristic%20rainy%20alley%20lofi%20synthwave%20album%20cover?width=300&height=300&nologo=true", floorPrice: "3.2", mintedCount: 390, totalLimit: 400 },
    { id: "col-6", name: "Golden Horizon Lofi", artist: "Retro Vibes", coverUrl: "https://image.pollinations.ai/prompt/golden%20hour%20sunrise%20retro%20car%20lofi%20beats%20cover?width=300&height=300&nologo=true", floorPrice: "2.9", mintedCount: 140, totalLimit: 200 },
    { id: "col-7", name: "Decentralized Amapiano", artist: "Major Sound", coverUrl: "https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=300&height=300&nologo=true", floorPrice: "9.5", mintedCount: 75, totalLimit: 100 },
    { id: "col-8", name: "Cyber Punk Rap Vault", artist: "Lil Crypto", coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20rapper%20gold%20teeth%20hologram%20neon%20art?width=300&height=300&nologo=true", floorPrice: "24.0", mintedCount: 11, totalLimit: 50 },
    { id: "col-9", name: "Web3 Bass Boosters", artist: "Dr. Osc", coverUrl: "https://image.pollinations.ai/prompt/subwoofer%20exploding%20with%20cosmic%20purple%20nebula%20cover?width=300&height=300&nologo=true", floorPrice: "6.0", mintedCount: 190, totalLimit: 250 },
    { id: "col-10", name: "Interstellar Anthem", artist: "Cosmic Key", coverUrl: "https://image.pollinations.ai/prompt/galaxy%20retro%20organ%20scifi%20music%20album%20art?width=300&height=300&nologo=true", floorPrice: "18.5", mintedCount: 45, totalLimit: 80 }
  ];

  // ------------------------------------------
  // SECTION 3: MOCK SPONSORED SLIDER PROMOS
  // ------------------------------------------
  const sponsoredPromos: SponsoredPromo[] = [
    { id: "promo-1", title: "Solar Pulse Reloaded", description: "Collect the exclusive diamond release NFT drop by DJ Krupy.", artwork: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=400&nologo=true", badge: "NFT DROP", ctaText: "Mint Now" },
    { id: "promo-2", title: "TON Producers Summit", description: "Tune in live tomorrow at 18:00 UTC with top music artists.", artwork: "https://image.pollinations.ai/prompt/futuristic%20audio%20synthesizer%20control%20deck%20concert%20neon?width=600&height=400&nologo=true", badge: "LIVE", ctaText: "Join Room" },
    { id: "promo-3", title: "Amapiano Wave 2026", description: "Discover high volume soundscapes straight from Lagos to Miami.", artwork: "https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=600&height=400&nologo=true", badge: "LAUNCH", ctaText: "Listen First" },
    { id: "promo-4", title: "Retro Sound Lab Sponsor", description: "Promoting next-gen digital instruments on TON Blockchain.", artwork: "https://image.pollinations.ai/prompt/retro%20lofi%20cassette%20player%20floating%20in%20purple%20space?width=600&height=400&nologo=true", badge: "SPONSORED", ctaText: "Claim Free Box" }
  ];

  // ------------------------------------------
  // 12 NEW DROPS TRACKS
  // ------------------------------------------
  const mockNewDrops = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    // Stretch to 12 mock tracks if database has fewer
    const repeated = [...list];
    while (repeated.length < 12) {
      repeated.push(...list.map(t => ({ ...t, id: `${t.id}-${Date.now()}-${Math.random()}` })));
    }
    return repeated.slice(0, 12);
  }, [allTracks]);

  // ------------------------------------------
  // TOP TRENDING SONGS (1-5)
  // ------------------------------------------
  const topTrendingSongs = useMemo(() => {
    return (allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS).slice(0, 5);
  }, [allTracks]);

  // ------------------------------------------
  // 10 TRENDING ARTISTS
  // ------------------------------------------
  const trendingArtists = [
    { id: "art-1", name: "DJ Krupy", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=krupy", followers: "142.5k", verified: true },
    { id: "art-2", name: "Byte Beat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=byte", followers: "84.2k", verified: true },
    { id: "art-3", name: "Echo Phase", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=echo", followers: "13.9k", verified: false },
    { id: "art-4", name: "Luna Ray", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=luna", followers: "92.0k", verified: true },
    { id: "art-5", name: "City Ghost", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ghost", followers: "128.1k", verified: true },
    { id: "art-6", name: "Major Sound", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=major", followers: "44.9k", verified: false },
    { id: "art-7", name: "Retro Vibes", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=vibes", followers: "52.3k", verified: true },
    { id: "art-8", name: "Dr. Osc", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=osc", followers: "8.4k", verified: false },
    { id: "art-9", name: "Lil Crypto", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=crypto", followers: "205.0k", verified: true },
    { id: "art-10", name: "Cosmic Key", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=key", followers: "1.9k", verified: false }
  ];

  const mappedTrendingArtists: Artist[] = useMemo(() => {
    return trendingArtists.map((art) => ({
      uid: art.id,
      name: art.name,
      avatarUrl: art.avatar,
      followers: parseFloat(art.followers.replace('k', '')) * 1000 || 0,
      verified: art.verified,
      isVerifiedArtist: art.verified,
      username: art.name.toLowerCase().replace(/\s+/g, ''),
    } as Artist));
  }, [trendingArtists]);

  // ------------------------------------------
  // LIVE SPACES
  // ------------------------------------------
  const liveSpaces = [
    { id: "space-1", title: "Afrobeats Producers Lounge 🌍", host: "Ayra Starr", listeners: "1.4k", status: "LIVE" },
    { id: "space-2", title: "TON Creators Hub - Minting Future 🚀", host: "DJ Krupy", listeners: "920", status: "LIVE" },
    { id: "space-3", title: "Music NFT Masterclass v2 💎", host: "Cyber Lord", listeners: "410", status: "LIVE" }
  ];

  // ------------------------------------------
  // RECOMMENDATIONS
  // ------------------------------------------
  const recommendedTracks = useMemo(() => {
    return (allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS).slice(1, 6);
  }, [allTracks]);

  const recommendedNFTs = [
    { id: "nft-r1", title: "Deep Oceans #04", price: "4.5 TON", owner: "Echo Phase", cover: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true" },
    { id: "nft-r2", title: "Solar Drift Signature", price: "12.0 TON", owner: "DJ Krupy", cover: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true" },
    { id: "nft-r3", title: "Cosmic Gate Keyframe", price: "2.8 TON", owner: "Luna Ray", cover: "https://image.pollinations.ai/prompt/galaxy%20retro%20organ%20scifi%20music%20album%20art?width=300&height=300&nologo=true" }
  ];

  const mappedRecommendedNFTs: NFTItem[] = useMemo(() => {
    return recommendedNFTs.map(nft => ({
      id: nft.id,
      trackId: "",
      title: nft.title,
      owner: nft.owner,
      creator: nft.owner,
      artist: nft.owner,
      price: nft.price,
      imageUrl: nft.cover,
      coverUrl: nft.cover,
      edition: "Limited Edition",
      type: "track",
      url: "",
    } as any));
  }, [recommendedNFTs]);

  // ------------------------------------------
  // REWARDS COUNTER & TASK DATA
  // ------------------------------------------
  const realTJBalance = userProfile?.tjBalance || 125430;

  // ------------------------------------------
  // TOP MARKETPLACE PICKS
  // ------------------------------------------
  const marketplacePicks: MarketplacePick[] = [
    { id: "pick-1", title: "Aura Beat Legendary #02", artist: "Luna Ray", price: "25.0 TON", likes: 340, image: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves%20artwork?width=300&height=300&nologo=true", badge: "Trending" },
    { id: "pick-2", title: "Cybernetic Echo Synth", artist: "Dr. Osc", price: "9.0 TON", likes: 112, image: "https://image.pollinations.ai/prompt/cybernetic%20abstract%20holographic%20music%20key?width=300&height=300&nologo=true", badge: "Highest Volume" },
    { id: "pick-3", title: "Amapiano Golden Sceptre #01", artist: "Major Sound", price: "45.0 TON", likes: 780, image: "https://image.pollinations.ai/prompt/gold%20african%20tribal%20future%20crown%20shield?width=300&height=300&nologo=true", badge: "Live Auction" }
  ];




  // ------------------------------------------
  // RECENTLY MINTED MUSIC NFTs
  // ------------------------------------------
  const [recentlyMintedNFTs, setRecentlyMintedNFTs] = useState([
    { id: "mint-1", name: "Pulse Beat Core", artist: "DJ Krupy", price: "2.5 TON", cover: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true", minted: false },
    { id: "mint-2", name: "Retro Sunset Drifter", artist: "Retro Vibes", price: "1.8 TON", cover: "https://image.pollinations.ai/prompt/golden%20hour%20sunrise%20retro%20car%20lofi%20beats%20cover?width=300&height=300&nologo=true", minted: false },
    { id: "mint-3", name: "Cyber City Alley Lofi", artist: "City Ghost", price: "3.2 TON", cover: "https://image.pollinations.ai/prompt/futuristic%20rainy%20alley%20lofi%20synthwave%20album%20cover?width=300&height=300&nologo=true", minted: true },
    { id: "mint-4", name: "Abyssal Aquatic Beats", artist: "Echo Phase", price: "5.0 TON", cover: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true", minted: false }
  ]);

  const handleMintNFT = (nftId: string) => {
    setRecentlyMintedNFTs(prev =>
      prev.map(item =>
        item.id === nftId ? { ...item, minted: true } : item
      )
    );
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#2BE08C", "#00B4D8", "#5B6BFF"]
    });
  };

  const mappedRecentlyMintedNFTs: NFTItem[] = useMemo(() => {
    return recentlyMintedNFTs.map(nft => ({
      id: nft.id,
      trackId: "",
      title: nft.name,
      owner: nft.minted ? (userProfile?.walletAddress || "EQ...user") : "EQ...creator",
      creator: nft.artist,
      artist: nft.artist,
      price: nft.price,
      imageUrl: nft.cover,
      coverUrl: nft.cover,
      edition: nft.minted ? "1 of 1" : "Limited Edition",
      type: "track",
      url: "",
      listingType: nft.minted ? undefined : 'sale',
    } as any));
  }, [recentlyMintedNFTs, userProfile]);

  // ------------------------------------------
  // COMMUNITY ACTIVITY SOCIAL STREAM (MOCK DATA)
  // ------------------------------------------
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000); // refresh every 10 seconds for real-time fidelity
    return () => clearInterval(timer);
  }, []);

  const [communityActivities, setCommunityActivities] = useState<CommunityActivity[]>([
    { id: "act-1", username: "Davido", action: "minted a new NFT", target: "OBO Genesis Edition #01", time: "now", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=davido", accentColor: "#2BE08C", createdAt: Date.now() - 4000 },
    { id: "act-2", username: "Ayra Starr", action: "released a track", target: "Bloody Samaritan (Vibe Edition)", time: "3m ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=ayra", accentColor: "#5B6BFF", createdAt: Date.now() - 3 * 60 * 1000 },
    { id: "act-3", username: "DJ Nova", action: "started a Space", target: "TON Creators Hub Live 🎙️", time: "12m ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=nova", accentColor: "#FF3A5C", createdAt: Date.now() - 12 * 60 * 1000 },
    { id: "act-4", username: "ProducerX", action: "reached milestones", target: "1,000,000 dynamic streams", time: "32m ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=prodx", accentColor: "#00B4D8", createdAt: Date.now() - 32 * 60 * 1000 },
    { id: "act-5", username: "krupyfan_ton", action: "purchased NFT", target: "Solar Pulse Keyframe #44", time: "1h ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=krupyfan", accentColor: "#F5D547", createdAt: Date.now() - 60 * 60 * 1000 },
    { id: "act-6", username: "vibe_collector", action: "followed artist", target: "Luna Ray Release Stream", time: "2h ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=vibe", accentColor: "#5B6BFF", createdAt: Date.now() - 120 * 60 * 1000 }
  ]);

  // Infinite Scroll simulation for social feed
  const loadMoreActivities = () => {
    const extra: CommunityActivity[] = [
      { id: `act-ex-${Date.now()}-1`, username: "Whiz_Collector", action: "minted music NFT", target: "Cyber Drift Platinum #09", time: "3h ago", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random()}`, accentColor: "#00B4D8", createdAt: Date.now() - 180 * 60 * 1000 },
      { id: `act-ex-${Date.now()}-2`, username: "Santi_Beats", action: "joined voice space", target: "Afrobeats Lounge", time: "4h ago", avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random()}`, accentColor: "#F5D547", createdAt: Date.now() - 240 * 60 * 1000 }
    ];
    setCommunityActivities(curr => [...curr, ...extra]);
  };

  const getRelativeTimeStr = (act: CommunityActivity) => {
    if (!act.createdAt) return act.time;
    const diffMs = Date.now() - act.createdAt;
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSecs < 10) return "now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // ------------------------------------------
  // AUTO CAROUSEL LOGIC (SECTION 3)
  // ------------------------------------------
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % sponsoredPromos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const listeningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listeningRef.current;
    if (!container) return;

    const scrollInterval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 1;
      }
    }, 50);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A113A] text-white pb-32 overflow-x-hidden selection:bg-[#5B6BFF]/30">
      
      {/* GLOWING ORBIT BACKGROUND BLURS - Boundary-Free, No outlines */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#5B6BFF]/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-[#00B4D8]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1800px] left-[-100px] w-[500px] h-[500px] bg-[#2BE08C]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Main Container constrained for premium mobile-first preview */}
      <div className="max-w-md mx-auto px-4 pt-6 space-y-8 pb-12">

        {/* ==========================================
            SECTION 1: PERSONALIZED WELCOME HERO
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 text-left"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans leading-none pt-2">
              Good Evening <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-sm font-medium text-[#9AA0AE] font-sans">
              Welcome Back, {userProfile?.username || "Collector"}
            </p>
            <p className="text-[11px] text-[#9AA0AE]/80 font-normal font-sans">
              Discover new sounds, collect music NFTs and earn rewards.
            </p>
          </div>
        </motion.div>

        <div className="space-y-3 text-left">
          <h2 className="text-xs font-black tracking-widest text-[#9AA0AE] uppercase px-4">
            Continue Listening
          </h2>
          <div ref={listeningRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pl-4" style={{ scrollBehavior: 'smooth' }}>
            {(allTracks && allTracks.length > 0 ? allTracks.slice(0, 6) : MOCK_TRACKS.slice(0, 6)).map((track) => (
              <div key={track.id} className="w-[300px] shrink-0">
                <ContinueListeningCard
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl || (track as any).imageUrl || ""}
                  onPlay={() => playTrack(track)}
                />
              </div>
            ))}
          </div>
        </div>

        <FilterPills selectedGenre={selectedCategory} onSelect={setSelectedCategory} />

        {/* ==========================================
            BROWSE GENRES (Horizontal Scroll)
            ========================================== */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-black tracking-tight text-white px-0.5">
            Browse Genres
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-0.5">
            {[
              { id: '1', name: 'Electronic', icon: Radio, color: 'from-blue-600 to-cyan-400' },
              { id: '2', name: 'Amapiano', icon: Music, color: 'from-yellow-500 to-orange-400' },
              { id: '3', name: 'Lofi', icon: Headphones, color: 'from-purple-600 to-indigo-400' },
              { id: '4', name: 'Afrobeats', icon: Mic2, color: 'from-red-600 to-orange-400' },
              { id: '5', name: 'Rock', icon: Guitar, color: 'from-zinc-600 to-zinc-400' },
              { id: '6', name: 'Hip-Hop', icon: Disc, color: 'from-rose-600 to-pink-400' },
              { id: '7', name: 'Pop', icon: Zap, color: 'from-yellow-400 to-amber-300' },
              { id: '8', name: 'Jazz', icon: Music, color: 'from-emerald-600 to-teal-400' },
              { id: '9', name: 'Classical', icon: Music, color: 'from-amber-700 to-yellow-600' },
              { id: '10', name: 'Ambient', icon: Radio, color: 'from-cyan-600 to-blue-500' },
              { id: '11', name: 'R&B', icon: Flame, color: 'from-pink-600 to-rose-400' },
              { id: '12', name: 'Reggae', icon: Radio, color: 'from-green-600 to-lime-400' },
              { id: '13', name: 'Funk', icon: Zap, color: 'from-orange-600 to-yellow-400' },
              { id: '14', name: 'Techno', icon: Disc, color: 'from-zinc-800 to-zinc-500' },
              { id: '15', name: 'House', icon: Headphones, color: 'from-violet-600 to-purple-400' },
            ].map((genre) => (
              <div key={genre.id} className="w-[120px] shrink-0">
                <GenreCard genre={genre} />
              </div>
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 9: EARN TJ PREVIEW
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-br from-[#101A3B] to-[#0A113A]/90 p-5 relative overflow-hidden text-left border-none shadow-xl"
        >
          {/* Flame ambient light */}
          <div className="absolute top-[40px] right-[-40px] w-28 h-28 bg-[#2BE08C]/12 rounded-full blur-[35px] pointer-events-none" />

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2BE08C]/10 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-[#2BE08C] fill-[#2BE08C]/20" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  Earn up to {dailyEarnable > 0 ? dailyEarnable : 0} TJ Today
                </h3>
                <p className="text-[10px] text-[#9AA0AE]">
                  Keep alignment rewards streaming
                </p>
              </div>
            </div>

            {/* Simulated Live Coins Balance and routing */}
            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full shrink-0">
              <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" />
              <span className="text-[11px] font-black font-mono tracking-tight text-white">
                {parseFloat(String(userProfile?.jamBalance || '0')).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-[#9AA0AE] ml-1">JAM</span>
            </div>
          </div>

          {/* Quick inline micro progress slider bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9AA0AE]">
              <span>Missions Completed</span>
              <span className="text-[#2BE08C]">{completedCount} / {totalCount} Complete</span>
            </div>
            <div className="w-full h-1.5 bg-[#050A24] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#2BE08C] to-[#00B4D8] rounded-full transition-all duration-300" 
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between gap-3">
            <span className="text-[10px] text-[#9AA0AE] truncate max-w-[200px]">
              Next: {nextUpTask.title} ({nextUpTask.reward})
            </span>
            <Button
              size="sm"
              onClick={() => navigate("/tasks")}
              className="h-8 bg-[#5B6BFF] hover:bg-[#4856ea] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none shrink-0"
            >
              View Tasks <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        </motion.div>


        {/* ==========================================
            SECTION 3: SPONSORED JAM FEED
            ========================================== */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-black tracking-tight text-white px-0.5">
            Featured Launches & Updates
          </h2>

          <div className="relative rounded-2xl overflow-hidden bg-[#0A113A]/50 backdrop-blur-xl h-[170px] border-none shadow-xl">
            <AnimatePresence mode="wait">
              {sponsoredPromos.map((item, idx) => {
                if (idx !== currentPromoIndex) return null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col justify-end p-5"
                  >
                    {/* Background Artwork Cover Image directly rendered inline */}
                    <img 
                      src={item.artwork} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-35" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] via-[#050A24]/70 to-transparent" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="inline-block px-2 py-0.5 rounded bg-[#5B6BFF] text-[8px] font-black uppercase tracking-widest text-white leading-none">
                        {item.badge}
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-1.5 leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#9AA0AE] leading-normal max-w-[280px]">
                        {item.description}
                      </p>
                      
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (item.badge === "LIVE") {
                              confetti({ particleCount: 50 });
                            } else {
                              navigate("/marketplace");
                            }
                          }}
                          className="h-7 bg-[#00B4D8] hover:bg-[#009bba] text-[#050A24] font-black text-[9px] uppercase tracking-widest px-3.5 rounded-full cursor-pointer leading-none border-none"
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
            <div className="absolute bottom-3 right-5 z-10 flex gap-1">
              {sponsoredPromos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPromoIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer border-none p-0 outline-none ${
                    idx === currentPromoIndex ? "bg-[#5B6BFF] w-4" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>


        {/* ==========================================
            SECTION 2: TRENDING TRACKS
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-lg font-black tracking-tight text-white">
              Trending Now
            </h2>
            <button onClick={() => navigate("/marketplace")} className="text-xs font-bold text-[#5B6BFF] flex items-center outline-none cursor-pointer border-none bg-transparent">
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {(allTracks && allTracks.length > 0 ? [...allTracks].sort((a,b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5) : MOCK_TRACKS.slice(0, 5)).map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                variant="default"
                className="w-[165px] shrink-0"
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 4: NEW DROPS (Horizontal scroll music cards)
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-black tracking-tight text-white">
              New Drops
            </h2>
            <span className="text-[10px] text-[#9AA0AE] font-medium">12 Fresh Releases</span>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {mockNewDrops.map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                variant="default" 
                className="w-[165px] shrink-0"
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 5: TOP TRENDING SONGS (Rank #1 - #5)
            ========================================== */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-black tracking-tight text-white px-0.5">
            Top Trending Songs
          </h2>

          <div className="rounded-2xl bg-[#0A113A]/50 backdrop-blur-md p-2 space-y-1.5 shadow-md border-none">
            {topTrendingSongs.map((track, idx) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                variant="row" 
                index={idx} 
                className="w-full" 
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 6: TRENDING ARTISTS (Horizontal Cards with profile items)
            ========================================== */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-black tracking-tight text-white px-0.5">
            Trending Artists
          </h2>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-0.5">
            {mappedTrendingArtists.map((art) => (
              <ArtistCard 
                key={art.uid} 
                artist={art} 
                variant="default" 
                className="w-[150px] shrink-0 bg-[#0A113A]/50 px-3 py-4 rounded-2xl" 
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 7: LIVE SPACES
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-lg font-black tracking-tight text-white">
              Live Spaces
            </h2>
            <span className="text-[9px] text-[#FF3A5C] bg-[#FF3A5C]/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
              On Air
            </span>
          </div>

          <div className="space-y-2.5">
            {liveSpaces.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-[#0A113A]/60 backdrop-blur-md flex items-center justify-between gap-3 shadow-md border-none"
              >
                <div className="space-y-1.5 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3A5C]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#9AA0AE] leading-none">
                      {room.host} Space
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white leading-tight tracking-tight truncate max-w-[220px]">
                    {room.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#9AA0AE]">
                    <Users className="w-3.5 h-3.5 text-[#00B4D8]" /> Shared with <span className="font-extrabold text-white">{room.listeners} listening</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    confetti({ particleCount: 30, spread: 50 });
                  }}
                  className="h-8 bg-[#FF3A5C] hover:bg-[#e02d4d] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none"
                >
                  Join
                </Button>
              </div>
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 8: RECOMMENDED FOR YOU (Curated Tracks, Artists, NFTs)
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-black tracking-tight text-white">
              Recommended For Your Vibe
            </h2>
            <Sparkles className="w-4 h-4 text-[#F5D547]" />
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {/* Curated Track recommendation */}
            {recommendedTracks.map((rec) => (
              <TrackCard 
                key={rec.id} 
                track={rec} 
                variant="default" 
                className="w-[165px] shrink-0" 
              />
            ))}

            {/* Recommended Music NFT card */}
            {mappedRecommendedNFTs.map((nft) => (
              <NFTCard 
                key={nft.id} 
                nft={nft} 
                variant="default" 
                className="w-[165px] shrink-0" 
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 10: TOP MARKETPLACE PICKS
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-4 border-none">
            <h2 className="text-lg font-black tracking-tight text-white">
              Top Marketplace Picks
            </h2>
            <ShoppingBag className="w-4 h-4 text-[#00B4D8]" />
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {marketplacePicks.map((pick) => (
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
                  edition: '',
                  description: '',
                  isAuction: false
                } as any}
                className="w-[165px] shrink-0"
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 11: FAVORITE ARTISTS Latest Releases (User's followed ones)
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-lg font-black tracking-tight text-white font-sans">
              Favorite Artists Updates
            </h2>
            <span className="text-[9px] uppercase tracking-widest font-black text-[#2BE08C] bg-[#2BE08C]/15 px-2 py-0.5 rounded-full leading-none">
              Live Updates
            </span>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-2 px-4 animate-fade-in">
            {mappedTrendingArtists.filter(art => getIsFollowing(art.uid)).map((art) => (
              <ArtistCard 
                key={art.uid} 
                artist={art}
                variant="default"
                className="w-[120px] shrink-0 bg-[#0A113A]/50 px-3 py-4 rounded-2xl"
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 13: RECENTLY MINTED MUSIC NFTs (Horizontal Scroll)
            ========================================= */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-black tracking-tight text-white px-0.5">
            Recently Minted Music NFTs
          </h2>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4 animate-fade-in">
            {mappedRecentlyMintedNFTs.map((nft) => (
              <NFTCard 
                key={nft.id} 
                nft={nft} 
                variant="default"
                className="w-[165px] shrink-0"
                onAction={(nftItem) => {
                  if (nftItem.owner !== userProfile?.walletAddress) {
                    handleMintNFT(nftItem.id);
                  }
                }}
              />
            ))}
          </div>
        </div>


        {/* ==========================================
            SECTION 14: COMMUNITY ACTIVITY FEED (Infinite Scrolling Support)
            ========================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-lg font-black tracking-tight text-white">
              Community Activity Feed
            </h2>
            <Activity className="w-4.5 h-4.5 text-[#2BE08C] animate-pulse" />
          </div>

          <div className="rounded-2xl bg-[#0A113A]/50 p-4 border-none shadow-md text-left">
            <ScrollArea className="h-72 w-full pr-3">
              <div className="space-y-3.5">
                {communityActivities.map((act, index) => (
                  <React.Fragment key={act.id}>
                    <CommunityFeedCard
                      username={act.username}
                      action={act.action}
                      target={act.target}
                      time={getRelativeTimeStr(act)}
                      avatar={act.avatar}
                      accentColor={act.accentColor}
                    />
                    {index < communityActivities.length - 1 && (
                      <Separator className="my-3 opacity-30" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>

            <Button
              size="sm"
              variant="outline"
              onClick={loadMoreActivities}
              className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-white/[0.02] text-[#9AA0AE]/80 hover:bg-white/5 border-none rounded-xl mt-4 cursor-pointer flex items-center gap-1 justify-center leading-none"
            >
              Load Older Stream Activities <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>


        {/* DESIGN FOOTER & ORACLE PROTOCOL NOTE */}
        <div className="pt-6 text-center space-y-1.5 pb-10">
          <p className="text-[8.5px] uppercase tracking-[0.22em] text-[#9AA0AE]/40 font-black">
            TonJam Decentralized Music Marketplace
          </p>
          <div className="flex items-center justify-center gap-1.5 text-white/30 text-[8px] font-bold uppercase tracking-widest">
            <Disc className="w-3.5 h-3.5 text-[#00B4D8] animate-spin" />
            <span>Smart Node Web3 Interface Connected</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
