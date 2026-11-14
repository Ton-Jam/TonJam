import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Layers } from 'lucide-react';
import { CollectionCard } from '@/components/marketplace/CollectionCard';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

interface FirestoreCollectionCard {
  id: string;
  name: string;
  creatorName: string;
  floorPrice: string;
  volume: string;
  coverUrl: string;
  itemCount: number;
  verified: boolean;
}

export const Collections: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<FirestoreCollectionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'collections'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: FirestoreCollectionCard[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const itemCount =
            Number(data.totalNFTs || data.itemsCount || data.itemCount || 0) ||
            (Array.isArray(data.nftIds) ? data.nftIds.length : 0);
          return {
            id: docSnap.id,
            name: data.name || 'Untitled Collection',
            creatorName: data.creatorName || data.creator || data.artistName || 'Artist',
            floorPrice: String(data.floorPrice || '0'),
            volume: String(data.volume || '0'),
            coverUrl: data.coverUrl || data.imageUrl || '',
            itemCount,
            verified: Boolean(data.verified ?? data.creatorVerified ?? false),
          };
        });
        setCollections(loaded);
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'collections');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) => c.name.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070B18] text-white pb-32 overflow-x-hidden selection:bg-blue-600/30">
      <div className="sticky top-0 z-30 bg-[#070B18]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-none">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] px-3 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all border-none cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="min-w-0 flex-1 text-center px-2">
          <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-xs mx-auto">
            Collections
          </h2>
        </div>

        <div className="w-10 shrink-0" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-400" />
              Music NFT Collections
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore music collectibles and audio drops on TON
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[40px] bg-[#0B112C] text-xs text-white placeholder-slate-500 rounded-[10px] pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 border-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#0B112C] animate-pulse" />
            ))}
          </div>
        ) : filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredCollections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={{
                  id: col.id,
                  name: col.name,
                  creator: col.creatorName,
                  floorPrice: `${col.floorPrice} TON`,
                  volume: col.volume,
                  imageUrl: col.coverUrl,
                  itemCount: col.itemCount,
                  verified: col.verified,
                }}
                onClick={() => navigate(`/collections/${col.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#0B112C] rounded-[10px] space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              No Collections Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery.trim()
                ? `No music collections match "${searchQuery}". Try a different search term.`
                : 'No music NFT collections have been published to Firestore yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
