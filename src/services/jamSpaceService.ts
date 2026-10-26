import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment, 
  serverTimestamp, 
  writeBatch,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  SocialPost, 
  PostAuthor, 
  PostAttachment, 
  QuotePostSnippet, 
  ConversationThread,
  SocialNotificationType
} from '@/types/social';

const POSTS_COLLECTION = 'posts';
const REPOSTS_COLLECTION = 'reposts';
const FOLLOWS_COLLECTION = 'follows';
const REPORTS_COLLECTION = 'reports';

/**
 * Normalizes Firestore document data into a clean SocialPost model
 */
export function normalizePostDoc(docSnap: DocumentSnapshot): SocialPost {
  const data = docSnap.data() || {};
  
  // Format creation timestamp
  let createdAtIso = new Date().toISOString();
  if (data.createdAt?.toDate) {
    createdAtIso = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAtIso = data.createdAt;
  } else if (typeof data.timestamp === 'string') {
    createdAtIso = data.timestamp;
  }

  // Handle author details gracefully from legacy or canonical schema
  const author: PostAuthor = {
    uid: data.authorId || data.userId || 'anonymous',
    name: data.author?.name || data.authorName || data.userName || data.user?.name || 'TonJam Creator',
    username: data.author?.username || data.username || data.user?.username || '@tonjam',
    avatar: data.author?.avatar || data.authorPhoto || data.userAvatar || data.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isVerified: !!(data.author?.isVerified || data.isVerified || data.user?.isVerified),
    role: data.author?.role || data.role || data.user?.role || 'creator'
  };

  return {
    id: docSnap.id,
    authorId: author.uid,
    author,
    text: data.text || data.content || '',
    createdAt: createdAtIso,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
    visibility: data.visibility || 'public',
    replyToPostId: data.replyToPostId || null,
    replyToAuthorUsername: data.replyToAuthorUsername || null,
    rootPostId: data.rootPostId || null,
    quotePostId: data.quotePostId || null,
    quotePost: data.quotePost || null,
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : (data.likes || 0),
    replyCount: typeof data.replyCount === 'number' ? data.replyCount : (data.commentsCount || data.comments || 0),
    repostCount: typeof data.repostCount === 'number' ? data.repostCount : (data.reposts || 0),
    bookmarkCount: typeof data.bookmarkCount === 'number' ? data.bookmarkCount : 0,
    moderationStatus: data.moderationStatus || 'active'
  };
}

export interface FeedResponse {
  posts: SocialPost[];
  lastVisible: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Dispatches an in-app social notification to a recipient
 */
async function dispatchSocialNotification(params: {
  recipientId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  type: SocialNotificationType;
  postId?: string;
  postSnippet?: string;
}) {
  // Never notify self
  if (params.recipientId === params.senderId || !params.recipientId) {
    return;
  }

  try {
    const notifId = `notif_${params.type}_${params.senderId}_${params.postId || 'direct'}_${Date.now()}`;
    const notifRef = doc(db, 'users', params.recipientId, 'notifications', notifId);
    
    await setDoc(notifRef, {
      id: notifId,
      recipientId: params.recipientId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderUsername: params.senderUsername,
      senderAvatar: params.senderAvatar,
      type: params.type,
      postId: params.postId || null,
      postSnippet: (params.postSnippet || '').slice(0, 100),
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    // Non-blocking notification dispatch
    console.warn('[jamSpaceService] Social notification dispatch error:', err);
  }
}

export const jamSpaceService = {
  /**
   * Fetches "For You" feed with cursor-based pagination
   */
  async fetchForYouFeed(pageSize = 15, lastDocSnap?: QueryDocumentSnapshot | null): Promise<FeedResponse> {
    try {
      const postsRef = collection(db, POSTS_COLLECTION);
      let q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDocSnap) {
        q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastDocSnap),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      const posts: SocialPost[] = [];

      snapshot.docs.forEach((docSnap) => {
        const post = normalizePostDoc(docSnap);
        // Exclude removed content and replies from root main feed
        if (post.moderationStatus !== 'removed' && !post.replyToPostId) {
          posts.push(post);
        }
      });

      const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      const hasMore = snapshot.docs.length >= pageSize;

      return {
        posts,
        lastVisible,
        hasMore
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
      return { posts: [], lastVisible: null, hasMore: false };
    }
  },

  /**
   * Fetches "Following" feed filtering by accounts followed by currentUser
   */
  async fetchFollowingFeed(
    followingIds: string[],
    pageSize = 15,
    lastDocSnap?: QueryDocumentSnapshot | null
  ): Promise<FeedResponse> {
    if (!followingIds || followingIds.length === 0) {
      return { posts: [], lastVisible: null, hasMore: false };
    }

    try {
      const postsRef = collection(db, POSTS_COLLECTION);
      // Fetch recent posts and filter by followingIds to ensure pagination works cleanly
      let q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize * 2)
      );

      if (lastDocSnap) {
        q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastDocSnap),
          limit(pageSize * 2)
        );
      }

      const snapshot = await getDocs(q);
      const followingSet = new Set(followingIds);
      const posts: SocialPost[] = [];

      snapshot.docs.forEach((docSnap) => {
        const post = normalizePostDoc(docSnap);
        if (
          followingSet.has(post.authorId) && 
          post.moderationStatus !== 'removed' && 
          !post.replyToPostId
        ) {
          posts.push(post);
        }
      });

      const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      const hasMore = snapshot.docs.length >= (pageSize * 2);

      return {
        posts: posts.slice(0, pageSize),
        lastVisible,
        hasMore
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
      return { posts: [], lastVisible: null, hasMore: false };
    }
  },

