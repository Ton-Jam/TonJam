import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCategory, TaskStatus } from '@/components/earn/types';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, increment, onSnapshot, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { showTaskCompletionToast } from '@/components/earn/TaskToast';
import { reportTaskError, TaskErrorPayload } from '@/utils/taskErrorMonitor';
import { logError, ErrorMetadata } from '@/lib/logger';
import { useTaskErrorLogger } from '@/hooks/useTaskErrorLogger';

export const INITIAL_TASKS: Task[] = [];

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  updateTaskProgress: (taskId: string, incrementAmount?: number) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  claimTaskReward: (taskId: string) => Promise<boolean>;
  recordTaskActivity: (type: string, amount?: number) => Promise<void>;
  resetTasks: () => Promise<void>;
  reportTaskError: (payload: TaskErrorPayload) => void;
  logError: (error: unknown, context?: ErrorMetadata) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    return {
      tasks: [],
      isLoading: false,
      isSyncing: false,
      error: null,
      updateTaskProgress: async () => {},
      completeTask: async () => {},
      claimTaskReward: async () => false,
      recordTaskActivity: async () => {},
      resetTasks: async () => {},
      reportTaskError: () => {},
      logError: () => {},
    };
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    logError: logTaskError,
    wrapTaskCompletion,
    wrapStatusUpdate,
    wrapFirestoreSync,
    wrapTaskAction,
  } = useTaskErrorLogger();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [templateTasks, setTemplateTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync global task templates & user task progress from Firestore
  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeTemplates: (() => void) | null = null;
    let latestTemplates: Task[] = [];
    let latestUserTasks: Task[] | null = null;

    const mergeTasks = (templates: Task[], userTasks: Task[] | null): Task[] => {
      if (!userTasks || userTasks.length === 0) return templates;
      if (templates.length === 0) return userTasks;
      const userMap = new Map(userTasks.map((t) => [t.id, t]));
      return templates.map((tpl) => {
        const existing = userMap.get(tpl.id);
        return existing ? { ...tpl, progress: existing.progress ?? tpl.progress, status: existing.status ?? tpl.status, completedAt: existing.completedAt } : tpl;
      });
    };

    unsubscribeTemplates = onSnapshot(
      collection(db, 'tasks'),
      (snap) => {
        latestTemplates = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
        setTemplateTasks(latestTemplates);
        setTasks(mergeTasks(latestTemplates, latestUserTasks));
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'tasks');
      }
    );

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (currentUser) {
        setIsSyncing(true);
        const userTasksDocRef = doc(db, 'users', currentUser.uid, 'taskState', 'userTasks');

        unsubscribeDoc = onSnapshot(
          userTasksDocRef,
          (snap) => {
            setIsSyncing(false);
            if (snap.exists()) {
              const data = snap.data();
              if (Array.isArray(data.tasks)) {
                latestUserTasks = data.tasks;
                setTasks(mergeTasks(latestTemplates, latestUserTasks));
              }
            } else {
              latestUserTasks = [];
              setTasks(latestTemplates);
            }
          },
          (err) => {
            setIsSyncing(false);
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}/taskState/userTasks`);
            reportTaskError({
              eventType: 'TASK_SYNC_FAILED',
              error: err,
              message: 'Real-time synchronization for user task state failed',
              severity: 'warning',
              context: {
                userId: currentUser.uid,
                path: `users/${currentUser.uid}/taskState/userTasks`,
              },
            });
          }
        );
      } else {
        setIsSyncing(false);
        latestUserTasks = null;
        setTasks(latestTemplates);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeTemplates) unsubscribeTemplates();
    };
  }, []);

  // Persist helper with error tracking and Firestore status sync tracking
  const persistTasks = useCallback(
    async (updatedTasks: Task[]) => {
      setTasks(updatedTasks);
      try {
        localStorage.setItem('tonjam_earn_tj_tasks_v2', JSON.stringify(updatedTasks));
      } catch (e) {
        logTaskError(e, {
          eventType: 'TASK_STATUS_UPDATE_FAILED',
          message: 'Failed to persist task state to local storage cache',
          severity: 'warning',
          metadata: { tasksCount: updatedTasks.length },
        });
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        const path = `users/${currentUser.uid}/taskState/userTasks`;
        await wrapFirestoreSync(
          path,
          async () => {
            const userTasksDocRef = doc(db, 'users', currentUser.uid, 'taskState', 'userTasks');
            await setDoc(
              userTasksDocRef,
              {
                tasks: updatedTasks,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          },
          {
            userId: currentUser.uid,
            eventType: 'TASK_STATUS_UPDATE_FAILED',
            message: 'Failed to update task progress status in Firestore',
            metadata: { tasksCount: updatedTasks.length },
          }
        );
      }
    },
    [logTaskError, wrapFirestoreSync]
  );

  // Update specific task progress with status change validation & error capture
  const updateTaskProgress = useCallback(
    async (taskId: string, incrementAmount: number = 1) => {
      await wrapStatusUpdate(
        taskId,
        async () => {
          if (!taskId) {
            throw new Error('Cannot update task progress: taskId is required');
          }

          setTasks((prevTasks) => {
            const targetTask = prevTasks.find((t) => t.id === taskId);
            if (!targetTask) {
              throw new Error(`Task with id "${taskId}" not found in state`);
            }

            if (targetTask.status === 'completed') {
              logTaskError(
                new Error(`Task "${targetTask.title}" (${taskId}) is already completed and cannot be updated`),
                {
                  taskId,
                  taskTitle: targetTask.title,
                  fromStatus: 'completed',
                  toStatus: 'in_progress',
                  severity: 'warning',
                  progress: targetTask.progress,
                  total: targetTask.total,
                  incrementAmount,
                }
              );
              return prevTasks;
            }

            const currentProg = targetTask.progress || 0;
            const targetTotal = targetTask.total || 1;
            const nextProg = Math.min(targetTotal, currentProg + incrementAmount);
            const isClaimableNow = nextProg >= targetTotal;
            const nextStatus: TaskStatus = isClaimableNow ? 'claimable' : 'in_progress';

            const updated = prevTasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  progress: nextProg,
                  status: nextStatus,
                };
              }
              return task;
            });

            persistTasks(updated);
            return updated;
          });
        },
        {
          incrementAmount,
          eventType: 'TASK_STATUS_UPDATE_FAILED',
        }
      );
    },
    [wrapStatusUpdate, logTaskError, persistTasks]
  );

  // Complete task logic wrapped with useTaskErrorLogger
  const completeTask = useCallback(
    async (taskId: string) => {
      await wrapTaskCompletion(
        taskId,
        async () => {
          if (!taskId) {
            throw new Error('completeTask called without taskId');
          }

          const nowIso = new Date().toISOString();
          setTasks((prevTasks) => {
            const targetTask = prevTasks.find((t) => t.id === taskId);
            if (!targetTask) {
              throw new Error(`Task "${taskId}" not found to complete`);
            }

            if (targetTask.status === 'completed') {
              return prevTasks;
            }

            const updated = prevTasks.map((t) =>
              t.id === taskId
                ? { ...t, status: 'completed' as TaskStatus, completedAt: t.completedAt || nowIso }
                : t
            );
            persistTasks(updated);
            return updated;
          });
        },
        {
          toStatus: 'completed',
          eventType: 'TASK_COMPLETION_FAILED',
        }
      );
    },
    [wrapTaskCompletion, persistTasks]
  );

  // Claim task reward wrapped with useTaskErrorLogger
  const claimTaskReward = useCallback(
    async (taskId: string): Promise<boolean> => {
      const result = await wrapTaskCompletion(
        taskId,
        async () => {
          const targetTask = tasks.find((t) => t.id === taskId);
          if (!targetTask) {
            throw new Error(`Cannot claim reward: task "${taskId}" not found in current state`);
          }

          if (targetTask.status === 'completed') {
            logTaskError(
              new Error(`Reward for task "${targetTask.title}" (${taskId}) has already been claimed`),
              {
                taskId,
                taskTitle: targetTask.title,
                fromStatus: 'completed',
                toStatus: 'completed',
                severity: 'warning',
                rewardAmount: targetTask.rewardAmount,
                completedAt: targetTask.completedAt,
              }
            );
            return false;
          }

          if (targetTask.status !== 'claimable') {
            throw new Error(
              `Task "${targetTask.title}" (${taskId}) is not in claimable status (current: ${targetTask.status})`
            );
          }

          const nowIso = new Date().toISOString();
          const updatedTasks = tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed' as TaskStatus, completedAt: t.completedAt || nowIso }
              : t
          );

          await persistTasks(updatedTasks);

          // Increment user TJ balance in Firestore if logged in
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userRef, {
                tjBalance: increment(targetTask.rewardAmount),
                jamBalance: increment(targetTask.rewardAmount),
              });
            } catch (err) {
              console.warn('Error updating TJ balance in Firestore on task claim:', err);
              logTaskError(err, {
                taskId,
                taskTitle: targetTask.title,
                fromStatus: 'claimable',
                toStatus: 'completed',
                eventType: 'TASK_CLAIM_FAILED',
                severity: 'error',
                message: `Firestore balance increment failed for user ${currentUser.uid} claiming task "${taskId}"`,
                userId: currentUser.uid,
                rewardAmount: targetTask.rewardAmount,
              });
            }
          }

          showTaskCompletionToast({
            taskTitle: targetTask.title,
            rewardAmount: targetTask.rewardAmount,
            message: `+${targetTask.rewardAmount} TJ credited to your balance.`,
          });

          return true;
        },
        {
          eventType: 'TASK_CLAIM_FAILED',
        }
      );

      return Boolean(result);
    },
    [tasks, wrapTaskCompletion, persistTasks, logTaskError]
  );

  // Activity event handler with structured error logging
  const recordTaskActivity = useCallback(
    async (type: string, amount: number = 1) => {
      if (!type) return;

      await wrapTaskAction(
        async () => {
          setTasks((prevTasks) => {
            let changed = false;
            const updated = prevTasks.map((task) => {
              const cat = task.category.toLowerCase();
              const matchType =
                (type === 'listen_track' && (cat === 'music' || task.title.toLowerCase().includes('listen'))) ||
                (type === 'follow' && (cat === 'social' || task.title.toLowerCase().includes('artist'))) ||
                (type === 'community' && (cat === 'community' || task.title.toLowerCase().includes('community')));

              if (matchType && task.status !== 'completed') {
                const currentProg = task.progress || 0;
                const targetTotal = task.total || 1;
                const nextProg = Math.min(targetTotal, currentProg + amount);
                const isClaimableNow = nextProg >= targetTotal;
                changed = true;

                return {
                  ...task,
                  progress: nextProg,
                  status: isClaimableNow ? ('claimable' as TaskStatus) : ('in_progress' as TaskStatus),
                };
              }
              return task;
            });

            if (changed) {
              persistTasks(updated);
            }
            return updated;
          });
        },
        {
          eventType: 'TASK_ACTIVITY_RECORD_FAILED',
          message: `Failed to record task activity of type "${type}"`,
          severity: 'warning',
          activityType: type,
          incrementAmount: amount,
        }
      );
    },
    [wrapTaskAction, persistTasks]
  );

  // Reset tasks to Firestore templates
  const resetTasks = useCallback(async () => {
    await persistTasks(templateTasks);
  }, [persistTasks, templateTasks]);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      isSyncing,
      error,
      updateTaskProgress,
      completeTask,
      claimTaskReward,
      recordTaskActivity,
      resetTasks,
      reportTaskError,
      logError: logTaskError,
    }),
    [
      tasks,
      isLoading,
      isSyncing,
      error,
      updateTaskProgress,
      completeTask,
      claimTaskReward,
      recordTaskActivity,
      resetTasks,
      logTaskError,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export default TaskProvider;
