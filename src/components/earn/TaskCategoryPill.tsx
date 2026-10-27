import React from 'react';
import { motion } from 'motion/react';
import { TaskCategory } from './types';
import { Sparkles, Calendar, Music, Users, Clock } from 'lucide-react';

interface TaskCategoryFiltersProps {
  activeCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  completedCount?: number;
}

interface CategoryFilterItem {
  id: TaskCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const CATEGORIES: CategoryFilterItem[] = [
  { id: 'All Tasks', label: 'All Tasks', icon: Sparkles, accentColor: 'text-[#229ED9]' },
  { id: 'Daily', label: 'Daily', icon: Calendar, accentColor: 'text-[#FFC857]' },
  { id: 'Music', label: 'Music', icon: Music, accentColor: 'text-[#9B7CFF]' },
  { id: 'Community', label: 'Community', icon: Users, accentColor: 'text-[#2DD4BF]' },
  { id: 'History', label: 'History', icon: Clock, accentColor: 'text-[#34D399]' },
];

export const TaskCategoryPill: React.FC<{
  category: CategoryFilterItem;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ category, isActive, onClick, badgeCount }) => {
  const Icon = category.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-pressed={isActive}
      className={`
        flex items-center gap-1.5 px-3.5 py-2 rounded-full
        text-xs font-bold tracking-wide uppercase transition-all duration-200
        cursor-pointer shrink-0 outline-none border
        ${isActive 
          ? category.id === 'History' 
            ? 'bg-[#34D399] text-slate-950 border-[#34D399] shadow-md shadow-[#34D399]/25 font-black'
            : 'bg-[#229ED9] text-white border-[#229ED9] shadow-md shadow-[#229ED9]/25 font-black'
          : 'bg-[#111C30] text-slate-400 border-white/10 hover:text-white hover:border-white/20'
        }
      `}
    >
      <Icon className={`w-3.5 h-3.5 ${isActive ? (category.id === 'History' ? 'text-slate-950' : 'text-white') : category.accentColor}`} />
      <span>{category.label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-black/20 text-current' : 'bg-white/10 text-slate-300'}`}>
          {badgeCount}
        </span>
      )}
    </motion.button>
  );
};

export const TaskCategoryFilters: React.FC<TaskCategoryFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  completedCount,
}) => {
  return (
    <div className="w-full flex gap-2 overflow-x-auto no-scrollbar py-1 px-1 select-none touch-pan-x">
      {CATEGORIES.map((category) => (
        <TaskCategoryPill
          key={category.id}
          category={category}
          isActive={activeCategory === category.id}
          onClick={() => onSelectCategory(category.id)}
          badgeCount={category.id === 'History' ? completedCount : undefined}
        />
      ))}
    </div>
  );
};

export default TaskCategoryFilters;
