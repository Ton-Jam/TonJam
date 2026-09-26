import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export type PageHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  transparent?: boolean;
  sticky?: boolean;
  className?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightContent,
  transparent = false,
  sticky = true,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        "w-full h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between z-30 transition-all select-none border-none",
        sticky ? "sticky top-0" : "relative",
        transparent
          ? "bg-transparent"
          : "bg-black/85 backdrop-blur-xl",
        className
      )}
    >
      {/* LEFT / TITLE ZONE: Back button (if present) + Title aligned to the left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none shrink-0"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
        <h1 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* RIGHT ZONE: Screen-specific actions only */}
      {rightContent && (
        <div className="flex items-center justify-end shrink-0 gap-2 pl-3">
          {rightContent}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
