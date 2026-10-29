import React from 'react';

export const NotificationUnreadIndicator: React.FC = () => {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full bg-[#2E8CEB] shadow-[0_0_8px_rgba(46,140,235,0.8)] shrink-0"
      aria-label="Unread notification"
    />
  );
};

export default NotificationUnreadIndicator;
