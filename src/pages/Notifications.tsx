import React from 'react';
import { NotificationProvider } from '@/components/notifications/NotificationContext';
import NotificationScreen from '@/components/notifications/NotificationScreen';

const NotificationsPage: React.FC = () => {
  return (
    <NotificationProvider>
      <NotificationScreen />
    </NotificationProvider>
  );
};

export default NotificationsPage;
