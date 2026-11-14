import React, { useEffect, useState } from 'react';
import { Heart, MessageSquare, Share2, ShoppingCart, Coins, UserPlus, Clock } from 'lucide-react';
import { ActivityEvent } from './ProfileTypes';
import { ActivityChart } from './ActivityChart';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';

interface ActivityTabProps {
  activities?: ActivityEvent[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities: propActivities }) => {
  const [firestoreActivities, setFirestoreActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (propActivities !== undefined) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setFirestoreActivities([]);
      return;
    }

    const q = query(
      collection(db, 'users', uid, 'listeningHistory'),
      orderBy('playedAt', 'desc'),
      limit(20)
    );
    const unsubHistory = onSnapshot(
      q,
      (snap) => {
        const items: ActivityEvent[] = snap.docs.map((d) => {
          const data = d.data();
          const dt = data.playedAt?.toDate ? data.playedAt.toDate() : null;
          return {
            id: d.id,
            type: 'like',
            title: 'Streamed Track',
            description: `Played "${data.trackTitle || data.title || 'Track'}" by ${data.artist || 'Artist'}`,
            timestamp: dt ? dt.toLocaleDateString() : 'Recently',
            rawDate: dt ? dt.toISOString() : undefined,
            metadata: { trackId: data.trackId },
          };
        });
        setFirestoreActivities(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${uid}/listeningHistory`);
      }
    );

    const salesQ = query(
      collection(db, 'nftSales'),
      where('buyerId', '==', uid),
      limit(10)
    );
    const unsubSales = onSnapshot(
      salesQ,
      (snap) => {
        const purchaseEvents: ActivityEvent[] = snap.docs.map((d) => {
          const data = d.data();
          const dt = data.timestamp?.toDate ? data.timestamp.toDate() : null;
          return {
            id: `sale-${d.id}`,
            type: 'nft_purchase',
            title: 'NFT Purchased',
            description: `Collected "${data.nftTitle || 'NFT'}" for ${data.price || 0} TON`,
            timestamp: dt ? dt.toLocaleDateString() : 'Recently',
            rawDate: dt ? dt.toISOString() : undefined,
            metadata: { nftId: data.nftId, price: `${data.price || 0} TON` },
          };
        });
        if (purchaseEvents.length > 0) {
          setFirestoreActivities((prev) => {
            const existingIds = new Set(purchaseEvents.map((p) => p.id));
            return [...purchaseEvents, ...prev.filter((p) => !existingIds.has(p.id))];
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'nftSales');
      }
    );

    return () => {
      unsubHistory();
      unsubSales();
    };
  }, [propActivities]);

  const logs = propActivities ?? firestoreActivities;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-[#0052FF]" />;
      case 'nft_purchase':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'nft_sale':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3.5 text-white font-sans pb-8">
      <ActivityChart activities={logs} />

      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Recent Activity Logs
      </h3>

      <div className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="bg-[#101A3B] rounded-[12px] p-8 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#101A3B] rounded-[12px] p-4 flex gap-4 items-start hover:bg-[#15234f] transition-all"
            >
              <div className="p-2.5 bg-white/5 rounded-full shrink-0">
                {getEventIcon(log.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                    {log.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {log.description}
                </p>
                
                {log.metadata?.commentText && (
                  <div className="mt-2.5 p-3 bg-white/5 rounded-[8px] text-xs font-medium italic text-slate-300">
                    "{log.metadata.commentText}"
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
