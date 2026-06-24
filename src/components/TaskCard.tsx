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
      whileHover={{ y: -1 }}
      onClick={handleCardClick}
      className={`relative w-full rounded-xl transition-all duration-300 select-none overflow-hidden cursor-pointer flex flex-col justify-between p-3 border border-slate-800 ${
        task.claimed 
          ? 'bg-slate-900/50 opacity-65' 
          : task.completed
            ? 'bg-slate-900 border-emerald-500/20'
            : 'bg-slate-950 border-slate-800 hover:border-blue-500/30'
      }`}
    >
      {/* Header: Type and Rarity */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getTypeBadge()}
          {getRarityBadge()}
        </div>
        
        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
          {task.progress}/{task.total}
        </span>
      </div>

      {/* Main Content Info */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 shrink-0">
          {getIcon()}
        </div>

        <div className="space-y-0.5 flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-200 leading-snug tracking-tight">
            {task.title}
          </h4>
          <p className="text-[10px] text-slate-500 leading-tight">
            {task.description}
          </p>
        </div>
      </div>

      {/* Footer: Bottom row with Rewards and CTA Button */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">{task.reward}</span>
            <img src={TJ_COIN_ICON} alt="TJ" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
            <span className="text-[9px] text-blue-400 font-bold ml-1">+{task.points} XP</span>
        </div>

        <div className="shrink-0">
          {task.claimed ? (
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800 px-2 py-1 rounded inline-block">
              Claimed
            </span>
          ) : task.completed ? (
            <Button 
              size="sm"
              onClick={handleClaim}
              disabled={isClaiming}
              className="h-7 text-[9px] font-bold uppercase px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md cursor-pointer"
            >
              {isClaiming ? 'Claiming...' : 'Claim'}
            </Button>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
              Active
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
