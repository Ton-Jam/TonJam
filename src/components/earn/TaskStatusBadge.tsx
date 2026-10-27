import React from 'react';
import { TaskStatus } from './types';
import { Check, Lock, Sparkles, ArrowRight } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  actionLabel?: string;
  onAction?: (e: React.MouseEvent) => void;
  progress?: number;
  total?: number;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  actionLabel,
  onAction,
  progress,
  total,
}) => {
  switch (status) {
    case 'completed':
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#34D399] text-xs font-bold shrink-0">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>Completed</span>
        </div>
      );

    case 'claimable':
      return (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 active:scale-95 transition-all duration-200 cursor-pointer outline-none shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-950 shrink-0 animate-pulse" />
          <span>Claim TJ</span>
        </button>
      );

    case 'in_progress':
      return (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] border border-[#229ED9]/30 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all duration-200 cursor-pointer outline-none shrink-0"
        >
          {progress !== undefined && total !== undefined ? (
            <span>{progress}/{total}</span>
          ) : (
            <span>Continue</span>
          )}
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>
      );

    case 'locked':
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-500 text-xs font-semibold shrink-0">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Locked</span>
        </div>
      );

    case 'available':
    default:
      return (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#229ED9] hover:bg-[#1f8ec4] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#229ED9]/20 active:scale-95 transition-all duration-200 cursor-pointer outline-none shrink-0"
        >
          <span>{actionLabel || 'Start'}</span>
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>
      );
  }
};

export default TaskStatusBadge;
