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
      <div className="px-4 md:px-6 py-6 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              TonJam Rewards
            </p>

            <h1 className="text-3xl font-black tracking-tight mt-1">
              Earn TJ
            </h1>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <img src={TJ_COIN_ICON} alt="TJ Coin" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>

        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-2xl shadow-blue-600/20"
        >
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-[10px] uppercase tracking-[0.35em]">
                  Available Balance
                </p>

                <div className="flex items-end gap-3 mt-2">
                  <h2 className="text-6xl font-black tracking-tight text-white">
                    {totalTJ}
                  </h2>
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-10 h-10 mb-2 object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />

                  <span className="text-sm text-white/80">
                    +{todayEarned} TJ earned today
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                  Level
                </p>

                <h3 className="text-2xl font-black text-white">
                  {level}
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>XP Progress</span>
                <span>{xp}%</span>
              </div>

              <Progress value={xp} className="h-3 bg-white/10" />
            </div>

            <Button className="bg-white text-blue-700 hover:bg-white/90 rounded-full font-bold h-12 px-6">
              Claim Rewards
            </Button>
          </div>
        </motion.div>

        {/* DAILY STREAK */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />

            <h2 className="font-black tracking-tight text-xl">
              Daily Streak
            </h2>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {STREAK_DAYS.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-3 flex flex-col items-center justify-center transition-all ${
                  item.active
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-card border-white/5'
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest">
                  {item.day}
                </span>

                <Flame className="w-5 h-5 mt-2" />
              </div>
            ))}
          </div>
        </section>

        {/* FILTERS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                  : 'bg-card border border-white/5 text-muted-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* TASK LIST */}
        <section className="space-y-4">
          {filteredTasks.map((task) => {
            const Icon = categoryIcons[task.category];
            const percentage = (task.progress / task.total) * 100;

            return (
              <motion.div
                key={task.id}
                whileTap={{ scale: 0.98 }}
                className="rounded-[28px] bg-card border border-white/5 p-5 backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">

                  {/* ICON */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 items-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReminder(task.id);
                          }}
                          className={`mt-0.5 p-1.5 rounded-xl transition-all ${
                            task.reminderSet 
                              ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' 
                              : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                          }`}
                        >
                          {task.reminderSet ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                        </button>
                        <div>
                          <h3 className="font-bold text-base leading-tight">
                            {task.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-primary/15 px-5 py-3 rounded-full backdrop-blur-md shadow-2xl shadow-primary/25">
                        <img src={TJ_COIN_ICON} alt="TJ" className="w-12 h-12 object-contain drop-shadow-xl" referrerPolicy="no-referrer" />

                        <span className="text-xl font-black text-primary">
                          +{task.reward}
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {task.progress}/{task.total} completed
                        </span>

                        <span>{Math.floor(percentage)}%</span>
                      </div>

                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* ACTION */}
                    <div className="mt-5 flex items-center justify-between">

                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {task.completed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-primary" />
                            Active Task
                          </>
                        )}
                      </div>

                      <Button
                        disabled={task.completed}
                        className={`rounded-full h-11 px-5 font-bold ${
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
                            <ArrowRight className="w-4 h-4 ml-2" />
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
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />

            <h2 className="font-black tracking-tight text-xl">
              Top Earners
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { name: 'DJ Nova', tj: 12450 },
              { name: 'Krupy Vibez', tj: 11200 },
              { name: 'TON Wave', tj: 10230 },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl bg-card border border-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    {idx === 0 ? (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold">{user.name}</p>

                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Rank #{idx + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-primary/15 px-5 py-3 rounded-full backdrop-blur-xl shadow-2xl shadow-primary/25">
                  <img src={TJ_COIN_ICON} alt="TJ" className="w-10 h-10 object-contain drop-shadow-xl" referrerPolicy="no-referrer" />

                  <span className="font-black text-primary text-xl">
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
