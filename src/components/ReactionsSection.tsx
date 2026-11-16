import React, { useState, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

interface Reaction {
  id: string; // userId
  type: string;
}

interface ReactionsSectionProps {
  targetId: string;
  targetType: 'track' | 'nft';
}

const REACTION_TYPES = [
  { emoji: '🔥', label: 'fire' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '🚀', label: 'rocket' },
  { emoji: '🤯', label: 'mindblown' },
  { emoji: '💎', label: 'gem' },
];

export default function ReactionsSection({ targetId, targetType }: ReactionsSectionProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const { addNotification } = useAudio();

  useEffect(() => {
    const q = query(
      collection(db, 'reactions'),
      where('targetId', '==', targetId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReactions = snapshot.docs.map(doc => ({
        id: doc.data().userId,
        type: doc.data().type
      })) as Reaction[];
      setReactions(fetchedReactions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reactions');
    });

    return () => unsubscribe();
  }, [targetId]);

  const handleReact = async (type: string) => {
    if (!auth.currentUser) {
      addNotification("Please log in to react", "error");
      return;
    }

    const userId = auth.currentUser.uid;
    const existingReaction = reactions.find(r => r.id === userId);

    try {
      if (existingReaction && existingReaction.type === type) {
        // Remove reaction
        await deleteDoc(doc(db, 'reactions', `${targetId}_${userId}`));
      } else {
        // Add or update reaction
        await setDoc(doc(db, 'reactions', `${targetId}_${userId}`), {
          targetId,
          targetType,
          userId,
          type,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reactions');
    }
  };

  const reactionCounts = REACTION_TYPES.map(rt => ({
    ...rt,
    count: reactions.filter(r => r.type === rt.label).length,
    hasReacted: auth.currentUser ? reactions.some(r => r.id === auth.currentUser!.uid && r.type === rt.label) : false
  }));

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {reactionCounts.map(({ emoji, label, count, hasReacted }) => (
        <motion.button
          key={label}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleReact(label)}
          className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-[var(--tj-radius-sm,6px)] text-xs font-semibold border-0 cursor-pointer transition-colors ${
            hasReacted 
              ? 'bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-brand-primary,#00B4D8)]' 
              : 'bg-[var(--tj-color-surface-default,#0D1628)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:text-white'
          }`}
        >
          <span>{emoji}</span>
          {count > 0 && <span className="font-mono tabular-nums">{count}</span>}
        </motion.button>
      ))}
    </div>
  );
}
