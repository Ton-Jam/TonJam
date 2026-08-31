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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeIn, slideUp, staggerChildren } from "@/motion";
import { useAudio } from "@/contexts/AudioContext";
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
    <motion.div 
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="min-h-screen bg-background text-text-primary pb-32 overflow-x-hidden selection:bg-primary/30"
    >
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/10 to-transparent blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-150px] w-[350px] h-[350px] bg-verified/5 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-full px-4 sm:px-6 md:px-8 pt-6 space-y-6">

        {/* SECTION 1: EARN TJ HEADER */}
        <motion.div 
          variants={slideUp}
          className="text-center space-y-3 pt-4"
        >
          <div className="space-y-1">
            <h1 className="text-page-title text-text-primary">
              Earn TJ
            </h1>
            <p className="text-caption">
              Complete missions and earn rewards.
            </p>
          </div>

          {/* Animated Balance Counter Widget */}
          <div className="relative inline-flex items-center justify-center py-5 px-8 rounded-card bg-surface">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-verified/10 rounded-card blur-[1px]" />
            <div className="relative flex items-center gap-3">
              <motion.img 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                src={TJ_COIN_ICON} 
                className="w-8 h-8 object-contain" 
                alt="TJ Coin"
              />
              <span className="text-3xl font-black tracking-tight text-text-primary font-mono">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-success self-end mb-1 bg-success/10 px-2 py-0.5 rounded-full z-10">
                TJ
              </span>
            </div>
          </div>
        </motion.div>


        {/* SECTION 2: DAILY STREAK CARD */}
        <motion.div
          variants={slideUp}
          className="relative overflow-hidden rounded-card bg-surface p-5"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-button bg-primary/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              <div className="text-left">
                <span className="text-caption uppercase">
                  Streak Multiplier
                </span>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  Current Streak: <span className="text-verified font-extrabold">7 Days</span>
                </h3>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="verified" className="text-[11px] px-2.5 py-1">
                7 / 30
              </Badge>
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
                  className={`flex flex-col items-center justify-center py-2 rounded-button transition-all ${
                    isActive 
                      ? "bg-primary text-background shadow-md shadow-primary/20" 
                      : isToday 
                        ? "bg-primary/20 border border-primary/40 text-primary font-bold" 
                        : "bg-background text-text-muted/40"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>


        <motion.div 
          variants={staggerChildren()}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { title: "Total TJ Earned", val: totalTJEarned.toLocaleString(), icon: Trophy, color: "var(--color-reward)", bg: "rgba(var(--color-reward-rgb),0.06)" },
            { title: "Tasks Completed", val: `${tasksCompletedCount} / ${missions.length}`, icon: CheckCircle2, color: "var(--color-success)", bg: "rgba(var(--color-success-rgb),0.06)" },
            { title: "Active Referrals", val: "12 Users", icon: Users, color: "var(--color-verified)", bg: "rgba(var(--color-verified-rgb),0.06)" },
            { title: "NFT Rewards", val: "3 Claimed", icon: Wallet, color: "var(--color-primary)", bg: "rgba(var(--color-primary-rgb),0.06)" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={slideUp}
                className="bg-surface p-4 rounded-card flex flex-col justify-between space-y-2 relative overflow-hidden text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption uppercase">
                    {item.title}
                  </span>
                  <div className="w-7 h-7 rounded-button flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight text-text-primary font-sans">
                  {item.val}
                </span>
              </motion.div>
            );
          })}
        </motion.div>


        <motion.div
          variants={slideUp}
          onClick={() => handleMissionClick(featuredMission)}
          className={`relative rounded-card p-4 overflow-hidden transition-all duration-300 cursor-pointer group ${
            featuredMission.state === "completed" 
              ? "bg-surface opacity-70" 
              : "bg-surface hover:bg-hover"
          }`}
        >
          {/* Holographic Glowing Orbs */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-primary/15 to-verified/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Left Side: Compact Icon badge with pulse glow */}
              <div className="w-10 h-10 rounded-button bg-gradient-to-br from-primary/20 to-verified/20 flex items-center justify-center shrink-0 shadow-lg shadow-black/50">
                <Zap className="w-5 h-5 text-verified animate-pulse" />
              </div>

              {/* Title & Desc Column */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="verified" className="text-[8px] py-0.5">
                    Featured Mission
                  </Badge>
                  <span className="text-[8px] font-black uppercase tracking-wider text-text-muted">
                    {featuredMission.progress}/{featuredMission.total} Complete
                  </span>
                </div>
                <h2 className="text-sm font-bold text-text-primary tracking-tight flex items-center gap-1.5">
                  {featuredMission.title}
                </h2>
                <p className="text-[11px] text-text-muted leading-normal max-w-sm">
                  {featuredMission.description}
                </p>
              </div>
            </div>

            {/* Right Side: Reward & Action CTA aligned perfectly */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-3 shrink-0">
              {/* Reward Tag */}
              <Badge variant="primary" className="text-[10px] px-2.5 py-1 flex items-center gap-1">
                <img src={TJ_COIN_ICON} alt="TJ" className="w-3.5 h-3.5 object-contain" />
                <span>+500 TJ</span>
              </Badge>

              {/* CTA Button */}
              <div>
                {featuredMission.state === "completed" ? (
                  <Badge variant="success" className="text-[10px] py-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </Badge>
                ) : featuredMission.state === "claimable" ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => handleClaimReward(featuredMission, e)}
                    className="h-8 text-[9px] px-4 font-black"
                  >
                    Claim TJ
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[9px] px-4 font-black flex items-center gap-1"
                  >
                    Mint <ArrowUpRight className="w-3 h-3 text-verified" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Thin Progress bar at the bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/45">
            <div 
              className="h-full bg-gradient-to-r from-primary to-verified"
              style={{ width: `${(featuredMission.progress / featuredMission.total) * 100}%` }}
            />
          </div>
        </motion.div>


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
                  <span className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 inline-block text-center border-[2px] ${
                    isActive 
                      ? "bg-primary text-background border-primary shadow-md shadow-primary/25" 
                      : "bg-surface hover:bg-hover text-text-muted border-white/5"
                  }`}>
                    {cat}
                  </span>
                  
                  {isActive && (
                    <motion.span 
                      layoutId="activeFilterUnderline"
                      className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-1 bg-verified rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>


        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between px-1">
            <span className="text-caption uppercase">
              {activeCategory} Missions ({filteredMissions.length})
            </span>
            <span className="text-[9px] text-text-muted/60">Tap cards to increase progress</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredMissions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center bg-surface rounded-card"
                >
                  <AlertCircle className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">No active missions found in this category.</p>
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
                      className={`h-[94px] rounded-card bg-surface hover:bg-hover transition-colors p-3.5 flex items-center justify-between gap-3 relative overflow-hidden select-none cursor-pointer ${
                        isCompleted ? "opacity-60 bg-surface/30" : ""
                      }`}
                    >
                      {/* Left Side: Glowing Icon */}
                      <div className="w-9 h-9 rounded-button flex items-center justify-center bg-background shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent" />
                        {getMissionIcon(m.iconName)}
                      </div>

                      {/* Middle Column: Info & Slim Progress Bar */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-text-primary tracking-tight truncate leading-none">
                              {m.title}
                            </h4>
                            {isPremium && (
                              <Badge variant="reward" className="text-[7.5px] px-1.5 rounded-full">
                                PREM
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-text-muted leading-none truncate opacity-85">
                            {m.description}
                          </p>
                        </div>

                        {/* Infinite tiny slim interactive utility bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[8px] text-text-muted/60 font-bold uppercase tracking-wider leading-none">
                            <span>Alignment Status</span>
                            <span>{m.progress}/{m.total}</span>
                          </div>
                          <div className="w-full h-[3.5px] bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-verified rounded-full"
                              style={{ width: `${(m.progress / m.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Reward Pill & CTA Button */}
                      <div className="shrink-0 flex flex-col items-end justify-between h-full py-0.5 pl-1.5">
                        {/* Always display points reward badge */}
                        <Badge variant="primary" className="text-[11px] px-2.5 py-1">
                          <img src={TJ_COIN_ICON} alt="" className="w-3.5 h-3.5 object-contain" />
                          <span>{m.reward}</span>
                        </Badge>

                        <div>
                          {isCompleted ? (
                            <Badge variant="success" className="text-[9px] px-2 py-1">
                              ✓ Completed
                            </Badge>
                          ) : isClaimable ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={(e) => handleClaimReward(m, e)}
                              className="h-6 text-[8px] px-3 font-black"
                            >
                              Claim TJ
                            </Button>
                          ) : isLocked ? (
                            <span className="text-[9.5px] font-medium text-text-muted/50 flex items-center gap-1 leading-none py-1">
                              <Lock className="w-3 h-3 text-text-muted/35" /> Locked
                            </span>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-2 py-1">
                              Active
                            </Badge>
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


        <motion.div
          variants={slideUp}
          className="rounded-card bg-surface p-5 relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <Badge variant="error" className="text-[9px] px-3 py-1">
                👥 Share & Earn
              </Badge>
              <h3 className="text-base font-bold text-text-primary tracking-tight mt-2.5">
                Invite Friends
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Earn <span className="text-text-primary font-black">+1,000 TJ</span> per active joining player.
              </p>
            </div>

            <div className="w-10 h-10 rounded-button bg-error/10 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-error" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-background/80 p-2.5 rounded-card">
            <div className="flex-1 font-mono text-center font-bold text-sm text-verified tracking-widest">
              {referralCode}
            </div>
            
            <Button
              onClick={handleCopyCode}
              size="sm"
              className="h-9 px-3 text-xs font-bold"
            >
              {copied ? "Copied! ✨" : "Copy"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const text = `Join TonJam and earn TJ rewards together! My referral code is ${referralCode}`;
                window.open(`https://t.me/share/url?url=https://tonjam.io&text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="w-9 h-9"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-divider">
            <div>
              <p className="text-caption uppercase mb-0.5">Invited</p>
              <p className="text-base font-bold text-text-primary">12 Friends</p>
            </div>
            <div>
              <p className="text-caption uppercase mb-0.5">Pending</p>
              <p className="text-base font-bold text-reward">3 Users</p>
            </div>
            <div>
              <p className="text-caption uppercase mb-0.5">TJ Earned</p>
              <p className="text-base font-extrabold text-success">+12.0k</p>
            </div>
          </div>
        </motion.div>


        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 px-1 justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-reward" />
              <span className="text-caption uppercase">
                Top Earners Activity
              </span>
            </div>
            <span className="text-[9px] text-text-muted/60 font-medium">Recomputed Hourly</span>
          </div>

          <div className="rounded-card bg-surface overflow-hidden p-1 shrink-0 space-y-1">
            {leaderboardUsers.map((user, idx) => {
              const isGold = user.rank === 1;
              const isSilver = user.rank === 2;
              const isBronze = user.rank === 3;

              return (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3.5 rounded-button transition-all ${
                    idx % 2 === 0 ? "bg-background/30" : "bg-hover/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge Indicator */}
                    <div className="w-6 shrink-0 text-center font-mono font-black">
                      {isGold ? (
                        <Crown className="w-4.5 h-4.5 text-reward fill-reward/20 mx-auto" />
                      ) : isSilver ? (
                        <Award className="w-4.5 h-4.5 text-text-muted mx-auto" />
                      ) : isBronze ? (
                        <Award className="w-4.5 h-4.5 text-orange-500 mx-auto" />
                      ) : (
                        <span className="text-xs text-text-muted/60">#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar with live pulse indicator if active */}
                    <div className="relative w-8 h-8 rounded-button bg-background flex items-center justify-center shrink-0">
                      <img src={user.avatarSeed} alt="" className="w-7 h-7 object-contain rounded-full" />
                      {user.isActive && (
                        <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 bg-success rounded-full border border-background animate-pulse" />
                      )}
                    </div>

                    {/* Username & Tier */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate leading-none">
                        {user.username}
                      </p>
                      <span className="text-[8.5px] uppercase tracking-widest text-text-muted/70 font-bold block mt-0.5">
                        {user.tier}
                      </span>
                    </div>
                  </div>

                  {/* TJ Balance Earned */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" />
                    <span className="text-primary font-black text-sm font-mono">
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
              <ShoppingBag className="w-4.5 h-4.5 text-verified" />
              <span className="text-caption uppercase">
                Redeem TJ Rewards
              </span>
            </div>
            <span className="text-[9px] text-success font-semibold flex items-center gap-1">
              Shop Open <span className="inline-block w-1.5 h-1.5 bg-success rounded-full" />
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {rewardShopItems.map((item) => {
              const affordable = balance >= item.price;
              
              return (
                <div
                  key={item.id}
                  className="w-[200px] shrink-0 rounded-card bg-surface overflow-hidden p-4 flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-2.5">
                    {/* Item Image with Badge */}
                    <div className="relative w-full h-[100px] rounded-button overflow-hidden bg-background">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-[8px] bg-black text-white px-2.5 py-1">
                          {item.badge}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-text-primary leading-tight tracking-tight h-[32px] overflow-hidden line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-text-muted leading-tight line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-t border-divider pt-3">
                      <span className="text-caption uppercase">Price</span>
                      <div className="flex items-center gap-1">
                        <img src={TJ_COIN_ICON} alt="TJ" className="w-3.5 h-3.5 object-contain" />
                        <span className="text-xs font-black text-primary font-mono">{item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      variant={affordable ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleRedeem(item)}
                      className="w-full text-[10px] font-black h-8"
                    >
                      {affordable ? "Redeem Item" : "Insufficient TJ"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 px-1">
            <span className="text-caption uppercase">
              Recent Activity
            </span>
          </div>

          <div className="rounded-card bg-surface overflow-hidden p-1 space-y-1">
            <AnimatePresence initial={false}>
              {activities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between p-3.5 rounded-button bg-background/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-success rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{act.message}</p>
                      <p className="text-[9px] text-text-muted">{act.time}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-success font-mono shrink-0 pl-3">
                    {act.amount}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>


        {/* FOOTER */}
        <div className="pt-4 text-center space-y-1 pb-10">
          <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted/50 font-black">
            Powered by TonJam Rewards Protocol v1.0
          </p>
          <div className="flex items-center justify-center gap-1.5 text-text-muted/40 text-[8px] font-bold uppercase tracking-widest">
            <Music className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>TON BLOCKCHAIN ORACLE INTEGRATION ACTIVE</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Tasks;
