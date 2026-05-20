import React, { useMemo, useState } from 'react';
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
import { toast } from 'sonner';

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed?: boolean;
  reminderSet?: boolean;
  category: 'daily' | 'social' | 'streaming' | 'nft' | 'referral';
};

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Stream 5 Tracks',
    description: 'Listen to at least 5 songs today',
    reward: 40,
    progress: 3,
    total: 5,
    category: 'streaming',
  },
  {
    id: '2',
    title: 'Follow TonJam on X',
    description: 'Stay updated with TonJam news',
    reward: 25,
    progress: 0,
    total: 1,
    category: 'social',
  },
  {
    id: '3',
    title: 'Buy Your First NFT',
    description: 'Own a music collectible',
    reward: 120,
    progress: 0,
    total: 1,
    category: 'nft',
  },
  {
    id: '4',
    title: 'Invite 3 Friends',
    description: 'Grow the TonJam community',
    reward: 80,
    progress: 1,
    total: 3,
    category: 'referral',
  },
  {
    id: '5',
    title: 'Daily Login',
    description: 'Open TonJam today',
    reward: 15,
    progress: 1,
    total: 1,
    completed: true,
    category: 'daily',
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
  'Social',
  'Streaming',
  'NFT',
  'Referral',
];

const categoryIcons = {
  daily: Clock3,
  social: Users,
  streaming: PlayCircle,
  nft: Wallet,
  referral: Gift,
};

const Tasks: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  const toggleReminder = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newState = !t.reminderSet;
        toast.success(newState ? 'Reminder set!' : 'Reminder removed', {
          description: newState ? `We'll notify you about "${t.title}"` : undefined,
          icon: newState ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />
        });
        return { ...t, reminderSet: newState };
      }
      return t;
    }));
  };

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'All') return tasks;

    return tasks.filter(
      (task) =>
        task.category.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter, tasks]);

  const totalTJ = 1420;
  const todayEarned = 145;
  const level = 12;
  const xp = 72;

  return (
    <div className="min-h-screen bg-background text-foreground pb-[140px]">
      <div className="px-4 md:px-6 py-4 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-black font-ui">
              TonJam Rewards
            </p>

            <h1 className="text-lg font-black tracking-tight mt-0.5 font-display">
              Earn TJ
            </h1>
          </div>

          <div className="flex items-center justify-center">
            <motion.img 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              src={TJ_COIN_ICON} 
              alt="TJ Coin" 
              className="w-6 h-6 object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>

        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-2xl shadow-blue-600/20"
        >
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-[9px] uppercase tracking-[0.35em] font-black">
                  Available Balance
                </p>

                <div className="flex items-end gap-1.5 mt-0.5">
                  <h2 className="text-3xl font-black tracking-tight text-white leading-none font-display">
                    {totalTJ}
                  </h2>
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-5 h-5 mb-0.5 object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-300" />

                  <span className="text-[10px] text-white/80 font-medium tracking-tight font-ui">
                    +{todayEarned} TJ earned today
                  </span>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-black">
                  Level
                </p>

                <h3 className="text-xl font-black text-white">
                  {level}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-white/70 font-bold uppercase tracking-wider">
                <span>XP Progress</span>
                <span>{xp}%</span>
              </div>

              <Progress value={xp} className="h-2 bg-white/10" indicatorClassName="bg-white" />
            </div>

            <Button className="bg-white text-blue-700 hover:bg-white/90 rounded-full font-black text-[11px] h-10 px-5 uppercase tracking-widest">
              Claim Rewards
            </Button>
          </div>
        </motion.div>

        {/* DAILY STREAK */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />

            <h2 className="font-black tracking-tight text-lg">
              Daily Streak
            </h2>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {STREAK_DAYS.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-2 flex flex-col items-center justify-center transition-all ${
                  item.active
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-card border-white/5'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {item.day}
                </span>

                <Flame className="w-4 h-4 mt-1" />
              </div>
            ))}
          </div>
        </section>

        {/* FILTERS */}
        <div className="py-1">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap overflow-x-auto no-scrollbar gap-2 justify-start">
              {FILTERS.map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border bg-card border-white/5 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* TASK LIST */}
        <section className="space-y-2">
          {filteredTasks.map((task) => {
            const Icon = categoryIcons[task.category];
            const percentage = (task.progress / task.total) * 100;

            return (
              <motion.div
                key={task.id}
                whileTap={{ scale: 0.98 }}
                className="rounded-[16px] bg-card border border-white/5 p-3"
              >
                <div className="flex items-start gap-2.5">

                  {/* ICON */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2 items-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReminder(task.id);
                          }}
                          className={`mt-0.5 p-1 rounded-md transition-all ${
                            task.reminderSet 
                              ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' 
                              : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          {task.reminderSet ? <Bell className="w-3 h-3 fill-current" /> : <BellOff className="w-3 h-3" />}
                        </button>
                        <div>
                          <h3 className="font-bold text-[13px] leading-tight font-ui">
                            {task.title}
                          </h3>

                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug font-ui">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 py-1 pr-1">
                        <img src={TJ_COIN_ICON} alt="TJ" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />

                        <span className="text-sm font-black text-primary font-ui">
                          +{task.reward}
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-ui">
                        <span>
                          {task.progress}/{task.total} completed
                        </span>

                        <span>{Math.floor(percentage)}%</span>
                      </div>

                      <Progress value={percentage} className="h-1 bg-white/5" indicatorClassName="bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                    </div>

                    {/* ACTION */}
                    <div className="mt-3 flex items-center justify-between">

                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground font-ui">
                        {task.completed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-primary" />
                            Active Task
                          </>
                        )}
                      </div>

                      <Button
                        disabled={task.completed}
                        className={`rounded-full h-7 px-3 text-[9px] font-black uppercase tracking-widest font-ui ${
                          task.completed
                            ? 'opacity-50'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {task.completed ? (
                          'Claimed'
                        ) : (
                          <>
                            Go
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* LEADERBOARD */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />

            <h2 className="font-black tracking-tight text-lg">
              Top Earners
            </h2>
          </div>

          <div className="space-y-2">
            {[
              { name: 'DJ Nova', tj: 12450 },
              { name: 'Krupy Vibez', tj: 11200 },
              { name: 'TON Wave', tj: 10230 },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-card border border-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    {idx === 0 ? (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-sm tracking-tight">{user.name}</p>

                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                      Rank #{idx + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-1">
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />

                  <span className="font-black text-primary text-base">
                    {user.tj.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <div className="pt-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Powered by TON Blockchain
          </p>

          <div className="flex items-center justify-center gap-2 mt-2">
            <Music2 className="w-4 h-4 text-primary" />

            <span className="text-sm font-semibold">
              TonJam Rewards Protocol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
