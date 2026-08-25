import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { TJ_COIN_ICON } from "@/constants";

export const EarnTJSection: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, tasks } = useAudio();

  const realTasks = tasks || [];
  const completedCount = realTasks.filter(t => t.completed).length;
  const totalCount = realTasks.length || 11;
  const nextUpTask = realTasks.find(t => !t.completed) || { title: "Complete all daily missions", reward: "Bonus TJ" };
  const dailyEarnable = realTasks.filter(t => !t.completed).reduce((acc, current) => {
    const pts = current.points || 50; 
    return acc + pts;
  }, 0);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full text-left rounded-2xl bg-zinc-950 p-4 sm:p-5 relative overflow-hidden border-none"
    >
      {/* Subtle green aura */}
      <div className="absolute top-[20px] right-[-20px] w-28 h-28 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white leading-tight">
              Earn up to {dailyEarnable > 0 ? dailyEarnable : 250} TJ Today
            </h3>
            <p className="text-xs text-zinc-400">
              Keep daily alignment rewards streaming
            </p>
          </div>
        </div>

        {/* Live Coins Balance */}
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full shrink-0">
          <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" />
          <span className="text-xs font-mono font-black text-white">
            {parseFloat(String(userProfile?.jamBalance || '0')).toLocaleString()}
          </span>
          <span className="text-[9px] font-black text-zinc-400 ml-0.5">JAM</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-zinc-400">
          <span>Missions Completed</span>
          <span className="text-emerald-400">{completedCount} / {totalCount} Complete</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full transition-all duration-500" 
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between gap-3 relative z-10">
        <span className="text-xs text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
          Next: <strong className="text-white">{nextUpTask.title}</strong> ({nextUpTask.reward})
        </span>
        <Button
          size="sm"
          onClick={() => navigate("/tasks")}
          className="h-8 bg-primary hover:bg-primary/90 text-black font-black text-[10px] uppercase tracking-widest px-4 rounded-full border-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          View Tasks <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>
    </motion.section>
  );
};

export default EarnTJSection;
