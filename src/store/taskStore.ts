import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/types';

const DEFAULT_TASKS: Task[] = [];

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
