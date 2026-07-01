import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Target, Trophy, Award, Copy, Users, Clock, Flame, 
  Sparkles, Check, ChevronRight, Zap, TrendingUp, Gift 
} from 'lucide-react';

// --- TS INTERFACES ---

export interface MissionData {
  id: string;
  title: string;
  description: string;
  rewardText: string; // e.g. "+50 XP, +0.5 TON"
  progressValue: number; // e.g. 3
  progressMax: number; // e.g. 5
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface LeaderboardUserData {
  id: string;
  rank: number;
  displayName: string;
  avatarUrl?: string;
  scoreText: string; // e.g. "12,450 XP"
  isCurrentUser?: boolean;
}

// --- 1. MISSION CARD ---
export const MissionCard: React.FC<{
  mission?: MissionData;
  isLoading?: boolean;
  onClaim?: (mission: MissionData) => void;
  className?: string;
}> = ({ mission, isLoading, onClaim, className = '' }) => {
  const [claimed, setClaimed] = useState(mission?.isClaimed || false);

  if (isLoading || !mission) {
    return (
      <div className={`p-4 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-full max-w-[340px] ${className}`}>
        <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
        <div className="h-3 bg-white/10 rounded w-full mb-3" />
        <div className="h-6 bg-white/10 rounded w-1/4" />
      </div>
    );
  }

  const percent = Math.min(100, Math.round((mission.progressValue / mission.progressMax) * 100));

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="text-[13px] font-black uppercase tracking-tight leading-snug">{mission.title}</h4>
          <p className="text-[11px] text-[#9AA0AE] leading-tight mt-1">{mission.description}</p>
        </div>
        <span className="text-[9px] font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
          {mission.rewardText}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-[#9AA0AE] font-mono">
          <span>Progress</span>
          <span className="font-bold text-white">{mission.progressValue}/{mission.progressMax}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        {mission.isCompleted ? (
          <button
            onClick={() => { setClaimed(true); onClaim?.(mission); }}
            disabled={claimed}
            className={`py-1.5 px-4 rounded-[6px] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
              claimed 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            {claimed ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
            <span>{claimed ? 'Claimed' : 'Claim Reward'}</span>
          </button>
        ) : (
          <span className="text-[9px] font-black text-[#9AA0AE] uppercase tracking-wider bg-white/5 py-1 px-3 rounded-md">In Progress</span>
        )}
      </div>
    </div>
  );
};

// --- 2. DAILY REWARD CARD (7-Day consecutively check boxes) ---
export const DailyRewardCard: React.FC<{
  currentDay: number; // 1 to 7
  onClaim?: (day: number) => void;
  className?: string;
}> = ({ currentDay, onClaim, className = '' }) => {
  const [claimedDays, setClaimedDays] = useState<number[]>(Array.from({ length: currentDay - 1 }, (_, i) => i + 1));

  const handleClaim = (day: number) => {
    if (day === currentDay && !claimedDays.includes(day)) {
      setClaimedDays([...claimedDays, day]);
      onClaim?.(day);
    }
  };

  const days = [
    { day: 1, reward: '+10 XP' },
    { day: 2, reward: '+15 XP' },
    { day: 3, reward: '+20 XP' },
    { day: 4, reward: '+25 XP' },
    { day: 5, reward: '+30 XP' },
    { day: 6, reward: '+40 XP' },
    { day: 7, reward: '🔥 100 XP' },
  ];

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Gift className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Consecutive Daily Rewards</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const isClaimed = claimedDays.includes(d.day);
          const isCurrent = d.day === currentDay;
          return (
            <div
              key={d.day}
              onClick={() => handleClaim(d.day)}
              className={`p-2.5 rounded-[6px] flex flex-col items-center justify-between h-20 transition-all cursor-pointer select-none text-center ${
                isClaimed
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : isCurrent
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-white/[0.02] text-[#9AA0AE] hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-[10px] font-mono font-black">Day {d.day}</span>
              <div className="my-1.5">
                {isClaimed ? (
                  <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#9AA0AE]/60 mx-auto" />
                )}
              </div>
              <span className="text-[8px] font-mono truncate leading-none">{d.reward}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 3. STREAK CARD ---
export const StreakCard: React.FC<{
  streakDays: number;
  multiplier: string;
  className?: string;
}> = ({ streakDays, multiplier, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-gradient-to-tr from-amber-600 to-red-600 select-none text-white w-full max-w-[340px] flex items-center justify-between ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-200">Sync Streak Active</span>
        </div>
        <h3 className="text-xl font-black font-mono leading-none">{streakDays} DAYS STREAK</h3>
        <p className="text-[11px] text-white/85">Listen daily to keep multiplying rewards!</p>
      </div>
      <div className="p-3 bg-white/10 rounded-full font-mono text-center shrink-0 ml-3 min-w-[56px]">
        <span className="block text-[8px] uppercase tracking-wider text-white/70">Bonus</span>
        <span className="text-base font-black text-yellow-200">{multiplier}</span>
      </div>
    </div>
  );
};

// --- 4. REFERRAL CARD ---
export const ReferralCard: React.FC<{
  referralCode: string;
  rewardDetails: string;
  onCopy?: () => void;
  className?: string;
}> = ({ referralCode, rewardDetails, onCopy, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Refer & Earn Rewards</span>
      </div>
      <p className="text-xs text-white/90 leading-relaxed mb-3">{rewardDetails}</p>
      
      <div className="flex items-center gap-2 bg-white/[0.03] p-2.5 rounded-[6px] font-mono text-[13px]">
        <span className="flex-1 text-[#9AA0AE] truncate">{referralCode}</span>
        <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-[6px] text-white/80 active:scale-90 transition-all">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// --- 5. XP CARD (Level progress) ---
export const XPCard: React.FC<{
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}> = ({ currentXP, nextLevelXP, level, className = '' }) => {
  const percent = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">XP Progress</span>
        <span className="text-sm font-black font-mono text-blue-400">Level {level}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-[#9AA0AE] font-mono">
          <span>{currentXP.toLocaleString()} XP</span>
          <span>{nextLevelXP.toLocaleString()} XP to Level {level + 1}</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
};

// --- 6. LEADERBOARD CARD ---
export const LeaderboardCard: React.FC<{
  users: LeaderboardUserData[];
  title?: string;
  className?: string;
}> = ({ users, title = 'Leaderboard', className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[340px] ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-amber-500 fill-current" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">{title}</span>
      </div>
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {users.map((u) => {
          const isTop3 = u.rank <= 3;
          const medalColor = u.rank === 1 ? 'text-amber-400' : u.rank === 2 ? 'text-slate-300' : 'text-amber-700';
          return (
            <div key={u.id} className={`flex items-center justify-between p-2 rounded-[6px] ${u.isCurrentUser ? 'bg-blue-600/20' : 'bg-white/[0.01]'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 font-mono font-black text-center text-xs shrink-0">
                  {isTop3 ? <Trophy className={`w-4 h-4 ${medalColor} fill-current mx-auto`} /> : u.rank}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-950 shrink-0">
                  {u.avatarUrl && <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />}
                </div>
                <h4 className="text-[12px] font-bold text-white truncate">{u.displayName}</h4>
              </div>
              <span className="font-mono text-[11px] font-bold text-blue-400 shrink-0">{u.scoreText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 7. CHALLENGE CARD ---
export const ChallengeCard: React.FC<{
  title: string;
  description: string;
  endsIn: string;
  rewardPool: string;
  participantsCount: number;
  onJoin?: () => void;
  className?: string;
}> = ({ title, description, endsIn, rewardPool, participantsCount, onJoin, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-gradient-to-tr from-purple-900 to-[#0A113A] select-none text-white w-full max-w-[340px] flex flex-col justify-between h-48 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[8px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">ACTIVE CHALLENGE</span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
            <Clock className="w-3.5 h-3.5" /> Ends in {endsIn}
          </span>
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-tight leading-snug">{title}</h4>
        <p className="text-[11px] text-[#9AA0AE] leading-snug mt-1.5">{description}</p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#9AA0AE] block">Reward Pool</span>
          <span className="text-[13px] font-black text-emerald-400 font-mono">{rewardPool}</span>
        </div>
        <button onClick={onJoin} className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] flex items-center gap-1 transition-all">
          <Zap className="w-3.5 h-3.5 fill-current" /> Enter Challenge
        </button>
      </div>
    </div>
  );
};

// --- 8. BONUS REWARD CARD ---
export const BonusRewardCard: React.FC<{
  title: string;
  description: string;
  rewardValue: string;
  onClaim?: () => void;
  className?: string;
}> = ({ title, description, rewardValue, onClaim, className = '' }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`p-4 rounded-[10px] bg-gradient-to-tr from-slate-900 to-indigo-950 select-none text-white w-full max-w-[340px] flex flex-col justify-between h-40 ${className}`}>
      <div>
        <span className="text-[8px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full inline-block mb-2">MYSTERY BONUS</span>
        <h4 className="text-[14px] font-bold text-white leading-tight">{title}</h4>
        <p className="text-[11px] text-[#9AA0AE] leading-snug mt-1">{description}</p>
      </div>

      <div className="mt-3">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="scratch"
              onClick={() => setRevealed(true)}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-[6px]"
            >
              🎉 SCRATCH & UNLOCK
            </motion.button>
          ) : (
            <motion.div
              key="reward"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-between items-center bg-white/[0.03] p-2 rounded-[6px]"
            >
              <div className="font-mono">
                <span className="text-[8px] uppercase tracking-wider text-emerald-400 block font-bold">UNLOCKED REWARD</span>
                <span className="text-[13px] font-black text-white">{rewardValue}</span>
              </div>
              <button onClick={onClaim} className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[4px] transition-all">
                Claim
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
