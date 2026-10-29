import React from 'react';
import { CheckCircle2, Lock, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { TaskStatusType } from './types';

interface TaskStatusBadgeProps {
  status: TaskStatusType;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#34D399]/15 text-[#34D399]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    case 'claimable':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFC857]/20 text-[#FFC857] animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claim Reward</span>
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2E8CEB]/15 text-[#2E8CEB]">
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
        </span>
      );
    case 'locked':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/[0.06] text-slate-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Locked</span>
        </span>
      );
    case 'available':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2E8CEB] text-white hover:bg-[#2577c9] transition-colors">
          <span>Start</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      );
  }
};

export default TaskStatusBadge;
