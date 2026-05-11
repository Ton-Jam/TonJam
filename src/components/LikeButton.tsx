import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useAudio } from '@/context/AudioContext';

interface LikeButtonProps {
  targetId: string;
  targetType: 'track' | 'artist' | 'post';
}

export default function LikeButton({ targetId, targetType }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { addNotification } = useAudio();

  useEffect(() => {
    if (!targetId) return;

    // Listen for likes count and user's like status
    const q = query(
      collection(db, 'likes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setLikeCount(snapshot.size);
        if (auth.currentUser) {
            setIsLiked(snapshot.docs.some(doc => doc.data().userId === auth.currentUser!.uid));
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'likes');
    });

    return () => unsubscribe();
  }, [targetId, targetType]);

  const toggleLike = async () => {
    if (!auth.currentUser) {
      addNotification("Please log in to like", "error");
      return;
    }

    const userId = auth.currentUser.uid;
    const likeId = `${targetId}_${userId}`; // Simple ID

    try {
      if (isLiked) {
        await deleteDoc(doc(db, 'likes', likeId));
      } else {
        await setDoc(doc(db, 'likes', likeId), {
          targetId,
          targetType,
          userId,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'likes');
    }
  };

  return (
    <button 
      onClick={toggleLike}
      className={`flex items-center gap-1.5 p-2 rounded-full transition-all ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="text-xs font-bold">{likeCount}</span>
    </button>
  );
}
