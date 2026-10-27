import React from 'react';

interface DrawerNotificationBadgeProps {
  count: number;
  className?: string;
}

export const DrawerNotificationBadge: React.FC<DrawerNotificationBadgeProps> = ({
  count,
  className = '',
}) => {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#229ED9] text-white text-[10px] font-mono font-bold leading-none shadow-sm select-none ${className}`}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
};

export default DrawerNotificationBadge;
