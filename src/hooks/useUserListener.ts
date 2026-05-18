import { useEffect, useCallback } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface UseUserListenerOptions {
  userId: string;
  onUpdate?: (profile: UserProfile) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Custom hook for real-time listening to user profile changes
 * Automatically unsubscribes on unmount
 */
export const useUserListener = ({
  userId,
  onUpdate,
  onError,
  enabled = true,
}: UseUserListenerOptions) => {
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    let unsubscribe: Unsubscribe | undefined;

    try {
      const docRef = doc(db, 'users', userId);
      
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            // Convert Firestore timestamps to ISO strings if needed
            if (data.createdAt && typeof data.createdAt !== 'string') {
              data.createdAt = (data.createdAt as any).toDate().toISOString();
            }
            if (data.updatedAt && typeof data.updatedAt !== 'string') {
              data.updatedAt = (data.updatedAt as any).toDate().toISOString();
            }
            if (data.lastActive && typeof data.lastActive !== 'string') {
              data.lastActive = (data.lastActive as any).toDate().toISOString();
            }
            onUpdate?.(data);
          }
        },
        (error) => {
          console.error('[v0] Error listening to user profile:', error);
          onError?.(error as Error);
        }
      );
    } catch (error) {
      console.error('[v0] Failed to set up user listener:', error);
      onError?.(error as Error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, enabled, onUpdate, onError]);
};

/**
 * Custom hook for tracking user online/offline presence
 */
export const useUserPresence = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) {
      return;
    }

    const updatePresence = async () => {
      try {
        const { updateDoc, serverTimestamp } = await import('firebase/firestore');
        const userRef = doc(db, 'users', userId);
        
        await updateDoc(userRef, {
          lastActive: serverTimestamp(),
          isOnline: true,
        });
      } catch (error) {
        console.error('[v0] Error updating presence:', error);
      }
    };

    // Update presence on mount
    updatePresence();

    // Update presence periodically (every 30 seconds)
    const interval = setInterval(updatePresence, 30000);

    // Update presence before unload (user goes offline)
    const handleBeforeUnload = async () => {
      try {
        const { updateDoc } = await import('firebase/firestore');
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
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
};

/**
 * Custom hook for listening to user activity/feed
 */
export const useUserActivityListener = (
  userId: string,
  onUpdate?: (activities: any[]) => void,
  onError?: (error: Error) => void
) => {
  useEffect(() => {
    if (!userId) {
      return;
    }

    let unsubscribe: Unsubscribe | undefined;

    try {
      const activitiesRef = doc(db, `users/${userId}/metadata`, 'activities');
      
      unsubscribe = onSnapshot(
        activitiesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            onUpdate?.(data.items || []);
          }
        },
        (error) => {
          console.error('[v0] Error listening to user activities:', error);
          onError?.(error as Error);
        }
      );
    } catch (error) {
      console.error('[v0] Failed to set up activity listener:', error);
      onError?.(error as Error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, onUpdate, onError]);
};
