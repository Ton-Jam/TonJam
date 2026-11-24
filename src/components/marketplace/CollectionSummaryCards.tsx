import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Coins, Users, Layers } from 'lucide-react';
import { Collection, NFTItem, Transaction } from '@/types';

interface CollectionSummaryCardsProps {
  collectionId?: string;
  collectionName?: string;
  nft?: NFTItem | null;
  allNFTs?: NFTItem[];
  collections?: Collection[];
  transactions?: Transaction[];
  customVolume?: string | number;
  customOwners?: number;
  customItems?: number;
}

export const CollectionSummaryCards: React.FC<CollectionSummaryCardsProps> = ({
  collectionId,
  collectionName,
  nft,
  allNFTs = [],
  collections = [],
  transactions = [],
  customVolume,
  customOwners,
  customItems
}) => {
  const stats = useMemo(() => {
    if (customVolume !== undefined || customOwners !== undefined || customItems !== undefined) {
      return {
        volume: customVolume?.toString() || '0',
        owners: customOwners ?? 0,
        items: customItems ?? 0,
        name: collectionName || 'Collection',
        isStandalone: false,
      };
    }

    let activeCollection: Collection | undefined;
    if (collectionId) {
      activeCollection = collections.find((c) => c.id === collectionId);
    } else if (nft) {
      activeCollection = collections.find(
        (c) => (Array.isArray(c.nftIds) && c.nftIds.includes(nft.id)) || c.id === (nft as any).collectionId
      );
    }

    if (activeCollection) {
      const nftIdList = Array.isArray(activeCollection.nftIds) ? activeCollection.nftIds : [];
      const nftsInCollection = allNFTs.filter(
        (n) => nftIdList.includes(n.id) || (n as any).collectionId === activeCollection!.id
      );

      const collectionTx = transactions.filter(
        (t) =>
          t.type === 'nft_sale' &&
          (nftIdList.includes(t.nftId || '') || nftsInCollection.some((n) => n.id === t.nftId))
      );
      const txVol = collectionTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const docVol = parseFloat(String((activeCollection as any).volume || '0')) || 0;
      const volumeNum = txVol > 0 ? txVol : docVol;

      const ownersSet = new Set(nftsInCollection.map((n) => n.owner || n.ownerId).filter(Boolean));
      const ownersCount = ownersSet.size || Number((activeCollection as any).ownersCount || 0);
      const itemsCount = nftIdList.length || nftsInCollection.length || Number((activeCollection as any).itemCount || 0);

      return {
        volume: volumeNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        owners: ownersCount,
        items: itemsCount,
        name: activeCollection.name,
        isStandalone: false,
      };
    }

    // Standalone NFT summary strictly computed from the NFT document itself (no fake hardcoded numbers)
    if (nft) {
      const salesVol = (nft.history || [])
        .filter((h) => h.event === 'Sold' && h.price)
        .reduce((sum, h) => sum + (parseFloat(String(h.price).replace(/[^\d.]/g, '')) || 0), 0);
      const supplyNum = Number(nft.supply || 1);

      return {
        volume: salesVol > 0 ? salesVol.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0',
        owners: nft.owner ? 1 : 0,
        items: supplyNum,
        name: nft.title || 'Single Release',
        isStandalone: true,
      };
    }

    return {
      volume: '0',
      owners: 0,
      items: 0,
      name: collectionName || 'Collection',
      isStandalone: false,
    };
  }, [collectionId, collectionName, nft, allNFTs, collections, transactions, customVolume, customOwners, customItems]);

  const cardsData = [
    {
      id: 'stat-volume',
      label: 'Traded Volume',
      value: `${stats.volume} TON`,
      icon: Coins,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      note: 'On-chain sales',
    },
    {
      id: 'stat-owners',
      label: stats.isStandalone ? 'Holders' : 'Unique Owners',
      value: stats.owners.toLocaleString(),
      icon: Users,
      iconColor: 'text-[#38BDF8]',
      bgColor: 'bg-[#0088CC]/15',
      note: 'Verified wallets',
    },
    {
      id: 'stat-items',
      label: stats.isStandalone ? 'Total Supply' : 'Collection Items',
      value: `${stats.items} ${stats.items === 1 ? 'Edition' : 'Editions'}`,
      icon: Layers,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      note: stats.isStandalone ? 'Single release' : 'Catalog count',
    }
  ];

  return (
    <div className="space-y-3" id="collection-summary-stats-block">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
          {stats.name} Summary
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, ease: 'easeOut' }}
              className="bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] backdrop-blur-none border-0 p-3.5 rounded-[var(--tj-mkt-radius-sm,9px)] flex items-center justify-between transition-colors duration-200 cursor-default"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {card.label}
                </span>
                <h4 className="text-base sm:text-lg font-black text-white font-mono tabular-nums tracking-tight truncate">
                  {card.value}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {card.note}
                </p>
              </div>

              <div className={`${card.bgColor} p-2.5 rounded-[7px] border-0 shrink-0`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionSummaryCards;
