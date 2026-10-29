import React from 'react';
import { Music, Calendar, Users, User, Star, Check } from 'lucide-react';
import { UnifiedTask } from './types';
import TaskRewardBadge from './TaskRewardBadge';
import TaskStatusBadge from './TaskStatusBadge';
import TaskProgressBar from './TaskProgressBar';

interface TaskCardProps {
  task: UnifiedTask;
  onTaskClick?: (task: UnifiedTask) => void;
  onActionClick?: (task: UnifiedTask, e: React.MouseEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskClick,
  onActionClick,
}) => {
  // Category visual color mapping
  const getCategoryStyles = () => {
    if (task.status === 'completed') {
      return {
        icon: Check,
        bg: 'bg-[#34D399]/15',
        color: 'text-[#34D399]',
        badgeColor: 'gold' as const,
      };
    }

    switch (task.category) {
      case 'Music':
        return {
          icon: Music,
          bg: 'bg-[#9B7CFF]/15',
          color: 'text-[#9B7CFF]',
          badgeColor: 'purple' as const,
        };
      case 'Daily':
        return {
          icon: Calendar,
          bg: 'bg-[#FFC857]/15',
          color: 'text-[#FFC857]',
          badgeColor: 'gold' as const,
        };
      case 'Community':
        return {
          icon: Users,
          bg: 'bg-[#2DD4BF]/15',
          color: 'text-[#2DD4BF]',
          badgeColor: 'blue' as const,
        };
      case 'Profile':
      default:
        return {
          icon: User,
          bg: 'bg-[#2E8CEB]/15',
          color: 'text-[#2E8CEB]',
          badgeColor: 'blue' as const,
        };
    }
  };

  const styles = getCategoryStyles();
  const Icon = styles.icon;

  return (
    <div
      onClick={() => onTaskClick?.(task)}
      className="w-full rounded-2xl bg-[#111C30] hover:bg-[#14223b] p-4 flex flex-col gap-3 shadow-sm select-none cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.color} flex items-center justify-center shrink-0 mt-0.5`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#91A8C5]">
                {task.category}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FB] truncate mt-0.5">
              {task.title}
            </h4>
            <p className="text-xs text-[#91A8C5] line-clamp-2 mt-0.5 leading-relaxed">
              {task.description}
            </p>
          </div>
        </div>

        <TaskRewardBadge
          reward={task.reward}
          colorOverride={styles.badgeColor}
        />
      </div>

      {/* Progress bar if in progress */}
      {task.progress && task.status === 'in_progress' && (
        <div className="pt-1">
          <TaskProgressBar
            current={task.progress.current}
            total={task.progress.total}
            showLabels={true}
          />
        </div>
      )}

      {/* Bottom Action / Status */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#91A8C5]">
          {task.status === 'completed'
            ? 'Completed'
            : task.status === 'claimable'
            ? 'Ready to claim'
            : task.status === 'in_progress'
            ? 'In Progress'
            : 'Available'}
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

export default TaskCard;
