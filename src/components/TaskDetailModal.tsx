import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { Task } from '@/pages/Tasks';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-background border border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${task.completed ? 'bg-green-500/10 text-green-500' : 'bg-blue-600/10 text-blue-500'}`}>
                {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{task.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {task.description}
            </p>

            {task.dueDate && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-2xl">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</p>
                  <p className="text-sm font-bold text-foreground">{task.dueDate}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reward</div>
              <div className="text-sm font-black text-foreground">{task.reward} + {task.points} XP</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetailModal;
