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

export const addComment = async (postId: string, userId: string, userName: string, content: string) => {
  try {
    const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
      userId,
      userName,
      content,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'posts', postId), {
      commentsCount: increment(1)
    });
    
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
  }
};

export const createActivityPost = async (
  userId: string, 
  userName: string, 
  userAvatar: string, 
  content: string, 
  activityType: 'tip' | 'nft_purchase' | 'fan_club_join' | 'track_release',
  metadata: {
    targetId?: string;
    artistName?: string;
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
