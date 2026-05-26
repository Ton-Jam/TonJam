import React, { useState } from 'react';
import { CheckCircle2, Trophy, Clock3, Gift, Globe, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Task } from '@/types';
import { TJ_COIN_ICON } from '@/constants';
import { Button } from '@/components/ui/button';

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onClaim(task.id);
      toast.success(`Successfully claimed ${task.reward} TJ!`);
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
    } catch (error: any) {
      toast.error("Failed to claim reward");
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

  const handleCardClick = () => {
    onClick(task);
    if ((task.type === 'social' || task.type === 'achievement' || task.type === 'referral') && task.link) {
      window.open(task.link, '_blank');
      // Optimistically complete social/referral link tasks when clicked
      if (!task.completed) {
        onToggle(task.id, task.total);
      }
    }
  };

  const progressPercent = Math.min(100, (task.progress / task.total) * 100);

  // Determine dynamic category icons based on task type or title content
  const getIcon = () => {
    if (task.completed) return <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />;
    
    switch (task.type) {
      case 'daily':
        return <Clock3 className="w-4 h-4 text-amber-500" />;
      case 'referral':
      case 'social':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'onchain':
      case 'milestone':
      case 'achievement':
        return <Award className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  // Rarity styling helpers without border lines
  const getRarityBadge = () => {
    if (!task.rarity) return null;
    const colors: Record<string, string> = {
      common: 'bg-neutral-500/10 text-neutral-400',
      rare: 'bg-blue-500/10 text-blue-400',
      epic: 'bg-purple-500/10 text-purple-400',
      legendary: 'bg-orange-500/10 text-orange-400',
    };
    return (
      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${colors[task.rarity] || 'bg-neutral-500/10 text-neutral-400'}`}>
        {task.rarity}
      </span>
    );
  };

  return (
    <motion.div
      layout
      onClick={handleCardClick}
      className={`relative w-full rounded-xl transition-all duration-200 select-none overflow-hidden cursor-pointer ${
        task.claimed 
          ? 'bg-foreground/[0.01] opacity-65' 
          : task.completed
            ? 'bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]'
            : 'bg-foreground/[0.02] hover:bg-foreground/[0.04]'
      }`}
    >
      <div className="p-3 flex items-center justify-between gap-3">
        {/* Left Side: Category Icon and Descriptive Details */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/[0.03] shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-foreground leading-snug tracking-tight truncate max-w-[160px] sm:max-w-none">
                {task.title}
              </h4>
              {getRarityBadge()}
              {!task.completed && (
                <span className="text-[9px] font-bold text-muted-foreground ml-auto pr-1 shrink-0 bg-background/30 px-1.5 py-0.2 rounded">
                  {task.progress}/{task.total}
                </span>
              )}
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-normal truncate pr-2">
              {task.description}
            </p>

            {/* Micro progress line inside the row */}
            {!task.completed && (
              <div className="w-full h-1 bg-foreground/[0.03] rounded-full overflow-hidden mt-1 max-w-[200px]">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Rewards & Dynamic Claim Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Reward label */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-foreground">{task.reward}</span>
              <img src={TJ_COIN_ICON} alt="TJ" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[8px] text-muted-foreground font-medium uppercase">+{task.points} xp</span>
          </div>

          {/* Inline compact action button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!task.completed && !task.claimed && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleIncrement} 
                className="h-7 w-7 p-0 text-xs text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full"
              >
                +1
              </Button>
            )}
            
            {task.claimed ? (
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider px-2 py-1">
                Claimed
              </span>
            ) : task.completed ? (
              <Button 
                size="sm"
                onClick={handleClaim}
                disabled={isClaiming}
                className="h-7 text-[10px] font-black uppercase tracking-widest px-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/15"
              >
                {isClaiming ? 'Claiming' : 'Claim'}
              </Button>
            ) : (
              <span className="text-[8px] font-black uppercase tracking-widest bg-foreground/[0.04] text-muted-foreground/60 px-2.5 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
