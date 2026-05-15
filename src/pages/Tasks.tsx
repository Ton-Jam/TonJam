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

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.FC<any>> = {
  'ShieldCheck': ShieldCheck,
  'Share2': Share2,
  'Play': Play,
  'ShoppingBag': ShoppingBag,
  'Zap': Zap,
};

const Tasks: React.FC = () => {
  const { userProfile, addNotification, artists } = useAudio(); // Using for addNotification for backwards compatibility right now
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
    <div className="min-h-screen pb-32 relative overflow-hidden bg-white dark:bg-background">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-purple-600/[0.03] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
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
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Command Center</h1>
            </div>

              <div className="flex flex-col items-end gap-2">
                 <Badge variant="outline" className="bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-white/60 font-black px-3 h-8 flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    Level {stats.level}
                 </Badge>
              </div>
            </div>

            {/* XP PROGRESS BAR */}
            <Card className="bg-blue-50/50 dark:bg-white/5 border-blue-100 dark:border-white/5 shadow-none p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/40 dark:text-white/40">Network resonance</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600/60 dark:text-white/60">{Math.round(stats.progress)}% to Level {stats.level + 1}</span>
              </div>
              <Progress value={stats.progress} className="h-2 bg-blue-100 dark:bg-white/5" />
              <p className="text-[8px] font-bold text-blue-600/20 dark:text-white/20 uppercase tracking-[0.2em] mt-2 text-right">
                {stats.xpToNext} XP required for next node expansion
              </p>
            </Card>

            {/* BALANCE BLOCK */}
            <button onClick={() => setShowBuyModal(true)} className="relative group text-left w-full transition-transform active:scale-95">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative flex items-center gap-5 bg-white dark:bg-[#0A0A0C]/80 backdrop-blur-3xl border border-blue-100 dark:border-white/10 px-6 py-6 rounded-3xl shadow-xl overflow-hidden min-h-[110px]">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                
                {isVIP && (
                  <div className="absolute -top-0 -right-0 pt-3 pr-3">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-[10px] shadow-lg border border-white/20 text-[7px] font-black text-white tracking-[0.2em]">
                      <Gem className="w-2.5 h-2.5 text-white animate-pulse mr-1.5" />
                      VIP NODE
                    </Badge>
                  </div>
                )}

              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                <motion.img 
                  src={TJ_COIN_ICON} 
                  className="w-12 h-12 object-contain relative z-10" 
                  alt="Balance"
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="flex-1 flex flex-col -space-y-1 relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-black tracking-[-0.08em] text-blue-600 dark:text-white tabular-nums leading-none">
                    {balance.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-blue-500 uppercase tracking-tighter">TJ</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-pulse" />
                   <span className="text-[10px] font-black text-blue-600/30 dark:text-white/30 uppercase tracking-[0.25em] whitespace-nowrap">
                     AVAILABLE NEURAL CREDITS
                   </span>
                </div>
              </div>
              
              <div className="shrink-0 bg-blue-50 dark:bg-white/5 p-2 rounded-full border border-blue-100 dark:border-white/5 shadow-inner">
                <Plus className="w-4 h-4 text-blue-600/40 dark:text-white/40" />
              </div>
            </div>
          </button>
        </div>

            {/* STREAK BENTO */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} className="transition-all">
                <Card className="p-5 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/10 shadow-none h-full">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 mb-3">
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">Sync Streak</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-zinc-800 dark:text-white">{streak} <span className="text-sm font-medium opacity-50">Days</span></div>
                  <p className="text-[10px] font-bold text-orange-600/40 dark:text-orange-400/40 uppercase tracking-widest mt-1">
                    Next Sync: +{Math.min((streak + 1) * 10, 100)} TJ
                  </p>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="transition-all">
                <Card className="p-5 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 shadow-none h-full">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Rewards</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-zinc-800 dark:text-white">2.4K+ <span className="text-[9px] font-medium opacity-50">earned</span></div>
                  <p className="text-[10px] font-bold text-blue-600/40 dark:text-blue-400/40 uppercase tracking-widest mt-1">
                    Top 15% of Nodes
                  </p>
                </Card>
              </motion.div>
            </div>

        {/* NAVIGATION RAIL AND CONTENT */}
        <Tabs defaultValue="quest" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
          <TabsList className="bg-blue-50/50 dark:bg-white/5 p-1 rounded-2xl border border-blue-100 dark:border-white/5 h-14 w-full grid grid-cols-4">
            {[
              { id: 'quest', label: 'Quests', icon: Target },
              { id: 'staking', label: 'Vault', icon: Layers },
              { id: 'referral', label: 'Nodes', icon: Share2 },
              { id: 'leaderboard', label: 'Ranks', icon: Trophy }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center gap-2 py-2 rounded-full transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/30 border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 data-[state=inactive]:bg-white/5"
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="quest" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
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
                    >
                      <Card className={cn(
                        "group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all border-white/5 shadow-none bg-white/5 overflow-hidden",
                        task.claimed && 'opacity-50 grayscale pointer-events-none'
                      )}>
                        <CardContent className="p-4 flex justify-between items-center bg-transparent">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-[12px] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                              `bg-${taskColor}-500/10 text-${taskColor}-500`
                            )}>
                              <TaskIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black uppercase text-[11px] tracking-tight text-zinc-800 dark:text-white">{task.title}</h3>
                              <p className="text-[8px] font-bold text-blue-600/40 dark:text-white/40 uppercase tracking-widest mt-0.5">{task.subtitle || task.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <img src={TJ_COIN_ICON} className="w-3 h-3 grayscale opacity-30" alt="" />
                                  <span className={cn("text-[10px] font-mono font-bold", `text-${taskColor}-500`)}>+{task.reward}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-blue-100 dark:bg-white/10" />
                                <span className="text-[10px] font-mono font-bold text-blue-600/40 dark:text-white/40">+{task.points || 0} XP</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {!task.completed && (
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleStart(task.id)}
                                className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10 text-white"
                              >
                                Execute
                              </Button>
                            )}

                            {task.completed && !task.claimed && (
                              <Button
                                size="sm"
                                onClick={() => handleClaim(task.id)}
                                disabled={isClaiming === task.id}
                                className="h-10 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:scale-100 border-none"
                              >
                                {isClaiming === task.id ? 'Syncing...' : 'Claim'}
                              </Button>
                            )}

                            {task.claimed && (
                              <div className="flex items-center gap-2 pr-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocol Sync</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="staking" className="mt-0">
             <StakingPanel balance={balance} onStake={() => {}} onBuyTJ={() => setShowBuyModal(true)} />
          </TabsContent>

          <TabsContent value="referral" className="mt-0">
             <ReferralPanel />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
             <Leaderboard artists={artists} limit={10} />
          </TabsContent>
        </Tabs>

      </div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {showBuyModal && <BuyTJModal onClose={() => setShowBuyModal(false)} onSuccess={() => {}} />}
    </div>
  );
};

export default Tasks;
