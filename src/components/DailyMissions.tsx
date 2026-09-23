import React from 'react';
import { DailyMission } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TJ_COIN_ICON } from '@/constants';
import { Check, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DailyMissionsProps {
  missions?: DailyMission[];
  isLoading?: boolean;
  timeUntilReset?: string;
  className?: string;
  title?: string;
  onMissionClick?: (mission: DailyMission) => void;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  missions = [],
  isLoading = false,
  timeUntilReset,
  className,
  title = 'Daily Missions',
  onMissionClick,
}) => {
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-3", className)}>
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-32 bg-zinc-800/80 rounded" />
          <Skeleton className="h-4 w-20 bg-zinc-800/80 rounded" />
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface/80 space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-44 bg-zinc-800/80 rounded" />
                  <Skeleton className="h-3 w-56 bg-zinc-800/60 rounded" />
                </div>
                <Skeleton className="h-5 w-16 bg-zinc-800/80 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-12 bg-zinc-800/60 rounded" />
                <Skeleton className="h-3 w-16 bg-zinc-800/60 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full bg-zinc-800/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className={cn("w-full space-y-3", className)}>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="p-6 text-center rounded-xl bg-surface space-y-1">
          <p className="text-xs font-semibold text-text-primary">
            No daily missions available
          </p>
          <p className="text-[11px] text-text-muted">
            Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <span>{title}</span>
        </h3>
        {timeUntilReset && (
          <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>Resets in {timeUntilReset}</span>
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {missions.map((mission) => {
          // Safe progress calculation clamped between 0 and 100%
          const rawTarget = typeof mission.target === 'number' && !isNaN(mission.target) ? mission.target : 1;
          const safeTarget = rawTarget > 0 ? rawTarget : 1;
          const rawProgress = typeof mission.progress === 'number' && !isNaN(mission.progress) ? mission.progress : 0;
          const safeProgress = Math.max(0, Math.min(rawProgress, safeTarget));
          const isCompleted = Boolean(mission.completed || rawProgress >= safeTarget);
          const progressPercent = Math.min(100, Math.max(0, Math.round((safeProgress / safeTarget) * 100)));
          const safeReward = typeof mission.reward === 'number' && !isNaN(mission.reward) ? mission.reward : 0;

          return (
            <div
              key={mission.id}
              onClick={() => onMissionClick?.(mission)}
              className={cn(
                "p-3.5 sm:p-4 rounded-xl transition-all relative overflow-hidden select-none",
                isCompleted
                  ? "bg-surface/90"
                  : "bg-surface hover:bg-hover",
                onMissionClick ? "cursor-pointer" : ""
              )}
            >
              {/* Top Row: Mission Title + Reward / Completion Status */}
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary leading-tight break-words">
                    {mission.title}
                  </h4>
                  {mission.description && (
                    <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed line-clamp-2">
                      {mission.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start">
                  {/* TJ Reward Amount */}
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <img
                      src={TJ_COIN_ICON}
                      alt="TJ"
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>+{safeReward} TJ</span>
                  </span>

                  {/* Completion indicator */}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 text-success stroke-[3]" />
                      <span className="hidden xs:inline">Completed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Progress Counter & Percentage */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-text-muted pt-1 mb-1.5">
                <span className="font-mono text-text-primary font-bold">
                  {safeProgress} / {safeTarget}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {progressPercent}%
                </span>
              </div>

              {/* Bottom Row: Clamped Progress Bar */}
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted
                      ? "bg-success"
                      : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;
