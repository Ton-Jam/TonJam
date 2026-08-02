import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  ChevronRight, 
  X, 
  Share2, 
  Music,
  Play,
  Gem,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { 
  ListenStreakBadge, 
  ListenStreakData, 
  STREAK_BADGES, 
  getInitialListenStreakData, 
  recordListenActivity, 
  claimBadge,
  getTodayIsoDate 
} from '@/lib/listenStreak';
import { useAudio } from '@/contexts/AudioContext';
import { cn } from '@/lib/utils';

interface ListenStreakIndicatorProps {
  className?: string;
  isOwnProfile?: boolean;
}

export const ListenStreakIndicator: React.FC<ListenStreakIndicatorProps> = ({ 
  className = '',
  isOwnProfile = true 
}) => {
  const { addNotification, userProfile, setUserProfile, playTrack, allTracks } = useAudio();
  
  const [streakData, setStreakData] = useState<ListenStreakData>(getInitialListenStreakData);
  const [selectedBadge, setSelectedBadge] = useState<ListenStreakBadge | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  useEffect(() => {
    setStreakData(getInitialListenStreakData());
  }, []);

  const today = getTodayIsoDate();
  const listenedToday = streakData.lastListenDate === today;

  // Calculate next badge goal
  const nextBadge = useMemo(() => {
    return STREAK_BADGES.find(b => b.streakRequired > streakData.currentStreak) || STREAK_BADGES[STREAK_BADGES.length - 1];
  }, [streakData.currentStreak]);

  const daysToNextBadge = Math.max(0, nextBadge.streakRequired - streakData.currentStreak);
  const nextBadgeProgress = Math.min(100, Math.round((streakData.currentStreak / nextBadge.streakRequired) * 100));

  // Current Multiplier based on streak
  const currentMultiplier = useMemo(() => {
    if (streakData.currentStreak >= 60) return '2.0x';
    if (streakData.currentStreak >= 30) return '1.5x';
    if (streakData.currentStreak >= 14) return '1.25x';
    if (streakData.currentStreak >= 7) return '1.15x';
    if (streakData.currentStreak >= 3) return '1.05x';
    return '1.0x';
  }, [streakData.currentStreak]);

  // Handle Simulate Listen / Verify Daily Streak
  const handleSimulateListen = () => {
    const { data, newlyUnlockedBadge } = recordListenActivity();
    setStreakData({ ...data });
    
    if (newlyUnlockedBadge) {
      addNotification(`🎉 New NFT Badge Unlocked: ${newlyUnlockedBadge.name}!`, "success", 5000);
      setSelectedBadge(newlyUnlockedBadge);
    } else {
      addNotification("🔥 Daily listen streak logged! Your streak flame is burning bright.", "success");
    }

    // Play a sample track if possible
    if (allTracks.length > 0) {
      playTrack(allTracks[0]);
    }
  };

  // Handle Claim NFT Badge
  const handleClaimBadge = (badge: ListenStreakBadge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsClaiming(badge.id);

    setTimeout(() => {
      const updated = claimBadge(badge.id);
      setStreakData({ ...updated });
      setIsClaiming(null);
      
      // Update User Profile TJ Balance / Owned NFTs if needed
      if (setUserProfile && userProfile) {
        setUserProfile((prev: any) => ({
          ...prev,
          tjBalance: (prev.tjBalance || 100) + (badge.streakRequired * 20),
          ownedNftIds: Array.from(new Set([...(prev.ownedNftIds || []), `nft-badge-${badge.id}`]))
        }));
      }

      addNotification(`🏆 Successfully claimed ${badge.name} NFT Badge! Added to your collection.`, "success");
    }, 800);
  };

  // Generate 7-day week bubbles
  const weekDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7; // Convert Sun=0 to Mon=0

    return days.map((dayLabel, idx) => {
      const diff = idx - currentDayIdx;
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + diff);
      const isoStr = targetDate.toISOString().split('T')[0];

      const isPastOrToday = idx <= currentDayIdx;
      const isToday = idx === currentDayIdx;
      const isCompleted = streakData.historyDates.includes(isoStr) || (isToday && listenedToday);

      return {
        label: dayLabel,
        dateNumber: targetDate.getDate(),
        isToday,
        isCompleted,
        isPastOrToday
      };
    });
  }, [streakData.historyDates, listenedToday]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero Streak Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e163d] via-[#121c4e] to-[#0a102d] border border-orange-500/20 p-5 sm:p-6 shadow-2xl shadow-orange-500/5">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-rose-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Main Streak Counter */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-0.5 shadow-lg shadow-orange-500/30">
                <div className="w-full h-full bg-[#0a102d] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider mt-0.5">
                    Active
                  </span>
                </div>
              </div>

              {/* Pulse Ring */}
              <div className="absolute -inset-1 rounded-2xl bg-orange-500/20 blur-sm -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Listen Streak
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {currentMultiplier} Multiplier
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  {streakData.currentStreak}
                </h2>
                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                  {streakData.currentStreak === 1 ? 'Day' : 'Days'} Consecutive
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Longest Streak: <span className="text-amber-300 font-bold font-mono">{streakData.longestStreak} Days</span> • Total: <span className="text-slate-200 font-bold font-mono">{streakData.totalDaysListened} Days</span>
              </p>
            </div>
          </div>

          {/* Action & Protection Badge */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3">
            {isOwnProfile && (
              <button
                onClick={handleSimulateListen}
                disabled={listenedToday}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95",
                  listenedToday
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-orange-500/20"
                )}
              >
                {listenedToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Today's Streak Secured!
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                    Listen Today (+1 Day)
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Streak Freeze Shield Enabled</span>
            </div>
          </div>
        </div>

        {/* Weekly Day Tracker */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              This Week's Activity
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {listenedToday ? 'Active Today' : 'Listen to keep streak'}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((wd, i) => (
              <div
                key={`weekday-${i}`}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-center relative",
                  wd.isCompleted
                    ? "bg-gradient-to-b from-orange-500/20 to-amber-500/10 border-orange-500/40 text-amber-300"
                    : wd.isToday
                    ? "bg-white/10 border-amber-400/50 text-white animate-pulse"
                    : wd.isPastOrToday
                    ? "bg-white/5 border-white/10 text-slate-500"
                    : "bg-white/[0.02] border-white/5 text-slate-600"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  {wd.label}
                </span>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center">
                  {wd.isCompleted ? (
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 drop-shadow-sm" />
                  ) : (
                    <span className="text-xs font-mono font-bold">{wd.dateNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Badge Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Next Badge: <strong className="text-amber-300">{nextBadge.name}</strong> ({nextBadge.streakRequired} Days)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextBadgeProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
              {streakData.currentStreak}/{nextBadge.streakRequired}
            </span>
          </div>
        </div>
      </div>

      {/* NFT Badge Rewards Section */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Streak NFT Badge Rewards
            </h3>
            <p className="text-xs text-slate-400">
              Maintain your daily listening loop to mint exclusive collectible NFT badges on TON
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
            {streakData.claimedBadgeIds.length}/{STREAK_BADGES.length} Claimed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {STREAK_BADGES.map((badge) => {
            const isUnlocked = streakData.currentStreak >= badge.streakRequired;
            const isClaimed = streakData.claimedBadgeIds.includes(badge.id);

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "group relative bg-[#0d1538] rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg",
                  isClaimed
                    ? `border-amber-500/40 hover:border-amber-400 shadow-amber-500/10`
                    : isUnlocked
                    ? `border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/20 animate-pulse`
                    : `border-white/10 hover:border-white/20 opacity-75 hover:opacity-100`
                )}
              >
                {/* Rarity & Status Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                    badge.tier === 'bronze' && "bg-amber-950/60 text-amber-300 border-amber-600/40",
                    badge.tier === 'silver' && "bg-cyan-950/60 text-cyan-300 border-cyan-500/40",
                    badge.tier === 'gold' && "bg-yellow-950/60 text-yellow-300 border-yellow-500/40",
                    badge.tier === 'platinum' && "bg-purple-950/60 text-purple-300 border-purple-500/40",
                    badge.tier === 'mythic' && "bg-rose-950/60 text-rose-300 border-rose-500/40"
                  )}>
                    {badge.rarity}
                  </span>

                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Claimed
                    </span>
                  ) : isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      Unlocked!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      <Lock className="w-3 h-3" /> {badge.streakRequired} Days
                    </span>
                  )}
                </div>

                {/* Badge Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={badge.badgeImageUrl}
                    alt={badge.name}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-300",
                      !isUnlocked && "grayscale opacity-50"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-mono font-bold">
                    <span>{badge.streakRequired} Days</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                </div>

                {/* Badge Title & Perks */}
                <div className="space-y-1 mb-3">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                    {badge.perk}
                  </p>
                </div>

                {/* Claim / Status Button */}
                {isUnlocked && !isClaimed && isOwnProfile ? (
                  <button
                    onClick={(e) => handleClaimBadge(badge, e)}
                    disabled={isClaiming === badge.id}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    {isClaiming === badge.id ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Award className="w-3.5 h-3.5" />
                    )}
                    Claim NFT Badge
                  </button>
                ) : (
                  <div className="w-full py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        In Collection
                      </>
                    ) : (
                      <>
                        <span>{streakData.currentStreak}/{badge.streakRequired} Days</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* NFT Badge Inspection Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0c1338] border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                {/* Badge Image Large */}
                <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 group">
                  <img
                    src={selectedBadge.badgeImageUrl}
                    alt={selectedBadge.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    {selectedBadge.rarity} NFT
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white font-mono">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-xs text-amber-300 font-bold tracking-widest uppercase mt-0.5">
                    {selectedBadge.streakRequired}-Day Listen Streak Collectible
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {selectedBadge.description}
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Holder Benefit & Perk
                  </span>
                  <p className="text-xs font-bold text-white">
                    {selectedBadge.perk}
                  </p>
                </div>

                {/* Claim / Close Actions */}
                <div className="pt-2 flex items-center gap-3">
                  {streakData.currentStreak >= selectedBadge.streakRequired && !streakData.claimedBadgeIds.includes(selectedBadge.id) && isOwnProfile ? (
                    <button
                      onClick={() => {
                        handleClaimBadge(selectedBadge);
                        setSelectedBadge(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Award className="w-4 h-4" />
                      Claim & Mint NFT Badge
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                    >
                      Close Inspector
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListenStreakIndicator;
