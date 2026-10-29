import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TonJamHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const TonJamHeader: React.FC<TonJamHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = false,
  rightAction,
}) => {
  return (
    <div className="sticky top-0 z-20 w-full px-5 py-4 bg-[#091326]/90 backdrop-blur-md flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 text-slate-200 flex items-center justify-center transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FB] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-medium text-[#91A8C5] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && (
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default TonJamHeader;
