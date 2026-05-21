import React, { useState } from 'react';
import { CheckCircle2, Zap, Sparkles, Trophy, Target } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Task } from '@/types';
import { TJ_COIN_ICON } from '@/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      onClaim(task.id);
      toast.success(`Successfully claimed ${task.reward}!`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
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

  const progressPercent = Math.min(100, (task.progress / task.total) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card 
        onClick={() => onClick(task)}
        className={`group transition-all duration-300 h-full flex flex-col cursor-pointer border-2 ${
          task.claimed 
            ? 'bg-muted/50 border-transparent opacity-80' 
            : task.completed
              ? 'border-primary/50 bg-primary/5 shadow-md'
              : 'hover:shadow-lg border-transparent bg-card'
        }`}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                    task.completed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}>
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <CardTitle className="text-sm font-bold uppercase tracking-tight">{task.title}</CardTitle>
            </div>
            
            {task.rarity && (
              <Badge variant={task.rarity === 'rare' ? 'default' : task.rarity === 'epic' ? 'secondary' : 'outline'} className="uppercase">
                {task.rarity}
              </Badge>
            )}
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <CardDescription className="text-xs text-muted-foreground">
            {task.description}
          </CardDescription>

          {!task.completed && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{task.progress} / {task.total}</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between border-t border-border mt-auto pt-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-foreground">{task.reward}</span>
            <span className="text-xs text-muted-foreground">+{task.points} pts</span>
          </div>

          <div className="flex items-center gap-2">
            {!task.completed && !task.claimed && (
              <Button size="sm" variant="outline" onClick={handleIncrement} className="h-8 text-xs">
                +1
              </Button>
            )}
            
            <Button 
                size="sm"
                onClick={handleClaim}
                disabled={isClaiming || !task.completed || task.claimed}
                className={`h-8 text-xs font-semibold uppercase tracking-wide px-4`}
            >
                {isClaiming ? 'Claiming...' : task.claimed ? 'Claimed' : task.completed ? 'Claim Reward' : 'In Progress'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TaskCard;

