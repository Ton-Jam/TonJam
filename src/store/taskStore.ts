import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/types';

// Default tasks for the initial state
const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Daily Sync', description: 'Stream 5 tracks today', reward: '5 TJ', points: 50, completed: false, claimed: false, type: 'daily', progress: 0, total: 5 },
  { id: '2', title: 'Network Supporter', description: 'Follow 3 new artists', reward: '10 TJ', points: 100, completed: false, claimed: false, type: 'daily', progress: 0, total: 3 },
  { id: '3', title: 'Collector Genesis', description: 'Purchase your first NFT', reward: '50 TJ', points: 500, completed: false, claimed: false, type: 'achievement', progress: 0, total: 1 },
  { id: '4', title: 'Signal Broadcaster', description: 'Share a track to JamSpace', reward: '5 TJ', points: 25, completed: false, claimed: false, type: 'daily', progress: 0, total: 1 },
];

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  completeTaskLocal: (id: string) => void;
  claimTaskLocal: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: DEFAULT_TASKS,
      setTasks: (tasks) => set((state) => ({ 
        tasks: typeof tasks === 'function' ? tasks(state.tasks) : tasks 
      })),
      updateTaskProgress: (id, progress) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id === id) {
            const newProgress = Math.min(t.total, progress);
            return { ...t, progress: newProgress, completed: newProgress >= t.total };
          }
          return t;
        })
      })),
      completeTaskLocal: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: true, progress: t.total } : t)
      })),
      claimTaskLocal: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, claimed: true } : t)
      }))
    }),
    {
      name: 'tonjam-tasks',
    }
  )
);
