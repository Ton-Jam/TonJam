import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationEmptyStateProps {
  isFilterEmpty?: boolean;
  filterName?: string;
  onResetFilter?: () => void;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
  isFilterEmpty = false,
  filterName,
  onResetFilter,
}) => {
  const navigate = useNavigate();

  if (isFilterEmpty) {
    return (
      <div className="py-20 px-6 flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200">
        <div className="relative w-16 h-16 rounded-full bg-[#111C30] flex items-center justify-center mb-4 text-[#94A3B8]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#229ED9]/15 to-[#9B7CFF]/15 blur-lg" />
          <Bell className="w-7 h-7 relative z-10 text-[#94A3B8]" />
        </div>
        <h3 className="text-sm font-bold text-[#F5F7FB]">
          No notifications in this category yet
        </h3>
        <p className="text-xs text-[#94A3B8] font-normal max-w-xs mt-1.5 leading-relaxed">
          When there are new updates for {filterName || 'this filter'}, they will appear here.
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="mt-5 px-4 py-2 rounded-full bg-[#111C30] hover:bg-[#16243E] border border-white/[0.08] text-xs font-semibold text-[#F5F7FB] transition-all cursor-pointer"
          >
            View all notifications
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-20 px-6 flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200">
      <div className="relative w-20 h-20 rounded-full bg-[#111C30] flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#229ED9]/25 to-[#9B7CFF]/25 blur-xl pointer-events-none" />
        <div className="relative z-10 w-12 h-12 rounded-full bg-[#080D1A] flex items-center justify-center border border-white/[0.06]">
          <Bell className="w-6 h-6 text-[#229ED9]" />
        </div>
      </div>

      <h2 className="text-base font-bold text-[#F5F7FB]">
        You're all caught up
      </h2>
      <p className="text-xs text-[#94A3B8] font-normal max-w-xs mt-2 leading-relaxed">
        Updates from artists, listeners, and your music community will appear here.
      </p>

      <button
        onClick={() => navigate('/discover')}
        className="mt-6 px-5 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1e8bc2] text-white text-xs font-bold transition-all shadow-md shadow-[#229ED9]/20 active:scale-95 cursor-pointer flex items-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Explore TonJam</span>
      </button>
    </div>
  );
};

export default NotificationEmptyState;
