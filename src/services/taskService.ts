import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, serverTimestamp, increment } from 'firebase/firestore';
import { Task } from '@/types';

export const getTasks = async (): Promise<Task[]> => {
  if (!auth.currentUser) return [];
  try {
    const tasksRef = collection(db, `users/${auth.currentUser.uid}/tasks`);
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser.uid}/tasks`);
    return [];
  }
};

export const updateTaskProgress = async (taskId: string, progress: number) => {
  if (!auth.currentUser) return;
  try {
    const taskRef = doc(db, `users/${auth.currentUser.uid}/tasks`, taskId);
    await updateDoc(taskRef, { progress });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/tasks`);
  }
};

export const claimTaskReward = async (taskId: string, rewardAmount: number, points: number) => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  
  try {
    // 1. Mark task as claimed locally or on the user's subset
    // Depending on architecture, we might just store completed tasks in `taskCompletions`
    const completionRef = collection(db, 'taskCompletions');
    await addDoc(completionRef, {
      userId,
      taskId,
      completed: true,
      claimedAt: serverTimestamp(),
      rewardEarned: rewardAmount
    });

    // 2. Mark the task itself as claimed
    const taskRef = doc(db, `users/${userId}/tasks`, taskId);
    await updateDoc(taskRef, { claimed: true });

    // 3. Update user balance
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      tjBalance: increment(rewardAmount),
      jamBalance: increment(rewardAmount)
    });
    
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `taskCompletions`);
    throw error;
  }
};

