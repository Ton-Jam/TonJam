import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationPreferences } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  markAsRead: (id: string) => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
  refreshNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '',
    directAlerts: true,
    marketActivity: true,
    dropsAndReleases: true,
    socialSignals: true,
    bidAlerts: true,
    saleEvents: true,
    revenueThreshold: 100,
  });

  const refreshNotifications = () => {
    if (user) {
      setNotifications(notificationService.getNotifications(user.uid));
      setPreferences(notificationService.getPreferences(user.uid));
    }
  };

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    if (!user) return;
    notificationService.addNotification(user.uid, n);
    refreshNotifications();
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  const markAsRead = (id: string) => {
    if (!user) return;
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    notificationService.saveNotifications(user.uid, updated);
  };

  const updatePreferences = (prefs: NotificationPreferences) => {
    if (!user) return;
    setPreferences(prefs);
    notificationService.savePreferences(user.uid, prefs);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, preferences, unreadCount, markAsRead, updatePreferences, refreshNotifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