  /**
   * Hydrates current user's interaction status (like, repost, bookmark) for a list of posts
   */
  async hydrateUserInteractions(
    posts: SocialPost[],
    userId?: string
  ): Promise<SocialPost[]> {
    if (!userId || posts.length === 0) {
      return posts;
    }

    try {
      const hydrated = await Promise.all(
        posts.map(async (post) => {
          try {
            const [likeSnap, repostSnap, bookmarkSnap] = await Promise.all([
              getDoc(doc(db, POSTS_COLLECTION, post.id, 'likes', userId)),
              getDoc(doc(db, REPOSTS_COLLECTION, `${userId}_${post.id}`)),
              getDoc(doc(db, 'users', userId, 'bookmarks', post.id))
            ]);

            return {
              ...post,
              isLiked: likeSnap.exists(),
              isReposted: repostSnap.exists(),
              isBookmarked: bookmarkSnap.exists()
            };
          } catch {
            return post;
          }
        })
      );

      return hydrated;
    } catch (err) {
      console.warn('[jamSpaceService] Error hydrating interaction states:', err);
      return posts;
    }
  },

  /**
   * Creates a top-level post, reply, or quote-post
   */
  async createPost(params: {
    author: PostAuthor;
    text: string;
    attachments?: PostAttachment[];
    replyToPostId?: string | null;
    replyToAuthorUsername?: string | null;
    rootPostId?: string | null;
    quotePostId?: string | null;
    quotePost?: QuotePostSnippet | null;
  }): Promise<SocialPost> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const postPayload = {
      id: postId,
      authorId: params.author.uid,
      author: params.author,
      text: params.text.trim(),
      attachments: params.attachments || [],
      visibility: 'public',
      replyToPostId: params.replyToPostId || null,
      replyToAuthorUsername: params.replyToAuthorUsername || null,
      rootPostId: params.rootPostId || params.replyToPostId || null,
      quotePostId: params.quotePostId || null,
      quotePost: params.quotePost || null,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      bookmarkCount: 0,
      moderationStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Backward compatibility fields
      userId: params.author.uid,
      userName: params.author.name,
      userAvatar: params.author.avatar,
      username: params.author.username,
      content: params.text.trim(),
      likes: 0,
      commentsCount: 0,
      reposts: 0
    };

    const batch = writeBatch(db);
    batch.set(postRef, postPayload);

    // If this is a reply, atomically increment the parent's replyCount
    if (params.replyToPostId) {
      const parentRef = doc(db, POSTS_COLLECTION, params.replyToPostId);
      batch.update(parentRef, {
        replyCount: increment(1),
        commentsCount: increment(1),
        comments: increment(1)
      });
    }

    // If this is a quote post, increment the original's repostCount
    if (params.quotePostId) {
      const originalRef = doc(db, POSTS_COLLECTION, params.quotePostId);
      batch.update(originalRef, {
        repostCount: increment(1),
        reposts: increment(1)
      });
    }

    await batch.commit();

