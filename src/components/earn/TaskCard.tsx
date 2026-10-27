import React from 'react';
import { motion } from 'motion/react';
import { Task, TaskCategory } from './types';
import { TaskRewardBadge } from './TaskRewardBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import { 
  Music, 
  UserCheck, 
  Users, 
  Compass, 
  Calendar, 
  Zap, 
  Share2, 
  Check, 
  Crown, 
  Clock 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onActionClick: (task: Task, e: React.MouseEvent) => void;
  showTimestamp?: boolean;
}

const CATEGORY_ACCENT: Record<TaskCategory, {
  containerBg: string;
  iconColor: string;
  borderColor: string;
  rewardColor: 'blue' | 'purple' | 'gold' | 'teal' | 'green';
}> = {
  Music: {
    containerBg: 'bg-[#9B7CFF]/15',
    iconColor: 'text-[#9B7CFF]',
    borderColor: 'border-[#9B7CFF]/25 hover:border-[#9B7CFF]/50',
    rewardColor: 'purple',
  },
  Daily: {
    containerBg: 'bg-[#FFC857]/15',
    iconColor: 'text-[#FFC857]',
    borderColor: 'border-[#FFC857]/25 hover:border-[#FFC857]/50',
    rewardColor: 'gold',
  },
  Community: {
    containerBg: 'bg-[#2DD4BF]/15',
    iconColor: 'text-[#2DD4BF]',
    borderColor: 'border-[#2DD4BF]/25 hover:border-[#2DD4BF]/50',
    rewardColor: 'teal',
  },
  Social: {
    containerBg: 'bg-[#229ED9]/15',
    iconColor: 'text-[#229ED9]',
    borderColor: 'border-[#229ED9]/25 hover:border-[#229ED9]/50',
    rewardColor: 'blue',
  },
  'All Tasks': {
    containerBg: 'bg-[#229ED9]/15',
    iconColor: 'text-[#229ED9]',
    borderColor: 'border-[#229ED9]/25 hover:border-[#229ED9]/50',
    rewardColor: 'blue',
  },
  History: {
    containerBg: 'bg-emerald-500/15',
    iconColor: 'text-[#34D399]',
    borderColor: 'border-emerald-500/30',
    rewardColor: 'green',
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  profile: UserCheck,
  community: Users,
  artist: Compass,
  daily: Calendar,
  zap: Zap,
  share: Share2,
  crown: Crown,
  check: Check,
  clock: Clock,
};

export const formatTaskTime = (isoString?: string): string => {
  if (!isoString) return 'Completed recently';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Completed just now';
  if (diffMins < 60) return `Completed ${diffMins}m ago`;
  if (diffHours < 24) return `Completed ${diffHours}h ago`;
  if (diffDays === 1) return 'Completed Yesterday';
  if (diffDays < 7) return `Completed ${diffDays}d ago`;
  return `Completed ${new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
};

export const ColorfulTaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskClick,
  onActionClick,
  showTimestamp = false,
}) => {
  const isCompleted = task.status === 'completed';
  const CategoryIcon = task.iconName ? ICON_MAP[task.iconName] || Music : Music;

  const accent = isCompleted
    ? {
        containerBg: 'bg-emerald-500/15',
        iconColor: 'text-[#34D399]',
        borderColor: 'border-emerald-500/30',
        rewardColor: 'green' as const,
      }
    : CATEGORY_ACCENT[task.category] || CATEGORY_ACCENT.Social;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onTaskClick(task)}
      className={`
        w-full p-3.5 rounded-2xl bg-[#111C30] border ${accent.borderColor}
        transition-all duration-200 flex items-center justify-between gap-3
        select-none cursor-pointer text-left relative overflow-hidden shadow-md
        ${isCompleted ? 'opacity-85' : ''}
      `}
    >
      {/* LEFT: COLORFUL CATEGORY ICON */}
      <div className={`w-10 h-10 rounded-full ${accent.containerBg} ${accent.iconColor} flex items-center justify-center shrink-0 shadow-sm`}>
        {isCompleted ? <Check className="w-5 h-5 text-[#34D399]" /> : <CategoryIcon className="w-5 h-5" />}
      </div>

      {/* CENTER: TITLE, DESCRIPTION, REWARD & TIMESTAMP */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate leading-snug">
            {task.title}
          </h4>
        </div>

        <p className="text-[11px] text-slate-400 font-normal line-clamp-1 leading-snug">
          {task.description}
        </p>

        {/* TIMESTAMP OR PROGRESS BAR */}
        {(showTimestamp || isCompleted) && task.completedAt ? (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#34D399] pt-0.5">
            <Clock className="w-3 h-3 text-[#34D399] shrink-0" />
            <span>{formatTaskTime(task.completedAt)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-0.5">
            <TaskRewardBadge
              reward={task.reward}
              size="sm"
              colorOverride={accent.rewardColor}
            />

            {task.progress !== undefined && task.total !== undefined && task.total > 0 && (
              <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#229ED9] to-[#9B7CFF] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (task.progress / task.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: ACTION BUTTON OR STATUS INDICATOR */}
      <div className="shrink-0 flex items-center justify-end pl-1">
        <TaskStatusBadge
          status={task.status}
          actionLabel={task.actionLabel}
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

export const TaskCard = ColorfulTaskCard;
export default ColorfulTaskCard;
