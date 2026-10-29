import React from 'react';
import { Sparkles, Headphones, ArrowRight } from 'lucide-react';
import { UnifiedTask } from './types';
import TaskRewardBadge from './TaskRewardBadge';
import TaskStatusBadge from './TaskStatusBadge';

interface FeaturedTaskCardProps {
  task: UnifiedTask;
  onTaskClick?: (task: UnifiedTask) => void;
  onActionClick?: (task: UnifiedTask, e: React.MouseEvent) => void;
}

export const FeaturedTaskCard: React.FC<FeaturedTaskCardProps> = ({
  task,
  onTaskClick,
  onActionClick,
}) => {
  return (
    <div
      onClick={() => onTaskClick?.(task)}
      className="relative w-full rounded-3xl bg-gradient-to-br from-[#111C30] via-[#141b36] to-[#1c183b] p-5 flex flex-col gap-3.5 shadow-lg overflow-hidden select-none cursor-pointer hover:bg-white/[0.02] transition-all"
    >
      {/* Featured ambient pink/purple glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#F472B6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#9B7CFF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Featured Badge & Reward Badge */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F472B6]/15 text-[#F472B6] text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#F472B6] fill-[#F472B6]/20 animate-pulse" />
          <span>Featured Mission</span>
        </div>

        <TaskRewardBadge reward={task.reward} size="md" colorOverride="pink" />
      </div>

      {/* Center row: Icon, Title, Description */}
      <div className="flex items-start gap-3.5 z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F472B6]/20 to-[#9B7CFF]/20 text-[#F472B6] flex items-center justify-center shrink-0 shadow-md">
          <Headphones className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 text-left space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
            {task.title}
          </h3>
          <p className="text-xs text-[#91A8C5] leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      </div>

      {/* Bottom row: Category & Status button */}
      <div className="flex items-center justify-between gap-2 z-10 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B7CFF]">
          {task.category}
        </span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onActionClick?.(task, e);
          }}
        >
          <TaskStatusBadge status={task.status} />
        </div>
      </div>
    </div>
  );
};

export default FeaturedTaskCard;
