import React from 'react';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';

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
    <div
      style={{
        background: 'var(--tj-header-bg, transparent)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      className="sticky top-0 z-20 w-full px-5 py-4 bg-transparent backdrop-blur-none backdrop-filter-none border-none shadow-none flex items-center justify-between gap-3 select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-transparent hover:bg-white/10 active:scale-95 text-[#FFFFFF] flex items-center justify-center transition-all shrink-0 border-none cursor-pointer"
            aria-label="Go back"
          >
            <TonJamBackArrow size="md" />
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
