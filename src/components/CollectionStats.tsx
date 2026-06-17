import React, { useMemo, useState } from 'react';
import { Collection, NFTItem, Transaction } from '@/types';
import { BarChart3, TrendingUp, RefreshCw, Users } from 'lucide-react';

const TON_TO_USD = 5.0; // Mock rate

export const CollectionStats = ({ 
  nft, 
  allNFTs, 
  allCollections,
  transactions
}: { 
  nft: NFTItem; 
  allNFTs: NFTItem[]; 
  allCollections: Collection[];
  transactions: Transaction[];
}) => {
  const [isUSD, setIsUSD] = useState(false);

  const collectionData = useMemo(() => {
    // Find collection
    const collection = allCollections.find(c => c.nftIds.includes(nft.id));
    if (!collection) return null;

    const nftsInCollection = allNFTs.filter(n => collection.nftIds.includes(n.id));
    
    // Floor price: min price among listed NFTs
    const prices = nftsInCollection
      .map(n => parseFloat(n.price))
      .filter(p => !isNaN(p) && p > 0);
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // Total volume: sum of amounts of all sales of NFTs in this collection
    const collectionTransactions = transactions.filter(t => 
      t.type === 'nft_sale' && collection.nftIds.includes(t.nftId || '')
    );
    const totalVolume = collectionTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Unique Holders
    const owners = nftsInCollection.map(n => n.owner || n.ownerId);
    const uniqueHolders = new Set(owners.filter(Boolean)).size;

    return { floorPrice, totalVolume, uniqueHolders };
  }, [nft, allNFTs, allCollections, transactions]);

  if (!collectionData) return null;

  const displayValue = (value: number) => {
    return isUSD ? (value * TON_TO_USD).toFixed(2) : value.toFixed(2);
  };

  const currencyLabel = isUSD ? "USD" : "TON";

  return (
    <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 my-4 p-4 rounded-lg bg-muted/10 border border-white/5">
      <button 
        onClick={() => setIsUSD(!isUSD)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
      >
        <RefreshCw className="h-3 w-3" /> Toggle
      </button>
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
           <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Floor Price</p>
          <p className="text-lg font-bold">{displayValue(collectionData.floorPrice)} <span className="text-xs text-muted-foreground">{currencyLabel}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-500">
           <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Volume</p>
          <p className="text-lg font-bold">{displayValue(collectionData.totalVolume)} <span className="text-xs text-muted-foreground">{currencyLabel}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-purple-500/10 p-2 rounded-full text-purple-500">
           <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Unique Holders</p>
          <p className="text-lg font-bold">{collectionData.uniqueHolders}</p>
        </div>
      </div>
    </div>
  );
};
