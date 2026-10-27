import React from 'react';
import { toast } from 'sonner';
import { TJ_COIN_ICON } from '@/constants';
import { Sparkles } from 'lucide-react';

interface TaskToastProps {
  taskTitle: string;
  rewardAmount: number | string;
  message?: string;
}

export const showTaskCompletionToast = ({
  taskTitle,
  rewardAmount,
  message = 'Reward credited to your balance.',
}: TaskToastProps) => {
  const formattedReward = String(rewardAmount).startsWith('+')
    ? rewardAmount
    : `+${rewardAmount} TJ`;

  toast.custom(
    (t) => (
      <div
        className={`
          w-full max-w-sm p-3.5 rounded-2xl bg-[#111C30] border border-[#229ED9]/40 
          shadow-xl shadow-[#080D1A]/80 text-white flex items-center gap-3.5 
          select-none transition-all duration-300 pointer-events-auto
        `}
      >
        {/* TJ COIN ICON WITH GLOW */}
        <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center shrink-0 p-1">
          <img
            src={TJ_COIN_ICON}
            alt="TJ Coin"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>

        {/* TEXT CONTENT */}
        <div className="flex-1 min-w-0 text-left space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#229ED9] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFC857]" />
              <span>Task Complete!</span>
            </span>
            <span className="text-xs font-mono font-black text-[#FFC857]">
              {formattedReward}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white tracking-tight truncate leading-tight">
            {taskTitle}
          </h4>

          <p className="text-[10px] text-slate-400 font-medium truncate">
            {message}
          </p>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-center',
    }
  );
};

export default showTaskCompletionToast;
