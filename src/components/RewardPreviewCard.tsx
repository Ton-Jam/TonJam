import React from "react";
import { Flame } from "lucide-react";
import { motion } from "motion/react";
import { TJ_COIN_ICON } from "@/constants";

interface RewardPreviewCardProps {
  completedTasks: number;
  totalTasks: number;
  balance: number;
  onViewTasks: () => void;
}

const RewardPreviewCard: React.FC<RewardPreviewCardProps> = ({
  completedTasks,
  totalTasks,
  balance,
  onViewTasks,
}) => {
  const percent = Math.min(100, Math.max(0, (completedTasks / totalTasks) * 100));

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl bg-gradient-to-br from-[#101A3B] to-[#0A113A]/90 p-5 relative overflow-hidden text-left border-none shadow-xl"
    >
      <div className="absolute top-[-40px] right-[-40px] w-28 h-28 bg-[#2BE08C]/12 rounded-full blur-[35px] pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2BE08C]/10 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-[#2BE08C] fill-[#2BE08C]/20" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Earn 250 TJ Today
            </h3>
            <p className="text-[10px] text-[#9AA0AE]">
              Keep alignment rewards streaming
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full shrink-0">
          <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" />
          <span className="text-[11px] font-black font-mono tracking-tight text-white">
            {balance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9AA0AE]">
          <span>Missions Completed</span>
          <span className="text-[#2BE08C]">{completedTasks} / {totalTasks} Complete</span>
        </div>
        <div className="w-full h-1.5 bg-[#050A24] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#2BE08C] to-[#00B4D8] rounded-full transition-all duration-500" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between gap-3">
        <span className="text-[10px] text-[#9AA0AE]">Next up: Stream 5 Tracks for +50 TJ</span>
        <button
          onClick={onViewTasks}
          className="h-8 bg-[#5B6BFF] hover:bg-[#4856ea] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none"
        >
          View Tasks
        </button>
      </div>
    </motion.div>
  );
};

export default RewardPreviewCard;
