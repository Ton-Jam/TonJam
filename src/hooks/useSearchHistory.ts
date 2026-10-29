import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  increment
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';

const LOCAL_STORAGE_KEY = 'tonjam_search_history';
const DEFAULT_SEARCHES = ['Burna Boy', 'Asake', 'Afrobeats 2026', 'Phonk', 'TON NFT'];

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_SEARCHES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with Firestore if authenticated
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    const userId = currentUser.uid;
    const historyRef = collection(db, 'users', userId, 'searchHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(12));

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: string[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.query && typeof data.query === 'string') {
            if (!items.includes(data.query)) {
              items.push(data.query);
            }
          }
        });

        if (items.length > 0) {
          setSearchHistory(items);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        }
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/searchHistory`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  // Save a query to search history
  const saveQuery = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed || trimmed.length < 2) return;

    // Local update immediately for snappy UI
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      const userId = currentUser.uid;
      const docId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50) || `${Date.now()}`;
      const docPath = `users/${userId}/searchHistory/${docId}`;

      try {
        await setDoc(doc(db, 'users', userId, 'searchHistory', docId), {
          id: docId,
          userId,
          query: trimmed,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
    }

    // Also update real-time trending search count in Firestore
    try {
      const trendId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
      setDoc(
        doc(db, 'trendingSearches', trendId),
        {
          id: trendId,
          term: trimmed,
          count: increment(1),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      ).catch(() => {});
    } catch {}
  }, []);

  // Remove a specific search term
  const removeQuery = useCallback(async (termToRemove: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      const userId = currentUser.uid;
      const docId = termToRemove.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50) || `${Date.now()}`;
      const docPath = `users/${userId}/searchHistory/${docId}`;

      try {
        await deleteDoc(doc(db, 'users', userId, 'searchHistory', docId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    }
  }, []);

  // Clear all search history
  const clearAllQueries = useCallback(async () => {
    const currentUser = auth.currentUser;

    setSearchHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('recentSearches');
    } catch {}

    if (currentUser) {
      const userId = currentUser.uid;
      const historyPath = `users/${userId}/searchHistory`;
      try {
        const historyRef = collection(db, 'users', userId, 'searchHistory');
        const snapshot = await getDocs(historyRef);
        const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, historyPath);
      }
    }
  }, []);

  return {
    searchHistory,
    saveQuery,
    removeQuery,
    clearAllQueries,
    isLoading
  };
}
