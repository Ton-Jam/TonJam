import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface TaskErrorStateProps {
  error?: string;
  onRetry: () => void;
}

export const TaskErrorState: React.FC<TaskErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center select-none">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 text-rose-400">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-sm font-black uppercase tracking-wider text-white">
        We Couldn't Load Your Tasks
      </h3>

      <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mt-1 mb-5">
        {error || 'A network error occurred while connecting to the tasks registry.'}
      </p>

      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-[#229ED9] hover:bg-[#1f8ec4] text-white rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-2 outline-none shadow-md shadow-[#229ED9]/20"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Retry Loading</span>
      </button>
    </div>
  );
};

export default TaskErrorState;
