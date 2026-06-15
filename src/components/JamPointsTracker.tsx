import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Flame, 
  Award, 
  CheckCircle, 
  Music, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  Check, 
  Gift, 
  Loader2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const JamPointsTracker: React.FC = () => {
  const { addNotification, recentlyPlayed, posts, userProfile, setUserProfile } = useAudio();

  // Load state from local storage or default
  const [tracksListened, setTracksListened] = useState<number>(() => {
    const val = localStorage.getItem('jampoints_tracks_count');
    return val ? parseInt(val, 10) : 2; // Default to 2
  });

  const [nftsExplored, setNftsExplored] = useState<number>(() => {
    const val = localStorage.getItem('jampoints_nfts_count');
    return val ? parseInt(val, 10) : 3; // Default to 3
  });

  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(() => {
    return localStorage.getItem('jampoints_checked_in') === 'true';
  });

  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    return localStorage.getItem('jampoints_reward_claimed') === 'true';
  });

  const [streak, setStreak] = useState<number>(() => {
    const val = localStorage.getItem('jampoints_streak');
    return val ? parseInt(val, 10) : 4; // Default to a 4-day streak!
  });

  // Calculate social signals from existing posts count inside AudioContext
  const sharedPostsCount = useMemo(() => {
    return posts.filter(p => p.userId === userProfile?.uid).length;
  }, [posts, userProfile?.uid]);

  // Sync actual listen actions from recent activity inside AudioContext if any
  useEffect(() => {
    if (recentlyPlayed.length > 0) {
      setTracksListened(prev => {
        const nextVal = Math.max(prev, recentlyPlayed.length);
        localStorage.setItem('jampoints_tracks_count', nextVal.toString());
        return nextVal;
      });
    }
  }, [recentlyPlayed]);

  // Save states on update
  useEffect(() => {
    localStorage.setItem('jampoints_tracks_count', tracksListened.toString());
  }, [tracksListened]);

  useEffect(() => {
    localStorage.setItem('jampoints_nfts_count', nftsExplored.toString());
  }, [nftsExplored]);

  // Task specs
  const TRACKS_GOAL = 5;
  const NFTS_GOAL = 6;
  const SIGNALS_GOAL = 1;

  // Calculate points
  const pointsFromTracks = Math.min(tracksListened, TRACKS_GOAL) * 40; // max 200
  const pointsFromNfts = Math.min(nftsExplored, NFTS_GOAL) * 25; // max 150
  const pointsFromSignals = Math.min(sharedPostsCount, SIGNALS_GOAL) * 100; // max 100
  const pointsFromCheckIn = hasCheckedIn ? 100 : 0; // max 100

  const totalPoints = pointsFromTracks + pointsFromNfts + pointsFromSignals + pointsFromCheckIn;
  const MAX_POINTS = 550; // Total available
  const completionPercentage = Math.round(Math.min((totalPoints / MAX_POINTS) * 100, 100));

  // Circular progress calculations
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    localStorage.setItem('jampoints_checked_in', 'true');
    setStreak(prev => {
      const nextStreak = prev + 1;
      localStorage.setItem('jampoints_streak', nextStreak.toString());
      return nextStreak;
    });
    addNotification("Consecutive connection signal secured! +100 JamPoints", "success");
  };

  const simulateListen = () => {
    setTracksListened(prev => {
      const next = prev + 1;
      addNotification(`Simulated track stream. JamPoints Updated!`, "info");
      return next;
    });
  };

  const simulateExplore = () => {
    setNftsExplored(prev => {
      const next = prev + 1;
      addNotification(`NFT aura trace analysis recorded. JamPoints Updated!`, "info");
      return next;
    });
  };

  const handleClaimChest = () => {
    if (totalPoints < MAX_POINTS) {
      addNotification(`Incomplete engagement sequence. Acquire ${MAX_POINTS - totalPoints} more JamPoints to decode.`, "warning");
      return;
    }
    if (rewardClaimed) {
      addNotification("Reward capsule already claimed today.", "info");
      return;
    }

    setRewardClaimed(true);
    localStorage.setItem('jampoints_reward_claimed', 'true');
    
    // Add real JAM coins to user balance!
    if (setUserProfile && userProfile) {
      const rewardCoins = 250;
      setUserProfile((prev: any) => ({
        ...prev,
        jamBalance: (prev.jamBalance || 0) + rewardCoins
      }));
      addNotification(`Chest successfully decoded! Secured +${rewardCoins} JAM tokens to your registry!`, "success");
    } else {
      addNotification("Chest unlocked! 250 JAM coins added to registry matrix.", "success");
    }
  };

  const resetProgress = () => {
    setTracksListened(0);
    setNftsExplored(0);
    setHasCheckedIn(false);
    setRewardClaimed(false);
    localStorage.removeItem('jampoints_tracks_count');
    localStorage.removeItem('jampoints_nfts_count');
    localStorage.removeItem('jampoints_checked_in');
    localStorage.removeItem('jampoints_reward_claimed');
    addNotification("Daily JamPoints tracker re-initialized to default matrix states.", "info");
  };

  return (
    <div className="bg-[#050c26]/60 backdrop-blur-2xl p-6 rounded-3xl relative overflow-hidden flex flex-col gap-6" id="jampoints-progress-section">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit px-2 py-0.5 bg-blue-500/10 border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-[0.25em] rounded-full">
            DAILY PROFILE SYNERGY
          </Badge>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            JamPoints Console
          </h3>
        </div>
        
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/10 px-3 py-1.5 rounded-2xl text-amber-400">
          <Flame className="h-4.5 w-4.5 animate-pulse fill-amber-500/20" />
          <span className="text-[10px] sm:text-xs font-black font-mono leading-none">
            {streak} DAY STREAK
          </span>
        </div>
      </div>

      {/* Core Radial Graph & Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Left: Beautiful progress wheel */}
        <div className="sm:col-span-5 flex justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-[#091136]"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-blue-500 transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))',
                }}
              />
            </svg>
            
            {/* Inner Content */}
            <div className="absolute flex flex-col items-center text-center">
              <Trophy className="h-5 w-5 text-amber-400 mb-0.5 animate-bounce" />
              <span className="text-2xl font-black font-mono leading-none tracking-tighter text-white">
                {totalPoints}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                / {MAX_POINTS} PTS
              </span>
              <span className="text-[10px] font-black text-blue-400 font-mono mt-1">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Summary Metric Cards */}
        <div className="sm:col-span-7 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#050a24]/50 p-3 rounded-2xl">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">STREAMS</span>
              <span className="text-base font-black font-mono text-zinc-200">
                {tracksListened} <span className="text-[10px] text-zinc-600">/ {TRACKS_GOAL}</span>
              </span>
            </div>
            
            <div className="bg-[#050a24]/50 p-3 rounded-2xl">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">DISCOVERED</span>
              <span className="text-base font-black font-mono text-zinc-200">
                {nftsExplored} <span className="text-[10px] text-zinc-600">/ {NFTS_GOAL}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[10px] font-medium text-zinc-400">
            <div className="flex justify-between items-center bg-[#050a24]/30 px-3 py-1.5 rounded-lg">
              <span>Streams points:</span>
              <span className="font-mono text-zinc-200 font-bold">{pointsFromTracks} PTS</span>
            </div>
            <div className="flex justify-between items-center bg-[#050a24]/30 px-3 py-1.5 rounded-lg">
              <span>Dimension explorer points:</span>
              <span className="font-mono text-zinc-200 font-bold">{pointsFromNfts} PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Tasks Sequence */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] block mb-0.5">
          DAILY SYNC CRITERIA
        </span>

        {/* 1. Daily Connection Signal */}
        <div className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              hasCheckedIn ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
            )}>
              {hasCheckedIn ? <Check className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase text-zinc-100 leading-tight">Connection Beacon</p>
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5">Consecutive check-in daily. +100 PTS</p>
            </div>
          </div>
          <button 
            disabled={hasCheckedIn}
            onClick={handleCheckIn}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors active:scale-95 duration-100",
              hasCheckedIn 
                ? "bg-zinc-800 text-zinc-500 cursor-default" 
                : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md shadow-blue-500/10"
            )}
          >
            {hasCheckedIn ? "CLAIMED" : "CLAIM"}
          </button>
        </div>

        {/* 2. Track Listening Task */}
        <div className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              tracksListened >= TRACKS_GOAL ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"
            )}>
              {tracksListened >= TRACKS_GOAL ? <Check className="h-4 w-4" /> : <Music className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase text-zinc-100 leading-tight">Acoustic Resonance</p>
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5">Stream {TRACKS_GOAL} user track nodes. {tracksListened}/{TRACKS_GOAL} streams (+40 PTS each)</p>
            </div>
          </div>
          <button 
            onClick={simulateListen}
            className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors active:scale-95 cursor-pointer"
          >
            {tracksListened >= TRACKS_GOAL ? "+ STREAM" : "STREAM"}
          </button>
        </div>

        {/* 3. NFT Exploring Task */}
        <div className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              nftsExplored >= NFTS_GOAL ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
            )}>
              {nftsExplored >= NFTS_GOAL ? <Check className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase text-zinc-100 leading-tight">Dimension Explorer</p>
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5">Examine {NFTS_GOAL} collectible dimensions. {nftsExplored}/{NFTS_GOAL} explored (+25 PTS each)</p>
            </div>
          </div>
          <button 
            onClick={simulateExplore}
            className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors active:scale-95 cursor-pointer"
          >
            {nftsExplored >= NFTS_GOAL ? "+ EXPLORE" : "EXPLORE"}
          </button>
        </div>

        {/* 4. Social Feed Posts Track */}
        <div className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              sharedPostsCount >= SIGNALS_GOAL ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
            )}>
              {sharedPostsCount >= SIGNALS_GOAL ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase text-zinc-100 leading-tight">Signal Creator</p>
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5">Broadcast custom signal updates on feed grid. {sharedPostsCount}/{SIGNALS_GOAL} shared (+100 PTS)</p>
            </div>
          </div>
          <div className="text-[9px] font-black uppercase font-mono px-3.5 text-zinc-500">
            {sharedPostsCount >= SIGNALS_GOAL ? "SYNCED" : "AUTO-TRACK"}
          </div>
        </div>
      </div>

      {/* Claim Chest Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 p-4 bg-blue-500/5 rounded-2xl">
        <div className="text-left">
          <h4 className="text-xs font-black uppercase text-zinc-100 flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-amber-400" /> Daily Capsule
          </h4>
          <p className="text-[9px] font-medium text-zinc-400 mt-1">
            Achieve full 550 PTS daily engagement sequence to claim 250 JAM.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {rewardClaimed ? (
            <div className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[9px] tracking-widest rounded-xl text-center">
              CAPSULE UNLOCKED ✓
            </div>
          ) : (
            <button
              onClick={handleClaimChest}
              disabled={totalPoints < MAX_POINTS}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 duration-150 shadow-md",
                totalPoints >= MAX_POINTS
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-blue-500/20"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              {totalPoints < MAX_POINTS && <Lock className="h-3 w-3" />}
              UNLOCK CHEST
            </button>
          )}

          <button 
            onClick={resetProgress}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Daily Goals"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
};
