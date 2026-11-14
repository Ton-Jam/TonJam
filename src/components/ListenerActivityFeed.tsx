import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Heart, 
  Play, 
  MessageSquare, 
  Coins, 
  Sparkles, 
  Send,
  Zap,
  Check,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { Track } from '@/types';

interface ListenerActivityFeedProps {
  tracks: Track[];
}

interface Interaction {
  id: string;
  type: 'stream' | 'like' | 'collect' | 'comment' | 'tip';
  username: string;
  userAvatarSeed: string;
  trackTitle: string;
  trackId?: string;
  detail?: string;
  timestamp: string;
  rawTime: Date;
  repliedMessage?: string;
  avatarBg: string;
}

const AVATAR_BGS = [
  'bg-blue-500/15 text-blue-400',
  'bg-purple-500/15 text-purple-400',
  'bg-pink-500/15 text-pink-400',
  'bg-cyan-500/15 text-cyan-400',
  'bg-amber-500/15 text-amber-400',
  'bg-emerald-500/15 text-emerald-400',
];

const formatRelativeTime = (date: Date): string => {
  const diffMins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: -15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export default function ListenerActivityFeed({ tracks }: ListenerActivityFeedProps) {
  const { playTrack } = useAudio();
  const { userProfile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'streams' | 'likes' | 'engagements'>('all');
  const [isLiveEnabled, setIsLiveEnabled] = useState<boolean>(true);
  const [salesActivities, setSalesActivities] = useState<Interaction[]>([]);
  const [commentActivities, setCommentActivities] = useState<Interaction[]>([]);
  const [txActivities, setTxActivities] = useState<Interaction[]>([]);
  const [repliedMap, setRepliedMap] = useState<Record<string, string>>({});

  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const trackIdSet = useMemo(() => new Set(tracks.map(t => t.id)), [tracks]);
  const trackMap = useMemo(() => new Map(tracks.map(t => [t.id, t])), [tracks]);

  useEffect(() => {
    if (!isLiveEnabled) return;

    const salesQuery = query(collection(db, 'nftSales'), limit(25));
    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      const items: Interaction[] = [];
      snapshot.docs.forEach((docSnap, idx) => {
        const d = docSnap.data() as any;
        if (userProfile?.uid && d.sellerId && d.sellerId !== userProfile.uid && d.creatorId !== userProfile.uid) {
          return;
        }
        const rawTime = d.timestamp ? new Date(d.timestamp) : new Date();
        const username = d.buyerName || d.buyerAddress?.slice(0, 10) || 'Collector';
        items.push({
          id: `sale-${docSnap.id}`,
          type: 'collect',
          username,
          userAvatarSeed: username.slice(0, 2).toUpperCase(),
          trackTitle: d.nftTitle || d.title || 'Music NFT',
          trackId: d.trackId,
          detail: `Collected NFT for ${d.price || d.amount || 0} TON`,
          timestamp: formatRelativeTime(rawTime),
          rawTime,
          avatarBg: AVATAR_BGS[idx % AVATAR_BGS.length],
        });
      });
      setSalesActivities(items);
    }, () => setSalesActivities([]));

    const commentsQuery = query(collection(db, 'comments'), limit(25));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const items: Interaction[] = [];
      snapshot.docs.forEach((docSnap, idx) => {
        const d = docSnap.data() as any;
        if (trackIdSet.size > 0 && d.trackId && !trackIdSet.has(d.trackId)) {
          return;
        }
        const rawTime = d.timestamp ? new Date(d.timestamp) : new Date();
        const username = d.userName || d.username || 'Listener';
        const matchedTrack = d.trackId ? trackMap.get(d.trackId) : undefined;
        items.push({
          id: `cmt-${docSnap.id}`,
          type: 'comment',
          username,
          userAvatarSeed: username.slice(0, 2).toUpperCase(),
          trackTitle: matchedTrack?.title || d.trackTitle || 'Track',
          trackId: d.trackId,
          detail: d.content ? `Commented: "${d.content}"` : undefined,
          timestamp: formatRelativeTime(rawTime),
          rawTime,
          avatarBg: AVATAR_BGS[(idx + 1) % AVATAR_BGS.length],
        });
      });
      setCommentActivities(items);
    }, () => setCommentActivities([]));

    let unsubTx = () => {};
    if (userProfile?.uid) {
      const txQuery = query(
        collection(db, 'transactions'),
        where('sellerId', '==', userProfile.uid),
        limit(25)
      );
      unsubTx = onSnapshot(txQuery, (snapshot) => {
        const items: Interaction[] = snapshot.docs.map((docSnap, idx) => {
          const d = docSnap.data() as any;
          const rawTime = d.timestamp ? new Date(d.timestamp) : new Date();
          const username = d.senderName || d.buyerName || d.senderAddress?.slice(0, 10) || 'Listener';
          const matchedTrack = d.trackId ? trackMap.get(d.trackId) : undefined;
          const isTip = d.type === 'tip' || d.type === 'stream_tip';
          const isStream = d.type === 'stream';
          return {
            id: `tx-${docSnap.id}`,
            type: isTip ? 'tip' : isStream ? 'stream' : 'collect',
            username,
            userAvatarSeed: username.slice(0, 2).toUpperCase(),
            trackTitle: matchedTrack?.title || d.title || 'Release',
            trackId: d.trackId,
            detail: isTip ? `Tipped ${d.amount || 0} TON` : isStream ? undefined : `Completed ${d.type || 'purchase'} (${d.amount || 0} TON)`,
            timestamp: formatRelativeTime(rawTime),
            rawTime,
            avatarBg: AVATAR_BGS[(idx + 2) % AVATAR_BGS.length],
          };
        });
        setTxActivities(items);
      }, () => setTxActivities([]));
    }

    return () => {
      unsubSales();
      unsubComments();
      unsubTx();
    };
  }, [isLiveEnabled, userProfile?.uid, trackIdSet, trackMap]);

  const activities = useMemo(() => {
    return [...txActivities, ...salesActivities, ...commentActivities]
      .sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime())
      .map(act => ({
        ...act,
        repliedMessage: repliedMap[act.id] || act.repliedMessage,
      }))
      .slice(0, 20);
  }, [txActivities, salesActivities, commentActivities, repliedMap]);

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return activities;
    return activities.filter(act => {
      if (activeFilter === 'streams') return act.type === 'stream';
      if (activeFilter === 'likes') return act.type === 'like';
      if (activeFilter === 'engagements') return act.type === 'comment' || act.type === 'tip' || act.type === 'collect';
      return true;
    });
  }, [activities, activeFilter]);

  const handleSendReply = (actId: string) => {
    if (!replyText.trim()) return;
    setRepliedMap(prev => ({
      ...prev,
      [actId]: replyText.trim(),
    }));
    setReplyText('');
    setReplyInputId(null);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stream':
        return <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />;
      case 'like':
        return <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageSquare className="w-3 h-3 text-purple-400 fill-purple-400" />;
      case 'tip':
        return <Coins className="w-3 h-3 text-amber-500" />;
      case 'collect':
        return <Sparkles className="w-3 h-3 text-cyan-400" />;
      default:
        return <Zap className="w-3 h-3 text-blue-400" />;
    }
  };

  const getStyleTheme = (type: string) => {
    switch (type) {
      case 'stream':
        return 'border-cyan-500/10 hover:border-cyan-500/30';
      case 'like':
        return 'border-pink-500/10 hover:border-pink-500/30';
      case 'comment':
        return 'border-purple-500/10 hover:border-purple-500/30';
      case 'tip':
        return 'border-amber-500/10 hover:border-amber-500/30 bg-amber-500/[0.02]';
      case 'collect':
        return 'border-purple-600/10 hover:border-purple-600/30 bg-purple-600/[0.02]';
      default:
        return 'border-white/5 hover:border-white/20';
    }
  };

  return (
    <div className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[4px] p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 px-1.5 bg-purple-500/10 rounded-md text-purple-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-1.5">
              Live Feed
              {isLiveEnabled && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </h2>
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white">
            Listener Interactions
          </h3>
        </div>

        {/* Real-time Toggle Switch */}
        <button
          onClick={() => setIsLiveEnabled(!isLiveEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1 bg-white/5 border rounded-full transition-all cursor-pointer ${
            isLiveEnabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isLiveEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-[8px] font-black tracking-widest uppercase text-white/50">
            {isLiveEnabled ? 'Live Autoplay' : 'Feed Paused'}
          </span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-4 gap-1 bg-black/20 p-1 rounded-2xl">
        {(['all', 'streams', 'likes', 'engagements'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            className={`py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all text-center cursor-pointer border ${
              activeFilter === filter
                ? 'bg-purple-600 text-white font-black border-[#c0c0c0]/40'
                : 'text-white/40 hover:bg-white/5 hover:text-white border-[#c0c0c0]/25'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activities Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2 pr-1"
      >
        <AnimatePresence>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              <motion.div
                key={act.id}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex flex-col p-3 bg-black/30 border rounded-2xl transition-all ${getStyleTheme(act.type)}`}
              >
                <div className="flex items-start gap-3">
                  {/* Dynamic Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase tracking-wider ${act.avatarBg}`}>
                    {act.userAvatarSeed}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-tight text-white/90 truncate flex items-center gap-1">
                        {act.username}
                        <Check className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                      </span>
                      <span className="text-[8px] font-bold text-white/25 flex items-center gap-1 shrink-0 bg-white/5 px-1.5 py-0.5 rounded-md">
                        <Clock className="w-2.5 h-2.5 text-white/30" />
                        {act.timestamp}
                      </span>
                    </div>

                    {/* Interaction detail explanation */}
                    <div className="mt-0.5 text-[10px] text-white/75 leading-relaxed">
                      {act.type === 'stream' && (
                        <p className="font-medium">
                          Streamed <span className="font-extrabold text-white text-[10px]">{act.trackTitle}</span>
                        </p>
                      )}
                      {act.type === 'like' && (
                        <p className="font-medium">
                          Liked <span className="font-extrabold text-white text-[10px]">{act.trackTitle}</span>
                        </p>
                      )}
                      {act.type === 'comment' && (
                        <div className="mt-1 bg-black/40 border border-white/5 p-2 rounded-xl">
                          <p className="text-white text-[9.5px] italic leading-relaxed">{act.detail}</p>
                        </div>
                      )}
                      {act.type === 'tip' && (
                        <p className="text-amber-400/90 font-extrabold flex items-center gap-1">
                          {act.detail}
                        </p>
                      )}
                      {act.type === 'collect' && (
                        <span className="text-purple-400 font-extrabold block">
                          {act.detail}
                        </span>
                      )}
                    </div>

                    {/* Interactive Sub-Controls */}
                    <div className="mt-2.5 flex items-center gap-2">
                      {act.trackId && act.trackId !== 'default' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (act.trackId) {
                              const matchingTrack = tracks.find(t => t.id === act.trackId);
                              if (matchingTrack) playTrack(matchingTrack as any);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-cyan-400 transition-all"
                        >
                          <Volume2 className="w-2.5 h-2.5 shrink-0" />
                          Listen
                        </button>
                      )}
                      {!act.repliedMessage && replyInputId !== act.id && (
                        <button
                          onClick={() => setReplyInputId(act.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-purple-500/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-purple-400 transition-all"
                        >
                          <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                          Reply Thanks
                        </button>
                      )}
                    </div>

                    {/* Reply Message display if already replied */}
                    {act.repliedMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-2 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-start gap-1.5"
                      >
                        <CheckCircle className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                        <div className="text-[8.5px] text-white/80">
                          <span className="font-black text-purple-400 block uppercase text-[7.5px] tracking-wider mb-0.5">Your Response Sent:</span>
                          "{act.repliedMessage}"
                        </div>
                      </motion.div>
                    )}

                    {/* Reply Textbox Input */}
                    {replyInputId === act.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2.5 space-y-2 bg-black/40 p-2 rounded-xl border border-white/10"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type personal thank-you..."
                          className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-[9.5px] text-white focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReplyInputId(null);
                              setReplyText('');
                            }}
                            className="px-2 py-1 text-[8px] font-bold text-white/50 uppercase hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(act.id)}
                            className="px-2.5 py-1 bg-purple-600 text-[8px] font-black uppercase tracking-widest rounded-lg text-white hover:bg-purple-500 flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            Send
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <Radio className="w-5 h-5 text-white/10 mx-auto mb-2.5" />
              <p className="text-[8.5px] font-bold text-white/30 uppercase tracking-widest">Quiet in the stream feed...</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
