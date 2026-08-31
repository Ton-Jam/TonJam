import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Notification, NotificationPreferences, PriceAlert, NFTItem } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PriceDropNotificationModal from '@/components/PriceDropNotificationModal';
import { toast } from 'sonner';

export interface TriggeredPriceDrop {
  alert: PriceAlert;
  nft: NFTItem;
  currentPrice: string;
  previousPrice?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  markAsRead: (id: string) => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
  refreshNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  requestPushPermission: () => Promise<boolean>;
  
  // Price Alert Features
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => Promise<void>;
  removePriceAlert: (alertId: string) => Promise<void>;
  activePriceDropModal: TriggeredPriceDrop | null;
  closePriceDropModal: () => void;
  simulatePriceDrop: (nftId: string, newPrice: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userBids, allTracks, followedUserIds, allNFTs, userProfile } = useAudio();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [activePriceDropModal, setActivePriceDropModal] = useState<TriggeredPriceDrop | null>(null);
  
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
  const alertedOutbids = useRef<Set<string>>(new Set());
  const alertedNewBids = useRef<Set<string>>(new Set());
  const alertedPriceAlerts = useRef<Set<string>>(new Set());
  const isInitialized = useRef<boolean>(false);

  const refreshNotifications = () => {
    if (user) {
      setNotifications(notificationService.getNotifications(user.uid));
      setPreferences(notificationService.getPreferences(user.uid));
    }
  };

