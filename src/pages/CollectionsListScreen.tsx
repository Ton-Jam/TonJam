import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Layers, Disc } from 'lucide-react';
import { CollectionCard } from '@/components/marketplace/CollectionCard';
import { PRIMARY_COLLECTIONS, DetailedCollection } from '@/data/collectionsData';
import { getFeaturedCollections } from '@/services/collectionService';

export const CollectionsListScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteCollections, setRemoteCollections] = useState<DetailedCollection[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadRemote = async () => {
      try {
        const fetched = await getFeaturedCollections();
        if (fetched && fetched.length > 0 && isMounted) {
          const mapped: DetailedCollection[] = fetched
            .filter(f => !PRIMARY_COLLECTIONS.some(p => p.id === f.id))
            .map(f => ({
              ...f,
              volume: '12,500',
              floorPrice: '10.0',
              ownersCount: 50,
              totalSupply: 100,
              creatorName: f.artistId || 'Artist',
              verified: true,
              contractAddress: `EQ_${f.id}_TON`,
              royaltyFee: '5.0%',
              bannerUrl: f.coverUrl,
              items: []
            }));
          setRemoteCollections(mapped);
        }
      } catch (e) {
        // Built-in PRIMARY_COLLECTIONS are always ready
      }
    };

    loadRemote();
    return () => { isMounted = false; };
  }, []);

  const allCollections = useMemo(() => {
    return [...PRIMARY_COLLECTIONS, ...remoteCollections];
  }, [remoteCollections]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return allCollections;
    const q = searchQuery.toLowerCase();
    return allCollections.filter(
      c => c.name.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q)
    );
  }, [allCollections, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070B18] text-white pb-32 overflow-x-hidden selection:bg-blue-600/30">
      
      {/* Top Clean Header: [Back] Screen Title */}
      <div className="sticky top-0 z-30 bg-[#070B18]/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-none">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] px-3 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all border-none cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="min-w-0 flex-1 text-center px-2">
          <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-xs mx-auto">
            Collections
          </h1>
        </div>

        <div className="w-[44px] shrink-0" aria-hidden="true" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Screen Title & Search Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Music NFT Collections
              </h2>
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-[4px]">
                {filteredCollections.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore curated and verified on-chain digital music collections on the TON Blockchain.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collections or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[40px] bg-[#0B112C] text-xs text-white placeholder-slate-500 rounded-[8px] pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 border-none"
            />
          </div>
        </div>

        {/* Collections Grid using refined 10px Collection Cards */}
        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={{
                  id: col.id,
                  name: col.name,
                  creator: col.creatorName,
                  floorPrice: col.floorPrice,
                  volume: col.volume,
                  imageUrl: col.coverUrl,
                  itemCount: col.items?.length || col.totalSupply,
                  verified: col.verified,
                }}
                onClick={() => navigate(`/collections/${col.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#0B112C] rounded-[10px] space-y-3">
            <Disc className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              No Collections Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No music NFT collections matched your search term "{searchQuery}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsListScreen;
