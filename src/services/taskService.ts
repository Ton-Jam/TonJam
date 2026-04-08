import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  points: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'achievement' | 'milestone' | 'seasonal';
  progress: number;
  total: number;
  dueDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  priority?: 'high' | 'medium' | 'low';
}

export const getTasks = async (): Promise<Task[]> => {
  if (!auth.currentUser) return [];
  const tasksRef = collection(db, `users/${auth.currentUser.uid}/tasks`);
  const snapshot = await getDocs(tasksRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const updateTaskProgress = async (taskId: string, progress: number) => {
  if (!auth.currentUser) return;
  const taskRef = doc(db, `users/${auth.currentUser.uid}/tasks`, taskId);
  await updateDoc(taskRef, { progress });
};

export const claimTaskReward = async (taskId: string) => {
  if (!auth.currentUser) return;
  const taskRef = doc(db, `users/${auth.currentUser.uid}/tasks`, taskId);
  await updateDoc(taskRef, { claimed: true });
  // Logic to add TJ coins to user balance would go here
};
