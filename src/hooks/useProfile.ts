import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { useUser } from '@/contexts/UserContext';

export interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom React hook `useProfile(userId)`
 * 
 * Fetches and synchronizes profile metadata for any given user ID from Firestore or UserContext.
 * Handles loading, error, and empty states appropriately.
 * 
 * @param userId Optional user ID. If omitted or matches current user, synchronizes with UserContext.
 */
export function useProfile(userId?: string): UseProfileResult {
  const currentUserContext = useUser();
  const currentUserId = currentUserContext?.user?.uid;

  const isCurrentUsersProfile = !userId || userId === currentUserId;

  const [profile, setProfile] = useState<UserProfile | null>(
    isCurrentUsersProfile ? (currentUserContext?.userProfile || null) : null
  );
  const [loading, setLoading] = useState<boolean>(isCurrentUsersProfile ? currentUserContext?.loading : true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  // Sync with UserContext if it's the current user's profile
  useEffect(() => {
    if (isCurrentUsersProfile) {
      if (currentUserContext?.userProfile) {
        setProfile(currentUserContext.userProfile);
        setLoading(false);
        setIsEmpty(false);
        setError(null);
      } else if (!currentUserContext?.loading) {
        setLoading(false);
        if (!currentUserContext?.user) {
          setIsEmpty(true);
        }
      }
    }
  }, [isCurrentUsersProfile, currentUserContext?.userProfile, currentUserContext?.loading, currentUserContext?.user]);

  // Fetch or subscribe to remote profile if userId is specified and differs from current user
  const fetchRemoteProfile = useCallback(async () => {
    if (isCurrentUsersProfile) return;

    if (!userId) {
      setProfile(null);
      setLoading(false);
      setIsEmpty(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Normalize createdAt if timestamp
        if (data.createdAt && typeof data.createdAt !== 'string' && typeof (data.createdAt as any).toDate === 'function') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        setProfile(data);
        setIsEmpty(false);
      } else {
        setProfile(null);
        setIsEmpty(true);
      }
    } catch (err: any) {
      console.error(`[useProfile] Failed to fetch profile for userId ${userId}:`, err);
      setError(err?.message || 'Failed to load user profile');
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, [userId, isCurrentUsersProfile]);

  useEffect(() => {
    if (!isCurrentUsersProfile && userId) {
      fetchRemoteProfile();

      // Optional real-time listener subscription
      const userRef = doc(db, 'users', userId);
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.createdAt && typeof data.createdAt !== 'string' && typeof (data.createdAt as any).toDate === 'function') {
              data.createdAt = (data.createdAt as any).toDate().toISOString();
            }
            setProfile(data);
            setIsEmpty(false);
            setLoading(false);
          } else {
            setProfile(null);
            setIsEmpty(true);
            setLoading(false);
          }
        },
        (err) => {
          console.warn(`[useProfile] Snapshot subscription error for userId ${userId}:`, err);
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [userId, isCurrentUsersProfile, fetchRemoteProfile]);

  return {
    profile,
    loading,
    error,
    isEmpty,
    refresh: isCurrentUsersProfile && (currentUserContext as any)?.refreshProfile ? (currentUserContext as any).refreshProfile : fetchRemoteProfile,
  };
}

export default useProfile;
