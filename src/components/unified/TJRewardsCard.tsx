import React from 'react';
import { motion } from 'motion/react';
import { TJ_COIN_ICON } from '@/constants';
import { Sparkles, Activity } from 'lucide-react';
import TaskProgressBar from './TaskProgressBar';

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
  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#111C30] via-[#101b33] to-[#1a1c3e] p-5 flex flex-col gap-4 shadow-xl overflow-hidden select-none">
      {/* Restrained blue-purple gradient glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#2E8CEB]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#9B7CFF]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Label & Today's earnings */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2E8CEB]">
          <Sparkles className="w-3.5 h-3.5 text-[#2E8CEB]" />
          <span>Your TJ Rewards</span>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-[#9B7CFF]/15 text-[11px] font-black uppercase tracking-wider text-[#9B7CFF] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#9B7CFF]" />
          <span>+{dailyPointsEarned} Today</span>
        </div>
      </div>

      {/* Middle row: Prominent Balance & TonJam Coin */}
      <div className="flex items-center justify-between gap-3 z-10">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {balance.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[#FFC857] uppercase tracking-wider">
              TJ
            </span>
          </div>
          <p className="text-xs text-[#91A8C5] mt-1">
            Complete tasks, stream verified tracks & earn rewards
          </p>
        </div>

        <motion.div
          whileHover={{ rotate: 12, scale: 1.05 }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#FFC857]/20 rounded-full blur-lg animate-pulse" />
          <img
            src={TJ_COIN_ICON}
            alt="TonJam Coin"
            className="relative w-full h-full object-contain drop-shadow-md"
          />
        </motion.div>
      </div>

      {/* Bottom row: Daily progress bar */}
      <div className="pt-2 z-10 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Daily Task Goal</span>
          <span className="font-mono text-[#2E8CEB] font-bold">
            {completedTasksCount} / {totalTasksCount} Completed
          </span>
        </div>
        <TaskProgressBar current={completedTasksCount} total={totalTasksCount} />
      </div>
    </div>
  );
};

export default TJRewardsCard;
