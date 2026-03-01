import React, { useState } from 'react';
import { CheckCircle2, Circle, Zap, Trophy, Star, Shield, Gift, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'achievement' | 'milestone';
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => (
  <div className={`p-6 rounded-[5px] border transition-all ${task.completed ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-[5px] flex items-center justify-center ${task.completed ? 'bg-green-500/20 text-green-500' : 'bg-blue-600/20 text-blue-500'}`}>
          {task.completed ? <CheckCircle2 className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">{task.title}</h3>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{task.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-blue-500">+{task.reward}</p>
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{task.points} XP</p>
      </div>
    </div>
  </div>
);

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Daily Sync', description: 'Stream 5 tracks today', reward: '5 TJ', points: 50, completed: true, type: 'daily' },
    { id: '2', title: 'Network Supporter', description: 'Follow 3 new artists', reward: '10 TJ', points: 100, completed: false, type: 'daily' },
    { id: '3', title: 'Collector Genesis', description: 'Purchase your first NFT', reward: '50 TJ', points: 500, completed: false, type: 'achievement' },
    { id: '4', title: 'Signal Broadcaster', description: 'Share a track to JamSpace', reward: '5 TJ', points: 25, completed: false, type: 'daily' },
    { id: '5', title: 'High Fidelity', description: 'Listen for 10 hours total', reward: '100 TJ', points: 1000, completed: false, type: 'milestone' },
  ]);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-4xl mx-auto pb-32">
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Neural Tasks</h1>
        <p className="text-sm font-bold text-white/20 uppercase tracking-[0.3em]">Complete protocols to earn TJ rewards</p>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
        <div className="min-w-[240px] flex-1 bg-blue-600/10 border border-blue-500/20 rounded-[5px] p-6 space-y-2">
          <Trophy className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Total Earned</p>
          <p className="text-2xl font-black text-white uppercase tracking-tighter">1,240 TJ</p>
        </div>
        <div className="min-w-[240px] flex-1 bg-purple-600/10 border border-purple-500/20 rounded-[5px] p-6 space-y-2">
          <Star className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Current XP</p>
          <p className="text-2xl font-black text-white uppercase tracking-tighter">Level 12</p>
        </div>
        <div className="min-w-[240px] flex-1 bg-amber-600/10 border border-amber-500/20 rounded-[5px] p-6 space-y-2">
          <Gift className="h-6 w-6 text-amber-500 mb-2" />
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Next Reward</p>
          <p className="text-2xl font-black text-white uppercase tracking-tighter">500 XP</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <SectionHeader title="Daily Protocols" subtitle="Resets in 14h 22m" />
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {tasks.filter(t => t.type === 'daily').map(task => (
              <div key={task.id} className="min-w-[280px] sm:min-w-[320px]">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Achievements" subtitle="Permanent network milestones" />
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {tasks.filter(t => t.type !== 'daily').map(task => (
              <div key={task.id} className="min-w-[280px] sm:min-w-[320px]">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tasks;
