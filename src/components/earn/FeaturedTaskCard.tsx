import React from 'react';
import { motion } from 'motion/react';
import { Task } from './types';
import { TaskRewardBadge } from './TaskRewardBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Music, Sparkles, Flame, Headphones } from 'lucide-react';

interface FeaturedTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onActionClick: (task: Task, e: React.MouseEvent) => void;
}

export const FeaturedTaskCard: React.FC<FeaturedTaskCardProps> = ({
  task,
  onTaskClick,
  onActionClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onTaskClick(task)}
      className="relative w-full rounded-2xl bg-[#111C30] border border-pink-500/30 p-4 sm:p-5 flex flex-col gap-3.5 shadow-lg overflow-hidden select-none cursor-pointer"
    >
      {/* FEATURED PINK & PURPLE AMBIENT GLOW */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#9B7CFF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* TOP ROW: FEATURED BADGE & PINK REWARD */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/25 text-[#F472B6] text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#F472B6] fill-[#F472B6]/20 animate-pulse" />
          <span>Featured Reward</span>
        </div>

        <TaskRewardBadge reward={task.reward} size="md" colorOverride="pink" />
      </div>

      {/* CENTER ROW: MUSIC ICON & TITLE/DESC */}
      <div className="flex items-start gap-3.5 z-10">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-[#9B7CFF]/20 border border-pink-500/20 text-[#F472B6] flex items-center justify-center shrink-0 shadow-md">
          <Headphones className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 text-left space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
            {task.title}
          </h3>
          <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      </div>

      {/* BOTTOM ROW: STATUS BADGE / CTA */}
      <div className="flex items-center justify-between gap-2 z-10 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7CFF]">
          {task.category}
        </span>

        <TaskStatusBadge
          status={task.status}
          actionLabel={task.actionLabel || 'Start Task'}
          onAction={(e) => {
            e.stopPropagation();
            onActionClick(task, e);
          }}
          progress={task.progress}
          total={task.total}
        />
      </div>
    </motion.div>
  );
};

export default FeaturedTaskCard;
