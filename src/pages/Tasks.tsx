import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Zap, 
  Trophy, 
  Star, 
  Gift, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Target,
  Info,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import SectionHeader from '@/components/SectionHeader';
import { useAudio } from '@/context/AudioContext';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';
import StakingPanel from '@/components/StakingPanel';
import Leaderboard from '@/components/Leaderboard';
import BuyTJModal from '@/components/BuyTJModal';
import ReferralPanel from '@/components/ReferralPanel';
import TaskDetailModal from '@/components/TaskDetailModal';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  points: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'achievement' | 'milestone' | 'seasonal';
  progress: number;
  total: number;
  dueDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  priority?: 'high' | 'medium' | 'low';
}

type TaskTab = 'all' | 'daily' | 'achievements' | 'milestones' | 'staking' | 'leaderboard' | 'referrals';

const TaskCard: React.FC<{ 
  task: Task; 
  onClaim: (id: string) => void;
  onToggle: (id: string, progress: number) => void;
  onClick: (task: Task) => void;
}> = ({ task, onClaim, onToggle, onClick }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaiming || task.claimed || !task.completed) return;
    
    setIsClaiming(true);
    try {
      // Simulate network delay and potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance of failure for demonstration
          if (Math.random() < 0.1) {
            reject(new Error("Network connection lost. Please check your internet and try again."));
          } else {
            resolve(true);
          }
        }, 1200);
      });
      
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
        action: {
          label: "Retry",
          onClick: () => handleClaim(e)
        }
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

  const rarityColors = {
    common: 'text-muted-foreground',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400'
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
            {task.completed && !task.claimed ? (
              <button 
                onClick={handleClaim}
                disabled={isClaiming}
                className="px-[15px] py-[7px] rounded-full bg-green-500 hover:bg-green-400 text-background text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isClaiming ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Claim Reward
                  </>
                )}
              </button>
            ) : task.claimed ? (
              <div className="flex items-center gap-2 text-green-500/50 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Claimed
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleIncrement}
                  className="px-[15px] py-[7px] rounded-full bg-muted/50 hover:bg-muted text-muted-foreground/80 hover:text-foreground transition-all text-[11px] font-bold uppercase tracking-widest"
                >
                  +1 Progress
                </button>
                <button 
                  onClick={handleComplete}
                  className="px-[15px] py-[7px] rounded-full bg-blue-600 hover:bg-blue-500 text-foreground transition-all text-[11px] font-bold uppercase tracking-widest"
                >
                  Complete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Tasks: React.FC = () => {
  const { addNotification, tasks, updateTaskProgress, claimTaskReward } = useAudio();
  const safeTasks = tasks || [];
  const [activeTab, setActiveTab] = useState<TaskTab>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userBalance, setUserBalance] = useState(1240);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const stats = useMemo(() => {
    const safeTasks = tasks || [];
    const completed = safeTasks.filter(t => t.completed).length;
    const total = safeTasks.length;
    const dailyCompleted = safeTasks.filter(t => t.type === 'daily' && t.completed).length;
    const dailyTotal = safeTasks.filter(t => t.type === 'daily').length;
    
    // Calculate total XP from claimed tasks
    const totalXP = safeTasks.filter(t => t.claimed).reduce((sum, t) => sum + t.points, 0) + 14400; // Base XP
    
    // Level formula: Level = floor(sqrt(totalXP / 100))
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100));
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
    const currentLevelXP = Math.pow(currentLevel, 2) * 100;
    const xpProgress = totalXP - currentLevelXP;
    const xpRequired = nextLevelXP - currentLevelXP;
    const xpPercent = Math.round((xpProgress / xpRequired) * 100);
    const xpToNext = nextLevelXP - totalXP;
    
    return {
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      dailyPercent: dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0,
      totalEarned: 1240,
      currentLevel,
      xpToNext,
      xpPercent
    };
  }, [safeTasks]);

  const filteredTasks = useMemo(() => {
    let result = safeTasks;
    
    // Tab filter
    if (activeTab === 'daily') result = result.filter(t => t.type === 'daily');
    else if (activeTab === 'achievements') result = result.filter(t => t.type === 'achievement');
    else if (activeTab === 'milestones') result = result.filter(t => t.type === 'milestone');
    
    // Status filter
    if (statusFilter === 'pending') result = result.filter(t => !t.completed);
    else if (statusFilter === 'completed') result = result.filter(t => t.completed);
    
    // Priority filter
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    
    return result;
  }, [safeTasks, activeTab, statusFilter, priorityFilter]);

  const handleClaim = (id: string) => {
    claimTaskReward(id);
  };

  const handleToggle = async (id: string, progress: number) => {
    try {
      // Simulate API call for task progress update
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 5% chance of failure for demonstration
          if (Math.random() < 0.05) {
            reject(new Error("Failed to sync progress with the network."));
          } else {
            resolve(true);
          }
        }, 500);
      });

      const task = tasks.find(t => t.id === id);
      if (task) {
        const newProgress = Math.min(task.total, progress);
        const isNowCompleted = newProgress >= task.total;
        if (isNowCompleted && !task.completed) {
            toast.success(`Task "${task.title}" completed!`, {
              description: "You can now claim your reward."
            });
            addNotification(`Task "${task.title}" completed!`, "success");
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#10b981', '#f59e0b']
            });
        }
        updateTaskProgress(id, newProgress);
      }
    } catch (error: any) {
      toast.error("Update failed", {
        description: error.message || "Could not update task progress. Please try again.",
      });
    }
  };



  const handleStake = (amount: number) => {
    setUserBalance(prev => prev - amount);
    addNotification(`Successfully staked ${amount} JAM protocols.`, "success");
  };

  const handleBuySuccess = (amount: number) => {
    setUserBalance(prev => prev + amount);
    addNotification(`Successfully forged ${amount} JAM using TON.`, "success");
  };

  return (
    <div className="p-4 lg:p-4 space-y-4 max-w-6xl mx-auto pb-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 opacity-[0.03] pointer-events-none">
          <motion.img 
            src={TJ_COIN_ICON} 
            animate={{ 
              y: [0, -20, 0],
              rotate: [-12, -8, -12]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-full h-full object-contain" 
            alt="" 
            referrerPolicy="no-referrer" 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 relative z-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Protocol Center</span>
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-[44px] font-black uppercase tracking-tighter text-foreground leading-none">Neural Tasks</h1>
          </div>
          <p className="text-sm font-medium text-foreground/30 max-w-md">
            Execute network protocols to strengthen the ecosystem and earn TJ rewards.
          </p>
        </motion.div>

        {/* Daily Progress Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-muted/50 rounded-2xl p-4 min-w-[280px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Progress</span>
              <span className="text-xs font-black text-blue-500">{stats.dailyPercent}%</span>
            </div>
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.dailyPercent}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
              />
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
              {safeTasks.filter(t => t.type === 'daily' && t.completed).length} of {safeTasks.filter(t => t.type === 'daily').length} protocols completed
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="min-w-[240px] flex-1 bg-blue-600/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-blue-600/20 transition-all relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
            <img src={TJ_COIN_ICON} className="w-full h-full object-contain rotate-12" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform relative z-10">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-4">Total Earned</p>
            <div className="flex items-center gap-4">
              <img src={TJ_COIN_ICON} className="w-6 h-6 object-contain" alt="" referrerPolicy="no-referrer" />
              <p className="text-[26px] font-black text-foreground tracking-tighter">{userBalance.toLocaleString()} TJ</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-600/10 rounded-2xl p-4 flex flex-col justify-center gap-4 group hover:bg-purple-600/20 transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-500/60 mb-4">Current Level</p>
              <p className="text-[26px] font-black text-foreground tracking-tighter">LVL {stats.currentLevel}</p>
            </div>
          </div>
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Next: LVL {stats.currentLevel + 1}</span>
              <span>{stats.xpToNext} XP needed</span>
            </div>
            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${stats.xpPercent}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-600/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-amber-600/20 transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Gift className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-4">Next Reward</p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[20px] font-black text-foreground tracking-tighter">{stats.xpToNext} XP</p>
              <span className="text-[10px] font-bold text-muted-foreground">75%</span>
            </div>
            <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-amber-500 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Filters & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
            {(['all', 'daily', 'achievements', 'milestones', 'staking', 'leaderboard', 'referrals'] as TaskTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-foreground shadow-lg shadow-blue-600/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-muted/50 text-[10px] font-black uppercase tracking-widest p-4 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-muted/50 text-[10px] font-black uppercase tracking-widest p-4 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <Clock className="w-3 h-3" />
              <span>Resets in 14h 22m</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'staking' ? (
            <motion.div 
              key="staking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StakingPanel balance={userBalance} onStake={handleStake} onBuyTJ={() => setShowBuyModal(true)} />
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Leaderboard />
            </motion.div>
          ) : activeTab === 'referrals' ? (
            <motion.div 
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReferralPanel />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClaim={handleClaim}
                    onToggle={handleToggle}
                    onClick={handleTaskClick}
                  />
                ))
              ) : (
                <div className="col-span-full py-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-foreground uppercase tracking-widest">No protocols found</p>
                    <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Check back later for new network tasks</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {isModalOpen && selectedTask && (
          <TaskDetailModal 
            task={selectedTask}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBuyModal && (
          <BuyTJModal 
            onClose={() => setShowBuyModal(false)} 
            onSuccess={handleBuySuccess} 
          />
        )}
      </AnimatePresence>

      {/* Seasonal Event Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex flex-col md:flex-row items-center justify-between gap-4 group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <img src={TJ_COIN_ICON} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
        </div>
        
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-4 px-4 py-4 rounded-full bg-muted/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-foreground">
            <Sparkles className="w-3 h-3" /> Limited Time Event
          </div>
          <h2 className="text-[26px] font-black uppercase tracking-tighter text-foreground">Genesis Launch Season</h2>
          <p className="text-sm font-medium text-muted-foreground/90 max-w-md">
            Complete special seasonal tasks to earn exclusive NFT badges and multiplier bonuses for your TJ earnings.
          </p>
        </div>
        <button className="relative z-10 px-4 py-4 rounded-xl bg-foreground text-blue-600 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-black/20">
          View Event Tasks
        </button>
      </motion.div>
    </div>
  );
};

export default Tasks;
