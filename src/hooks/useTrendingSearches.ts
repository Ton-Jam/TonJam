import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  increment,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export interface TrendingSearchItem {
  id: string;
  term: string;
  count: number;
  updatedAt?: string;
}

const DEFAULT_TRENDING: TrendingSearchItem[] = [
  { id: 'burna_boy', term: 'Burna Boy', count: 184 },
  { id: 'asake', term: 'Asake', count: 142 },
  { id: 'ton_nft', term: 'TON NFT', count: 119 },
  { id: 'afrobeats_2026', term: 'Afrobeats 2026', count: 96 },
  { id: 'phonk_drift', term: 'Phonk Drift', count: 83 },
  { id: 'amapiano', term: 'Amapiano', count: 68 },
  { id: 'synthwave', term: 'Synthwave', count: 54 },
  { id: 'wizkid', term: 'Wizkid', count: 47 }
];

export function useTrendingSearches() {
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearchItem[]>(DEFAULT_TRENDING);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and listen to real-time updates from Firestore
  useEffect(() => {
    const colRef = collection(db, 'trendingSearches');
    const q = query(colRef, orderBy('count', 'desc'), limit(10));

    // Seed defaults if empty
    const seedInitialIfEmpty = async () => {
      try {
        const snap = await getDocs(q);
        if (snap.empty) {
          for (const item of DEFAULT_TRENDING) {
            await setDoc(doc(db, 'trendingSearches', item.id), {
              ...item,
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        // Silently continue to listener
      }
    };
    seedInitialIfEmpty();

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TrendingSearchItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            if (data && data.term) {
              items.push({
                id: d.id,
                term: data.term,
                count: typeof data.count === 'number' ? data.count : 1,
                updatedAt: data.updatedAt
              });
            }
          });
          if (items.length > 0) {
            setTrendingSearches(items);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'trendingSearches');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Increment or record a search term count in real-time
  const recordSearchTerm = useCallback(async (rawTerm: string) => {
    const trimmed = rawTerm.trim();
    if (!trimmed || trimmed.length < 2) return;

    const termId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
    const docPath = `trendingSearches/${termId}`;

    try {
      await setDoc(
        doc(db, 'trendingSearches', termId),
        {
          id: termId,
          term: trimmed,
          count: increment(1),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }, []);

  return {
    trendingSearches,
    recordSearchTerm,
    isLoading
  };
}
