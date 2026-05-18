import { useEffect, useState, useCallback } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PresenceData {
  userId: string;
  isOnline: boolean;
  lastActive: string;
  lastActivityType?: string;
  device?: string;
}

/**
 * Hook for managing user presence (online/offline status)
 * Automatically updates user's presence and listens for changes
 */
export const usePresence = (userId: string | undefined) => {
  const [presenceData, setPresenceData] = useState<PresenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update user's presence on mount and periodically
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const updatePresence = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          lastActive: serverTimestamp(),
          isOnline: true,
          updatedAt: serverTimestamp(),
        } as any);
      } catch (error) {
        console.error('[v0] Error updating presence:', error);
      }
    };

    // Initial presence update
    updatePresence();
    setIsLoading(false);

    // Update presence every 30 seconds
    const presenceInterval = setInterval(updatePresence, 30000);

    // Set offline on page unload
    const handleBeforeUnload = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isOnline: false,
        });
      } catch (error) {
        console.error('[v0] Error setting offline status:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  // Listen to presence changes of a specific user (different from self)
  const subscribeToUserPresence = useCallback(
    (listenUserId: string, onUpdate: (presence: PresenceData | null) => void) => {
      if (!listenUserId || listenUserId === userId) {
        return () => {};
      }

      try {
        const userRef = doc(db, 'users', listenUserId);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            onUpdate({
              userId: listenUserId,
              isOnline: data.isOnline || false,
              lastActive: data.lastActive?.toDate?.()?.toISOString() || new Date().toISOString(),
              lastActivityType: data.lastActivityType,
              device: data.device,
            });
          } else {
            onUpdate(null);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('[v0] Error subscribing to user presence:', error);
        return () => {};
      }
    },
    [userId]
  );

  const recordActivity = useCallback(
    async (activityType: string, activityData?: Record<string, any>) => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          lastActivityType: activityType,
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...activityData,
        } as any);
      } catch (error) {
        console.error('[v0] Error recording activity:', error);
      }
    },
    [userId]
  );

  const setOffline = useCallback(async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline: false,
      });
    } catch (error) {
      console.error('[v0] Error setting offline status:', error);
    }
  }, [userId]);

  return {
    presenceData,
    isLoading,
    subscribeToUserPresence,
    recordActivity,
    setOffline,
  };
};

/**
 * Hook for listening to multiple users' presence
 */
export const useMultiplePresence = (userIds: string[]) => {
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceData>>({});

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    userIds.forEach((userId) => {
      try {
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setPresenceMap((prev) => ({
              ...prev,
              [userId]: {
                userId,
                isOnline: data.isOnline || false,
                lastActive: data.lastActive?.toDate?.()?.toISOString() || new Date().toISOString(),
                lastActivityType: data.lastActivityType,
                device: data.device,
              },
            }));
          }
        });
        unsubscribes.push(unsubscribe);
      } catch (error) {
        console.error(`[v0] Error subscribing to presence for user ${userId}:`, error);
      }
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [userIds.join(',')]); // Dependencies as string to prevent infinite loops

  return presenceMap;
};
