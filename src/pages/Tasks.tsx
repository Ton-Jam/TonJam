import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Gift, 
  Crown, 
  Play, 
  Users, 
  Music, 
  Wallet, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Copy, 
  Share2, 
  Award, 
  Zap, 
  Lock, 
  ShoppingBag, 
  ArrowUpRight, 
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/context/AudioContext";
import { TJ_COIN_ICON } from "@/constants";

// TYPES & INTERFACES FOR REWARDS SCREEN
interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  category: "All" | "Daily" | "Streaming" | "NFT" | "Social" | "Referral" | "Premium";
  progress: number;
  total: number;
  state: "active" | "claimable" | "completed" | "locked" | "premium";
  rewardValue: number;
  iconName: "music" | "play" | "users" | "share" | "message" | "zap" | "wallet" | "gift" | "flame" | "crown";
}

interface LeaderboardUser {
  rank: number;
  username: string;
  avatarSeed: string;
  tjEarned: number;
  tier: "Legendary" | "Elite" | "Pro" | "Rising Star";
  isActive: boolean;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  badge: string;
  color: string;
}

interface ActivityEvent {
  id: string;
  message: string;
  amount: string;
  time: string;
}

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    claimTaskReward,
    updateTaskProgress,
    completeTask,
    userProfile,
    transactions,
    firestoreUsers,
  } = useAudio();

  // 1. DYNAMIC TJ BALANCE TICKER STATE
  const realBalance = userProfile?.tjBalance || 125430;
  const [balance, setBalance] = useState(realBalance - 1500 > 0 ? realBalance - 1500 : 0);

  useEffect(() => {
    const end = realBalance;
    const start = balance;
    if (start === end) return;

    const duration = 1000; // ms
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setBalance(end);
        clearInterval(timer);
      } else {
        setBalance(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [realBalance]);

  // 2. MISSION CATEGORIES & STATE MANAGEMENT
  const categories = ["All", "Daily", "Streaming", "NFT", "Social", "Referral", "Premium"] as const;
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>("All");

  // Initial Seed for the requested 11 missions
  const [missions, setMissions] = useState<Mission[]>(() => {
    const localStorageKey = "tonjam_interactive_missions_v1";
    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }

    return [
      {
        id: "m1",
        title: "Stream 5 Tracks",
        description: "Explore the audio catalogue and listen to dynamic songs",
        reward: "+50 TJ",
        category: "Streaming",
        progress: 3,
        total: 5,
        state: "active",
        rewardValue: 50,
        iconName: "music",
      },
      {
        id: "m2",
        title: "Stream 30 Minutes",
        description: "Engage in synchronized playback with high fidelity",
        reward: "+150 TJ",
        category: "Streaming",
        progress: 30,
        total: 30,
        state: "claimable",
        rewardValue: 150,
        iconName: "play",
      },
      {
        id: "m3",
        title: "Follow 3 Artists",
        description: "Support creators by following their release streams",
        reward: "+75 TJ",
        category: "Social",
        progress: 1,
        total: 3,
        state: "active",
        rewardValue: 75,
        iconName: "users",
      },
      {
        id: "m4",
        title: "Share a Track",
        description: "Broadcast your favorite rhythm to active channels",
        reward: "+50 TJ",
        category: "Social",
        progress: 1,
        total: 1,
        state: "completed",
        rewardValue: 50,
        iconName: "share",
      },
      {
        id: "m5",
        title: "Join a Space",
        description: "Interact inside decentralized voice streaming rooms",
        reward: "+100 TJ",
        category: "Streaming",
        progress: 0,
        total: 1,
        state: "active",
        rewardValue: 100,
        iconName: "message",
      },
      {
        id: "m6",
        title: "Mint Your First NFT",
        description: "Deploy unique metadata tracking ownership onto the chain",
        reward: "+500 TJ",
        category: "NFT",
        progress: 0,
        total: 1,
        state: "active",
        rewardValue: 500,
        iconName: "zap",
      },
      {
        id: "m7",
        title: "Buy an NFT",
        description: "Participate in secondary auctions using TON or TJ",
        reward: "+300 TJ",
        category: "NFT",
        progress: 0,
        total: 1,
        state: "locked",
        rewardValue: 300,
        iconName: "wallet",
      },
      {
        id: "m8",
        title: "Invite a Friend",
        description: "Grow the ecosystem together to share bonus pools",
        reward: "+1000 TJ",
        category: "Referral",
        progress: 0,
        total: 10,
        state: "active",
        rewardValue: 1000,
        iconName: "gift",
      },
      {
        id: "m9",
        title: "7 Day Login Streak",
        description: "Keep the momentum of daily sound alignment going",
        reward: "+500 TJ",
        category: "Daily",
        progress: 7,
        total: 7,
        state: "claimable",
        rewardValue: 500,
        iconName: "flame",
      },
      {
        id: "m10",
        title: "Hold NFT For 7 Days",
        description: "Commit digital collectibles securely inside your vault",
        reward: "+750 TJ",
        category: "Premium",
        progress: 0,
        total: 7,
        state: "premium",
        rewardValue: 750,
        iconName: "crown",
      },
      {
        id: "m11",
        title: "Listen For 60 Minutes",
        description: "Let the playlists curate your background atmosphere",
        reward: "+200 TJ",
        category: "Streaming",
        progress: 15,
        total: 60,
        state: "active",
        rewardValue: 200,
        iconName: "play",
      },
    ];
  });

  // Save changes locally
  useEffect(() => {
    localStorage.setItem("tonjam_interactive_missions_v1", JSON.stringify(missions));
  }, [missions]);

  // CATEGORY FILTERED VIEW
  const filteredMissions = useMemo(() => {
    if (activeCategory === "All") return missions;
    return missions.filter((m) => m.category === activeCategory);
  }, [missions, activeCategory]);

  // FEATURED MISSION (From Section 4)
  const featuredMission = useMemo(() => {
    return missions.find((m) => m.id === "m6") || missions[0];
  }, [missions]);

  // QUICK STATS COUNTERS (From Section 3)
  const totalTJEarned = useMemo(() => missions.filter(m => m.state === "completed").reduce((sum, m) => sum + m.rewardValue, 0) + 125430, [missions]);
  const tasksCompletedCount = useMemo(() => missions.filter(m => m.state === "completed").length, [missions]);

  // REFERRAL CODE SYSTEM (From Section 7)
  const referralCode = "TONJAM-KRUPY-Z99";
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // LEADERBOARD USERS (From Section 8)
  const leaderboardUsers: LeaderboardUser[] = [
    { rank: 1, username: "tonwave.tg", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=wave", tjEarned: 450200, tier: "Legendary", isActive: true },
    { rank: 2, username: "djnova_ton", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=nova", tjEarned: 382900, tier: "Legendary", isActive: true },
    { rank: 3, username: "krupyvibes", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=krupy", tjEarned: 294400, tier: "Elite", isActive: false },
    { rank: 4, username: "stream_lord", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=lord", tjEarned: 184500, tier: "Elite", isActive: true },
    { rank: 5, username: "mint_master", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=mint", tjEarned: 173200, tier: "Pro", isActive: true },
    { rank: 6, username: "nft_flipper_x", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=flipper", tjEarned: 142800, tier: "Pro", isActive: false },
    { rank: 7, username: "sol_migrator", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=sol", tjEarned: 128100, tier: "Pro", isActive: false },
    { rank: 8, username: "music_junky", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=junky", tjEarned: 115400, tier: "Rising Star", isActive: true },
    { rank: 9, username: "user_9281", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=9281", tjEarned: 102000, tier: "Rising Star", isActive: false },
    { rank: 10, username: "sound_expert", avatarSeed: "https://api.dicebear.com/7.x/bottts/svg?seed=sound", tjEarned: 94800, tier: "Rising Star", isActive: true },
  ];

  // REWARD SHOP ITEMS (From Section 9)
  const rewardShopItems: RewardItem[] = [
    { id: "s1", title: "Elite Gold Badge", description: "Display a glistening gold frame around your user avatar in stream chats.", price: 5000, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150", badge: "Rare Badge", color: "from-amber-400 to-yellow-600" },
    { id: "s2", title: "1 Month Premium Pass", description: "Unlock uncompressed high-bitrate streaming audio and exclusive NFTs.", price: 10000, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=150", badge: "Pass", color: "from-blue-600 to-indigo-700" },
    { id: "s3", title: "15% NFT Discount", description: "Save 15% on any purchase in the secondary digital collectible arena.", price: 2500, image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=150", badge: "Coupon", color: "from-teal-500 to-emerald-600" },
    { id: "s4", title: "Artist Feed Boost x2", description: "Double exposure and play algorithms for your uploaded track signals.", price: 4000, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=150", badge: "Boost", color: "from-violet-500 to-fuchsia-600" },
  ];

  // LOG ACTIVITY EVENTS (From Section 10)
  const [activities, setActivities] = useState<ActivityEvent[]>([
    { id: "a1", message: "You completed Stream 5 Tracks", amount: "+50 TJ", time: "Just now" },
    { id: "a4", message: "You completed 7 Day Login Streak", amount: "+500 TJ", time: "1 hour ago" },
    { id: "a2", message: "You earned referral payout", amount: "+1000 TJ", time: "2 hours ago" },
    { id: "a3", message: "You completed Share a Track", amount: "+50 TJ", time: "5 hours ago" },
  ]);

  // MISSION ACTIONS & INTERACTION TRIGGERS
  const handleMissionClick = (mission: Mission) => {
    // Navigate or increment progress dynamically to satisfy the "gamified and addictive" gameplay
    if (mission.state === "completed" || mission.state === "claimable") return;

    if (mission.category === "Streaming") {
      navigate("/");
    } else if (mission.category === "Social") {
      navigate("/social");
    } else if (mission.category === "NFT") {
      navigate("/marketplace");
    } else {
      // Simulate incrementing task progress dynamically inside the UI!
      const nextProgress = Math.min(mission.total, mission.progress + 1);
      const isNowCompleted = nextProgress >= mission.total;
      
      setMissions((prev) =>
        prev.map((m) =>
          m.id === mission.id
            ? {
                ...m,
                progress: nextProgress,
                state: isNowCompleted ? "claimable" : m.state,
              }
            : m
        )
      );

      // Trigger a beautiful notification
      const newEvent: ActivityEvent = {
        id: `activity-${Date.now()}`,
        message: `Progress updated for "${mission.title}"`,
        amount: `${nextProgress}/${mission.total}`,
        time: "Just now"
      };
      setActivities((p) => [newEvent, ...p]);
    }
  };

  const handleClaimReward = (mission: Mission, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mission.state !== "claimable") return;

    // Trigger visual confetti explosion!
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.7 },
      colors: ["#5B6BFF", "#00B4D8", "#2BE08C", "#F5D547"]
    });

    // Update state to completed
    setMissions((p) =>
      p.map((m) =>
        m.id === mission.id
          ? {
              ...m,
              state: "completed" as const,
              progress: m.total,
            }
          : m
      )
    );

    // Dynamic balance tick addition
    const rewardRewardValue = mission.rewardValue;
    setBalance((curr) => curr + rewardRewardValue);

    // Add activity logger event
    const newEvent: ActivityEvent = {
      id: `a-${Date.now()}`,
      message: `You completed ${mission.title}`,
      amount: `${mission.reward}`,
      time: "Just now",
    };
    setActivities((prev) => [newEvent, ...prev]);

    // Perform actual real Firebase update if this matches an active DB ID
    const matchedDbTask = tasks.find(t => t.title.toLowerCase() === mission.title.toLowerCase() || t.id === mission.id);
    if (matchedDbTask) {
      claimTaskReward(matchedDbTask.id);
    }
  };

  // REDEEM ITEM FROM SHOP
  const handleRedeem = (item: RewardItem) => {
    if (balance < item.price) {
      confetti({
        particleCount: 20,
        spread: 30,
        colors: ["#FF3A5C"]
      });
      return;
    }

    setBalance((curr) => curr - item.price);
    
    // Create new custom activity event
    const newEvent: ActivityEvent = {
      id: `redeem-${Date.now()}`,
      message: `Redeemed: ${item.title}`,
      amount: `-${item.price} TJ`,
      time: "Just now"
    };
    setActivities((prev) => [newEvent, ...prev]);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#2BE08C", "#5B6BFF"]
    });
  };

  // CATEGORY ICON RENDERER
  const getMissionIcon = (iconName: Mission["iconName"]) => {
    switch (iconName) {
      case "music":
        return <Music className="w-4 h-4 text-[#5B6BFF]" />;
      case "play":
        return <Play className="w-4 h-4 fill-[#00B4D8]/20 text-[#00B4D8]" />;
      case "users":
        return <Users className="w-4 h-4 text-[#F5D547]" />;
      case "share":
        return <Share2 className="w-4 h-4 text-[#2BE08C]" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-[#FF3A5C]" />;
      case "zap":
        return <Zap className="w-4 h-4 text-[#5B6BFF] fill-[#5B6BFF]/20" />;
      case "wallet":
        return <Wallet className="w-4 h-4 text-[#00B4D8]" />;
      case "gift":
        return <Gift className="w-4 h-4 text-[#FF3A5C]" />;
      case "flame":
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />;
      case "crown":
        return <Crown className="w-4 h-4 text-[#F5D547] fill-[#F5D547]/20" />;
      default:
        return <Award className="w-4 h-4 text-[#5B6BFF]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A113A] text-white pb-32 overflow-x-hidden selection:bg-[#5B6BFF]/30">
      
      {/* BACKGROUND DECORATIVE GLOWS (Framed inside clean dark theme, no border lines) */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#5B6BFF]/10 to-transparent blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-150px] w-[350px] h-[350px] bg-[#00B4D8]/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">

        {/* SECTION 1: EARN TJ HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 pt-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-[#9AA0AE] bg-clip-text text-transparent font-sans">
              Earn TJ
            </h1>
            <p className="text-xs text-[#9AA0AE] font-medium">
              Complete missions and earn rewards.
            </p>
          </div>

          {/* Animated Balance Counter Widget */}
          <div className="relative inline-flex items-center justify-center py-5 px-8 rounded-2xl bg-[#0A113A]/50 backdrop-blur-xl border-none">
            <div className="absolute inset-0 bg-gradient-to-r from-[#5B6BFF]/10 to-[#00B4D8]/10 rounded-2xl blur-[1px]" />
            <div className="relative flex items-center gap-3">
              <motion.img 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                src={TJ_COIN_ICON} 
                className="w-8 h-8 object-contain" 
                alt="TJ Coin"
              />
              <span className="text-3xl font-black tracking-tight text-white font-mono">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#2BE08C] self-end mb-1 bg-[#2BE08C]/10 px-2 py-0.5 rounded-full z-10">
                TJ
              </span>
            </div>
          </div>
        </motion.div>


        {/* SECTION 2: DAILY STREAK CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-[#0A113A]/60 backdrop-blur-lg p-5 border-none"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5B6BFF]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B6BFF]/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#5B6BFF] fill-[#5B6BFF]/20" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">
                  Streak Multiplier
                </span>
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                  Current Streak: <span className="text-[#00B4D8] font-extrabold">7 Days</span>
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-black text-[#2BE08C] bg-[#2BE08C]/10 px-2.5 py-1 rounded-full">
                7 / 30
              </span>
            </div>
          </div>

          {/* Quick Mon-Sun Nodes */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
              const isActive = i < 6; 
              const isToday = i === 6; 
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                    isActive 
                      ? "bg-[#5B6BFF] text-white shadow-md shadow-[#5B6BFF]/20" 
                      : isToday 
                        ? "bg-[#5B6BFF]/20 border border-[#5B6BFF]/40 text-[#5B6BFF] font-bold" 
                        : "bg-[#050A24] text-[#9AA0AE]/40"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>


        {/* SECTION 3: QUICK STATS ROW */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Total TJ Earned", val: totalTJEarned.toLocaleString(), icon: Trophy, color: "#F5D547", bg: "rgba(245,213,71,0.06)" },
            { title: "Tasks Completed", val: `${tasksCompletedCount} / ${missions.length}`, icon: CheckCircle2, color: "#2BE08C", bg: "rgba(43,224,140,0.06)" },
            { title: "Active Referrals", val: "12 Users", icon: Users, color: "#00B4D8", bg: "rgba(0,180,216,0.06)" },
            { title: "NFT Rewards", val: "3 Claimed", icon: Wallet, color: "#5B6BFF", bg: "rgba(91,107,255,0.06)" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="bg-[#0A113A]/60 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between space-y-2 relative overflow-hidden text-left border-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#9AA0AE]">
                    {item.title}
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  {item.val}
                </span>
              </motion.div>
            );
          })}
        </div>


        {/* SECTION 4: FEATURED MISSION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleMissionClick(featuredMission)}
          className={`relative rounded-xl p-4 overflow-hidden transition-all duration-300 border-none cursor-pointer group ${
            featuredMission.state === "completed" 
              ? "bg-[#0A113A]/40 opacity-70" 
              : "bg-gradient-to-br from-[#121B3A] via-[#0E1535] to-[#0A0F2E]"
          }`}
        >
          {/* Holographic Glowing Orbs */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-[#5B6BFF]/15 to-[#00B4D8]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Left Side: Compact Icon badge with pulse glow */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B6BFF]/20 to-[#00B4D8]/20 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/50">
                <Zap className="w-5 h-5 text-[#00B4D8] animate-pulse" />
              </div>

              {/* Title & Desc Column */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-0.5 rounded-md">
                    Featured Mission
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#9AA0AE]">
                    {featuredMission.progress}/{featuredMission.total} Complete
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  {featuredMission.title}
                </h2>
                <p className="text-[11px] text-[#9AA0AE] leading-normal max-w-sm">
                  {featuredMission.description}
                </p>
              </div>
            </div>

            {/* Right Side: Reward & Action CTA aligned perfectly */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-3 shrink-0">
              {/* Reward Tag */}
              <div className="flex items-center gap-1 bg-[#5B6BFF]/10 text-white font-black text-[10px] px-2.5 py-1 rounded-lg">
                <img src={TJ_COIN_ICON} alt="TJ" className="w-3.5 h-3.5 object-contain" />
                <span>+500 TJ</span>
              </div>

              {/* CTA Button */}
              <div>
                {featuredMission.state === "completed" ? (
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#2BE08C] bg-[#2BE08C]/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </div>
                ) : featuredMission.state === "claimable" ? (
                  <Button
                    size="sm"
                    onClick={(e) => handleClaimReward(featuredMission, e)}
                    className="h-8 bg-[#2BE08C] hover:bg-[#20c87b] text-[#050A24] font-black text-[9px] uppercase tracking-widest px-4 rounded-lg shadow-lg cursor-pointer transition-all duration-200 active:scale-95 border-none"
                  >
                    Claim TJ
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border border-[#5B6BFF]/30 text-white hover:bg-[#5B6BFF]/10 font-black text-[9px] uppercase tracking-widest px-4 rounded-lg cursor-pointer flex items-center gap-1 transition-all duration-200 active:scale-95"
                  >
                    Mint <ArrowUpRight className="w-3 h-3 text-[#00B4D8]" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Thin Progress bar at the bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/45">
            <div 
              className="h-full bg-gradient-to-r from-[#5B6BFF] to-[#00B4D8]"
              style={{ width: `${(featuredMission.progress / featuredMission.total) * 100}%` }}
            />
          </div>
        </motion.div>


        {/* SECTION 5: MISSION CATEGORIES pills */}
        <div className="py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="relative p-0 cursor-pointer outline-none shrink-0"
                >
                  {/* Glowing custom button backgrounds */}
                  <span className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 inline-block text-center ${
                    isActive 
                      ? "bg-[#5B6BFF] text-white shadow-md shadow-[#5B6BFF]/25" 
                      : "bg-[#0A113A]/50 hover:bg-[#0A113A] text-[#9AA0AE]"
                  }`}>
                    {cat}
                  </span>
                  
                  {isActive && (
                    <motion.span 
                      layoutId="activeFilterUnderline"
                      className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00B4D8] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>


        {/* SECTION 6: MISSION LIST (COMPACT CARDS ONLY, 80px - 100px targeting) */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">
              {activeCategory} Missions ({filteredMissions.length})
            </span>
            <span className="text-[9px] text-[#9AA0AE]/60">Tap cards to increase progress</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredMissions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center bg-[#0A113A]/30 rounded-2xl"
                >
                  <AlertCircle className="w-8 h-8 text-[#9AA0AE]/50 mx-auto mb-2" />
                  <p className="text-xs text-[#9AA0AE]">No active missions found in this category.</p>
                </motion.div>
              ) : (
                filteredMissions.map((m) => {
                  const isCompleted = m.state === "completed";
                  const isClaimable = m.state === "claimable";
                  const isLocked = m.state === "locked";
                  const isPremium = m.state === "premium";

                  return (
                    <motion.div
                      layout
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleMissionClick(m)}
                      className={`h-[94px] rounded-2xl bg-[#0A113A]/55 hover:bg-[#101A3B]/80 transition-colors p-3.5 flex items-center justify-between gap-3 relative overflow-hidden select-none cursor-pointer border-none ${
                        isCompleted ? "opacity-60 bg-[#0A113A]/30" : ""
                      }`}
                    >
                      {/* Left Side: Glowing Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#101A3B] shrink-0 border-none relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent" />
                        {getMissionIcon(m.iconName)}
                      </div>

                      {/* Middle Column: Info & Slim Progress Bar */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[13px] font-bold text-white tracking-tight truncate leading-none">
                              {m.title}
                            </h4>
                            {isPremium && (
                              <span className="text-[7.5px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-1.5 rounded-full border-none">
                                PREM
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#9AA0AE] leading-none truncate opacity-85">
                            {m.description}
                          </p>
                        </div>

                        {/* Infinite tiny slim interactive utility bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[8px] text-[#9AA0AE]/60 font-bold uppercase tracking-wider leading-none">
                            <span>Alignment Status</span>
                            <span>{m.progress}/{m.total}</span>
                          </div>
                          <div className="w-full h-[3.5px] bg-[#050A24] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#5B6BFF] to-[#00B4D8] rounded-full"
                              style={{ width: `${(m.progress / m.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Reward Pill & CTA Button */}
                      <div className="shrink-0 flex flex-col items-end justify-between h-full py-0.5 pl-1.5">
                        {/* Always display points reward badge */}
                        <div className="flex items-center gap-1 text-[11px] font-black text-white bg-[#5B6BFF]/10 px-2.5 py-1 rounded-full">
                          <img src={TJ_COIN_ICON} alt="" className="w-3.5 h-3.5 object-contain" />
                          <span>{m.reward}</span>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#2BE08C] bg-[#2BE08C]/10 px-2 py-1 rounded-md flex items-center gap-0.5 leading-none">
                              ✓ Completed
                            </span>
                          ) : isClaimable ? (
                            <Button
                              size="sm"
                              onClick={(e) => handleClaimReward(m, e)}
                              className="h-6 text-[8px] font-black uppercase tracking-widest px-3 bg-[#2BE08C] hover:bg-[#1fd47e] text-[#050A24] rounded-md transition-all active:scale-95 cursor-pointer leading-none"
                            >
                              Claim TJ
                            </Button>
                          ) : isLocked ? (
                            <span className="text-[9.5px] font-medium text-[#9AA0AE]/50 flex items-center gap-1 leading-none py-1">
                              <Lock className="w-3 h-3 text-[#9AA0AE]/35" /> Locked
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-white/[0.04] text-[#9AA0AE] px-2 py-1 rounded-md leading-none">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>


        {/* SECTION 7: REFERRAL PROGRAM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-[#0A113A]/60 backdrop-blur-md p-5 border-none relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3A5C]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest bg-[#FF3A5C]/10 text-[#FF3A5C] px-3 py-1 rounded-full">
                👥 Share & Earn
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-2.5">
                Invite Friends
              </h3>
              <p className="text-xs text-[#9AA0AE] mt-0.5">
                Earn <span className="text-white font-black">+1,000 TJ</span> per active joining player.
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#FF3A5C]/10 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-[#FF3A5C]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-[#101A3B]/80 p-2.5 rounded-xl">
            <div className="flex-1 font-mono text-center font-bold text-sm text-[#00B4D8] tracking-widest">
              {referralCode}
            </div>
            
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-[#5B6BFF] hover:bg-[#4856ea] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none"
            >
              {copied ? (
                <>Copied! ✨</>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                const text = `Join TonJam and earn TJ rewards together! My referral code is ${referralCode}`;
                window.open(`https://t.me/share/url?url=https://tonjam.io&text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#9AA0AE] hover:text-white transition-all active:scale-95 cursor-pointer border-none"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-white/[0.03]">
            <div>
              <p className="text-[9px] text-[#9AA0AE] uppercase font-bold tracking-wider mb-0.5">Invited</p>
              <p className="text-base font-bold text-white">12 Friends</p>
            </div>
            <div>
              <p className="text-[9px] text-[#9AA0AE] uppercase font-bold tracking-wider mb-0.5">Pending</p>
              <p className="text-base font-bold text-[#F5D547]">3 Users</p>
            </div>
            <div>
              <p className="text-[9px] text-[#9AA0AE] uppercase font-bold tracking-wider mb-0.5">TJ Earned</p>
              <p className="text-base font-extrabold text-[#2BE08C]">+12.0k</p>
            </div>
          </div>
        </motion.div>


        {/* SECTION 8: LEADERBOARD SCREEN */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 px-1 justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-[#F5D547]" />
              <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">
                Top Earners Activity
              </span>
            </div>
            <span className="text-[9px] text-[#9AA0AE]/60 font-medium">Recomputed Hourly</span>
          </div>

          <div className="rounded-2xl bg-[#0A113A]/50 backdrop-blur-md overflow-hidden border-none p-1 shrink-0 space-y-1">
            {leaderboardUsers.map((user, idx) => {
              const isGold = user.rank === 1;
              const isSilver = user.rank === 2;
              const isBronze = user.rank === 3;

              return (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                    idx % 2 === 0 ? "bg-[#0A113A]/30" : "bg-[#101A3B]/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge Indicator */}
                    <div className="w-6 shrink-0 text-center font-mono font-black">
                      {isGold ? (
                        <Crown className="w-4.5 h-4.5 text-[#F5D547] fill-[#F5D547]/20 mx-auto" />
                      ) : isSilver ? (
                        <Award className="w-4.5 h-4.5 text-[#9AA0AE] mx-auto" />
                      ) : isBronze ? (
                        <Award className="w-4.5 h-4.5 text-orange-500 mx-auto" />
                      ) : (
                        <span className="text-xs text-[#9AA0AE]/60">#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar with live pulse indicator if active */}
                    <div className="relative w-8 h-8 rounded-lg bg-[#050A24] flex items-center justify-center shrink-0">
                      <img src={user.avatarSeed} alt="" className="w-7 h-7 object-contain rounded-full" />
                      {user.isActive && (
                        <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 bg-[#2BE08C] rounded-full border border-[#050A24] animate-pulse" />
                      )}
                    </div>

                    {/* Username & Tier */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-none">
                        {user.username}
                      </p>
                      <span className="text-[8.5px] uppercase tracking-widest text-[#9AA0AE]/70 font-bold block mt-0.5">
                        {user.tier}
                      </span>
                    </div>
                  </div>

                  {/* TJ Balance Earned */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" />
                    <span className="text-[#5B6BFF] font-black text-sm font-mono">
                      {user.tjEarned.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* SECTION 9: REWARD SHOP PREVIEW */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-[#00B4D8]" />
              <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">
                Redeem TJ Rewards
              </span>
            </div>
            <span className="text-[9px] text-[#2BE08C] font-semibold flex items-center gap-1">
              Shop Open <span className="inline-block w-1.5 h-1.5 bg-[#2BE08C] rounded-full" />
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {rewardShopItems.map((item) => {
              const affordable = balance >= item.price;
              
              return (
                <div
                  key={item.id}
                  className="w-[200px] shrink-0 rounded-2xl bg-[#0A113A]/60 backdrop-blur-md overflow-hidden p-4 flex flex-col justify-between space-y-4 text-left border-none"
                >
                  <div className="space-y-2.5">
                    {/* Item Image with Badge */}
                    <div className="relative w-full h-[100px] rounded-xl overflow-hidden bg-[#050A24]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-sm">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white leading-tight tracking-tight h-[32px] overflow-hidden line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[#9AA0AE] leading-normal h-[36px] overflow-hidden line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[#9AA0AE]">Cost</span>
                      <div className="flex items-center gap-1">
                        <img src={TJ_COIN_ICON} alt="" className="w-3.5 h-3.5 object-contain" />
                        <span className="text-xs font-black text-white font-mono">{item.price}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRedeem(item)}
                      disabled={!affordable}
                      className={`w-full h-7 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all border-none ${
                        affordable 
                          ? "bg-[#5B6BFF] hover:bg-[#4856ea] text-white active:scale-95" 
                          : "bg-white/[0.02] text-[#9AA0AE]/30"
                      }`}
                    >
                      {affordable ? "Redeem" : "Insufficient TJ"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* SECTION 10: RECENT REWARDS ACTIVITY */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#9AA0AE]">
              Your Recent Rewards Logs
            </span>
          </div>

          <div className="rounded-2xl bg-[#0A113A]/40 backdrop-blur-md p-4 space-y-3 border-none flex flex-col justify-start">
            <AnimatePresence initial={false}>
              {activities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.03] last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#2BE08C] rounded-full shrink-0" />
                    <div>
                      <p className="text-xs text-white font-medium">{act.message}</p>
                      <span className="text-[9px] text-[#9AA0AE]/60 block">{act.time}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-[#2BE08C] font-mono shrink-0 pl-3">
                    {act.amount}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>


        {/* FOOTER & LOGOUT DESIGN CREDIT */}
        <div className="pt-4 text-center space-y-1 pb-10">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#9AA0AE]/50 font-black">
            Powered by TonJam Rewards Protocol v1.0
          </p>
          <div className="flex items-center justify-center gap-1.5 text-white/40 text-[8px] font-bold uppercase tracking-widest">
            <Music className="w-3.5 h-3.5 text-[#5B6BFF] animate-pulse" />
            <span>TON BLOCKCHAIN ORACLE INTEGRATION ACTIVE</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tasks;
