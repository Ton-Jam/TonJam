import React from 'react';

interface TaskProgressBarProps {
  current: number;
  total: number;
  showLabels?: boolean;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  current,
  total,
  showLabels = false,
}) => {
  const percent = Math.min(100, Math.round((current / Math.max(1, total)) * 100));

  return (
    <div className="w-full space-y-1">
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] text-[#91A8C5] font-medium">
          <span>Progress</span>
          <span className="font-mono text-slate-300">
            {current} / {total} ({percent}%)
          </span>
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2E8CEB] to-[#9B7CFF] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default TaskProgressBar;
