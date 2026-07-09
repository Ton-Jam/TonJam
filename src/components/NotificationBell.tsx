import React from 'react';
import { NotificationProvider } from './notifications/NotificationContext';
import NewNotificationBell from './notifications/NotificationBell';

export const NotificationBell: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <NotificationProvider>
      <NewNotificationBell onClick={onClick} />
    </NotificationProvider>
  );
};

export default NotificationBell;
