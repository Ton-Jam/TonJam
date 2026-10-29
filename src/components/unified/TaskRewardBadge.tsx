import React from 'react';
import { TJ_COIN_ICON } from '@/constants';

interface TaskRewardBadgeProps {
  reward: number;
  size?: 'sm' | 'md';
  colorOverride?: 'gold' | 'pink' | 'purple' | 'blue';
}

export const TaskRewardBadge: React.FC<TaskRewardBadgeProps> = ({
  reward,
  size = 'sm',
  colorOverride = 'gold',
}) => {
  const colorStyles = {
    gold: 'bg-[#FFC857]/15 text-[#FFC857]',
    pink: 'bg-[#F472B6]/15 text-[#F472B6]',
    purple: 'bg-[#9B7CFF]/15 text-[#9B7CFF]',
    blue: 'bg-[#2E8CEB]/15 text-[#2E8CEB]',
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg shrink-0 ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } ${colorStyles[colorOverride]}`}
    >
      <img
        src={TJ_COIN_ICON}
        alt="TJ"
        className={isSmall ? 'w-3.5 h-3.5 object-contain' : 'w-4 h-4 object-contain'}
      />
      <span>+{reward.toLocaleString()}</span>
    </div>
  );
};

export default TaskRewardBadge;
