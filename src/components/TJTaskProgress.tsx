import React from 'react';
import { DailyMission } from '@/types';
import { CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface TJTaskProgressProps {
  missions?: DailyMission[];
  completedCount?: number;
  totalCount?: number;
  isLoading?: boolean;
  className?: string;
  showCardWrapper?: boolean;
}

export const TJTaskProgress: React.FC<TJTaskProgressProps> = ({
  missions,
  completedCount: propCompletedCount,
  totalCount: propTotalCount,
  isLoading = false,
  className,
  showCardWrapper = true,
}) => {
  // 1. Loading State: Render subtle skeleton without flashing 0%
  if (isLoading) {
    return (
      <div
        className={cn(
          showCardWrapper
            ? "p-4 sm:p-5 rounded-card bg-surface shadow-lg shadow-black/20"
            : "w-full",
          "space-y-3",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 bg-white/10 rounded" />
          <Skeleton className="h-4 w-20 bg-white/10 rounded" />
        </div>
        <Skeleton className="h-2.5 w-full bg-white/10 rounded-full" />
        <Skeleton className="h-3 w-36 bg-white/5 rounded" />
      </div>
    );
  }

  // 2. Safe Dynamic Calculation from actual available daily tasks
  const availableMissions = Array.isArray(missions) ? missions : undefined;
  const totalAvailableDailyTasks = availableMissions
    ? availableMissions.length
    : typeof propTotalCount === 'number' && !isNaN(propTotalCount) && propTotalCount >= 0
    ? propTotalCount
    : 0;

  const completedDailyTasks = availableMissions
    ? availableMissions.filter((m) =>
        Boolean(
          m.completed ||
            (typeof m.progress === 'number' &&
              typeof m.target === 'number' &&
              m.target > 0 &&
              m.progress >= m.target)
        )
      ).length
    : typeof propCompletedCount === 'number' && !isNaN(propCompletedCount) && propCompletedCount >= 0
    ? propCompletedCount
    : 0;

  // 3. Empty State: No daily tasks available
  if (totalAvailableDailyTasks === 0) {
    return (
      <div
        className={cn(
          showCardWrapper
            ? "p-4 sm:p-5 rounded-card bg-surface shadow-lg shadow-black/20"
            : "w-full",
          "space-y-2 text-left",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
            Daily Progress
          </h4>
        </div>
        <p className="text-xs text-text-muted">
          No daily tasks available
        </p>
      </div>
    );
  }

  // 4. Clamped Percentage Calculation: [0, 100]
  const clampedCompleted = Math.max(0, Math.min(completedDailyTasks, totalAvailableDailyTasks));
  const rawPercentage = (clampedCompleted / totalAvailableDailyTasks) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
  const isAllCompleted = clampedCompleted === totalAvailableDailyTasks && totalAvailableDailyTasks > 0;

  const content = (
    <div className="space-y-2.5 text-left select-none">
      {/* Top Header Row: Label & Status Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isAllCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Trophy className="w-4 h-4 text-[#0098EA] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
            Daily Progress
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "text-xs sm:text-sm font-black font-mono tracking-tight",
              isAllCompleted ? "text-emerald-400" : "text-[#0098EA]"
            )}
          >
            {clampedCompleted}/{totalAvailableDailyTasks} · {progressPercentage}%
          </span>
          {isAllCompleted && (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
          )}
        </div>
      </div>

      {/* Progress Track & Fill Bar */}
      <div
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Daily TJ task completion progress"
        className="w-full h-2.5 sm:h-3 rounded-full bg-white/[0.08] overflow-hidden p-0.5"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-sm",
            isAllCompleted
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30"
              : "bg-gradient-to-r from-[#0098EA] to-[#00B4D8] shadow-cyan-500/30"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Bottom Subtitle / Completion helper */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-text-muted">
        <span>
          {isAllCompleted
            ? "All daily tasks completed! Great job."
            : `${clampedCompleted} of ${totalAvailableDailyTasks} tasks completed`}
        </span>
        <span className="font-mono text-[10px]">
          {isAllCompleted ? "100%" : `${totalAvailableDailyTasks - clampedCompleted} remaining`}
        </span>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={cn("w-full", className)}>{content}</div>;
  }

  return (
    <div
      className={cn(
        "p-4 sm:p-5 rounded-card bg-surface shadow-lg shadow-black/20 relative overflow-hidden",
        isAllCompleted && "bg-gradient-to-b from-emerald-950/20 to-surface",
        className
      )}
    >
      {content}
    </div>
  );
};

export default TJTaskProgress;
