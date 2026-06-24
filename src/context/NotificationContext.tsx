import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Notification, NotificationPreferences } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  markAsRead: (id: string) => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
  refreshNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userBids, allTracks, followedUserIds } = useAudio();
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

  const alertedReleases = useRef<Set<string>>(new Set());
  const alertedSoonAuctions = useRef<Set<string>>(new Set());
  const isInitialized = useRef<boolean>(false);

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

  // Load alerted state from localStorage on mount
  useEffect(() => {
    try {
      const storedReleases = localStorage.getItem('tonjam_alerted_releases');
      if (storedReleases) {
        JSON.parse(storedReleases).forEach((id: string) => alertedReleases.current.add(id));
      }
      const storedAuctions = localStorage.getItem('tonjam_alerted_soon_auctions');
      if (storedAuctions) {
        JSON.parse(storedAuctions).forEach((id: string) => alertedSoonAuctions.current.add(id));
      }
    } catch (e) {
      console.warn("Could not load notified alerts local logs:", e);
    }
  }, []);

  // background checker context sync
  useEffect(() => {
    if (!user || !user.uid) return;

    // Suppress spamming existing historically seeded tracks at initial load
    if (!isInitialized.current && allTracks && allTracks.length > 0) {
      allTracks.forEach((track) => {
        const age = Date.now() - (Number(track.createdAt) || 0);
        if (age > 5 * 60 * 1000) {
          alertedReleases.current.add(track.id);
        }
      });
      localStorage.setItem('tonjam_alerted_releases', JSON.stringify(Array.from(alertedReleases.current)));
      isInitialized.current = true;
    }

    const checkAlerts = () => {
      let altered = false;

      // 1. Followed Artist Track Releases Check
      if (allTracks && allTracks.length > 0 && followedUserIds && followedUserIds.length > 0) {
        allTracks.forEach((track) => {
          if (followedUserIds.includes(track.artistId || "")) {
            if (!alertedReleases.current.has(track.id)) {
              notificationService.addNotification(user.uid, {
                userId: user.uid,
                type: 'track_upload',
                title: 'NEW RELEASE SIGNAL!',
                message: `Tracked artist "${track.artist}" dropped a new frequency: "${track.title}"! Sync up and stream.`,
                link: `/track/${track.id}`,
                metadata: { trackId: track.id, type: 'new_release' }
              });
              alertedReleases.current.add(track.id);
              altered = true;
            }
          }
        });

        if (altered) {
          localStorage.setItem('tonjam_alerted_releases', JSON.stringify(Array.from(alertedReleases.current)));
        }
      }

      // 2. Participated Auctions Ending warning Check
      if (userBids && userBids.length > 0) {
        userBids.forEach((nft) => {
          if (nft.listingType === 'auction' && nft.auctionEndTime) {
            const endTime = new Date(nft.auctionEndTime).getTime();
            const now = Date.now();
            const diff = endTime - now;

            // Trigger when remaining time is less than 30 minutes and still actively running
            if (diff > 0 && diff <= 30 * 60 * 1000) {
              if (!alertedSoonAuctions.current.has(nft.id)) {
                notificationService.addNotification(user.uid, {
                  userId: user.uid,
                  type: 'bid_update',
                  title: 'AUCTION ENDING SOON!',
                  message: `The cyber auction for "${nft.title}" ends in less than 30 minutes! Validate your placement now.`,
                  link: `/nft/${nft.id}`,
                  metadata: { nftId: nft.id, type: 'auction_ending_soon' }
                });
                alertedSoonAuctions.current.add(nft.id);
                localStorage.setItem('tonjam_alerted_soon_auctions', JSON.stringify(Array.from(alertedSoonAuctions.current)));
                altered = true;
              }
            }
          }
        });
      }

      if (altered) {
        refreshNotifications();
      }
    };

    checkAlerts();
    const alertInterval = setInterval(checkAlerts, 15000); // Check every 15 seconds
    return () => clearInterval(alertInterval);

  }, [user, allTracks, followedUserIds, userBids]);

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

  const requestPushPermission = async () => {
    return await notificationService.requestPushPermission();
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      preferences, 
      unreadCount, 
      markAsRead, 
      updatePreferences, 
      refreshNotifications, 
      addNotification,
      requestPushPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
