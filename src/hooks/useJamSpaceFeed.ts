import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SocialPost } from '@/types/social';
import { jamSpaceService, normalizePostDoc } from '@/services/jamSpaceService';
import { useAuth } from '@/contexts/AuthContext';

export type FeedTab = 'for-you' | 'following';

export function useJamSpaceFeed(initialTab: FeedTab = 'for-you') {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasNewPosts, setHasNewPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const topPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resolveFollowingIds = useCallback(async () => {
    const profileIds = userProfile?.followedUserIds || [];
    if (!user?.uid) return profileIds;
    const dbIds = await jamSpaceService.fetchFollowingIds(user.uid);
    return Array.from(new Set([...profileIds, ...dbIds]));
  }, [user?.uid, userProfile?.followedUserIds]);

  const loadFeed = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
      setError(null);
      lastDocRef.current = null;
    } else {
      setIsRefreshing(true);
    }

    try {
      let res;
      if (activeTab === 'for-you') {
        res = await jamSpaceService.fetchForYouFeed(15, null);
      } else {
        const followingIds = await resolveFollowingIds();
        res = await jamSpaceService.fetchFollowingFeed(followingIds, 15, null);
      }

      if (!isMountedRef.current) return;

      const hydrated = await jamSpaceService.hydrateUserInteractions(res.posts, user?.uid);
      if (!isMountedRef.current) return;

      setPosts(hydrated);
      topPostIdRef.current = hydrated[0]?.id || null;
      setHasNewPosts(false);
      lastDocRef.current = res.lastVisible;
      setHasMore(res.hasMore);
      setError(null);
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error('[useJamSpaceFeed] Error loading feed:', err);
        setError(err?.message || 'Unable to load transmissions from the network');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [activeTab, user?.uid, resolveFollowingIds]);

  // Load feed on tab switch or auth change
  useEffect(() => {
    loadFeed(true);
  }, [loadFeed]);

  // Real-time check for newly published broadcasts while user reads
  useEffect(() => {
    if (activeTab !== 'for-you' || isLoading) return;

    const latestQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      latestQuery,
      (snap) => {
        if (!snap.empty && topPostIdRef.current) {
          const latest = normalizePostDoc(snap.docs[0]);
          if (
            latest.id !== topPostIdRef.current &&
            !latest.replyToPostId &&
            latest.moderationStatus !== 'removed'
          ) {
            setHasNewPosts(true);
          }
        }
      },
      () => {
        // Ignore transient listener errors silently
      }
    );

    return () => unsubscribe();
  }, [activeTab, isLoading]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !lastDocRef.current) {
      return;
    }

    setIsLoadingMore(true);

    try {
      let res;
      if (activeTab === 'for-you') {
        res = await jamSpaceService.fetchForYouFeed(15, lastDocRef.current);
      } else {
        const followingIds = await resolveFollowingIds();
        res = await jamSpaceService.fetchFollowingFeed(followingIds, 15, lastDocRef.current);
      }

      if (!isMountedRef.current) return;

      const hydrated = await jamSpaceService.hydrateUserInteractions(res.posts, user?.uid);
      if (!isMountedRef.current) return;

      // Deduplicate posts
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = hydrated.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });

      lastDocRef.current = res.lastVisible;
      setHasMore(res.hasMore);
    } catch (err: any) {
      console.warn('[useJamSpaceFeed] Error loading more posts:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [activeTab, hasMore, isLoadingMore, user?.uid, resolveFollowingIds]);

  /**
   * Prepend a freshly created post to the feed
   */
  const prependPost = useCallback((newPost: SocialPost) => {
    setPosts((prev) => {
      const updated = [newPost, ...prev.filter((p) => p.id !== newPost.id)];
      topPostIdRef.current = updated[0]?.id || null;
      return updated;
    });
    setHasNewPosts(false);
  }, []);

  /**
   * Increment reply counter when the user publishes a reply inline
   */
  const incrementReplyCount = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replyCount: (p.replyCount || 0) + 1 } : p))
    );
  }, []);

  /**
   * Remove a deleted post from the feed
   */
  const removePostFromFeed = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  /**
   * Update a post in place (e.g. after like, repost, or reply)
   */
  const updatePostInFeed = useCallback((postId: string, updater: (post: SocialPost) => SocialPost) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
  }, []);

  return {
    activeTab,
    setActiveTab,
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    hasNewPosts,
    error,
    refreshFeed: () => loadFeed(false),
    loadMore,
    prependPost,
    incrementReplyCount,
    removePostFromFeed,
    updatePostInFeed
  };
}

