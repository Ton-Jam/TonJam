import React from 'react';

interface NotificationGroupHeaderProps {
  title: string;
  count: number;
}

export const NotificationGroupHeader: React.FC<NotificationGroupHeaderProps> = ({
  title,
  count,
}) => {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1 select-none">
      <span className="text-[11px] font-bold tracking-wider uppercase text-[#94A3B8]">
        {title}
      </span>
      <span className="text-[10px] font-semibold text-[#94A3B8] bg-white/[0.04] px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
};

export default NotificationGroupHeader;
