import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';
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
  transparent = true,
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
      data-transparent={transparent ? 'true' : 'false'}
      style={{
        background: 'var(--tj-header-bg, transparent)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      className={cn(
        'w-full h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between z-30 transition-all select-none border-none shadow-none bg-transparent backdrop-blur-none backdrop-filter-none',
        sticky ? 'sticky top-0' : 'relative',
        className
      )}
    >
      {/* LEFT / TITLE ZONE: Back button (if present) + Title aligned to the left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full text-[#FFFFFF] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none shrink-0 bg-transparent"
            aria-label="Go back"
          >
            <TonJamBackArrow size="md" />
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
