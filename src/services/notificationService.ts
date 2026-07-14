import { Notification, NotificationPreferences } from '@/types';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      timestamp,
    };
    notifications.unshift(newNotification);
    notificationService.saveNotifications(userId, notifications);

    // Build the unified notification object to write to Firestore
    // This allows both NotificationContexts (general and advanced TonJamNotification) to read and parse it perfectly.
    const categoryMapping: Record<string, string> = {
      track_upload: 'artist_release',
      bid_update: 'auction',
      nft_sale: 'nft_sale',
      event: 'marketplace',
    };

    const unifiedNotification: any = {
      id,
      userId,
      read: false,
      timestamp,
      
      // General Notification schema fields
      type: notification.type,
      message: notification.message,
      title: notification.title,
      link: notification.link || '',
      metadata: notification.metadata || {},
      
      // TonJamNotification schema fields
      category: categoryMapping[notification.type] || 'system',
      description: notification.message,
      thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&fit=crop&q=80',
    };

    // Add quick actions for interactive notification screens
    if (unifiedNotification.category === 'artist_release') {
      unifiedNotification.quickAction = {
        label: 'Listen',
        type: 'play',
        payload: { trackId: notification.metadata?.trackId }
      };
    } else if (unifiedNotification.category === 'auction') {
      unifiedNotification.quickAction = {
        label: 'Counter Bid',
        type: 'bid',
        payload: { nftId: notification.metadata?.nftId }
      };
    } else if (unifiedNotification.category === 'nft_sale') {
      unifiedNotification.quickAction = {
        label: 'Check Ledger',
        type: 'view',
        payload: { nftId: notification.metadata?.nftId }
      };
    }

    // Write to Firestore /users/{userId}/notifications/{id} asynchronously
    try {
      const docRef = doc(db, 'users', userId, 'notifications', id);
      setDoc(docRef, unifiedNotification).catch((err) => {
        console.warn("[notificationService] Firestore write failed:", err);
      });
    } catch (err) {
      console.warn("[notificationService] Firestore write failed:", err);
    }

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
