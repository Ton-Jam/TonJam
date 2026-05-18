import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Activity {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'share' | 'upload' | 'purchase' | 'view' | string;
  targetId?: string; // ID of the target (track, user, NFT, etc)
  targetType?: 'track' | 'user' | 'nft' | string; // Type of target
  description?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  isPublic?: boolean;
}

/**
 * Hook for logging user activities
 */
export const useActivityLog = (userId: string | undefined) => {
  const logActivity = useCallback(
    async (
      activityType: Activity['type'],
      targetId?: string,
      targetType?: string,
      metadata?: Record<string, any>
    ) => {
      if (!userId) {
        console.warn('[v0] Cannot log activity: user ID is not available');
        return;
      }

      try {
        const activitiesRef = collection(db, `users/${userId}/activities`);
        const newActivity: Omit<Activity, 'id'> = {
          userId,
          type: activityType,
          targetId,
          targetType,
          timestamp: new Date().toISOString(),
          isPublic: true,
          metadata: metadata || {},
        };

        const docRef = await addDoc(activitiesRef, {
          ...newActivity,
          createdAt: serverTimestamp(),
        });

        return { id: docRef.id, ...newActivity };
      } catch (error) {
        console.error('[v0] Error logging activity:', error);
        return null;
      }
    },
    [userId]
  );

  return { logActivity };
};

/**
 * Hook for listening to a user's activity feed
 */
export const useUserActivityFeed = (
  userId: string | undefined,
  limit_count: number = 50,
  activityTypes?: string[]
) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const activitiesRef = collection(db, `users/${userId}/activities`);
      let q = query(
        activitiesRef,
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      // Add activity type filter if specified
      if (activityTypes && activityTypes.length > 0) {
        q = query(
          activitiesRef,
          where('type', 'in', activityTypes),
          orderBy('createdAt', 'desc'),
          limit(limit_count)
        );
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const activityList: Activity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          activityList.push({
            id: doc.id,
            ...data,
          } as Activity);
        });
        setActivities(activityList);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('[v0] Error listening to activity feed:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [userId, limit_count, activityTypes?.join(',')]);

  return { activities, isLoading, error };
};

/**
 * Hook for listening to following activity feed
 * Shows activities from users that the current user follows
 */
export const useFollowingActivityFeed = (
  userId: string | undefined,
  followingUserIds: string[],
  limit_count: number = 50
) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || followingUserIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const unsubscribes: Array<() => void> = [];
      const allActivities: Activity[] = [];

      followingUserIds.forEach((followeeId) => {
        const activitiesRef = collection(db, `users/${followeeId}/activities`);
        const q = query(
          activitiesRef,
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(Math.ceil(limit_count / followingUserIds.length))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            allActivities.push({
              id: doc.id,
              ...data,
            } as Activity);
          });

          // Sort all activities by timestamp and take top limit_count
          const sorted = allActivities.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
          });

          setActivities(sorted.slice(0, limit_count));
          setIsLoading(false);
        });

        unsubscribes.push(unsubscribe);
      });

      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    } catch (err) {
      console.error('[v0] Error listening to following activity feed:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [userId, followingUserIds.join(','), limit_count]);

  return { activities, isLoading, error };
};

/**
 * Hook for deleting an activity
 */
export const useDeleteActivity = (userId: string | undefined) => {
  const deleteActivity = useCallback(
    async (activityId: string) => {
      if (!userId) {
        console.warn('[v0] Cannot delete activity: user ID is not available');
        return false;
      }

      try {
        const activityRef = doc(db, `users/${userId}/activities`, activityId);
        await deleteDoc(activityRef);
        return true;
      } catch (error) {
        console.error('[v0] Error deleting activity:', error);
        return false;
      }
    },
    [userId]
  );

  return { deleteActivity };
};

/**
 * Utility function to format activity description
 */
export const formatActivityDescription = (activity: Activity): string => {
  const descriptions: Record<string, string> = {
    follow: `Started following a user`,
    like: `Liked ${activity.targetType || 'content'}`,
    comment: `Commented on ${activity.targetType || 'content'}`,
    share: `Shared ${activity.targetType || 'content'}`,
    upload: `Uploaded a new ${activity.targetType || 'track'}`,
    purchase: `Purchased an ${activity.targetType || 'NFT'}`,
    view: `Viewed ${activity.targetType || 'content'}`,
  };

  return activity.metadata?.description || descriptions[activity.type] || `${activity.type} activity`;
};
