import React from 'react';
import { TaskCategoryType } from './types';

interface TaskCategoryFiltersProps {
  activeCategory: TaskCategoryType;
  onSelectCategory: (category: TaskCategoryType) => void;
  counts?: Partial<Record<TaskCategoryType, number>>;
}

const CATEGORIES: TaskCategoryType[] = ['All Tasks', 'Daily', 'Music', 'Community'];

export const TaskCategoryPill: React.FC<TaskCategoryFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          const count = counts?.[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 ${
                isActive
                  ? 'bg-[#2E8CEB] text-white shadow-sm'
                  : 'bg-white/[0.05] text-[#91A8C5] hover:bg-white/[0.08] hover:text-[#F5F7FB]'
              }`}
            >
              <span>{category}</span>
              {typeof count === 'number' && (
                <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCategoryPill;
