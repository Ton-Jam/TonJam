// import { db } from '@/lib/firebase';
// import { collection, addDoc, updateDoc, deleteDoc, doc, increment, serverTimestamp } from 'firebase/firestore';

import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

export const createPost = async (authorId: string, authorName: string, authorPhoto: string | null, content: string) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      authorId,
      authorName,
      authorPhoto,
      content,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
};

export const likePost = async (postId: string, userId: string) => {
  try {
    const likeId = `${userId}_${postId}`;
    await setDoc(doc(db, 'posts', postId, 'likes', likeId), {
      userId,
      postId,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'posts', postId), {
      likes: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}/likes`);
  }
};

export const unlikePost = async (postId: string, userId: string) => {
  try {
    const likeId = `${userId}_${postId}`;
    await deleteDoc(doc(db, 'posts', postId, 'likes', likeId));
    
    await updateDoc(doc(db, 'posts', postId), {
      likes: increment(-1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}/likes`);
  }
};

export const addComment = async (postId: string, userId: string, userName: string, content: string, userAvatar?: string) => {
  try {
    const commentData = {
      postId,
      targetId: postId,
      userId,
      userName,
      userAvatar: userAvatar || '',
      content,
      text: content,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
    } catch {
      // Subcollection write is secondary
    }
    
    try {
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1),
        comments: increment(1)
      });
    } catch {
      // Post counter increment
    }
    
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'comments');
  }
};

export const createActivityPost = async (
  userId: string, 
  userName: string, 
  userAvatar: string, 
  content: string, 
  activityType: 'tip' | 'nft_purchase' | 'fan_club_join' | 'track_release' | 'nft_mint',
  metadata: {
    targetId?: string;
    artistName?: string;
    trackTitle?: string;
    paymentAmount?: string;
    paymentCurrency?: string;
  }
) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      userId,
      userName,
      userAvatar,
      content,
      type: 'activity',
      status: activityType,
      ...metadata,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts/activity');
  }
};

export const followUser = async (followerId: string, followingId: string) => {
  try {
    const followId = `${followerId}_${followingId}`;
    await setDoc(doc(db, 'follows', followId), {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'follows');
  }
};

export const followCollection = async (userId: string, collectionId: string) => {
  try {
    const followId = `${userId}_${collectionId}`;
    await setDoc(doc(db, 'follows', followId), {
      followerId: userId,
      followingId: collectionId,
      type: 'collection',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'follows');
  }
};

export const repostPost = async (postId: string, userId: string, postData?: any) => {
  try {
    const repostId = `${userId}_${postId}`;
    await setDoc(doc(db, 'reposts', repostId), {
      userId,
      postId,
      postData: postData || null,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'posts', postId), {
      reposts: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reposts');
  }
};

export const unrepostPost = async (postId: string, userId: string) => {
  try {
    const repostId = `${userId}_${postId}`;
    await deleteDoc(doc(db, 'reposts', repostId));
    
    await updateDoc(doc(db, 'posts', postId), {
      reposts: increment(-1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'reposts');
  }
};

export const reportPost = async (postId: string, userId: string, reason: string = 'Inappropriate content') => {
  try {
    const reportId = `${userId}_${postId}_${Date.now()}`;
    await setDoc(doc(db, 'reports', reportId), {
      postId,
      userId,
      reason,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reports');
  }
};

