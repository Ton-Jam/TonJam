import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

import { useAudio } from '@/contexts/AudioContext';
import { useTask } from '@/contexts/TaskContext';

import { Task, TaskCategory, TaskStatus } from '@/components/earn/types';
import EarnTJHeader from '@/components/earn/EarnTJHeader';
import TJBalanceCard from '@/components/earn/TJBalanceCard';
import TaskCategoryFilters from '@/components/earn/TaskCategoryPill';
import TaskProgressBar from '@/components/earn/TaskProgressBar';
import FeaturedTaskCard from '@/components/earn/FeaturedTaskCard';
import TaskCard from '@/components/earn/TaskCard';
import TaskDetailsSheet from '@/components/earn/TaskDetailsSheet';
import TaskSkeleton from '@/components/earn/TaskSkeleton';
import TaskEmptyState from '@/components/earn/TaskEmptyState';
import TaskErrorState from '@/components/earn/TaskErrorState';
import ListenerLevelCard from '@/components/earn/ListenerLevelCard';
import { reportTaskError } from '@/utils/taskErrorMonitor';
import { Info } from 'lucide-react';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAudio();
  const {
    tasks: tasksList,
    updateTaskProgress,
    claimTaskReward,
    isLoading,
    isSyncing,
    error,
  } = useTask();

  const [activeCategory, setActiveCategory] = useState<TaskCategory>('All Tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Real user balance
  const userBalance = userProfile?.tjBalance || 2450;

  // Compute daily completed tasks count
  const completedDailyCount = useMemo(() => {
    return tasksList.filter((t) => t.category === 'Daily' && t.status === 'completed').length;
  }, [tasksList]);

  const totalDailyCount = useMemo(() => {
    return tasksList.filter((t) => t.category === 'Daily').length || 3;
  }, [tasksList]);

  // Total completed tasks count
  const totalCompletedCount = useMemo(() => {
    return tasksList.filter((t) => t.status === 'completed').length;
  }, [tasksList]);

  // Featured task
  const featuredTask = useMemo(() => {
    return tasksList.find((t) => t.isFeatured) || tasksList[0];
  }, [tasksList]);

  // Category filtering
  const filteredTasks = useMemo(() => {
    if (activeCategory === 'History') {
      return tasksList
        .filter((t) => t.status === 'completed')
        .sort((a, b) => {
          const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return timeB - timeA;
        });
    }
    if (activeCategory === 'All Tasks') {
      return tasksList.filter((t) => !t.isFeatured);
    }
    return tasksList.filter((t) => t.category === activeCategory && !t.isFeatured);
  }, [tasksList, activeCategory]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const handleTaskAction = async (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      if (task.status === 'claimable') {
        const success = await claimTaskReward(task.id);
        if (success) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.7 },
            colors: ['#229ED9', '#0088CC', '#34D399', '#FFC857'],
          });
        }
        return;
      }

      if (task.status === 'completed') {
        toast.info('Task Completed', { description: 'You have already claimed this reward.' });
        return;
      }

      if (task.actionTarget) {
        navigate(task.actionTarget);
      } else {
        await updateTaskProgress(task.id, 1);
      }
    } catch (actionErr) {
      reportTaskError({
        eventType: 'TASK_STATUS_UPDATE_FAILED',
        taskId: task.id,
        taskTitle: task.title,
        fromStatus: task.status,
        error: actionErr,
        message: `Action execution failed on task "${task.title}"`,
        severity: 'error',
      });
      toast.error('Action Failed', {
        description: 'Unable to update task status right now. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-[#080D1A] text-white font-sans pb-32 relative">
      {/* SCREEN HEADER */}
      <EarnTJHeader onInfoClick={() => setShowInfoModal(true)} />

      {/* CONTENT WRAPPER */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-2 z-10 text-left">
        {isLoading ? (
          <TaskSkeleton />
        ) : error ? (
          <TaskErrorState error={error} onRetry={() => window.location.reload()} />
        ) : (
          <>
            {/* TASK CATEGORY FILTERS AT TOP */}
            <div className="pt-1">
              <TaskCategoryFilters
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                completedCount={totalCompletedCount}
              />
            </div>

            {/* TJ BALANCE CARD */}
            <TJBalanceCard
              balance={userBalance}
              completedTasksCount={completedDailyCount}
              totalTasksCount={totalDailyCount}
            />

            {/* LISTENER LEVEL PROGRESSION */}
            <ListenerLevelCard totalPoints={userBalance} />

            {/* DAILY PROGRESS BAR */}
            <TaskProgressBar
              completedCount={completedDailyCount}
              totalCount={totalDailyCount}
            />

            {/* FEATURED TASK */}
            {activeCategory === 'All Tasks' && featuredTask && (
              <div className="flex flex-col gap-2 pt-1">
                <FeaturedTaskCard
                  task={featuredTask}
                  onTaskClick={handleTaskClick}
                  onActionClick={handleTaskAction}
                />
              </div>
            )}

            {/* TASK LIST */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {activeCategory === 'History' ? 'Completed Tasks History' : activeCategory} ({filteredTasks.length})
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {isSyncing ? 'Syncing Firestore...' : 'Tap for details'}
                </span>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskCard
                          task={task}
                          onTaskClick={handleTaskClick}
                          onActionClick={handleTaskAction}
                          showTimestamp={activeCategory === 'History'}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <TaskEmptyState category={activeCategory} />
              )}
            </div>
          </>
        )}
      </div>

      {/* TASK DETAILS SHEET */}
      <TaskDetailsSheet
        task={selectedTask}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onActionClick={(task) => handleTaskAction(task)}
      />

      {/* ABOUT TJ REWARDS MODAL */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm rounded-2xl bg-[#111C30] p-5 flex flex-col gap-3 text-left shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-2 text-[#229ED9]">
                <Info className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  About TJ Rewards
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                TJ Points are in-app rewards synced directly with your Firestore user profile. Earn points by streaming music, exploring new artists, completing daily check-ins, and engaging with the TonJam community.
              </p>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[11px] font-bold text-[#229ED9]">Real-Time Sync</div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Your task progress and claimed rewards synchronize across devices in real time using TonJam Firestore listeners.
                </p>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer outline-none mt-1"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
