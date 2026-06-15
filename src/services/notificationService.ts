import { Notification, NotificationPreferences } from '@/types';

const STORAGE_KEY_NOTIFICATIONS = 'notifications';
const STORAGE_KEY_PREFERENCES = 'notification_preferences';

export const notificationService = {
  getNotifications: (userId: string): Notification[] => {
    const data = localStorage.getItem(`${STORAGE_KEY_NOTIFICATIONS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveNotifications: (userId: string, notifications: Notification[]) => {
    localStorage.setItem(`${STORAGE_KEY_NOTIFICATIONS}_${userId}`, JSON.stringify(notifications));
  },

  getPreferences: (userId: string): NotificationPreferences => {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFERENCES}_${userId}`);
    return data ? JSON.parse(data) : {
      userId,
      directAlerts: true,
      marketActivity: true,
      dropsAndReleases: true,
      socialSignals: true,
      bidAlerts: true,
      saleEvents: true,
      revenueThreshold: 100,
    };
  },

  savePreferences: (userId: string, preferences: NotificationPreferences) => {
    localStorage.setItem(`${STORAGE_KEY_PREFERENCES}_${userId}`, JSON.stringify(preferences));
  },

  addNotification: (userId: string, notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const prefs = notificationService.getPreferences(userId);
    
    // Check if user wants this notification
    if (notification.type === 'track_upload' && !prefs.dropsAndReleases) return;
    if (notification.type === 'nft_sale' && !prefs.saleEvents) return;
    if (notification.type === 'event' && !prefs.directAlerts) return;
    if (notification.type === 'bid_update' && !prefs.bidAlerts) return;

    const notifications = notificationService.getNotifications(userId);
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      timestamp: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    notificationService.saveNotifications(userId, notifications);

    // Trigger standard HTML5 native desktop/push alerts if enabled and approved
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        try {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        } catch (error) {
          console.warn("Native push notification display failed:", error);
        }
      }
    }
  },

  requestPushPermission: async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') return true;
      if (window.Notification.permission === 'denied') return false;
      
      try {
        const permission = await window.Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error("Error requesting push permissions:", error);
        return false;
      }
    }
    return false;
  }
};
