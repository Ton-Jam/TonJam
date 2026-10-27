import React from 'react';
import { motion } from 'motion/react';
import { TJ_COIN_ICON } from '@/constants';
import { Sparkles, Activity } from 'lucide-react';

interface TJRewardsCardProps {
  balance: number;
  completedTasksCount?: number;
  totalTasksCount?: number;
  dailyPointsEarned?: number;
}

export const TJRewardsCard: React.FC<TJRewardsCardProps> = ({
  balance,
  completedTasksCount = 2,
  totalTasksCount = 5,
  dailyPointsEarned = 150,
}) => {
  const progressPercent = Math.min(100, Math.round((completedTasksCount / Math.max(1, totalTasksCount)) * 100));

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#111C30] via-[#0E1728] to-[#181938] border border-white/10 p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl overflow-hidden select-none">
      {/* RESTRAINED GRADIENT GLOW ORBS */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#229ED9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#9B7CFF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* SUBTLE DECORATIVE MUSIC WAVEFORM BACKGROUND */}
      <div className="absolute top-3 right-16 flex items-end gap-1 opacity-25 pointer-events-none h-8">
        {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] }}
            transition={{
              duration: 1.2 + (i % 3) * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1 bg-[#9B7CFF] rounded-full"
          />
        ))}
      </div>

      {/* TOP ROW: LABEL & BADGE */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#229ED9]">
          <Sparkles className="w-3.5 h-3.5 text-[#229ED9]" />
          <span>Your TJ Rewards</span>
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-[#9B7CFF]/15 border border-[#9B7CFF]/20 text-[10px] font-black uppercase tracking-wider text-[#9B7CFF] flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#9B7CFF]" />
          <span>+{dailyPointsEarned} Today</span>
        </div>
      </div>

      {/* MIDDLE ROW: PROMINENT BALANCE & COIN ICON */}
      <div className="flex items-center justify-between gap-3 z-10 my-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
            {balance.toLocaleString()}
          </span>
          <span className="text-sm font-black text-[#229ED9]">TJ</span>
        </div>

        <motion.div
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] border border-white/10 p-1.5 flex items-center justify-center shrink-0 shadow-lg"
        >
          <img
            src={TJ_COIN_ICON}
            alt="TJ Points"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>

      {/* COMPACT PROGRESS BAR & SUPPORTING MESSAGE */}
      <div className="flex flex-col gap-2 z-10 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="text-slate-400">Daily Rewards Goal</span>
          <span className="font-mono text-[#FFC857]">{completedTasksCount}/{totalTasksCount} Completed</span>
        </div>

        {/* THIN PROGRESS TRACK */}
        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#229ED9] via-[#9B7CFF] to-[#FFC857] rounded-full"
          />
        </div>

        <p className="text-[11px] font-medium text-slate-400 leading-relaxed mt-0.5">
          Complete daily streaming and social tasks to claim your TJ reward bonuses.
        </p>
      </div>
    </div>
  );
};

export const TJBalanceCard = TJRewardsCard;
export default TJRewardsCard;
