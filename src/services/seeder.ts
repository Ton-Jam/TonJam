import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { Achievement } from '@/types';

export const seedAchievements = async () => {
  const achievements: Achievement[] = [
    {
      id: 'first-nft',
      title: 'First NFT Purchased',
      description: 'Purchased your first music NFT',
      criteria: 'Buy 1 Music NFT',
      rarity: 'common',
    },
    {
      id: 'explorer',
      title: 'Music Explorer',
      description: 'Listened to 10 unique tracks',
      criteria: 'Listen to 10 tracks',
      rarity: 'rare',
    },
    {
      id: 'top-fan',
      title: 'Top Fan',
      description: 'Liked 50 tracks',
      criteria: 'Like 50 tracks',
      rarity: 'epic',
    },
  ];

  const achievementsRef = collection(db, 'achievements');
  const snapshot = await getDocs(achievementsRef);

  if (snapshot.empty) {
    for (const achievement of achievements) {
      try {
        await setDoc(doc(achievementsRef, achievement.id), achievement);
      } catch (e) {
        console.error('Failed to seed achievement:', e);
      }
    }
  }
};
