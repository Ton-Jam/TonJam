import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import {
  TonJamHeader,
  TJRewardsCard,
  TaskCategoryPill,
  FeaturedTaskCard,
  TaskCard,
  BottomSheet,
  EmptyState,
  ErrorState,
  SkeletonRow,
} from '../index';
import { UnifiedTask, TaskCategoryType } from '../types';
import { toast } from 'sonner';

interface MobileEarnTJScreenProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

const INITIAL_TASKS: UnifiedTask[] = [
  {
    id: 'task-feat-1',
    title: 'Stream 3 Genesis Music NFTs',
    description: 'Listen to 3 verified master edition tracks in the Genesis collection for at least 45 seconds each.',
    category: 'Music',
    reward: 250,
    status: 'in_progress',
    progress: { current: 2, total: 3 },
    isFeatured: true,
    iconType: 'music',
  },
  {
    id: 'task-1',
    title: 'Daily Check-In',
    description: 'Launch TonJam and connect to the decentralized audio stream to maintain your listening streak.',
    category: 'Daily',
    reward: 50,
    status: 'claimable',
    iconType: 'daily',
  },
  {
    id: 'task-2',
    title: 'Music Discovery Session',
    description: 'Listen to 5 different emerging indie electronic tracks from the Discover weekly curated playlist.',
    category: 'Music',
    reward: 120,
    status: 'in_progress',
    progress: { current: 3, total: 5 },
    iconType: 'music',
  },
  {
    id: 'task-3',
    title: 'Community Participation',
    description: 'Drop a constructive feedback comment or heart reaction in an active live JamSpace room.',
    category: 'Community',
    reward: 80,
    status: 'available',
    iconType: 'community',
  },
  {
    id: 'task-4',
    title: 'Complete Your Profile',
    description: 'Upload your listener avatar, write a bio, and link your Telegram account handle.',
    category: 'Profile',
    reward: 100,
    status: 'completed',
    completedAt: 'Yesterday',
    iconType: 'profile',
  },
  {
    id: 'task-5',
    title: 'Discover 3 New Artists',
    description: 'Follow 3 verified artists from the Trending Leaderboard to expand your Web3 feed.',
    category: 'Community',
    reward: 90,
    status: 'available',
    iconType: 'community',
  },
  {
    id: 'task-6',
    title: 'Exclusive Auction Watcher',
    description: 'Add a rare 1-of-1 master NFT auction to your watchlist to unlock market watcher bonus points.',
    category: 'Music',
    reward: 60,
    status: 'locked',
    iconType: 'music',
  },
];

export const MobileEarnTJScreen: React.FC<MobileEarnTJScreenProps> = ({
  onNavigate,
  onBack,
  showBack = false,
}) => {
  const [tasks, setTasks] = useState<UnifiedTask[]>(INITIAL_TASKS);
  const [balance, setBalance] = useState<number>(2450);
  const [activeCategory, setActiveCategory] = useState<TaskCategoryType>('All Tasks');
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'error'>('normal');

  // Daily statistics
  const completedDailyCount = useMemo(() => {
    return tasks.filter((t) => t.category === 'Daily' && t.status === 'completed').length;
  }, [tasks]);

  const totalDailyCount = useMemo(() => {
    return tasks.filter((t) => t.category === 'Daily').length || 2;
  }, [tasks]);

  // Featured task
  const featuredTask = useMemo(() => {
    return tasks.find((t) => t.isFeatured) || tasks[0];
  }, [tasks]);

  // Filter tasks
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

  const handleTaskAction = (task: UnifiedTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (task.status === 'claimable') {
      // Confetti celebratory explosion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2E8CEB', '#9B7CFF', '#FFC857', '#34D399'],
      });

      setBalance((prev) => prev + task.reward);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed', completedAt: 'Just now' } : t
        )
      );

      toast.success(`Claimed +${task.reward} TJ rewards!`);
      if (selectedTask?.id === task.id) {
        setIsSheetOpen(false);
      }
      return;
    }

    if (task.status === 'available') {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: 'in_progress', progress: { current: 1, total: 3 } }
            : t
        )
      );
      toast.info(`Started: ${task.title}`);
      return;
    }

    if (task.status === 'in_progress') {
      // Advance progress or complete
      if (task.progress && task.progress.current + 1 >= task.progress.total) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: 'claimable' } : t))
        );
        toast.success(`Task objective complete! Ready to claim.`);
      } else if (task.progress) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  progress: {
                    current: (t.progress?.current || 0) + 1,
                    total: t.progress?.total || 3,
                  },
                }
              : t
          )
        );
        toast.info(`Progress updated on ${task.title}`);
      }
      return;
    }

    if (task.status === 'locked') {
      toast.warning('This quest unlocks after reaching Listener Level 2');
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#080D1A] text-white select-none pb-24 text-left">
      {/* SCREEN HEADER */}
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
        {/* BALANCE CARD */}
        <TJRewardsCard
          balance={balance}
          completedTasksCount={completedDailyCount}
          totalTasksCount={totalDailyCount}
          dailyPointsEarned={150}
        />

        {/* CATEGORY FILTER PILLS */}
        <TaskCategoryPill
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          counts={{
            'All Tasks': tasks.length - 1,
            Daily: tasks.filter((t) => t.category === 'Daily' && !t.isFeatured).length,
            Music: tasks.filter((t) => t.category === 'Music' && !t.isFeatured).length,
            Community: tasks.filter((t) => t.category === 'Community' && !t.isFeatured).length,
          }}
        />

        {/* FEATURED MISSION */}
        {activeCategory === 'All Tasks' && featuredTask && (
          <div className="space-y-1 pt-1">
            <FeaturedTaskCard
              task={featuredTask}
              onTaskClick={handleTaskClick}
              onActionClick={handleTaskAction}
            />
          </div>
        )}

        {/* TASK FEED BODY */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#91A8C5]">
              {activeCategory} ({filteredTasks.length})
            </span>
          </div>

          {simulatedState === 'loading' ? (
            <SkeletonRow count={4} />
          ) : simulatedState === 'error' ? (
            <ErrorState
              title="Failed to load tasks"
              message="Check your network connection and retry."
              onRetry={() => setSimulatedState('normal')}
            />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              heading="No active tasks in this category"
              supportingText="Check back tomorrow for fresh daily and music discovery rewards."
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

      {/* TASK DETAILS BOTTOM SHEET */}
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
                : selectedTask.status === 'in_progress'
                ? 'Continue Objective'
                : 'Start Mission'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MobileEarnTJScreen;
