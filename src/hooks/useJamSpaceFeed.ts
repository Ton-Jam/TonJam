import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { SocialPost } from '@/types/social';
import { jamSpaceService } from '@/services/jamSpaceService';
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
  const [error, setError] = useState<string | null>(null);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        const followingIds = userProfile?.followedUserIds || [];
        res = await jamSpaceService.fetchFollowingFeed(followingIds, 15, null);
      }

      if (!isMountedRef.current) return;

      const hydrated = await jamSpaceService.hydrateUserInteractions(res.posts, user?.uid);
      if (!isMountedRef.current) return;

      setPosts(hydrated);
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
  }, [activeTab, user?.uid, userProfile?.followedUserIds]);

  // Load feed on tab switch or auth change
  useEffect(() => {
    loadFeed(true);
  }, [loadFeed]);

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
        const followingIds = userProfile?.followedUserIds || [];
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
  }, [activeTab, hasMore, isLoadingMore, user?.uid, userProfile?.followedUserIds]);

  /**
   * Prepend a freshly created post to the feed
   */
  const prependPost = useCallback((newPost: SocialPost) => {
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
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
    error,
    refreshFeed: () => loadFeed(false),
    loadMore,
    prependPost,
    removePostFromFeed,
    updatePostInFeed
  };
}
