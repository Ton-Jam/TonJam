import React from 'react';
import { CheckCheck, Settings } from 'lucide-react';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';
import { useNavigate } from 'react-router-dom';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onOpenSettings: () => void;
  showBack?: boolean;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  onMarkAllAsRead,
  onOpenSettings,
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: 'var(--tj-header-bg, transparent)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      className="w-full flex items-center justify-between px-4 py-3 bg-transparent backdrop-blur-none backdrop-filter-none border-none shadow-none select-none sticky top-0 z-30"
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-[#FFFFFF] hover:bg-white/10 transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Go back"
          >
            <TonJamBackArrow size="sm" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight text-[#F5F7FB]">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors cursor-pointer"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#F5F7FB] hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Notification settings"
          aria-label="Notification settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default NotificationsHeader;
