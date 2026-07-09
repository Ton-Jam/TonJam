import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TonJamNotification, NotificationPreferences, NotificationCategory } from './types';
import { generateMockNotifications } from './mock/mockNotifications';
import { useAuth } from '@/context/AuthContext';
import { 
  collection, 
  getDocs, 
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
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
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

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
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

  // Load state from Firestore with LocalStorage fallback
  useEffect(() => {
    setIsLoading(true);
    let active = true;

    const loadData = async () => {
      try {
        const uid = user?.uid;
        
        // Load preferences
        const storedPrefs = localStorage.getItem(getStorageKey('prefs'));
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }

        // Always check localStorage first as instant visual fallback
        const storedNotif = localStorage.getItem(getStorageKey('list'));
        if (storedNotif) {
          setNotifications(JSON.parse(storedNotif));
        }

        if (uid) {
          console.log(`[NotificationContext] Fetching notifications from Firestore for user: ${uid}...`);
          const notifColRef = collection(db, 'users', uid, 'notifications');
          const querySnapshot = await getDocs(notifColRef).catch((err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}/notifications`);
            return null;
          });

          if (!active) return;

          if (querySnapshot && !querySnapshot.empty) {
            const list: TonJamNotification[] = [];
            querySnapshot.forEach((doc) => {
              list.push(doc.data() as TonJamNotification);
            });
            
            // Sort by timestamp descending
            const sortedList = list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setNotifications(sortedList);
            localStorage.setItem(getStorageKey('list'), JSON.stringify(sortedList));
            console.log(`[NotificationContext] Loaded ${sortedList.length} notifications from Firestore.`);
          } else {
            console.log('[NotificationContext] No notifications in Firestore. Seeding initial mock signals...');
            const seeded = generateMockNotifications(uid);
            setNotifications(seeded);
            localStorage.setItem(getStorageKey('list'), JSON.stringify(seeded));

            // Seed recent notifications to Firestore directly to Cloud
            const batchSize = 100;
            const itemsToSeed = seeded.slice(0, 150); // Seed the most recent 150 notifications directly to Cloud
            
            try {
              for (let i = 0; i < itemsToSeed.length; i += batchSize) {
                const chunk = itemsToSeed.slice(i, i + batchSize);
                const batch = writeBatch(db);
                chunk.forEach((item) => {
                  const docRef = doc(db, 'users', uid, 'notifications', item.id);
                  batch.set(docRef, item);
                });
                await batch.commit();
              }
              console.log(`[NotificationContext] Seeded ${itemsToSeed.length} notifications to Firestore.`);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${uid}/notifications`);
            }
          }
        } else {
          // Guest User mode
          const storedGuestNotif = localStorage.getItem(getStorageKey('list'));
          if (storedGuestNotif) {
            setNotifications(JSON.parse(storedGuestNotif));
          } else {
            const seeded = generateMockNotifications('guest_user');
            setNotifications(seeded);
            localStorage.setItem(getStorageKey('list'), JSON.stringify(seeded));
          }
        }
      } catch (err) {
        console.error('[NotificationContext] Error loading notifications:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user, getStorageKey]);

  // Save utility helper
  const saveNotificationsToStorage = useCallback((newList: TonJamNotification[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem(getStorageKey('list'), JSON.stringify(newList));
    } catch (err) {
      console.error('Failed to save notifications state:', err);
    }
  }, [getStorageKey]);

  const markAsRead = useCallback(async (id: string) => {
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

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notifications', id);
        await updateDoc(docRef, { read: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications/${id}`);
      }
    }
  }, [user, getStorageKey]);

  const markAllAsRead = useCallback(async () => {
    // 1. Update local state immediately for instant responsive UI feedback
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      try {
        localStorage.setItem(getStorageKey('list'), JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    // 2. Trigger Firestore batch operation to sync all unread statuses
    if (user?.uid) {
      try {
        // Find unread notifications from the state
        const unreadList = notifications.filter((notif) => !notif.read);
        if (unreadList.length > 0) {
          const batch = writeBatch(db);
          let count = 0;

          for (const notif of unreadList) {
            if (count >= 450) break; // stay within single batch limit of 500
            const docRef = doc(db, 'users', user.uid, 'notifications', notif.id);
            batch.update(docRef, { read: true });
            count++;
          }

          if (count > 0) {
            await batch.commit();
            console.log(`[NotificationContext] Firestore batch updated ${count} notifications to read.`);
          }
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
