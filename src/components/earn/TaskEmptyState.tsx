import React from 'react';
import { Inbox, Sparkles } from 'lucide-react';

interface TaskEmptyStateProps {
  category?: string;
}

export const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({ category }) => {
  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center select-none">
      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-3 text-slate-400">
        <Inbox className="w-7 h-7" />
      </div>

      <h3 className="text-sm font-black uppercase tracking-wider text-white">
        No Tasks Available
      </h3>

      <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mt-1">
        {category && category !== 'All Tasks'
          ? `There are no active tasks available in "${category}" right now.`
          : 'No tasks available right now. Check back soon for new reward opportunities!'}
      </p>
    </div>
  );
};

export default TaskEmptyState;
