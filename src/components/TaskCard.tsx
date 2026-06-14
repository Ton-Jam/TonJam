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

  // Determine dynamic category icons
  const getIcon = () => {
    if (task.completed) return <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />;
    
    switch (task.type) {
      case 'daily':
        return <Clock3 className="w-5 h-5 text-amber-500" />;
      case 'referral':
      case 'social':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'onchain':
      case 'milestone':
      case 'achievement':
        return <Award className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-pink-400" />;
    }
  };

  const getRarityBadge = () => {
    if (!task.rarity) return null;
    const colors: Record<string, string> = {
      common: 'bg-neutral-500/10 text-neutral-400',
      rare: 'bg-blue-500/10 text-blue-400',
      epic: 'bg-purple-500/10 text-purple-400',
      legendary: 'bg-orange-500/10 text-orange-400',
    };
    return (
      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${colors[task.rarity] || 'bg-neutral-500/10 text-neutral-400'}`}>
        {task.rarity}
      </span>
    );
  };

  const getTypeBadge = () => {
    if (!task.type) return null;
    return (
      <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
        {task.type}
      </span>
    );
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
      className={`relative w-full rounded-none transition-all duration-300 select-none overflow-hidden cursor-pointer flex flex-col justify-between p-4 shadow-none ${
        task.claimed 
          ? 'bg-[#09132e]/50 opacity-65' 
          : task.completed
            ? 'bg-[#101a3b] hover:bg-[#16244f]'
            : 'bg-[#09132e] hover:bg-[#101a3b]'
      }`}
    >
      {/* Glow effects without border lines */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* Header: Type and Rarity */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getTypeBadge()}
          {getRarityBadge()}
        </div>
        
        <span className="text-[10px] font-mono font-bold text-muted-foreground/80 bg-background/40 px-2 py-0.5 rounded-full">
          {task.progress}/{task.total}
        </span>
      </div>

      {/* Main Content Info */}
      <div className="flex items-start gap-3.5 mb-4 flex-1">
        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-foreground/[0.03] hover:bg-foreground/[0.06] shrink-0 transition-colors">
          {getIcon()}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <h4 className="text-sm font-black text-foreground leading-snug tracking-tight">
            {task.title}
          </h4>
          <p className="text-[11px] text-muted-foreground/85 leading-normal">
            {task.description}
          </p>
        </div>
      </div>

      {/* Middle: Progress visualization */}
      {!task.completed && (
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Mission Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-foreground/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Footer: Bottom row with Rewards and CTA Button */}
      <div className="flex items-center justify-between gap-3 pt-3 bg-white/[0.01] rounded-xl px-2.5 py-2">
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground/50 font-black uppercase tracking-wider">Reward</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-black tracking-tight text-foreground">{task.reward}</span>
            <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
            <span className="text-[9px] text-blue-400 font-bold ml-1">+{task.points} XP</span>
          </div>
        </div>

        <div className="shrink-0">
          {task.claimed ? (
            <span className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest bg-foreground/[0.05] px-3 py-1.5 rounded-full inline-block leading-none">
              Claimed
            </span>
          ) : task.completed ? (
            <Button 
              size="sm"
              onClick={handleClaim}
              disabled={isClaiming}
              className="h-8 text-[10px] font-black uppercase tracking-widest px-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-all duration-200 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward'}
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleIncrement} 
                className="h-8 w-8 p-0 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full cursor-pointer shrink-0"
              >
                +1
              </Button>
              <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-3 py-2 rounded-full inline-block leading-none">
                Active
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
