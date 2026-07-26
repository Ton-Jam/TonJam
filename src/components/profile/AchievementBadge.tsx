import React from 'react';
import { Achievement } from '@/types';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, unlocked = false }) => {
  return (
    <div className={`flex flex-col items-center p-2 rounded-lg ${unlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
        {achievement.iconUrl ? (
          <img src={achievement.iconUrl} alt={achievement.title} className="w-full h-full rounded-full" />
        ) : (
          <span className="text-xl font-bold">{achievement.title[0]}</span>
        )}
      </div>
      <p className="text-sm font-semibold text-center">{achievement.title}</p>
    </div>
  );
};
