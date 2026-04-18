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
          ? 'bg-neutral-900/40 opacity-50' 
          : task.completed
            ? 'bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.05)]'
            : 'bg-muted/50 hover:bg-foreground/[0.07]'
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
              <h3 className={`text-sm font-bold uppercase tracking-tight transition-all ${task.completed ? 'text-green-500/80' : 'text-foreground'}`}>
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
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Reward Section */}
        <div className="mt-4 pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Reward</span>
            <div className="flex items-center gap-4">
              <img src={TJ_COIN_ICON} className="w-4 h-4 object-contain" alt="" referrerPolicy="no-referrer" />
              <span className="text-sm font-black text-foreground">{task.reward}</span>
              <span className="text-[10px] font-bold text-blue-500/60">+{task.points} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {task.claimed ? (
              <div className="flex items-center gap-2 text-green-500/50 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Claimed
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {!task.completed && (
                  <button 
                    onClick={handleIncrement}
                    className="px-[12px] py-[6px] rounded-full bg-muted/50 hover:bg-muted text-muted-foreground/80 hover:text-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    +1 Progress
                  </button>
                )}
                <button 
                  onClick={task.completed ? handleClaim : handleComplete}
                  disabled={isClaiming}
                  className={`px-[15px] py-[7px] rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                    task.completed 
                      ? 'bg-green-500 hover:bg-green-400 text-background shadow-green-500/20' 
                      : 'bg-blue-600 hover:bg-blue-500 text-foreground shadow-blue-600/20'
                  }`}
                >
                  {isClaiming ? (
                    <>
                      <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Claiming...
                    </>
                  ) : task.completed ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Claim Reward
                    </>
                  ) : (
                    <>Complete</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