  // Real-time Firestore onSnapshot listener for user notifications
  useEffect(() => {
    if (!user || !user.uid) {
      setNotifications(notificationService.getNotifications('guest'));
      return;
    }

    const notifColRef = collection(db, 'users', user.uid, 'notifications');
    const unsubscribe = onSnapshot(
      notifColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Notification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            list.push({
              id: docSnap.id,
              userId: data.userId || user.uid,
              type: data.type || (data.category ? 'bid_update' : 'event'),
              title: data.title || 'Notification',
              message: data.message || data.description || '',
              read: data.read ?? false,
              timestamp: data.timestamp || new Date().toISOString(),
              link: data.link || '',
              metadata: data.metadata || {},
            });
          });

          // Sort descending by timestamp
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(list);
          notificationService.saveNotifications(user.uid, list);
        } else {
          // Fall back to local storage if Firestore collection is not seeded yet
          refreshNotifications();
        }
      },
      (error) => {
        console.warn('[NotificationContext] onSnapshot error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const userId = user?.uid || 'guest';
    notificationService.addNotification(userId, n);
  };

  // Load local price alerts on mount
  useEffect(() => {
    try {
      const storedLocalAlerts = localStorage.getItem('tonjam_price_alerts');
      if (storedLocalAlerts) {
        const parsedAlerts: PriceAlert[] = JSON.parse(storedLocalAlerts);
        setPriceAlerts(parsedAlerts.filter(a => a.status === 'active'));
      }
    } catch (err) {
      console.warn("Error loading local price alerts:", err);
    }
  }, []);

  // Add Price Alert handler
  const addPriceAlert = async (newAlert: PriceAlert) => {
    setPriceAlerts((prev) => {
      const updated = [newAlert, ...prev.filter(a => a.id !== newAlert.id)];
      localStorage.setItem('tonjam_price_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  // Remove Price Alert handler
  const removePriceAlert = async (alertId: string) => {
    setPriceAlerts((prev) => {
      const updated = prev.filter(a => a.id !== alertId);
      localStorage.setItem('tonjam_price_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  // Close active price drop modal
  const closePriceDropModal = () => {
    setActivePriceDropModal(null);
  };

  // Simulate price drop test handler
  const simulatePriceDrop = (nftId: string, newPrice: string) => {
    const targetNft = allNFTs.find((n) => n.id === nftId);
    if (!targetNft) return;

    let matchingAlert = priceAlerts.find((a) => a.nftId === nftId);
    
    if (!matchingAlert) {
      matchingAlert = {
        id: `sim_alert_${Date.now()}`,
        userId: user?.uid || 'guest',
        nftId: targetNft.id,
        nftTitle: targetNft.title,
        nftImageUrl: targetNft.imageUrl,
        targetPrice: (parseFloat(targetNft.price || '10') * 0.9).toFixed(2),
        condition: 'below',
        status: 'active',
        channels: ['app'],
        createdAt: new Date().toISOString()
      };
    }

    const previousPrice = targetNft.price || '10';

    setActivePriceDropModal({
      alert: matchingAlert,
      nft: targetNft,
      currentPrice: newPrice,
      previousPrice: previousPrice
    });

    addNotification({
      userId: user?.uid || 'guest',
      type: 'bid_update',
      title: 'PRICE DROP ALERT TRIGGERED!',
      message: `Price for "${targetNft.title}" dropped to ${newPrice} TON (Target threshold: ${matchingAlert.targetPrice} TON).`,
      link: `/nft/${targetNft.id}`,
      metadata: { nftId: targetNft.id, type: 'price_alert', price: newPrice }
    });
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
      const storedOutbids = localStorage.getItem('tonjam_alerted_outbids');
      if (storedOutbids) {
        JSON.parse(storedOutbids).forEach((id: string) => alertedOutbids.current.add(id));
      }
      const storedNewBids = localStorage.getItem('tonjam_alerted_new_bids');
      if (storedNewBids) {
        JSON.parse(storedNewBids).forEach((id: string) => alertedNewBids.current.add(id));
      }
      const storedPriceAlerts = localStorage.getItem('tonjam_alerted_price_alerts');
      if (storedPriceAlerts) {
        JSON.parse(storedPriceAlerts).forEach((id: string) => alertedPriceAlerts.current.add(id));
      }
    } catch (e) {
      console.warn("Could not load notified alerts local logs:", e);
    }
  }, []);

  // Listen to the user's active price alerts from Firestore
  useEffect(() => {
    if (!user || !user.uid) return;

    const alertsQuery = query(
      collection(db, 'users', user.uid, 'priceAlerts'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot: any) => {
      const dbAlerts: PriceAlert[] = [];
      snapshot.forEach((doc: any) => {
        dbAlerts.push(doc.data());
      });

      if (dbAlerts.length > 0) {
        setPriceAlerts((prev) => {
          const merged = [...dbAlerts];
          prev.forEach((local) => {
            if (!merged.some((d) => d.id === local.id)) {
              merged.push(local);
            }
          });
          return merged;
        });
      }
    }, (error: any) => {
      console.warn("Error listening to price alerts from Firestore:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Background price alert monitor and context sync
  useEffect(() => {
    if (!user || !user.uid) return;

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

    const checkAlerts = async () => {
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

      // 3. Outbid Check
      if (allNFTs && allNFTs.length > 0 && userProfile?.walletAddress) {
        allNFTs.forEach((nft) => {
          const isAuction = nft.listingType === 'auction' || nft.isAuction;
          if (isAuction && nft.offers && nft.offers.length > 0) {
            const userOfferIndex = nft.offers.findIndex(o => o.offerer === userProfile.walletAddress);
            if (userOfferIndex !== -1) {
              const highestOffer = nft.offers[0];
              if (highestOffer.offerer !== userProfile.walletAddress) {
                const alertKey = `outbid_${nft.id}_${highestOffer.price}`;
                if (!alertedOutbids.current.has(alertKey)) {
                  notificationService.addNotification(user.uid, {
                    userId: user.uid,
                    type: 'bid_update',
                    title: "YOU'VE BEEN OUTBID!",
                    message: `Your bid on "${nft.title}" was surpassed by ${highestOffer.price} TON. Re-bid now to secure it!`,
                    link: `/nft/${nft.id}`,
                    metadata: { nftId: nft.id, type: 'outbid', bidAmount: parseFloat(highestOffer.price) }
                  });

                  toast.error("You've been outbid!", {
                    description: `Your bid on "${nft.title}" was surpassed by ${highestOffer.price} TON. Re-bid now to secure it!`,
                  });

                  alertedOutbids.current.add(alertKey);
                  localStorage.setItem('tonjam_alerted_outbids', JSON.stringify(Array.from(alertedOutbids.current)));
                  altered = true;
                }
              }
            }
          }
        });
      }

      // 4. New Bid on My NFT Check
      if (allNFTs && allNFTs.length > 0 && userProfile?.walletAddress) {
        allNFTs.forEach((nft) => {
          const isMyNFT = nft.owner === userProfile.walletAddress || nft.artistId === user.uid;
          const isAuction = nft.listingType === 'auction' || nft.isAuction;
          if (isMyNFT && isAuction && nft.offers && nft.offers.length > 0) {
            const highestOffer = nft.offers[0];
            if (highestOffer.offerer !== userProfile.walletAddress) {
              const alertKey = `new_bid_${nft.id}_${highestOffer.price}`;
              if (!alertedNewBids.current.has(alertKey)) {
                notificationService.addNotification(user.uid, {
                  userId: user.uid,
                  type: 'bid_update',
                  title: 'NEW HIGH BID RECEIVED!',
                  message: `A new bid of ${highestOffer.price} TON has been placed on your NFT "${nft.title}" by ${highestOffer.offerer.slice(0, 6)}...`,
                  link: `/nft/${nft.id}`,
                  metadata: { nftId: nft.id, type: 'new_bid', bidAmount: parseFloat(highestOffer.price) }
                });
                alertedNewBids.current.add(alertKey);
                localStorage.setItem('tonjam_alerted_new_bids', JSON.stringify(Array.from(alertedNewBids.current)));
                altered = true;
              }
            }
          }
        });
      }

      // 5. Price Alerts Evaluation & Modal Trigger
      if (priceAlerts && priceAlerts.length > 0 && allNFTs && allNFTs.length > 0) {
        priceAlerts.forEach(async (alert) => {
          const nft = allNFTs.find((n) => n.id === alert.nftId);
          if (nft && nft.price) {
            const currentPrice = parseFloat(nft.price);
            const targetPrice = parseFloat(alert.targetPrice);
            if (!isNaN(currentPrice) && !isNaN(targetPrice)) {
              let isTriggered = false;
              if (alert.condition === 'below' && currentPrice <= targetPrice) {
                isTriggered = true;
              } else if (alert.condition === 'above' && currentPrice >= targetPrice) {
                isTriggered = true;
              }
              
              if (isTriggered) {
                const alertKey = `price_alert_triggered_${alert.id}_${nft.price}`;
                if (!alertedPriceAlerts.current.has(alertKey)) {
                  notificationService.addNotification(user.uid, {
                    userId: user.uid,
                    type: 'bid_update',
                    title: 'PRICE ALERT TRIGGERED!',
                    message: `Price alert triggered for "${nft.title}"! Target: ${alert.targetPrice} TON, Current: ${nft.price} TON.`,
                    link: `/nft/${nft.id}`,
                    metadata: { nftId: nft.id, type: 'price_alert', price: nft.price }
                  });
                  alertedPriceAlerts.current.add(alertKey);
                  localStorage.setItem('tonjam_alerted_price_alerts', JSON.stringify(Array.from(alertedPriceAlerts.current)));
                  altered = true;

                  // Trigger Modal Popup
                  setActivePriceDropModal({
                    alert,
                    nft,
                    currentPrice: nft.price,
                    previousPrice: (targetPrice * 1.2).toFixed(2)
                  });
                  
                  // Mark status in Firestore
                  try {
                    const alertDocRef = doc(db, 'users', user.uid, 'priceAlerts', alert.id);
                    await updateDoc(alertDocRef, { status: 'triggered' });
                  } catch (err) {
                    console.warn("Failed to update price alert status in DB:", err);
                  }
                }
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
    const alertInterval = setInterval(checkAlerts, 15000);
    return () => clearInterval(alertInterval);

  }, [user, allTracks, followedUserIds, userBids, allNFTs, userProfile, priceAlerts]);

  const markAsRead = (id: string) => {
    if (!user) return;
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    notificationService.markAsRead(user.uid, id);
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
      requestPushPermission,
      priceAlerts,
      addPriceAlert,
      removePriceAlert,
      activePriceDropModal,
      closePriceDropModal,
      simulatePriceDrop
    }}>
      {children}
      <PriceDropNotificationModal data={activePriceDropModal} onClose={closePriceDropModal} />
    </NotificationContext.Provider>
  );
};