    // Trigger notification if replying or quoting
    if (params.replyToPostId) {
      try {
        const parentDoc = await getDoc(doc(db, POSTS_COLLECTION, params.replyToPostId));
        if (parentDoc.exists()) {
          const parentAuthorId = parentDoc.data().authorId || parentDoc.data().userId;
          await dispatchSocialNotification({
            recipientId: parentAuthorId,
            senderId: params.author.uid,
            senderName: params.author.name,
            senderUsername: params.author.username,
            senderAvatar: params.author.avatar,
            type: 'reply',
            postId,
            postSnippet: params.text
          });
        }
      } catch (e) {}
    } else if (params.quotePostId && params.quotePost) {
      await dispatchSocialNotification({
        recipientId: params.quotePost.authorId,
        senderId: params.author.uid,
        senderName: params.author.name,
        senderUsername: params.author.username,
        senderAvatar: params.author.avatar,
        type: 'quote',
        postId,
        postSnippet: params.text
      });
    }

    return {
      id: postId,
      authorId: params.author.uid,
      author: params.author,
      text: params.text.trim(),
      createdAt: new Date().toISOString(),
      visibility: 'public',
      replyToPostId: params.replyToPostId || null,
      replyToAuthorUsername: params.replyToAuthorUsername || null,
      rootPostId: params.rootPostId || params.replyToPostId || null,
      quotePostId: params.quotePostId || null,
      quotePost: params.quotePost || null,
      attachments: params.attachments || [],
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      bookmarkCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      moderationStatus: 'active'
    };
  },

  /**
   * Idempotent like / unlike toggle
   */
  async toggleLike(
    postId: string, 
    userId: string, 
    userAuthor?: PostAuthor, 
    postAuthorId?: string
  ): Promise<{ isLiked: boolean; newCount: number }> {
    const likeDocRef = doc(db, POSTS_COLLECTION, postId, 'likes', userId);
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const likeSnap = await getDoc(likeDocRef);
    const isCurrentlyLiked = likeSnap.exists();

    const batch = writeBatch(db);

    if (isCurrentlyLiked) {
      batch.delete(likeDocRef);
      batch.update(postRef, {
        likeCount: increment(-1),
        likes: increment(-1)
      });
      await batch.commit();
      return { isLiked: false, newCount: -1 };
    } else {
      batch.set(likeDocRef, {
        userId,
        postId,
        createdAt: serverTimestamp()
      });
      batch.update(postRef, {
        likeCount: increment(1),
        likes: increment(1)
      });
      await batch.commit();

      if (postAuthorId && userAuthor) {
        await dispatchSocialNotification({
          recipientId: postAuthorId,
          senderId: userId,
          senderName: userAuthor.name,
          senderUsername: userAuthor.username,
          senderAvatar: userAuthor.avatar,
          type: 'like',
          postId
        });
      }

      return { isLiked: true, newCount: 1 };
    }
  },

  /**
   * Idempotent repost / unrepost toggle
   */
  async toggleRepost(
    postId: string, 
    userId: string, 
    userAuthor?: PostAuthor, 
    postAuthorId?: string
  ): Promise<{ isReposted: boolean; newCount: number }> {
    const repostId = `${userId}_${postId}`;
    const repostDocRef = doc(db, REPOSTS_COLLECTION, repostId);
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const repostSnap = await getDoc(repostDocRef);
    const isCurrentlyReposted = repostSnap.exists();

    const batch = writeBatch(db);

    if (isCurrentlyReposted) {
      batch.delete(repostDocRef);
      batch.update(postRef, {
        repostCount: increment(-1),
        reposts: increment(-1)
      });
      await batch.commit();
      return { isReposted: false, newCount: -1 };
    } else {
      batch.set(repostDocRef, {
        id: repostId,
        userId,
        postId,
        createdAt: serverTimestamp()
      });
      batch.update(postRef, {
        repostCount: increment(1),
        reposts: increment(1)
      });
      await batch.commit();

      if (postAuthorId && userAuthor) {
        await dispatchSocialNotification({
          recipientId: postAuthorId,
          senderId: userId,
          senderName: userAuthor.name,
          senderUsername: userAuthor.username,
          senderAvatar: userAuthor.avatar,
          type: 'repost',
          postId
        });
      }

      return { isReposted: true, newCount: 1 };
    }
  },

  /**
   * Idempotent private bookmark toggle under users/{userId}/bookmarks/{postId}
   */
  async toggleBookmark(
    postId: string, 
    userId: string, 
    post?: SocialPost
  ): Promise<{ isBookmarked: boolean }> {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const bookmarkSnap = await getDoc(bookmarkRef);
    const isCurrentlyBookmarked = bookmarkSnap.exists();

    const batch = writeBatch(db);

    if (isCurrentlyBookmarked) {
      batch.delete(bookmarkRef);
      batch.update(postRef, {
        bookmarkCount: increment(-1)
      });
      await batch.commit();
      return { isBookmarked: false };
    } else {
      batch.set(bookmarkRef, {
        postId,
        userId,
        createdAt: serverTimestamp(),
        postSnapshot: post ? {
          text: post.text,
          authorName: post.author.name,
          authorUsername: post.author.username,
          authorAvatar: post.author.avatar
        } : null
      });
      batch.update(postRef, {
        bookmarkCount: increment(1)
      });
      await batch.commit();
      return { isBookmarked: true };
    }
  },

  /**
   * Fetches full conversation thread (parent, post, and replies)
   */
  async fetchPostWithThread(postId: string): Promise<ConversationThread | null> {
    try {
      const postDoc = await getDoc(doc(db, POSTS_COLLECTION, postId));
      if (!postDoc.exists()) {
        return null;
      }

      const post = normalizePostDoc(postDoc);

      // Fetch parent post if this is a reply
      let parentPost: SocialPost | null = null;
      if (post.replyToPostId) {
        try {
          const parentDoc = await getDoc(doc(db, POSTS_COLLECTION, post.replyToPostId));
          if (parentDoc.exists()) {
            parentPost = normalizePostDoc(parentDoc);
          }
        } catch {}
      }

      // Fetch replies to this post
      const repliesQuery = query(
        collection(db, POSTS_COLLECTION),
        where('replyToPostId', '==', postId),
        orderBy('createdAt', 'asc'),
        limit(50)
      );

      const repliesSnap = await getDocs(repliesQuery);
      const replies: SocialPost[] = [];

      repliesSnap.docs.forEach((snap) => {
        const replyPost = normalizePostDoc(snap);
        if (replyPost.moderationStatus !== 'removed') {
          replies.push(replyPost);
        }
      });

      return {
        post,
        parentPost,
        rootPost: null,
        replies
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${POSTS_COLLECTION}/${postId}`);
      return null;
    }
  },

  /**
   * Follows or unfollows a user idempotently
   */
  async toggleFollow(follower: PostAuthor, followingId: string): Promise<{ isFollowing: boolean }> {
    if (follower.uid === followingId) {
      throw new Error('You cannot follow yourself');
    }

    const followId = `${follower.uid}_${followingId}`;
    const followRef = doc(db, FOLLOWS_COLLECTION, followId);
    const followerUserRef = doc(db, 'users', follower.uid);
    const targetUserRef = doc(db, 'users', followingId);

    const followSnap = await getDoc(followRef);
    const isCurrentlyFollowing = followSnap.exists();

    const batch = writeBatch(db);

    if (isCurrentlyFollowing) {
      batch.delete(followRef);
      batch.update(followerUserRef, { following: increment(-1) });
      batch.update(targetUserRef, { followers: increment(-1) });
      await batch.commit();
      return { isFollowing: false };
    } else {
      batch.set(followRef, {
        id: followId,
        followerId: follower.uid,
        followingId,
        createdAt: serverTimestamp()
      });
      batch.update(followerUserRef, { following: increment(1) });
      batch.update(targetUserRef, { followers: increment(1) });
      await batch.commit();

      await dispatchSocialNotification({
        recipientId: followingId,
        senderId: follower.uid,
        senderName: follower.name,
        senderUsername: follower.username,
        senderAvatar: follower.avatar,
        type: 'follow'
      });

      return { isFollowing: true };
    }
  },

  /**
   * Reports a post or user
   */
  async submitReport(params: {
    reporterId: string;
    targetPostId?: string;
    targetUserId?: string;
    reason: 'spam' | 'harassment' | 'copyright' | 'inappropriate' | 'other';
    details?: string;
  }): Promise<void> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await setDoc(doc(db, REPORTS_COLLECTION, reportId), {
      id: reportId,
      reporterId: params.reporterId,
      targetPostId: params.targetPostId || null,
      targetUserId: params.targetUserId || null,
      reason: params.reason,
      details: params.details || '',
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  /**
   * Deletes a post authored by the user
   */
  async deletePost(postId: string, authorId: string): Promise<void> {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return;
    }

    const data = postSnap.data();
    if (data.authorId !== authorId && data.userId !== authorId) {
      throw new Error('Unauthorized to delete this post');
    }

    await deleteDoc(postRef);
  }
};
