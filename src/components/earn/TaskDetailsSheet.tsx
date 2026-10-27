import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, CATEGORY_COLORS } from './types';
import { TaskRewardBadge } from './TaskRewardBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import { X, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface TaskDetailsSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onActionClick: (task: Task) => void;
}

export const TaskDetailsSheet: React.FC<TaskDetailsSheetProps> = ({
  task,
  isOpen,
  onClose,
  onActionClick,
}) => {
  if (!task) return null;

  const categoryTheme = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Social;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* BOTTOM SHEET CONTAINER */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-[#111C30] border-t border-white/10 p-5 sm:p-6 flex flex-col gap-4 text-left shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* DRAG HANDLE */}
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto shrink-0 mb-1" />

            {/* HEADER ROW */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 pr-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${categoryTheme.textColor}`}>
                  {task.category} Task
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {task.title}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* REWARD BADGE ROW */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFC857]" />
                <span className="text-xs font-bold text-slate-300">Reward Pool</span>
              </div>
              <TaskRewardBadge reward={task.reward} size="lg" colorOverride={task.isFeatured ? 'pink' : task.category === 'Music' ? 'purple' : task.category === 'Daily' ? 'gold' : task.category === 'Community' ? 'teal' : 'blue'} />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Task Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {task.description}
              </p>
            </div>

            {/* ELIGIBILITY & PREREQUISITES */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#229ED9]" />
                <span>Requirements & Rules</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {task.eligibility || 'Open to all registered TonJam listeners and music NFT collectors. Complete the action to claim your TJ rewards.'}
              </p>
              {task.prerequisite && (
                <div className="text-[11px] font-semibold text-[#FFC857] flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Prerequisite: {task.prerequisite}</span>
                </div>
              )}
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <div className="pt-2">
              <TaskStatusBadge
                status={task.status}
                actionLabel={task.actionLabel || 'Start Task'}
                onAction={() => {
                  onActionClick(task);
                  onClose();
                }}
                progress={task.progress}
                total={task.total}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsSheet;
