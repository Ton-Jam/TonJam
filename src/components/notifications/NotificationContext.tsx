import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TonJamNotification, NotificationPreferences, NotificationCategory } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query,
  onSnapshot, 
  doc, 
  writeBatch, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface NotificationContextType {
  notifications: TonJamNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
  retryFetch: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  requestPushPermission: () => Promise<boolean>;
  simulateNotification: (category?: NotificationCategory) => void;
  simulateBidUpdate: () => void;
  simulateTrackDrop: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: NotificationPreferences = {
  directAlerts: true,
  marketActivity: true,
  dropsAndReleases: true,
  socialSignals: true,
  bidAlerts: true,
  saleEvents: true,
  rewardsAndMissions: true,
  systemUpdates: true,
  digestFrequency: 'none',
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TonJamNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [retryIndex, setRetryIndex] = useState<number>(0);

  const retryFetch = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStorageKey = useCallback((suffix: string) => {
    const uid = user?.uid || 'guest_user';
    return `tonjam_notifications_${uid}_${suffix}`;
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const uid = user?.uid;

    try {
      const storedPrefs = localStorage.getItem(getStorageKey('prefs'));
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (e) {
      console.warn('Error reading stored prefs:', e);
    }

    if (!uid) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const notifColRef = collection(db, 'users', uid, 'notifications');
    const notifQuery = query(notifColRef);

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        setError(null);
        if (snapshot.empty) {
          setNotifications([]);
          setIsLoading(false);
          return;
        }

        const list: TonJamNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId || uid,
            category: data.category || (data.type ? (data.type === 'track_upload' ? 'artist_release' : data.type === 'bid_update' ? 'auction' : data.type === 'nft_sale' ? 'nft_sale' : 'system') : 'system'),
            title: data.title || 'Notification',
            description: data.description || data.message || '',
            timestamp: data.timestamp || new Date().toISOString(),
            read: data.read ?? false,
            avatarUrl: data.avatarUrl,
            thumbnailUrl: data.thumbnailUrl,
            senderName: data.senderName,
            isVerified: data.isVerified,
            musicPreview: data.musicPreview,
            nftPreview: data.nftPreview,
            socialPreview: data.socialPreview,
            link: data.link,
            quickAction: data.quickAction,
            metadata: data.metadata,
          } as TonJamNotification);
        });

        const sortedList = list.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setNotifications(sortedList);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load notifications from network.');
        handleFirestoreError(err, OperationType.GET, `users/${uid}/notifications`);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, getStorageKey, retryIndex]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        await updateDoc(docRef, { read: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications/${id}`);
      }
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    if (user?.uid) {
      try {
        const unreadList = notifications.filter((notif) => !notif.read);
        if (unreadList.length > 0) {
          const batchSize = 400;
          for (let i = 0; i < unreadList.length; i += batchSize) {
            const chunk = unreadList.slice(i, i + batchSize);
            const batch = writeBatch(db);
            chunk.forEach((item) => {
              const docRef = doc(db, 'users', user.uid, 'notifications', item.id);
              batch.update(docRef, { read: true });
            });
            await batch.commit();
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications`);
      }
    }
  }, [user, notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/notifications/${id}`);
      }
    }
  }, [user]);

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(getStorageKey('prefs'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  }, [getStorageKey]);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') return true;
      if (window.Notification.permission === 'denied') return false;
      try {
        const permission = await window.Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting push permissions:', error);
        return false;
      }
    }
    return false;
  };

  const simulateNotification = useCallback(() => {}, []);
  const simulateBidUpdate = useCallback(() => {}, []);
  const simulateTrackDrop = useCallback(() => {}, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        isOffline,
        error,
        retryFetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        requestPushPermission,
        simulateNotification,
        simulateBidUpdate,
        simulateTrackDrop,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const FALLBACK_TONJAM_NOTIF_CONTEXT: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  preferences: DEFAULT_PREFERENCES,
  isLoading: false,
  isOffline: false,
  error: null,
  retryFetch: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  updatePreferences: () => {},
  requestPushPermission: async () => false,
  simulateNotification: () => {},
  simulateBidUpdate: () => {},
  simulateTrackDrop: () => {},
};

export const useTonJamNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return FALLBACK_TONJAM_NOTIF_CONTEXT;
  }
  return context;
};
export default NotificationContext;
