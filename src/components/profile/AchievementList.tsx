import React, { useEffect, useState } from 'react';
import { Achievement, UserAchievement } from '@/types';
import { achievementService } from '@/services/achievementService';
import { AchievementBadge } from './AchievementBadge';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AchievementListProps {
  userId: string;
}

export const AchievementList: React.FC<AchievementListProps> = ({ userId }) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const uAchievements = await achievementService.getUserAchievements(userId);
      setUserAchievements(uAchievements);

      const achievementsSnap = await getDocs(collection(db, 'achievements'));
      const aAchievements = achievementsSnap.docs.map(doc => doc.data() as Achievement);
      setAllAchievements(aAchievements);
    };
    fetchData();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-3 gap-4">
        {allAchievements.map(a => {
          const unlocked = userAchievements.find(ua => ua.achievementId === a.id);
          return <AchievementBadge key={a.id} achievement={a} unlocked={!!unlocked} />;
        })}
      </div>
    </div>
  );
};
