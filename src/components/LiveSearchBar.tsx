import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';

export const LiveSearchBar: React.FC = () => {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<{ tracks: any[]; artists: any[] }>({ tracks: [], artists: [] });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (queryText.length < 2) {
        setResults({ tracks: [], artists: [] });
        return;
      }

      // Search tracks (basic prefix match)
      const tracksQuery = query(collection(db, 'tracks'), where('title', '>=', queryText), where('title', '<=', queryText + '\uf8ff'), limit(5));
      const trackSnapshot = await getDocs(tracksQuery);
      
      // Search artists
      const artistsQuery = query(collection(db, 'artists'), where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'), limit(5));
      const artistSnapshot = await getDocs(artistsQuery);

      setResults({
        tracks: trackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        artists: artistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [queryText]);

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Search database..."
          className="w-full bg-muted/20 border border-border/40 rounded-full py-2 pl-10 pr-4 text-sm"
        />
      </div>
      
      <AnimatePresence>
        {isOpen && queryText.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 p-2"
          >
            {results.tracks.map(t => <div key={t.id} className="p-2 hover:bg-muted text-sm">{t.title}</div>)}
            {results.artists.map(a => <div key={a.id} className="p-2 hover:bg-muted text-sm font-bold">{a.name}</div>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
