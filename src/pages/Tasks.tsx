import React, { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Clock3,
  Gift,
  Crown,
  PlayCircle,
  Users,
  Music2,
  Wallet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Bell,
  BellOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TJ_COIN_ICON } from '@/constants';
import TaskCard from '@/components/TaskCard';
import { getTasks, updateTaskProgress, completeTask, claimTaskReward } from '@/services/taskService';
import { Task } from '@/types';

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Stream 5 Tracks',
    description: 'Listen to at least 5 songs today',
    reward: "40",
    points: 10,
    progress: 3,
    total: 5,
    type: 'daily',
    completed: false,
    claimed: false,
  },
  {
    id: '2',
    title: 'Follow TonJam on X',
    description: 'Stay updated with TonJam news',
    reward: "25",
    points: 5,
    progress: 0,
    total: 1,
    type: 'achievement',
    completed: false,
    claimed: false,
  },
  {
    id: '3',
    title: 'Buy Your First NFT',
    description: 'Own a music collectible',
    reward: "120",
    points: 50,
    progress: 0,
    total: 1,
    type: 'onchain',
    completed: false,
    claimed: false,
  },
  {
    id: '4',
    title: 'Invite 3 Friends',
    description: 'Grow the TonJam community',
    reward: "80",
    points: 20,
    progress: 1,
    total: 3,
    type: 'referral',
    completed: false,
    claimed: false,
  },
  {
    id: '5',
    title: 'Daily Login',
    description: 'Open TonJam today',
    reward: "15",
    points: 2,
    progress: 1,
    total: 1,
    completed: true,
    claimed: false,
    type: 'daily',
  },
];

const STREAK_DAYS = [
  { day: 'Mon', active: true },
  { day: 'Tue', active: true },
  { day: 'Wed', active: true },
  { day: 'Thu', active: false },
  { day: 'Fri', active: false },
  { day: 'Sat', active: false },
  { day: 'Sun', active: false },
];

const FILTERS = [
  'All',
  'Daily',
  'Achievement',
  'Onchain',
  'Referral',
];

const categoryIcons: Record<string, any> = {
  daily: Clock3,
  social: Users,
  streaming: PlayCircle,
  nft: Wallet,
  referral: Gift,
};

const Tasks: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, []);

  const handleClaim = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // In firestore Task definition, reward is a string. Need to parse it.
    const rewardAmount = parseInt(task.reward.replace(/[^0-9]/g, '')) || 0;
    await claimTaskReward(taskId, rewardAmount, task.points);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, claimed: true } : t));
  };

  const handleToggle = async (taskId: string, progress: number) => {
    await updateTaskProgress(taskId, progress);
    
    const task = tasks.find(t => t.id === taskId);
    if (task && progress >= task.total) {
        await completeTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress, completed: true } : t));
    } else {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress } : t));
    }
  };

  const handleClick = (task: Task) => {
      console.log('Task clicked', task);
  };

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'All') return tasks;

    return tasks.filter(
      (task) =>
        task.type.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter, tasks]);

  const totalTJ = 1420;
  const todayEarned = 145;
  const level = 12;
  const xp = 72;

  return (
    <div className="min-h-screen bg-background text-foreground pb-[140px]">
      <div className="px-4 py-3 space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <p className="text-[8px] uppercase tracking-[0.25em] text-muted-foreground font-black font-ui">
              TonJam Rewards
            </p>

            <h1 className="text-md font-black tracking-tight mt-0.5 font-display">
              Earn TJ
            </h1>
          </div>

          <div className="flex items-center justify-center">
            <motion.img 
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              src={TJ_COIN_ICON} 
              alt="TJ Coin" 
              className="w-5 h-5 object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>

        {/* COMPACT HERO STATS BLOCKS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-4 shadow-lg shadow-blue-600/10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-[8px] uppercase tracking-[0.25em] font-black">
                  Available Balance
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <h2 className="text-2xl font-black tracking-tight text-white leading-none font-display">
                    {totalTJ}
                  </h2>
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-4.5 h-4.5 object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-2.5 h-2.5 text-green-300" />
                  <span className="text-[9px] text-white/80 font-medium tracking-tight">
                    +{todayEarned} today
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg px-2.5 py-1.5 text-center">
                  <p className="text-[8px] uppercase tracking-wider text-white/60 font-black">
                    Lvl {level}
                  </p>
                  <p className="text-[9px] font-bold text-white">{xp}% XP</p>
                </div>
                
                <Button className="bg-white text-blue-700 hover:bg-white/90 rounded-full font-black text-[9px] h-8 px-3.5 uppercase tracking-wider">
                  Claim
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={xp} className="h-1 bg-white/10 indicator-white" indicatorClassName="bg-white" />
            </div>
          </div>
        </motion.div>

        {/* DAILY STREAK - NEW COMPACT SLIDERS */}
        <section className="bg-foreground/[0.02] rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground font-ui">
                Daily Streak Tracker
              </h2>
            </div>
            <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">
              3 Days
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            {STREAK_DAYS.map((item, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-xl py-1.5 flex flex-col items-center justify-center min-w-[36px] transition-all duration-300 ${
                  item.active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'bg-foreground/[0.03] text-muted-foreground/40'
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-wider">
                  {item.day}
                </span>
                <Flame className={`w-3.5 h-3.5 mt-0.5 ${item.active ? 'fill-white text-white' : 'text-muted-foreground/20'}`} />
              </div>
            ))}
          </div>
        </section>

        {/* FILTERS - FRAMELESS HIGH-CONTRAST PILLES */}
        <div className="py-0.5">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap overflow-x-auto no-scrollbar gap-2 justify-start -mx-4 px-4">
              {FILTERS.map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-white/5 hover:bg-white/10 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground border-none shrink-0 cursor-pointer h-auto"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* TASK LIST - COMPLETED WITH OUR SLICK ROW TASK CARDS */}
        <section className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClaim={handleClaim} 
              onToggle={handleToggle} 
              onClick={handleClick}
            />
          ))}
        </section>

        {/* LEADERBOARD - ULTRA COMPACT WITHOUT BORDER LINES */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <h2 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground font-ui">
              Top Earners
            </h2>
          </div>

          <div className="space-y-1.5">
            {[
              { name: 'DJ Nova', tj: 12450 },
              { name: 'Krupy Vibez', tj: 11200 },
              { name: 'TON Wave', tj: 10230 },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-foreground/[0.02] p-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {idx === 0 ? (
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-xs tracking-tight">{user.name}</h5>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-0.5">
                      Rank #{idx + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="font-black text-primary text-sm">
                    {user.tj.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER - COMPACT */}
        <div className="pt-2 text-center text-[9px] uppercase tracking-[0.25em] text-muted-foreground space-y-1">
          <p>Powered by TON Blockchain</p>
          <div className="flex items-center justify-center gap-1.5 text-foreground/70 font-bold uppercase tracking-widest text-[8px]">
            <Music2 className="w-3 h-3 text-primary animate-pulse" />
            <span>TonJam Rewards Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
