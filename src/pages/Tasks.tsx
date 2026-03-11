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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import SectionHeader from '@/components/SectionHeader';
import { useAudio } from '@/context/AudioContext';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';
import StakingPanel from '@/components/StakingPanel';
import Leaderboard from '@/components/Leaderboard';
import BuyTJModal from '@/components/BuyTJModal';

interface Task {
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

type TaskTab = 'all' | 'daily' | 'achievements' | 'milestones' | 'staking' | 'leaderboard';

const TaskCard: React.FC<{ 
  task: Task; 
  onClaim: (id: string) => void;
  onToggle: (id: string) => void;
}> = ({ task, onClaim, onToggle }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaiming || task.claimed || !task.completed) return;
    
    setIsClaiming(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    onClaim(task.id);
    setIsClaiming(false);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b']
    });
  };

  const rarityColors = {
    common: 'text-white/40',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400'
  };

  const progressPercent = Math.min(100, (task.progress / task.total) * 100);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full ${
        task.claimed 
          ? 'bg-neutral-900/40 border-white/5 opacity-50' 
          : task.completed
            ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]'
            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      {/* Rarity & Priority Indicators */}
      <div className="absolute top-0 right-0 flex items-center gap-1 p-2">
        {task.priority && (
          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
            task.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
            task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/20'
          }`}>
            {task.priority} Priority
          </div>
        )}
        {task.rarity && task.rarity !== 'common' && (
          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
            task.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
            task.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
            'bg-amber-500/20 text-amber-400 border border-amber-500/20'
          }`}>
            {task.rarity}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 mt-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
              task.completed ? 'bg-green-500/20 text-green-500' : 'bg-blue-600/20 text-blue-500'
            }`}>
              {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-tight transition-all ${task.completed ? 'text-green-500/80' : 'text-white'}`}>
                {task.title}
              </h3>
              <p className="text-[10px] font-medium text-white/40 leading-relaxed mt-0.5">
                {task.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!task.completed && (
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
              <span>Progress</span>
              <span>{task.progress} / {task.total}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Reward Section */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Reward</span>
            <div className="flex items-center gap-1.5">
              <img src={TJ_COIN_ICON} className="w-4 h-4 object-contain" alt="" referrerPolicy="no-referrer" />
              <span className="text-sm font-black text-white">{task.reward}</span>
              <span className="text-[10px] font-bold text-blue-500/60">+{task.points} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.completed && !task.claimed ? (
              <button 
                onClick={handleClaim}
                disabled={isClaiming}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
              <div className="flex items-center gap-1 text-green-500/50 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Claimed
              </div>
            ) : (
              <button 
                onClick={() => onToggle(task.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TaskTab>('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1240);
  const { addNotification } = useAudio();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Daily Sync', description: 'Stream 5 tracks today', reward: '5 TJ', points: 50, completed: true, claimed: true, type: 'daily', progress: 5, total: 5, rarity: 'common', priority: 'medium' },
    { id: '2', title: 'Network Supporter', description: 'Follow 3 new artists', reward: '10 TJ', points: 100, completed: false, claimed: false, type: 'daily', progress: 1, total: 3, rarity: 'common', priority: 'low' },
    { id: '3', title: 'Collector Genesis', description: 'Purchase your first NFT', reward: '50 TJ', points: 500, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
    { id: '4', title: 'Signal Broadcaster', description: 'Share a track to JamSpace', reward: '5 TJ', points: 25, completed: false, claimed: false, type: 'daily', progress: 0, total: 1, rarity: 'common', priority: 'low' },
    { id: '5', title: 'High Fidelity', description: 'Listen for 10 hours total', reward: '100 TJ', points: 1000, completed: true, claimed: false, type: 'milestone', progress: 10, total: 10, rarity: 'epic', priority: 'medium' },
    { id: '6', title: 'Legend of TON', description: 'Stake 10,000 JAM for 30 days', reward: '500 TJ', points: 5000, completed: false, claimed: false, type: 'milestone', progress: 12, total: 30, rarity: 'legendary', priority: 'high' },
    { id: '7', title: 'TON Ecosystem', description: 'Follow TON on X', reward: '20 TJ', points: 200, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
    { id: '8', title: 'Join the Jam', description: 'Follow TonJam on X', reward: '20 TJ', points: 200, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1, rarity: 'rare', priority: 'high' },
    { id: '9', title: 'Network Expansion', description: 'Invite 3 friends to TonJam', reward: '100 TJ', points: 1000, completed: false, claimed: false, type: 'milestone', progress: 0, total: 3, rarity: 'epic', priority: 'medium' },
  ]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const dailyCompleted = tasks.filter(t => t.type === 'daily' && t.completed).length;
    const dailyTotal = tasks.filter(t => t.type === 'daily').length;
    
    // Calculate total XP from claimed tasks
    const totalXP = tasks.filter(t => t.claimed).reduce((sum, t) => sum + t.points, 0) + 14400; // Base XP
    
    // Level formula: Level = floor(sqrt(totalXP / 100))
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100));
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
    const currentLevelXP = Math.pow(currentLevel, 2) * 100;
    const xpProgress = totalXP - currentLevelXP;
    const xpRequired = nextLevelXP - currentLevelXP;
    const xpPercent = Math.round((xpProgress / xpRequired) * 100);
    const xpToNext = nextLevelXP - totalXP;
    
    return {
      percent: Math.round((completed / total) * 100),
      dailyPercent: Math.round((dailyCompleted / dailyTotal) * 100),
      totalEarned: 1240,
      currentLevel,
      xpToNext,
      xpPercent
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    if (activeTab === 'daily') return tasks.filter(t => t.type === 'daily');
    if (activeTab === 'achievements') return tasks.filter(t => t.type === 'achievement');
    if (activeTab === 'milestones') return tasks.filter(t => t.type === 'milestone');
    return tasks;
  }, [tasks, activeTab]);

  const handleClaim = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, claimed: true } : t));
  };

  const handleToggle = (id: string) => {
    // In a real app, this would be triggered by actual user actions
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, progress: !t.completed ? t.total : 0 } : t));
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
    <div className="p-6 lg:p-10 space-y-12 max-w-6xl mx-auto pb-40">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
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
          className="space-y-3 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Protocol Center</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">Neural Tasks</h1>
          <p className="text-sm font-medium text-white/30 max-w-md">
            Execute network protocols to strengthen the ecosystem and earn TJ rewards.
          </p>
        </motion.div>

        {/* Daily Progress Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[280px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Daily Progress</span>
              <span className="text-xs font-black text-blue-500">{stats.dailyPercent}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.dailyPercent}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
              />
            </div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {tasks.filter(t => t.type === 'daily' && t.completed).length} of {tasks.filter(t => t.type === 'daily').length} protocols completed
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="min-w-[240px] flex-1 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex items-center gap-6 group hover:bg-blue-600/20 transition-all relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
            <img src={TJ_COIN_ICON} className="w-full h-full object-contain rotate-12" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform relative z-10">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-1">Total Earned</p>
            <div className="flex items-center gap-2">
              <img src={TJ_COIN_ICON} className="w-6 h-6 object-contain" alt="" referrerPolicy="no-referrer" />
              <p className="text-3xl font-black text-white tracking-tighter">{userBalance.toLocaleString()} TJ</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-center gap-4 group hover:bg-purple-600/20 transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-500/60 mb-1">Current Level</p>
              <p className="text-3xl font-black text-white tracking-tighter">LVL {stats.currentLevel}</p>
            </div>
          </div>
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <span>Next: LVL {stats.currentLevel + 1}</span>
              <span>{stats.xpToNext} XP needed</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${stats.xpPercent}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-600/10 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-6 group hover:bg-amber-600/20 transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Gift className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Next Reward</p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-black text-white tracking-tighter">{stats.xpToNext} XP</p>
              <span className="text-[10px] font-bold text-white/40">75%</span>
            </div>
            <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-amber-500 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Filters & List */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
            {(['all', 'daily', 'achievements', 'milestones', 'staking', 'leaderboard'] as TaskTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <div className="flex items-center gap-2">
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
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClaim={handleClaim}
                    onToggle={handleToggle}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase tracking-widest">No protocols found</p>
                    <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Check back later for new network tasks</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <img src={TJ_COIN_ICON} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
        </div>
        
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white">
            <Sparkles className="w-3 h-3" /> Limited Time Event
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Genesis Launch Season</h2>
          <p className="text-sm font-medium text-white/80 max-w-md">
            Complete special seasonal tasks to earn exclusive NFT badges and multiplier bonuses for your TJ earnings.
          </p>
        </div>
        <button className="relative z-10 px-8 py-4 rounded-xl bg-white text-blue-600 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-black/20">
          View Event Tasks
        </button>
      </motion.div>
    </div>
  );
};

export default Tasks;
