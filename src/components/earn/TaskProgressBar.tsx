import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Trophy, Flame } from 'lucide-react';

interface TaskProgressBarProps {
  completedCount: number;
  totalCount: number;
  dailyPointsEarned?: number;
  dailyStreak?: number;
  message?: string;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  completedCount,
  totalCount,
  dailyPointsEarned = 150,
  dailyStreak = 3,
  message = 'Complete daily tasks to unlock bonus rewards!',
}) => {
  const percentage = Math.min(100, Math.round((completedCount / Math.max(1, totalCount)) * 100));

  return (
    <div className="w-full rounded-2xl bg-[#111C30] border border-white/10 p-3.5 sm:p-4 flex flex-col gap-3 text-left select-none shadow-md">
      {/* HEADER & STATISTICS CARDS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
            <div className="text-xs font-black text-white font-mono">{completedCount} of {totalCount}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Streak</div>
            <div className="text-xs font-black text-[#FFC857] font-mono">{dailyStreak} Days</div>
          </div>
        </div>
      </div>

      {/* THIN BLUE-TO-PURPLE PROGRESS BAR */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="text-slate-400">Daily Task Target</span>
          <span className="font-mono text-[#229ED9]">{percentage}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#229ED9] via-[#9B7CFF] to-[#34D399] rounded-full"
          />
        </div>
      </div>

      <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  );
};

export default TaskProgressBar;
