import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { NFTItem } from '@/types';
import NFTCard from '@/components/NFTCard';

const RecentlyMintedNFTs: React.FC = () => {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNFTs = async () => {
      try {
        const nftsRef = collection(db, 'nfts');
        const q = query(nftsRef, orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const fetchedNfts: NFTItem[] = [];
        querySnapshot.forEach((doc) => {
          fetchedNfts.push({ id: doc.id, ...doc.data() } as NFTItem);
        });
        
        setNfts(fetchedNfts);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'nfts');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNFTs();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 px-4">
        <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4">Recently Minted</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[200px] h-[280px] bg-slate-800 animate-pulse rounded-[12px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Recently Minted</h2>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/20">
          Live Feed
        </span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
        {nfts.map((nft) => (
          <div key={nft.id} className="min-w-[220px] max-w-[260px] snap-center shrink-0">
            <NFTCard nft={nft} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyMintedNFTs;
