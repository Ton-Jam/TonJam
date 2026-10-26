import { useState, useCallback } from 'react';
import { SocialPost, PostAuthor } from '@/types/social';
import { jamSpaceService } from '@/services/jamSpaceService';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';

export function usePostActions(onPostUpdated?: (postId: string, updater: (p: SocialPost) => SocialPost) => void) {
  const { user, userProfile } = useAuth();
  const { addNotification } = useAudio();

  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [isReposting, setIsReposting] = useState<Record<string, boolean>>({});
  const [isBookmarking, setIsBookmarking] = useState<Record<string, boolean>>({});

  const currentUserAuthor: PostAuthor = {
    uid: user?.uid || 'guest',
    name: userProfile?.name || user?.displayName || 'TonJam Pioneer',
    username: userProfile?.username || '@pioneer',
    avatar: userProfile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isVerified: !!userProfile?.verified || !!userProfile?.isVerifiedArtist,
    role: userProfile?.role || 'fan'
  };

  const handleToggleLike = useCallback(async (post: SocialPost) => {
    if (!user) {
      addNotification('Please connect your account to like posts', 'info');
      return;
    }

    if (isLiking[post.id]) return;

    setIsLiking((prev) => ({ ...prev, [post.id]: true }));

    // Optimistic update
    const previousLiked = !!post.isLiked;
    const delta = previousLiked ? -1 : 1;

    if (onPostUpdated) {
      onPostUpdated(post.id, (p) => ({
        ...p,
        isLiked: !previousLiked,
        likeCount: Math.max(0, p.likeCount + delta)
      }));
    }

    try {
      const res = await jamSpaceService.toggleLike(
        post.id,
        user.uid,
        currentUserAuthor,
        post.authorId
      );

      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isLiked: res.isLiked
        }));
      }
    } catch (err) {
      console.error('[usePostActions] Error toggling like:', err);
      // Rollback on failure
      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isLiked: previousLiked,
          likeCount: Math.max(0, p.likeCount - delta)
        }));
      }
      addNotification('Failed to update like. Please try again.', 'error');
    } finally {
      setIsLiking((prev) => ({ ...prev, [post.id]: false }));
    }
  }, [user, isLiking, currentUserAuthor, onPostUpdated, addNotification]);

  const handleToggleRepost = useCallback(async (post: SocialPost) => {
    if (!user) {
      addNotification('Please connect your account to repost transmissions', 'info');
      return;
    }

    if (isReposting[post.id]) return;

    setIsReposting((prev) => ({ ...prev, [post.id]: true }));

    // Optimistic update
    const previousReposted = !!post.isReposted;
    const delta = previousReposted ? -1 : 1;

    if (onPostUpdated) {
      onPostUpdated(post.id, (p) => ({
        ...p,
        isReposted: !previousReposted,
        repostCount: Math.max(0, p.repostCount + delta)
      }));
    }

    try {
      const res = await jamSpaceService.toggleRepost(
        post.id,
        user.uid,
        currentUserAuthor,
        post.authorId
      );

      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isReposted: res.isReposted
        }));
      }

      addNotification(res.isReposted ? 'Reposted to your profile!' : 'Repost removed', 'success');
    } catch (err) {
      console.error('[usePostActions] Error toggling repost:', err);
      // Rollback
      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isReposted: previousReposted,
          repostCount: Math.max(0, p.repostCount - delta)
        }));
      }
      addNotification('Failed to update repost', 'error');
    } finally {
      setIsReposting((prev) => ({ ...prev, [post.id]: false }));
    }
  }, [user, isReposting, currentUserAuthor, onPostUpdated, addNotification]);

  const handleToggleBookmark = useCallback(async (post: SocialPost) => {
    if (!user) {
      addNotification('Please connect your account to save bookmarks', 'info');
      return;
    }

    if (isBookmarking[post.id]) return;

    setIsBookmarking((prev) => ({ ...prev, [post.id]: true }));

    const previousBookmarked = !!post.isBookmarked;

    if (onPostUpdated) {
      onPostUpdated(post.id, (p) => ({
        ...p,
        isBookmarked: !previousBookmarked,
        bookmarkCount: Math.max(0, p.bookmarkCount + (previousBookmarked ? -1 : 1))
      }));
    }

    try {
      const res = await jamSpaceService.toggleBookmark(post.id, user.uid, post);
      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isBookmarked: res.isBookmarked
        }));
      }
      addNotification(res.isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks', 'success');
    } catch (err) {
      console.error('[usePostActions] Error toggling bookmark:', err);
      if (onPostUpdated) {
        onPostUpdated(post.id, (p) => ({
          ...p,
          isBookmarked: previousBookmarked,
          bookmarkCount: Math.max(0, p.bookmarkCount - (previousBookmarked ? -1 : 1))
        }));
      }
      addNotification('Failed to update bookmark', 'error');
    } finally {
      setIsBookmarking((prev) => ({ ...prev, [post.id]: false }));
    }
  }, [user, isBookmarking, onPostUpdated, addNotification]);

  const handleShare = useCallback(async (post: SocialPost) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.name} on TonJam`,
          text: post.text.slice(0, 100),
          url: postUrl
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(postUrl);
      addNotification('Post link copied to clipboard!', 'success');
    } catch {
      addNotification('Could not copy link', 'error');
    }
  }, [addNotification]);

  const handleDelete = useCallback(async (postId: string, authorId: string) => {
    try {
      await jamSpaceService.deletePost(postId, authorId);
      addNotification('Post deleted successfully', 'success');
    } catch (err: any) {
      console.error('[usePostActions] Delete error:', err);
      addNotification(err?.message || 'Failed to delete post', 'error');
      throw err;
    }
  }, [addNotification]);

  const handleReport = useCallback(async (
    postId: string, 
    reason: 'spam' | 'harassment' | 'copyright' | 'inappropriate' | 'other',
    details?: string
  ) => {
    if (!user) {
      addNotification('Please log in to report content', 'info');
      return;
    }

    try {
      await jamSpaceService.submitReport({
        reporterId: user.uid,
        targetPostId: postId,
        reason,
        details
      });
      addNotification('Thank you. Post reported to moderators.', 'success');
    } catch (err) {
      addNotification('Failed to submit report', 'error');
    }
  }, [user, addNotification]);

  return {
    handleToggleLike,
    handleToggleRepost,
    handleToggleBookmark,
    handleShare,
    handleDelete,
    handleReport,
    currentUserAuthor
  };
}
