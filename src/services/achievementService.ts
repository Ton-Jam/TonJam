import { db } from '@/lib/firebase';
import { collection, doc, setDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { Achievement, UserAchievement } from '@/types';

export const achievementService = {
  async unlockAchievement(userId: string, achievementId: string) {
    const userAchievementRef = doc(collection(db, 'users', userId, 'achievements'), achievementId);
    const userAchievementSnap = await getDoc(userAchievementRef);

    if (userAchievementSnap.exists()) {
      return; // Already unlocked
    }

    const newAchievement: UserAchievement = {
      id: Math.random().toString(36).substring(7),
      userId,
      achievementId,
      unlockedAt: new Date().toISOString(),
    };

    await setDoc(userAchievementRef, newAchievement);
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const snapshot = await getDocs(achievementsRef);
    return snapshot.docs.map(doc => doc.data() as UserAchievement);
  },
};
