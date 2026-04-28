import React, { useState } from 'react';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Task } from '@/types';
import { TJ_COIN_ICON } from '@/constants';

interface TaskCardProps {
  task: Task;
  onClaim: (id: string) => void;
  onToggle: (id: string, progress: number) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClaim, onToggle, onClick }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaiming || task.claimed || !task.completed) return;
    
    setIsClaiming(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      onClaim(task.id);
      toast.success(`Successfully claimed ${task.reward}!`, {
        description: `Your balance has been updated with ${task.reward}.`
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
    } catch (error: any) {
      toast.error("Failed to claim reward", {
        description: error.message || "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) return;
    const newProgress = Math.min(task.total, task.progress + 1);
    onToggle(task.id, newProgress);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) return;
    onToggle(task.id, task.total);
  };

  const progressPercent = Math.min(100, (task.progress / task.total) * 100);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for task: ${task.title}`}
      className={`relative group rounded-2xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        task.claimed 
          ? 'bg-neutral-100 dark:bg-neutral-900/40 opacity-70' 
          : task.completed
            ? 'bg-green-50 dark:bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.05)] border border-green-500/20'
            : 'bg-white dark:bg-muted/50 hover:shadow-xl border border-border shadow-sm'
      }`}
    >
      {/* Rarity Indicator */}
      <div className="absolute top-0 right-0 flex items-center gap-4 p-4">
        {task.rarity && task.rarity !== 'common' && (
          <div className={`px-4 py-4 rounded-lg text-[8px] font-black uppercase tracking-widest ${
            task.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
            task.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {task.rarity}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 mt-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
              task.completed ? 'bg-green-500/20 text-green-500' : 'bg-blue-600/20 text-blue-500'
            }`}>
              {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-tight transition-all ${task.completed ? 'text-green-600 dark:text-green-500/80' : 'text-zinc-800 dark:text-foreground'}`}>
                {task.title}
              </h3>
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mt-4">
                {task.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!task.completed && (
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-4">
              <span>Progress</span>
              <span>{task.progress} / {task.total}</span>
            </div>
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="h-full bg-blue-500 rounded-full relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              >
                {/* Animated shimmer effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  }}
                  className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Reward Section */}
        <div className="mt-4 pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Reward</span>
            <div className="flex items-center gap-4">
              <img src={TJ_COIN_ICON} className="w-4 h-4 object-contain" alt="" referrerPolicy="no-referrer" />
              <span className="text-sm font-black text-zinc-800 dark:text-white">{task.reward}</span>
              <span className="text-[10px] font-bold text-blue-500/60">+{task.points} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!task.claimed && !task.completed && (
              <button 
                onClick={handleIncrement}
                className="px-3 py-1.5 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-[9px] font-bold uppercase tracking-widest border border-border/50"
              >
                +1 Progress
              </button>
            )}
            
            <button 
              onClick={handleClaim}
              disabled={isClaiming || !task.completed || task.claimed}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2 ${
                task.claimed 
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 cursor-not-allowed'
                  : task.completed
                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-500/20' 
                    : 'bg-muted text-muted-foreground/40 cursor-not-allowed border border-border'
              }`}
            >
              {isClaiming ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing
                </>
              ) : task.claimed ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Claimed
                </>
              ) : task.completed ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  Claim Reward
                </>
              ) : (
                <>
                  Locked
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
