import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface SettingsSelectionRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description?: string;
  currentValue: string;
  onClick: () => void;
}

export const SettingsSelectionRow: React.FC<SettingsSelectionRowProps> = ({
  icon: Icon,
  iconBgColor = 'bg-[#9B7CFF]/15',
  iconColor = 'text-[#9B7CFF]',
  title,
  description,
  currentValue,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.07]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[#F5F7FB] truncate">
            {title}
          </span>
          {description && (
            <span className="text-xs text-[#91A8C5] line-clamp-1 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-[#2E8CEB] bg-[#2E8CEB]/10 px-2.5 py-1 rounded-lg">
          {currentValue}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>
    </div>
  );
};

export default SettingsSelectionRow;
