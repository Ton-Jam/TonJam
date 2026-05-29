import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Heart, 
  Play, 
  MessageSquare, 
  Coins, 
  Sparkles, 
  UserPlus,
  Send,
  Zap,
  Check,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
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
  timestamp: string; // "Just now", "2m ago", "12m ago", etc.
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

const USERNAME_POOL = [
  'ton_wizard', 'soundwave_01', 'cryptosonic', 'krupy_grooves', 
  'sol_rebel', 'jammin_ton', 'beats_by_ton', 'dubstep_ninja',
  'cyber_bard', '0x_vibe', 'harmonic_whale', 'neon_dancer',
  'bass_lord', 'melodic_phoenix', 'lofi_duck', 'synth_cat'
];

const COMMENT_POOL = [
  'These drums hit hard! 🔥',
  'This is going playing on repeat all weekend.',
  'Insane production quality here.',
  'Can we get a VIP remix of this??',
  'Absolute masterpiece. TONJAM is the future!',
  'Brings back retro gaming vibes 🎮',
  'Who wrote this chord progression? Super slick.',
  'Beautiful atmospheric arrangement.'
];

export default function ListenerActivityFeed({ tracks }: ListenerActivityFeedProps) {
  const { playTrack, currentTrack, isPlaying, addNotification } = useAudio();
  const [activeFilter, setActiveFilter] = useState<'all' | 'streams' | 'likes' | 'engagements'>('all');
  const [isLiveEnabled, setIsLiveEnabled] = useState<boolean>(true);
  const [activities, setActivities] = useState<Interaction[]>(() => {
    // Initial dummy data matching artist activities
    const now = new Date();
    return [
      {
        id: 'act-1',
        type: 'tip',
        username: 'ton_wizard',
        userAvatarSeed: 'TW',
        trackTitle: tracks[0]?.title || 'Cosmic Journey',
        trackId: tracks[0]?.id,
        detail: 'Tipped 10 TON to support the release! 💎',
        timestamp: '3m ago',
        rawTime: new Date(now.getTime() - 3 * 60 * 1000),
        avatarBg: AVATAR_BGS[0],
      },
      {
        id: 'act-2',
        type: 'comment',
        username: 'neon_dancer',
        userAvatarSeed: 'ND',
        trackTitle: tracks[1]?.title || 'Sunset Boulevard',
        trackId: tracks[1]?.id,
        detail: 'Commented: "These drums hit hard! 🔥"',
        timestamp: '7m ago',
        rawTime: new Date(now.getTime() - 7 * 60 * 1000),
        avatarBg: AVATAR_BGS[1],
      },
      {
        id: 'act-3',
        type: 'stream',
        username: 'lofi_duck',
        userAvatarSeed: 'LD',
        trackTitle: tracks[0]?.title || 'Cosmic Journey',
        trackId: tracks[0]?.id,
        timestamp: '12m ago',
        rawTime: new Date(now.getTime() - 12 * 60 * 1000),
        avatarBg: AVATAR_BGS[4],
      },
      {
        id: 'act-4',
        type: 'like',
        username: 'synth_cat',
        userAvatarSeed: 'SC',
        trackTitle: tracks[2]?.title || 'Analog Dreams',
        trackId: tracks[2]?.id,
        timestamp: '22m ago',
        rawTime: new Date(now.getTime() - 22 * 60 * 1000),
        avatarBg: AVATAR_BGS[3],
      },
      {
        id: 'act-5',
        type: 'collect',
        username: '0x_vibe',
        userAvatarSeed: 'XV',
        trackTitle: tracks[0]?.title || 'Cosmic Journey',
        trackId: tracks[0]?.id,
        detail: 'Collected Edition #12/100 NFT!',
        timestamp: '1h ago',
        rawTime: new Date(now.getTime() - 60 * 60 * 1000),
        avatarBg: AVATAR_BGS[2],
      }
    ];
  });

  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Periodically generate simulated activity if Live Feed is active
  useEffect(() => {
    if (!isLiveEnabled) return;

    const interval = setInterval(() => {
      // Pick a random track or default
      const trackObj = tracks.length > 0
        ? tracks[Math.floor(Math.random() * tracks.length)]
        : { id: 'default', title: 'Sonic Dimension' };

      // Probability of event type: 40% stream, 30% like, 15% comment, 10% tip, 5% collect
      const rand = Math.random();
      let type: 'stream' | 'like' | 'comment' | 'tip' | 'collect' = 'stream';
      let detail = '';

      if (rand < 0.4) {
        type = 'stream';
      } else if (rand < 0.7) {
        type = 'like';
      } else if (rand < 0.85) {
        type = 'comment';
        detail = `Commented: "${COMMENT_POOL[Math.floor(Math.random() * COMMENT_POOL.length)]}"`;
      } else if (rand < 0.95) {
        type = 'tip';
        const amount = Math.floor(Math.random() * 8) + 3;
        detail = `Tipped ${amount} TON to support the release! 💎`;
      } else {
        type = 'collect';
        const ed = Math.floor(Math.random() * 50) + 1;
        detail = `Collected Edition #${ed}/100 NFT!`;
      }

      const rawUsername = USERNAME_POOL[Math.floor(Math.random() * USERNAME_POOL.length)];
      const userInitials = rawUsername.split('_').map(n => n[0].toUpperCase()).join('').substring(0, 2);

      const newActivity: Interaction = {
        id: `act-${Date.now()}`,
        type,
        username: rawUsername,
        userAvatarSeed: userInitials,
        trackTitle: trackObj.title,
        trackId: trackObj.id,
        detail: detail || undefined,
        timestamp: 'Just now',
        rawTime: new Date(),
        avatarBg: AVATAR_BGS[Math.floor(Math.random() * AVATAR_BGS.length)]
      };

      // Add fresh activity to state and shift lists
      setActivities(prev => [newActivity, ...prev].slice(0, 15));

      // Notification hook
      if (type === 'tip' || type === 'collect' || type === 'comment') {
        if (addNotification) {
          addNotification(`${rawUsername} ${type === 'tip' ? 'tipped TON!' : type === 'collect' ? 'collected an NFT!' : 'commented on your track'}`, 'success');
        }
      }
    }, 12000); // add new state item every 12s

    return () => clearInterval(interval);
  }, [isLiveEnabled, tracks, addNotification]);

  // Handle active relative time computation
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setActivities(prev => prev.map(act => {
        const diffMs = Date.now() - act.rawTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) {
          return { ...act, timestamp: 'Just now' };
        } else if (diffMins < 60) {
          return { ...act, timestamp: `${diffMins}m ago` };
        } else {
          return { ...act, timestamp: `${Math.floor(diffMins / 60)}h ago` };
        }
      }));
    }, 10000);

    return () => clearInterval(timeInterval);
  }, []);

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
    setActivities(prev => prev.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          repliedMessage: replyText
        };
      }
      return act;
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
            className={`py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all text-center cursor-pointer ${
              activeFilter === filter
                ? 'bg-purple-600 text-white font-black'
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activities Container */}
      <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: -15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
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
      </div>
    </div>
  );
}
