import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Trophy, 
  Star, 
  Gift, 
  Plus,
  Flame,
  Globe,
  Share2,
  Play,
  ShoppingBag,
  Gem,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Disc,
  Clock,
  ChevronRight,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { TJ_COIN_ICON } from '@/constants';
import Leaderboard from '@/components/Leaderboard';
import AuthModal from '@/components/AuthModal';
import StakingPanel from '@/components/StakingPanel';
import ReferralPanel from '@/components/ReferralPanel';
import BuyTJModal from '@/components/BuyTJModal';

import { useTaskStore } from '@/store/taskStore';
import { claimTaskReward, getTasks } from '@/services/taskService';
import { useUserStore } from '@/store/userStore';

const ICONS: Record<string, React.FC<any>> = {
  'ShieldCheck': ShieldCheck,
  'Share2': Share2,
  'Play': Play,
  'ShoppingBag': ShoppingBag,
  'Zap': Zap,
};

const Tasks: React.FC = () => {
  const { userProfile, addNotification } = useAudio(); // Using for addNotification for backwards compatibility right now
  const { user } = useAuth();
  const tasks = useTaskStore(state => state.tasks);
  const setTasks = useTaskStore(state => state.setTasks);
  const claimTaskLocal = useTaskStore(state => state.claimTaskLocal);
  const completeTaskLocal = useTaskStore(state => state.completeTaskLocal);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'quest' | 'staking' | 'referral' | 'leaderboard'>('quest');
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  useEffect(() => {
    // Fetch live tasks if authenticated
    if (user) {
      getTasks().then(firestoreTasks => {
        if (firestoreTasks.length > 0) {
           // Merge firestore tasks over default tasks or replace entirely depending on logic
           // For now, let's just use firestore tasks if any exist
           setTasks(firestoreTasks);
        }
      });
    }
  }, [user, setTasks]);

  // Logic for leveling and rewards
  const balance = userProfile.tjBalance || 0;
  const streak = 3; 
  const isVIP = userProfile.isVerifiedArtist || userProfile.role === 'admin';

  // Level Logic
  const stats = useMemo(() => {
    const baseXP = 1250; // Dynamic starting XP
    const earnedXP = tasks.filter(t => t.claimed).reduce((acc, t) => acc + (t.points || 0), 0);
    const totalXP = baseXP + earnedXP;
    
    // Level = floor(sqrt(XP / 50))
    const level = Math.floor(Math.sqrt(totalXP / 50));
    const nextLevelXP = Math.pow(level + 1, 2) * 50;
    const currentLevelXP = Math.pow(level, 2) * 50;
    const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return { level, progress, totalXP, xpToNext: nextLevelXP - totalXP };
  }, [tasks]);

  const handleClaim = async (taskId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.completed || task.claimed) return;

    try {
      setIsClaiming(taskId);
      const parsedReward = parseInt(task.reward) || 50;
      await claimTaskReward(taskId, parsedReward, task.points);

      const multiplier = isVIP ? 2 : 1;
      const finalReward = parsedReward * multiplier;
      
      claimTaskLocal(taskId);

      toast.success(`Protocol Synthesized!`, {
        description: `Received ${finalReward} TJ and ${task.points} XP.`
      });
      
      addNotification(`Received ${finalReward} TJ for ${task.title}`, "success");
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
      
    } catch (error) {
      toast.error('Failed to claim reward. Please try again.');
    } finally {
      setIsClaiming(null);
    }
  };

  const handleStart = (id: string) => {
    toast.info("Task Sequence Initialized", {
      description: "Return after completing the neural protocol."
    });
    // Mock local completion for demo purposes
    setTimeout(() => {
      completeTaskLocal(id);
    }, 2000);
  };


  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto p-4 space-y-6">
        
        {/* HEADER AREA */}
        <div className="flex flex-col gap-6 pt-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Node</span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Command Center</h1>
            </div>

            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Level {stats.level}</span>
               </div>
            </div>
          </div>

          {/* XP PROGRESS BAR */}
          <div className="glass-card p-4 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Network resonance</span>
              </div>
              <span className="text-xs font-mono font-bold text-white/60">{Math.round(stats.progress)}% to Level {stats.level + 1}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              />
            </div>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2 italic text-right">
              {stats.xpToNext} XP required for next node expansion
            </p>
          </div>

          {/* BALANCE BLOCK */}
          <button onClick={() => setShowBuyModal(true)} className="relative group text-left w-full transition-transform active:scale-95">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative flex items-center gap-5 bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/10 px-6 py-5 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
              
              {isVIP && (
                <div className="absolute -top-0 -right-0 pt-3 pr-3">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full shadow-lg border border-white/20">
                    <Gem className="w-2.5 h-2.5 text-white animate-pulse" />
                    <span className="text-[7px] font-black text-white tracking-[0.2em]">VIP NODE</span>
                  </div>
                </div>
              )}

              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full" />
                <motion.img 
                  src={TJ_COIN_ICON} 
                  className="w-11 h-11 object-contain relative z-10" 
                  alt="Balance"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="flex-1 flex flex-col -space-y-1 relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-black tracking-[-0.08em] text-white tabular-nums leading-none">
                    {balance.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-blue-500 italic uppercase tracking-tighter">TJ</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-pulse" />
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] whitespace-nowrap">
                     AVAILABLE NEURAL CREDITS
                   </span>
                </div>
              </div>
              
              <div className="shrink-0 bg-white/5 p-2 rounded-full border border-white/5">
                <Plus className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </button>
        </div>

        {/* STREAK BENTO */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-3xl relative overflow-hidden group border-white/5"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-2 text-orange-500 mb-3">
              <Flame className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-wider">Sync Streak</span>
            </div>
            <div className="text-2xl font-black italic tracking-tighter">{streak} Days</div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Next Sync: +{Math.min((streak + 1) * 10, 100)} TJ
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-3xl relative overflow-hidden group border-white/5"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Rewards</span>
            </div>
            <div className="text-2xl font-black italic tracking-tighter">2.4K+ <span className="text-[10px] text-white/30 lowercase not-italic">total earned</span></div>
            <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mt-1">
              Top 15% of Nodes
            </p>
          </motion.div>
        </div>

        {/* NAVIGATION RAIL */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'quest', label: 'Quests', icon: Target },
            { id: 'staking', label: 'Vault', icon: Layers },
            { id: 'referral', label: 'Nodes', icon: Share2 },
            { id: 'leaderboard', label: 'Ranks', icon: Trophy }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black' 
                : 'text-white/40 hover:text-white/60 font-bold'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`} />
              <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'quest' && (
            <motion.div 
              key="quests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* TASK LIST */}
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const TaskIcon = (task.iconName && ICONS[task.iconName]) || Target;
                  const taskColor = task.color || 'blue';

                  return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`glass-card p-4 rounded-3xl flex justify-between items-center group hover:bg-white/[0.03] transition-colors border-white/5 ${task.claimed ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${taskColor}-500/10 flex items-center justify-center text-${taskColor}-500 group-hover:scale-110 transition-transform shadow-inner`}>
                        <TaskIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-[11px] tracking-tight">{task.title}</h3>
                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{task.subtitle || task.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <img src={TJ_COIN_ICON} className="w-3 h-3 grayscale opacity-30" alt="" />
                            <span className={`text-[10px] font-mono font-bold text-${taskColor}-500`}>+{task.reward}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-mono font-bold text-white/40">+{task.points || 0} XP</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {!task.completed && (
                        <button 
                          onClick={() => handleStart(task.id)}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:border-blue-500/50"
                        >
                          Execute
                        </button>
                      )}

                      {task.completed && !task.claimed && (
                        <button
                          onClick={() => handleClaim(task.id)}
                          disabled={isClaiming === task.id}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:scale-100"
                        >
                          {isClaiming === task.id ? 'Syncing...' : 'Claim'}
                        </button>
                      )}

                      {task.claimed && (
                        <div className="flex items-center gap-2 pr-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocol Sync</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )})}
              </div>
            </motion.div>
          )}

          {activeTab === 'staking' && (
            <motion.div 
               key="staking"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
            >
               <StakingPanel balance={balance} onStake={() => {}} onBuyTJ={() => setShowBuyModal(true)} />
            </motion.div>
          )}

          {activeTab === 'referral' && (
            <motion.div 
               key="referral"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
            >
               <ReferralPanel />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div 
               key="leaderboard"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
            >
               <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {showBuyModal && <BuyTJModal onClose={() => setShowBuyModal(false)} onSuccess={() => {}} />}
    </div>
  );
};

export default Tasks;
