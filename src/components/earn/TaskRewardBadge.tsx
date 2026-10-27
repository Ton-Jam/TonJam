import React from 'react';
import { TJ_COIN_ICON } from '@/constants';

interface TaskRewardBadgeProps {
  reward: string;
  size?: 'sm' | 'md' | 'lg';
  colorOverride?: 'blue' | 'pink' | 'gold' | 'purple' | 'teal' | 'green';
}

const COLOR_MAP = {
  blue: 'bg-[#229ED9]/15 border-[#229ED9]/30 text-[#229ED9]',
  pink: 'bg-pink-500/15 border-pink-500/30 text-[#F472B6]',
  gold: 'bg-amber-500/15 border-amber-500/30 text-[#FFC857]',
  purple: 'bg-purple-500/15 border-purple-500/30 text-[#9B7CFF]',
  teal: 'bg-teal-500/15 border-teal-500/30 text-[#2DD4BF]',
  green: 'bg-emerald-500/15 border-emerald-500/30 text-[#34D399]',
};

export const TaskRewardBadge: React.FC<TaskRewardBadgeProps> = ({
  reward,
  size = 'md',
  colorOverride = 'blue',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-black',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const colorClass = COLOR_MAP[colorOverride] || COLOR_MAP.blue;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-black tracking-tight shrink-0 ${colorClass} ${sizeClasses[size]}`}>
      <img src={TJ_COIN_ICON} alt="TJ" className={`${iconSizes[size]} object-contain shrink-0`} />
      <span>{reward.startsWith('+') ? reward : `+${reward}`}</span>
    </div>
  );
};

export default TaskRewardBadge;
