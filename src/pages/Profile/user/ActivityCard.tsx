import React, { useEffect, useState, useMemo } from 'react';
import { History, ArrowRight, Heart, MessageSquare, Gem, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { ActivityEvent } from '@/components/profile/ProfileTypes';
import { useNavigate } from 'react-router-dom';

export const ActivityCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, likedTrackIds, allTracks } = useAudio();
  const [listenLogs, setListenLogs] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let active = true;
    if (!user?.uid) {
      setListenLogs([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'users', user.uid, 'listeningHistory'),
            orderBy('playedAt', 'desc'),
            limit(5)
          )
        );
        if (!active) return;
        const events: ActivityEvent[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: `hist-${docSnap.id}`,
            type: 'share',
            title: 'Streamed Track',
            description: data.trackTitle || data.title || 'Listened on TonJam',
            timestamp: data.playedAt ? new Date(data.playedAt).toLocaleDateString() : 'Recent',
            metadata: { trackId: data.trackId },
          };
        });
        setListenLogs(events);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/listeningHistory`);
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const logs = useMemo<ActivityEvent[]>(() => {
    const txEvents: ActivityEvent[] = (transactions || []).slice(0, 3).map((tx) => ({
      id: `tx-${tx.id}`,
      type:
        tx.type === 'nft_purchase' || tx.type === 'nft_sale'
          ? (tx.type as 'nft_purchase' | 'nft_sale')
          : 'share',
      title: tx.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: tx.trackTitle || `${tx.amount || 0} TON`,
      timestamp: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Recent',
    }));

    const likeEvents: ActivityEvent[] = (likedTrackIds || []).slice(0, 2).map((tid) => {
      const track = allTracks.find((t) => t.id === tid);
      return {
        id: `like-${tid}`,
        type: 'like',
        title: 'Liked a Track',
        description: track ? `${track.title} by ${track.artist}` : `Track #${tid}`,
        timestamp: 'Saved',
        metadata: { trackId: tid },
      };
    });

    return [...txEvents, ...listenLogs, ...likeEvents].slice(0, 3);
  }, [transactions, listenLogs, likedTrackIds, allTracks]);

  const getLogIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'nft_purchase':
      case 'nft_sale':
        return <Gem className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#101A3B] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Interactive Events Audit
            </span>
            <h4 className="text-sm font-bold text-slate-200">Activity Ledger</h4>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          {logs.length === 0 ? (
            <div className="bg-white/5 p-3 rounded-xl text-center">
              <p className="text-xs text-slate-400">No activity recorded yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-white/5 rounded-md shrink-0">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{log.title}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.description}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0 uppercase tracking-wide">
                  {log.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/wallet')}
        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>View Full Activity Ledger</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default ActivityCard;
