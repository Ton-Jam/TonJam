import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TonJamNotification, NotificationPreferences, NotificationCategory } from './types';
import { generateMockNotifications } from './mock/mockNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query,
  onSnapshot, 
  doc, 
  writeBatch, 
  setDoc, 
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

  // Network listener
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

  // Real-time listener for Firestore notifications + LocalStorage fallback
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const uid = user?.uid;

    // 1. Load preferences from local storage
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

    // 2. Load immediate cached list from LocalStorage for zero-latency initial UI
    try {
      const storedNotif = localStorage.getItem(getStorageKey('list'));
      if (storedNotif) {
        setNotifications(JSON.parse(storedNotif));
      }
    } catch (e) {
      console.warn('Error reading cached notifications:', e);
    }

    if (!uid) {
      // Guest User mode - use local storage without seeding fake backend items
      try {
        const storedGuest = localStorage.getItem(getStorageKey('list'));
        if (storedGuest) {
          setNotifications(JSON.parse(storedGuest));
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Error handling guest notifications:', err);
      }
      setIsLoading(false);
      return;
    }

    // Authenticated User: Bind real-time Firestore onSnapshot listener
    console.log(`[NotificationContext] Subscribing to real-time notifications for user: ${uid}`);
    const notifColRef = collection(db, 'users', uid, 'notifications');
    const notifQuery = query(notifColRef);

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        setError(null);
        if (snapshot.empty) {
          setNotifications([]);
          try {
            localStorage.setItem(getStorageKey('list'), JSON.stringify([]));
          } catch (err) {
            console.warn(err);
          }
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
            link: data.link,
            quickAction: data.quickAction,
            metadata: data.metadata,
          } as TonJamNotification);
        });

        // Sort by timestamp descending
        const sortedList = list.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setNotifications(sortedList);
        try {
          localStorage.setItem(getStorageKey('list'), JSON.stringify(sortedList));
        } catch (err) {
          console.warn(err);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[NotificationContext] Real-time onSnapshot error:', err);
        setError(err.message || 'Failed to load notifications from network.');
        handleFirestoreError(err, OperationType.GET, `users/${uid}/notifications`);
        setIsLoading(false);
      }
    );

    return () => {
      console.log(`[NotificationContext] Unsubscribing from notifications for user: ${uid}`);
      unsubscribe();
    };
  }, [user, getStorageKey, retryIndex]);

  // Mark individual notification as read
  const markAsRead = useCallback(async (id: string) => {
    // 1. Optimistic UI update (instant response)
    setNotifications((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );
      try {
        localStorage.setItem(getStorageKey('list'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    // 2. Real-time Firestore sync
    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        await updateDoc(docRef, { read: true });
        console.log(`[NotificationContext] Marked notification ${id} as read in Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications/${id}`);
      }
    }
  }, [user, getStorageKey]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // 1. Optimistic local state update
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      try {
        localStorage.setItem(getStorageKey('list'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    // 2. Firestore batch update
    if (user?.uid) {
      try {
        const unreadList = notifications.filter((notif) => !notif.read);
        if (unreadList.length > 0) {
          const batchSize = 400; // Stay well under 500 limit
          for (let i = 0; i < unreadList.length; i += batchSize) {
            const chunk = unreadList.slice(i, i + batchSize);
            const batch = writeBatch(db);
            chunk.forEach((item) => {
              const docRef = doc(db, 'users', user.uid, 'notifications', item.id);
              batch.update(docRef, { read: true });
            });
            await batch.commit();
          }
          console.log(`[NotificationContext] Firestore batch marked ${unreadList.length} notifications as read.`);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications`);
      }
    }
  }, [user, notifications, getStorageKey]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(getStorageKey('list'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/notifications/${id}`);
      }
    }
  }, [user, getStorageKey]);

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

  const simulateNotification = useCallback((customCategory?: NotificationCategory) => {
    const categories: NotificationCategory[] = [
      'music', 'artist_release', 'follower', 'like', 'comment', 'mention',
      'playlist_share', 'track_share', 'nft_sale', 'nft_purchase', 'auction',
      'marketplace', 'wallet_transaction', 'royalty', 'tj_reward', 'mission', 'system'
    ];
    
    const category = customCategory || categories[Math.floor(Math.random() * categories.length)];
    const id = `sim-${Date.now()}`;
    const uid = user?.uid || 'guest_user';

    const titles: Record<NotificationCategory, string> = {
      music: 'DYNAMIC BEAT VIBING',
      artist_release: 'EXOTIC TRACK SIGNAL DROP',
      follower: 'BROADCAST LINK ESTABLISHED',
      like: 'DIGITAL HARMONIC RESONANCE',
      comment: 'TRANSMISSION COMMENT INCOMING',
      mention: 'METADATA TAG COMPLETED',
      playlist_share: 'INCOMING BEAM PLAYLIST',
      track_share: 'CYBER TRACK TELEMETRY BEAM',
      nft_sale: 'CYBER MARKET TRANSACTION',
      nft_purchase: 'NFT ARTIFACT ACQUIRED',
      auction: 'OUTBID ALERT: COLLATERAL SECURED',
      marketplace: 'PREMIUM DROPS ENCRYPTED',
      wallet_transaction: 'TON CRYPTO TRANSFERRED',
      royalty: 'CREATOR ROYALTY CREDITED',
      tj_reward: 'COIN AIRDROP COMPLETED',
      mission: 'CRITICAL DAILY TELEMETRY',
      system: 'RELAY NODE RE-ROUTE COMPLETE',
    };

    const descriptions: Record<NotificationCategory, string> = {
      music: 'Another user is streaming your original acoustic layers right now.',
      artist_release: 'Luna Ray dropped an unreleased futuristic synthwave track "Digital Dreamer".',
      follower: 'Dmitry Ton started following your activity metrics.',
      like: 'Beat Lord liked your recently published "Vapor Echo" mix.',
      comment: 'Nadia Synth commented: "This ambient soundscape is pure masterwork!"',
      mention: 'Cyber Jam tagged your profile in the Decentralized Governance thread.',
      playlist_share: 'A curated modular frequency playlist was sent to your hub.',
      track_share: 'A private track preview link has been beam-encoded for your listen.',
      nft_sale: 'Your digital artwork "Cosmic Vinyl #004" sold to a collector for 15.5 TON!',
      nft_purchase: 'Your purchase order for "Frequency Artifact #001" has been settled.',
      auction: 'A new high bidder placed 42.0 TON on the Sonic Prism NFT.',
      marketplace: 'The Marketplace updated with 5 new exclusive creator keys.',
      wallet_transaction: 'Received a secure deposit of +50.00 TON to your primary wallet address.',
      royalty: 'A secondary transfer royalty of +3.25 TON has been automatically settled.',
      tj_reward: 'Claim +250 TJ Coins as a loyalty bonus for 3-day active stream check.',
      mission: 'Daily signal target: Like 2 new track designs and comments.',
      system: 'System security patch successfully compiled on container node.',
    };

    const actions: Record<NotificationCategory, any> = {
      music: { label: 'Play Now', type: 'play' },
      artist_release: { label: 'Listen', type: 'play' },
      follower: { label: 'Track Back', type: 'follow' },
      like: { label: 'View', type: 'view' },
      comment: { label: 'Reply', type: 'reply' },
      mention: { label: 'Join Chat', type: 'reply' },
      playlist_share: { label: 'Open', type: 'view' },
      track_share: { label: 'Play', type: 'play' },
      nft_sale: { label: 'Check Ledger', type: 'view' },
      nft_purchase: { label: 'Vault', type: 'view' },
      auction: { label: 'Counter Bid', type: 'bid' },
      marketplace: { label: 'Mint', type: 'mint' },
      wallet_transaction: { label: 'Receipt', type: 'view' },
      royalty: { label: 'Claim', type: 'claim' },
      tj_reward: { label: 'Claim Coins', type: 'claim' },
      mission: { label: 'Start', type: 'join' },
      system: { label: 'Read Notes', type: 'view' },
    };

    const newNotification: TonJamNotification = {
      id,
      userId: uid,
      category,
      title: titles[category],
      description: descriptions[category],
      timestamp: new Date().toISOString(),
      read: false,
      avatarUrl: ['music', 'artist_release', 'follower', 'like', 'comment', 'mention', 'playlist_share', 'track_share'].includes(category)
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80'
        : undefined,
      thumbnailUrl: ['nft_sale', 'nft_purchase', 'auction', 'marketplace'].includes(category)
        ? 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&fit=crop&q=80'
        : undefined,
      quickAction: actions[category],
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      try {
        localStorage.setItem(getStorageKey('list'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        setDoc(docRef, newNotification).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/notifications/${id}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/notifications/${id}`);
      }
    }

    // Native trigger
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(titles[category], { body: descriptions[category] });
      } catch (err) {
        console.warn(err);
      }
    }
  }, [user, getStorageKey]);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useTonJamNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useTonJamNotifications must be used within a NotificationProvider');
  }
  return context;
};
export default NotificationContext;
