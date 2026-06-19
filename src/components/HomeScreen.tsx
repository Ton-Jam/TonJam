import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  Activity, 
  Disc, 
  ArrowUpRight, 
  CheckCircle,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import { TJ_COIN_ICON, TON_LOGO, MOCK_TRACKS } from "@/constants";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

import ContinueListeningCard from "./ContinueListeningCard";
import NFTCollectionCard from "./NFTCollectionCard";
import SponsoredFeedCard from "./SponsoredFeedCard";
import LiveSpaceCard from "./LiveSpaceCard";
import RewardPreviewCard from "./RewardPreviewCard";
import MarketplaceCard from "./MarketplaceCard";
import TopicPill from "./TopicPill";
import CommunityFeedCard from "./CommunityFeedCard";

// Detailed interface for collections & listings 
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

interface TopicPillData {
  id: string;
  label: string;
  count: string;
}

interface MarketplacePickData {
  id: string;
  title: string;
  artist: string;
  price: string;
  likes: number;
  image: string;
  badge: string;
}

interface CommunityActivityData {
  id: string;
  username: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  accentColor: string;
}

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playTrack, 
    userProfile, 
    allTracks
  } = useAudio();

  // 10 mock Collections
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

  // Sponsored feeds
  const sponsoredPromos: SponsoredPromo[] = [
    { id: "promo-1", title: "Solar Pulse Reloaded", description: "Collect the exclusive diamond release NFT drop by DJ Krupy.", artwork: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=400&nologo=true", badge: "NFT DROP", ctaText: "Mint Now" },
    { id: "promo-2", title: "TON Producers Summit", description: "Tune in live tomorrow at 18:00 UTC with top music artists.", artwork: "https://image.pollinations.ai/prompt/futuristic%20audio%20synthesizer%20control%20deck%20concert%20neon?width=600&height=400&nologo=true", badge: "LIVE", ctaText: "Join Room" },
    { id: "promo-3", title: "Amapiano Wave 2026", description: "Discover high volume soundscapes straight from Lagos to Miami.", artwork: "https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=600&height=400&nologo=true", badge: "LAUNCH", ctaText: "Listen First" },
    { id: "promo-4", title: "Retro Sound Lab Sponsor", description: "Promoting next-gen digital instruments on TON Blockchain.", artwork: "https://image.pollinations.ai/prompt/retro%20lofi%20cassette%20player%20floating%20in%20purple%20space?width=600&height=400&nologo=true", badge: "SPONSORED", ctaText: "Claim Free Box" }
  ];

  const mockNewDrops = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    const repeated = [...list];
    while (repeated.length < 12) {
      repeated.push(...list.map(t => ({ ...t, id: `${t.id}-${Date.now()}-${Math.random()}` })));
    }
    return repeated.slice(0, 12);
  }, [allTracks]);

  const topTrendingSongs = useMemo(() => {
    return (allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS).slice(0, 5);
  }, [allTracks]);

  const trendingArtists = [
    { id: "art-1", name: "DJ Krupy", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=krupy", followers: "142.5k", verified: true, followed: true },
    { id: "art-2", name: "Byte Beat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=byte", followers: "84.2k", verified: true, followed: false },
    { id: "art-3", name: "Echo Phase", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=echo", followers: "13.9k", verified: false, followed: false },
    { id: "art-4", name: "Luna Ray", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=luna", followers: "92.0k", verified: true, followed: true },
    { id: "art-5", name: "City Ghost", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ghost", followers: "128.1k", verified: true, followed: false },
    { id: "art-10", name: "Cosmic Key", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=key", followers: "1.9k", verified: false, followed: false }
  ];

  const [artistFollowStates, setArtistFollowStates] = useState<Record<string, boolean>>({
    "art-1": true,
    "art-4": true,
  });

  const toggleFollow = (artId: string) => {
    setArtistFollowStates(prev => {
      const next = !prev[artId];
      if (next) {
        confetti({ particleCount: 12, spread: 20 });
      }
      return { ...prev, [artId]: next };
    });
  };

  const liveSpaces = [
    { id: "space-1", title: "Afrobeats Producers Lounge 🌍", host: "Ayra Starr", listeners: "1.4k" },
    { id: "space-2", title: "TON Creators Hub - Minting Future 🚀", host: "DJ Krupy", listeners: "920" },
    { id: "space-3", title: "Music NFT Masterclass v2 💎", host: "Cyber Lord", listeners: "410" }
  ];

  const recommendedTracks = useMemo(() => {
    return (allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS).slice(1, 4);
  }, [allTracks]);

  const recommendedNFTs = [
    { id: "nft-r1", title: "Deep Oceans #04", price: "4.5 TON", owner: "Echo Phase", cover: "https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true" },
    { id: "nft-r2", title: "Solar Drift Signature", price: "12.0 TON", owner: "DJ Krupy", cover: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true" },
  ];

  const marketplacePicks: MarketplacePickData[] = [
    { id: "pick-1", title: "Aura Beat Legendary #02", artist: "Luna Ray", price: "25.0 TON", likes: 340, image: "https://image.pollinations.ai/prompt/glowing%20aesthetic%20crystal%20sound%20waves%20artwork?width=300&height=300&nologo=true", badge: "Trending" },
    { id: "pick-2", title: "Cybernetic Echo Synth", artist: "Dr. Osc", price: "9.0 TON", likes: 112, image: "https://image.pollinations.ai/prompt/cybernetic%20abstract%20holographic%20music%20key?width=300&height=300&nologo=true", badge: "Highest Volume" }
  ];

  const trendingTopics: TopicPillData[] = [
    { id: "t1", label: "#Afrobeats", count: "12k" },
    { id: "t2", label: "#TONMusic", count: "89k" },
    { id: "t3", label: "#HipHop", count: "45k" },
    { id: "t4", label: "#MusicNFT", count: "10k" },
  ];

  const [recentlyMintedNFTs, setRecentlyMintedNFTs] = useState([
    { id: "mint-1", name: "Pulse Beat Core", artist: "DJ Krupy", price: "2.5 TON", cover: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true", minted: false },
    { id: "mint-2", name: "Retro Sunset Drifter", artist: "Retro Vibes", price: "1.8 TON", cover: "https://image.pollinations.ai/prompt/golden%20hour%20sunrise%20retro%20car%20lofi%20beats%20cover?width=300&height=300&nologo=true", minted: false }
  ]);

  const handleMintNFTClick = (id: string) => {
    setRecentlyMintedNFTs(prev => prev.map(n => n.id === id ? { ...n, minted: true } : n));
    confetti({ particleCount: 30, spread: 40 });
  };

  const [activities, setActivities] = useState<CommunityActivityData[]>([
    { id: "act-1", username: "Davido", action: "minted a new NFT", target: "OBO Genesis Edition #01", time: "Just now", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=davido", accentColor: "#2BE08C" },
    { id: "act-2", username: "Ayra Starr", action: "released a track", target: "Bloody Samaritan", time: "3 mins ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=ayra", accentColor: "#5B6BFF" }
  ]);

  const loadMore = () => {
    setActivities(prev => [
      ...prev,
      { id: `act-${Date.now()}`, username: "DJ Nova", action: "started a Space", target: "TON Creators Hub Live", time: "10m ago", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=nova", accentColor: "#FF3A5C" }
    ]);
  };

  const [promoIndex, setPromoIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(p => (p + 1) % sponsoredPromos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 select-none">
      
      {/* SECTION 1: WELCOME HERO */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-1.5 leading-none pt-2">
            Good Evening 👋
          </h1>
          <p className="text-base font-extrabold text-[#9AA0AE]">
            Welcome Back, {userProfile?.username || "Collector"}
          </p>
          <p className="text-xs text-[#9AA0AE]/80">
            Discover new sounds, collect music NFTs and earn rewards.
          </p>
        </div>

        <ContinueListeningCard
          title="Solar Pulse"
          artist="DJ Krupy"
          coverUrl="https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=300&height=300&nologo=true"
          onPlay={() => {
            const track = MOCK_TRACKS.find(t => t.id === "1") || MOCK_TRACKS[0];
            playTrack(track);
          }}
        />
      </div>

      {/* SECTION 12: TRENDING TOPICS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {trendingTopics.map(topic => (
          <TopicPill
            key={topic.id}
            label={topic.label}
            onClick={() => confetti({ particleCount: 5 })}
          />
        ))}
      </div>

      {/* SECTION 9: REWARDS PREVIEW */}
      <RewardPreviewCard
        completedTasks={3}
        totalTasks={5}
        balance={userProfile?.tjBalance || 125430}
        onViewTasks={() => navigate("/tasks")}
      />

      {/* SECTION 3: SPONSORED SLIDER CAROUSEL */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">
          Featured Launches & Updates
        </h2>
        <div className="relative h-[170px] overflow-hidden rounded-2xl bg-[#0A113A]/50">
          <AnimatePresence mode="wait">
            {sponsoredPromos.map((promo, idx) => (
              idx === promoIndex && (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <SponsoredFeedCard
                    title={promo.title}
                    description={promo.description}
                    artwork={promo.artwork}
                    badge={promo.badge}
                    ctaText={promo.ctaText}
                    onClick={() => navigate("/marketplace")}
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>
          <div className="absolute bottom-3 right-5 z-10 flex gap-1">
            {sponsoredPromos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPromoIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all border-none p-0 ${
                  idx === promoIndex ? "bg-[#5B6BFF] w-4" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: TRENDING NFT COLLECTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Trending NFT Collections</h2>
          <button onClick={() => navigate("/marketplace")} className="text-xs font-bold text-[#5B6BFF] border-none bg-transparent">
            All <ChevronRight className="w-3.5 h-3.5 inline" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {mockCollections.map(col => (
            <NFTCollectionCard
              key={col.id}
              name={col.name}
              artist={col.artist}
              coverUrl={col.coverUrl}
              floorPrice={col.floorPrice}
              mintedCount={col.mintedCount}
              totalLimit={col.totalLimit}
              onMint={() => confetti({ particleCount: 20 })}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4: NEW DROPS */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">New Drops</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {mockNewDrops.map(track => (
            <div
              key={track.id}
              className="w-[145px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3.5 flex flex-col justify-between space-y-3"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#050A24]">
                <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
                <p className="text-[10px] text-[#9AA0AE] truncate">{track.artist}</p>
              </div>
              <Button
                size="sm"
                onClick={() => playTrack(track)}
                className="w-full h-7 text-[8px] font-black uppercase tracking-widest bg-white/5 text-[#9AA0AE] border-none"
              >
                Play
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: TOP TRENDING SONGS */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Top Trending Songs</h2>
        <div className="rounded-2xl bg-[#0A113A]/50 p-2 space-y-1.5">
          {topTrendingSongs.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#101A3B]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-5 font-mono font-black text-base text-[#00B4D8]">#{idx + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
                  <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">{track.title}</h4>
                  <p className="text-[10px] text-[#9AA0AE] truncate">{track.artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-[#2BE08C]" />
                <span className="text-[10px] font-mono text-[#9AA0AE]">{(45 - idx * 5)}k plays</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: TRENDING ARTISTS */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Trending Artists</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {trendingArtists.map(art => {
            const hasFollowed = artistFollowStates[art.id] || false;
            return (
              <div
                key={art.id}
                className="w-[125px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3.5 flex flex-col items-center justify-between space-y-3 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#050A24] flex items-center justify-center overflow-hidden">
                  <img src={art.avatar} alt="" className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white truncate max-w-[90px]">{art.name}</h4>
                  <span className="text-[9px] text-[#9AA0AE]">{art.followers} fans</span>
                </div>
                <button
                  onClick={() => toggleFollow(art.id)}
                  className={`w-full h-6 text-[8px] font-black uppercase tracking-widest rounded-md border-none ${
                    hasFollowed ? "bg-white/5 text-[#9AA0AE]" : "bg-[#5B6BFF] text-white"
                  }`}
                >
                  {hasFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: LIVE SPACES */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Live Spaces</h2>
        <div className="space-y-2.5">
          {liveSpaces.map(space => (
            <LiveSpaceCard
              key={space.id}
              title={space.title}
              host={space.host}
              listeners={space.listeners}
              onJoin={() => confetti({ particleCount: 30 })}
            />
          ))}
        </div>
      </div>

      {/* SECTION 8: RECOMMENDED FOR YOU */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Recommended For You</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {recommendedTracks.map(track => (
            <div
              key={track.id}
              className="w-[145px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3 flex flex-col justify-between space-y-2.5"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                <span className="absolute top-1.5 left-1.5 text-[8px] font-black bg-[#5B6BFF] px-2 py-0.5 rounded-sm">Track</span>
              </div>
              <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
              <Button
                size="sm"
                onClick={() => playTrack(track)}
                className="w-full h-6 text-[8.5px] font-black bg-white/5 border-none text-[#9AA0AE] hover:text-white"
              >
                Listen
              </Button>
            </div>
          ))}
          {recommendedNFTs.map(nft => (
            <div
              key={nft.id}
              className="w-[145px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3 flex flex-col justify-between space-y-2.5"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={nft.cover} className="w-full h-full object-cover" alt="" />
                <span className="absolute top-1.5 left-1.5 text-[8px] font-black bg-[#00B4D8] text-[#050A24] px-2 py-0.5 rounded-sm">NFT</span>
              </div>
              <h4 className="text-xs font-black text-white truncate">{nft.title}</h4>
              <Button
                size="sm"
                onClick={() => confetti({ particleCount: 15 })}
                className="w-full h-6 text-[8.5px] font-black bg-white/5 border-none text-[#00B4D8] hover:text-white"
              >
                Bid
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 10: TOP MARKETPLACE PICKS */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Top Marketplace Picks</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {marketplacePicks.map(pick => (
            <MarketplaceCard
              key={pick.id}
              title={pick.title}
              artist={pick.artist}
              price={pick.price}
              badge={pick.badge}
              image={pick.image}
              onBid={() => confetti({ particleCount: 15 })}
            />
          ))}
        </div>
      </div>

      {/* SECTION 11: FAVORITE ARTISTS */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-[#9AA0AE]">Favorite Artists Updates</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {trendingArtists.filter(a => artistFollowStates[a.id]).map(art => (
            <div
              key={art.id}
              className="w-[100px] shrink-0 flex flex-col items-center p-2 rounded-2xl bg-[#0A113A]/30"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={art.avatar} alt="" className="w-full h-full" />
              </div>
              <h4 className="text-[11px] font-bold mt-1 text-white truncate max-w-[80px]">{art.name}</h4>
              <span className="text-[8px] text-[#2BE08C]">Just Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 13: RECENTLY MINTED MUSIC NFTs */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Recently Minted NFTs</h2>
        <div className="grid grid-cols-2 gap-3.5">
          {recentlyMintedNFTs.map(nft => (
            <div
              key={nft.id}
              className="bg-[#0A113A]/50 p-3 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={nft.cover} className="w-full h-full object-cover" alt="" />
                <span className="absolute bottom-2 left-2 text-[8px] font-black bg-black/60 px-2 py-0.5 rounded-sm">
                  {nft.price}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-white truncate">{nft.name}</h4>
                <p className="text-[10px] text-[#9AA0AE] truncate">{nft.artist}</p>
              </div>
              {nft.minted ? (
                <Button disabled className="w-full h-7 text-[8px] bg-emerald-500/10 text-emerald-400 border-none">
                  ✓ Minted
                </Button>
              ) : (
                <Button
                  onClick={() => handleMintNFTClick(nft.id)}
                  className="w-full h-7 text-[8px] bg-[#5B6BFF] hover:bg-[#4856ea] text-white border-none"
                >
                  Mint NFT
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 14: COMMUNITY ACTIVITY FEED */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-white">Community Activity</h2>
        <div className="rounded-2xl bg-[#0A113A]/50 p-4 space-y-3.5">
          {activities.map(act => (
            <CommunityFeedCard
              key={act.id}
              username={act.username}
              action={act.action}
              target={act.target}
              time={act.time}
              avatar={act.avatar}
              accentColor={act.accentColor}
            />
          ))}
          <Button
            size="sm"
            onClick={loadMore}
            className="w-full h-8 text-[9px] bg-white/[0.02] text-[#9AA0AE] border-none"
          >
            Load Older Stream Activities
          </Button>
        </div>
      </div>

    </div>
  );
};

export default HomeScreen;
export {
  ContinueListeningCard,
  NFTCollectionCard,
  SponsoredFeedCard,
  LiveSpaceCard,
  RewardPreviewCard,
  MarketplaceCard,
  TopicPill,
  CommunityFeedCard
};
