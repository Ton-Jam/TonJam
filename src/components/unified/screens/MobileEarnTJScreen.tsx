import React, { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import {
  TonJamHeader,
  TJRewardsCard,
  TaskCategoryPill,
  FeaturedTaskCard,
  TaskCard,
  BottomSheet,
  EmptyState,
} from '../index';
import { UnifiedTask, TaskCategoryType } from '../types';
import { useTask } from '@/contexts/TaskContext';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';

interface MobileEarnTJScreenProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const MobileEarnTJScreen: React.FC<MobileEarnTJScreenProps> = ({
  onBack,
  showBack = false,
}) => {
  const { tasks: contextTasks, claimTaskReward } = useTask();
  const { userProfile } = useAudio();

  const [activeCategory, setActiveCategory] = useState<TaskCategoryType>('All Tasks');
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const tasks = useMemo<UnifiedTask[]>(() => {
    return contextTasks.map((t, index) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: (t.category === 'Music' ? 'Music' : (t.category === 'Community' || t.category === 'Social') ? 'Community' : 'Daily') as UnifiedTask['category'],
      reward: t.rewardAmount || 0,
      status: t.status,
      progress: t.total ? { current: t.progress || 0, total: t.total } : undefined,
      isFeatured: t.isFeatured ?? index === 0,
      iconType: (t.iconName === 'music' ? 'music' : t.iconName === 'community' ? 'community' : t.iconName === 'profile' ? 'profile' : 'daily') as UnifiedTask['iconType'],
    }));
  }, [contextTasks]);

  const balance = Number(userProfile?.tjBalance ?? userProfile?.jamBalance ?? 0);

  const dailyPointsEarned = useMemo(() => {
    return tasks
      .filter((t) => t.category === 'Daily' && t.status === 'completed')
      .reduce((sum, t) => sum + t.reward, 0);
  }, [tasks]);

  const completedDailyCount = useMemo(() => {
    return tasks.filter((t) => t.category === 'Daily' && t.status === 'completed').length;
  }, [tasks]);

  const totalDailyCount = useMemo(() => {
    return tasks.filter((t) => t.category === 'Daily').length;
  }, [tasks]);

  const featuredTask = useMemo(() => {
    return tasks.find((t) => t.isFeatured) || tasks[0];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.isFeatured) return false;
      if (activeCategory === 'All Tasks') return true;
      return t.category === activeCategory;
    });
  }, [tasks, activeCategory]);

  const handleTaskClick = (task: UnifiedTask) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const handleTaskAction = async (task: UnifiedTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (task.status === 'claimable') {
      await claimTaskReward(task.id);
      if (selectedTask?.id === task.id) {
        setIsSheetOpen(false);
      }
      return;
    }

    toast.info(task.description || 'Complete objective in app to unlock claim');
  };

  return (
    <div className="w-full flex flex-col bg-[#080D1A] text-white select-none pb-24 text-left">
      <TonJamHeader
        title="Earn TJ"
        subtitle="Complete tasks. Earn rewards."
        showBack={showBack}
        onBack={onBack}
        rightAction={
          <button
            type="button"
            onClick={() => toast.info('TJ Points can be used for exclusive NFT mint whitelists & live room tipping')}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Rewards info"
          >
            <Info className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 space-y-4 pt-1">
        <TJRewardsCard
          balance={balance}
          completedTasksCount={completedDailyCount}
          totalTasksCount={totalDailyCount}
          dailyPointsEarned={dailyPointsEarned}
        />

        <TaskCategoryPill
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          counts={{
            'All Tasks': Math.max(0, tasks.length - (featuredTask ? 1 : 0)),
            Daily: tasks.filter((t) => t.category === 'Daily' && !t.isFeatured).length,
            Music: tasks.filter((t) => t.category === 'Music' && !t.isFeatured).length,
            Community: tasks.filter((t) => t.category === 'Community' && !t.isFeatured).length,
          }}
        />

        {activeCategory === 'All Tasks' && featuredTask && (
          <div className="space-y-1 pt-1">
            <FeaturedTaskCard
              task={featuredTask}
              onTaskClick={handleTaskClick}
              onActionClick={handleTaskAction}
            />
          </div>
        )}

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#91A8C5]">
              {activeCategory} ({filteredTasks.length})
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              heading="No active tasks in this category"
              supportingText="Check back later for new missions and rewards."
              buttonText="View All Tasks"
              onAction={() => setActiveCategory('All Tasks')}
            />
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                onActionClick={handleTaskAction}
              />
            ))
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={selectedTask?.title || 'Task Details'}
        subtitle={`${selectedTask?.category || 'Mission'} · Reward Details`}
      >
        {selectedTask && (
          <div className="space-y-4 pt-1 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] space-y-2">
              <span className="text-xs font-bold text-[#91A8C5] uppercase tracking-wider">
                Mission Description
              </span>
              <p className="text-sm text-[#F5F7FB] leading-relaxed">
                {selectedTask.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] space-y-1">
                <span className="text-xs text-[#91A8C5]">Reward Payout</span>
                <div className="text-base font-bold text-[#FFC857] font-mono">
                  +{selectedTask.reward} TJ
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] space-y-1">
                <span className="text-xs text-[#91A8C5]">Current Status</span>
                <div className="text-sm font-bold text-[#2E8CEB] capitalize">
                  {selectedTask.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            {selectedTask.progress && (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Objective Progress</span>
                  <span className="font-mono text-[#2E8CEB] font-bold">
                    {selectedTask.progress.current} / {selectedTask.progress.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2E8CEB] to-[#9B7CFF] rounded-full transition-all"
                    style={{
                      width: `${(selectedTask.progress.current / selectedTask.progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleTaskAction(selectedTask)}
              className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md ${
                selectedTask.status === 'claimable'
                  ? 'bg-[#FFC857] text-black font-black hover:bg-yellow-400 active:scale-95'
                  : selectedTask.status === 'completed'
                  ? 'bg-[#34D399]/20 text-[#34D399] pointer-events-none'
                  : 'bg-[#2E8CEB] hover:bg-[#2577c9] active:scale-95'
              }`}
            >
              {selectedTask.status === 'claimable'
                ? `Claim +${selectedTask.reward} TJ Rewards`
                : selectedTask.status === 'completed'
                ? 'Completed'
                : 'In Progress'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MobileEarnTJScreen;
