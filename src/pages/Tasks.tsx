import React, { useMemo, useState } from "react";
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
  BellOff,
} from "lucide-react";
import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TJ_COIN_ICON } from "@/constants";
import TaskCard from "@/components/TaskCard";
import TaskCards from "@/components/aicanvas/task-cards";
import { useAudio } from "@/context/AudioContext";
import { Task } from "@/types";

const STREAK_DAYS = [
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: true },
  { day: "Thu", active: false },
  { day: "Fri", active: false },
  { day: "Sat", active: false },
  { day: "Sun", active: false },
];

const FILTERS = ["All", "Daily", "Achievement", "Onchain", "Referral"];

const categoryIcons: Record<string, any> = {
  daily: Clock3,
  social: Users,
  streaming: PlayCircle,
  nft: Wallet,
  referral: Gift,
};

const Tasks: React.FC = () => {
  const {
    tasks,
    claimTaskReward,
    updateTaskProgress,
    completeTask,
    userProfile,
    transactions,
    firestoreUsers,
  } = useAudio();
  const [activeFilter, setActiveFilter] = useState("All");

  const handleClaim = async (taskId: string) => {
    await claimTaskReward(taskId);
  };

  const handleToggle = async (taskId: string, progress: number) => {
    await updateTaskProgress(taskId, progress);

    const task = tasks.find((t) => t.id === taskId);
    if (task && progress >= task.total && !task.completed) {
      await completeTask(taskId);
    }
  };

  const handleClick = (task: Task) => {
    console.log("Task clicked", task);
    if ((task.type === 'social' || task.type === 'achievement' || task.type === 'referral') && task.link) {
      window.open(task.link, '_blank');
      if (!task.completed) {
        handleToggle(task.id, task.total);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    if (activeFilter === "All") return tasks;

    return tasks.filter(
      (task) =>
        task.type && task.type.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [activeFilter, tasks]);

  const totalTJ = userProfile?.tjBalance || 0;
  const todayEarned = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter(
        (tx) =>
          tx.type === "claim_rewards" &&
          new Date(tx.timestamp || Date.now()) >= today,
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [transactions]);
  const level = Math.floor((totalTJ || 0) / 1000) + 1;
  const xp = Math.floor(((totalTJ || 0) % 1000) / 10); // Simple percentage out of 1000 threshold

  const topEarners = useMemo(() => {
    if (!firestoreUsers || firestoreUsers.length === 0) {
      return [
        { name: "DJ Nova", tj: 12450 },
        { name: "Krupy Vibez", tj: 11200 },
        { name: "TON Wave", tj: 10230 },
      ];
    }
    return [...firestoreUsers]
      .sort((a, b) => (b.tjBalance || 0) - (a.tjBalance || 0))
      .slice(0, 3)
      .map((u) => ({ name: u.name, tj: u.tjBalance || 0 }));
  }, [firestoreUsers]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-[140px] w-full">
      <div className="w-full max-w-full px-4 md:px-8 py-4 space-y-5">
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
                  <img
                    src={TJ_COIN_ICON}
                    alt="TJ"
                    className="w-4.5 h-4.5 object-contain"
                    referrerPolicy="no-referrer"
                  />
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
              <Progress
                value={xp}
                className="h-1 bg-white/10 indicator-white"
                indicatorClassName="bg-white"
              />
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
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                    : "bg-foreground/[0.03] text-muted-foreground/40"
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-wider">
                  {item.day}
                </span>
                <Flame
                  className={`w-3.5 h-3.5 mt-0.5 ${item.active ? "fill-white text-white" : "text-muted-foreground/20"}`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE SWIPE DECK */}
        <section className="bg-foreground/[0.02] rounded-2xl p-4 flex flex-col items-center">
          <div className="flex items-center gap-1.5 self-start mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            <h2 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground font-ui">
              Active Quest Deck
            </h2>
          </div>
          <p className="text-[9px] text-muted-foreground text-center mb-1">
            Swipe left/right to browse. Click <span className="font-black text-primary">Start</span> to begin.
          </p>
          <TaskCards 
            tasks={tasks}
            onClaim={handleClaim}
            onToggle={handleToggle}
            onClick={handleClick}
          />
        </section>

        {/* FILTERS - FRAMELESS HIGH-CONTRAST PILLES */}
        <div className="py-0.5 -mx-4 md:-mx-8 lg:-mx-12">
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12">
              <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap gap-2 justify-start">
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
            </div>
          </Tabs>
        </div>

        {/* TASK LIST - COMPLETED WITH OUR SLICK ROW TASK CARDS */}
        <section className="space-y-2 w-full">
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
            {topEarners.map((user, idx) => (
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
                    <h5 className="font-bold text-xs tracking-tight">
                      {user.name}
                    </h5>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-0.5">
                      Rank #{idx + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <img
                    src={TJ_COIN_ICON}
                    alt="TJ"
                    className="w-5 h-5 object-contain"
                    referrerPolicy="no-referrer"
                  />
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
