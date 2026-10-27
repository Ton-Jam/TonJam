import React from 'react';
import DrawerNotificationBadge from './DrawerNotificationBadge';

interface DrawerNavigationItemProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  label: string;
  isActive?: boolean;
  badgeCount?: number;
  badgeLabel?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export const DrawerNavigationItem: React.FC<DrawerNavigationItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  badgeCount,
  badgeLabel,
  subtitle,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl min-h-[44px] transition-all text-left cursor-pointer outline-none select-none
        focus-visible:ring-2 focus-visible:ring-[#229ED9]
        ${
          isActive
            ? 'bg-[#229ED9]/15 text-[#229ED9] font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
        }
        ${className}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={`w-5 h-5 shrink-0 transition-transform ${
            isActive ? 'text-[#229ED9] scale-105' : 'text-slate-400'
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />

        <div className="min-w-0">
          <span className="text-xs sm:text-[13px] tracking-wide block truncate">
            {label}
          </span>
          {subtitle && (
            <span className="text-[10px] text-slate-500 block truncate -mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {badgeCount !== undefined && badgeCount > 0 && (
          <DrawerNotificationBadge count={badgeCount} />
        )}
        {badgeLabel && (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#229ED9]/20 text-[#229ED9]">
            {badgeLabel}
          </span>
        )}
      </div>
    </button>
  );
};

export default DrawerNavigationItem;
