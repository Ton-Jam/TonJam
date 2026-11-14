import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Hand,
  Volume2,
  VolumeX,
  Headphones,
  Clock,
  Timer,
  Share2,
  LogOut,
  MessageSquare,
  Send,
  Coins,
  Flame,
  Sparkles,
  Heart,
  Users,
  Radio,
  Music,
  Play,
  Pause,
  ChevronLeft,
  Pin,
  ExternalLink,
  Zap,
  Copy,
  MoreHorizontal,
  ShieldCheck,
  Award,
  RadioTower,
  SlidersHorizontal,
  Check,
  Search,
  Plus,
  RefreshCw,
  X,
  Signal,
  Crown,
  UserPlus,
  Activity,
  Wifi,
  WifiOff,
  UserCheck,
  AlertTriangle,
  ThumbsUp,
  ChevronUp,
  TrendingUp,
  ListMusic,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import LivestreamChat from '@/components/LivestreamChat';
import { getPlaceholderImage } from '@/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc, increment } from 'firebase/firestore';
import { sendStreamChatMessage, submitStreamSongRequest } from '@/services/livestreamService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { sendTransactionSafe, validateTonAddress, extractTxHashFromBoc } from '@/services/tonService';
import { toNano } from '@ton/ton';

// Floating Reaction Emoji interface
interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

// Room Speaker interface
interface RoomSpeaker {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'Host' | 'Co-Host' | 'Speaker' | 'Artist';
  walletAddress?: string;
  isMuted: boolean;
  isSpeaking: boolean;
  handRaised?: boolean;
  gramsEarned?: number;
}

// Room Listener interface
interface RoomListener {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVip?: boolean;
  handRaised?: boolean;
}

// Space Room Data
interface SpaceRoomData {
  id: string;
  title: string;
  description: string;
  category: string;
  isLive: boolean;
  startedAt: string;
  listenerCount: number;
  host: RoomSpeaker;
  speakers: RoomSpeaker[];
  listeners: RoomListener[];
  pinnedTrack?: {
    id: string;
    title: string;
    artist: string;
    cover: string;
    price: string;
  };
}

// Queue Track interface
interface QueueTrack {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  upvotes: number;
  upvotedBy: string[];
  submittedBy: string;
  isPlaying?: boolean;
  genre?: string;
}

const STATIC_SPEAKING_BARS = [45, 80, 55, 90, 65, 75];

export const SpaceRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const { addNotification, isPlaying, togglePlay } = useAudio();

  const [roomData, setRoomData] = useState<SpaceRoomData | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState<boolean>(true);

  // Audio Controls & Room States
  const [isJoined, setIsJoined] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRoomAudioMuted, setIsRoomAudioMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'stage' | 'chat' | 'listeners'>('stage');
  const [searchListener, setSearchListener] = useState('');

  // Participant Overlay / Side Panel States
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState<'all' | 'speakers' | 'vip'>('all');

  // Live Session Duration Timer State (derived from startedAt when live)
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Real-time Track Queue & Upvoting State
  const [queueTracks, setQueueTracks] = useState<QueueTrack[]>([]);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Afrobeats');

  // Tipping Modal State
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTipSpeaker, setSelectedTipSpeaker] = useState<RoomSpeaker | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState('5');
  const [isSendingTip, setIsSendingTip] = useState(false);

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [reactionCombo, setReactionCombo] = useState<{ emoji: string; count: number } | null>(null);

  // Bottom Navigation Bar Hide on Scroll Down State
  const [isBottomBarHidden, setIsBottomBarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Subscribe to Firestore liveStreams/{id}
  useEffect(() => {
    if (!id) {
      setRoomData(null);
      setIsRoomLoading(false);
      return;
    }

    setIsRoomLoading(true);
    const roomRef = doc(db, 'liveStreams', id);
    const unsubscribe = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) {
          setRoomData(null);
          setIsRoomLoading(false);
          return;
        }
        const raw = snap.data() as any;
        const startedAtIso =
          typeof raw.startedAt === 'string'
            ? raw.startedAt
            : raw.createdAt?.toDate
              ? raw.createdAt.toDate().toISOString()
              : new Date().toISOString();

        const hostObj: RoomSpeaker = raw.host && typeof raw.host === 'object'
          ? {
              id: raw.host.id || raw.ownerId || raw.artistId || 'host',
              name: raw.host.name || raw.artistName || 'Host',
              handle: (raw.host.handle || raw.host.username || raw.artistHandle || 'host').replace(/^@/, ''),
              avatar: raw.host.avatar || raw.artistAvatar || getPlaceholderImage(raw.host.name || 'host'),
              role: 'Host',
              walletAddress: raw.host.walletAddress || raw.artistAddress || '',
              isMuted: Boolean(raw.host.isMuted),
              isSpeaking: Boolean(raw.host.isSpeaking ?? true),
              gramsEarned: raw.host.gramsEarned || 0,
            }
          : {
              id: raw.artistId || raw.ownerId || 'host',
              name: raw.artistName || 'Host',
              handle: (raw.artistHandle || 'host').replace(/^@/, ''),
              avatar: raw.artistAvatar || getPlaceholderImage(raw.artistName || 'host'),
              role: 'Host',
              walletAddress: raw.artistAddress || '',
              isMuted: false,
              isSpeaking: raw.status === 'live' || raw.isLive === true,
              gramsEarned: 0,
            };

        const parsedSpeakers: RoomSpeaker[] = Array.isArray(raw.speakers)
          ? raw.speakers
              .map((sp: any, idx: number) =>
                typeof sp === 'string'
                  ? {
                      id: `sp-${idx}`,
                      name: sp,
                      handle: sp.toLowerCase().replace(/\s+/g, '_'),
                      avatar: getPlaceholderImage(sp),
                      role: 'Speaker' as const,
                      isMuted: false,
                      isSpeaking: false,
                    }
                  : {
                      id: sp.id || `sp-${idx}`,
                      name: sp.name || 'Speaker',
                      handle: (sp.handle || sp.username || 'speaker').replace(/^@/, ''),
                      avatar: sp.avatar || getPlaceholderImage(sp.name || 'speaker'),
                      role: (sp.role || 'Speaker') as RoomSpeaker['role'],
                      walletAddress: sp.walletAddress || '',
                      isMuted: Boolean(sp.isMuted),
                      isSpeaking: Boolean(sp.isSpeaking),
                      gramsEarned: sp.gramsEarned || 0,
                    }
              )
              .filter((sp: RoomSpeaker) => sp.id !== hostObj.id && sp.name !== hostObj.name)
          : [];

        const parsedListeners: RoomListener[] = Array.isArray(raw.listeners)
          ? raw.listeners.map((l: any, idx: number) => ({
              id: l.id || `l-${idx}`,
              name: l.name || 'Listener',
              handle: (l.handle || l.username || 'listener').replace(/^@/, ''),
              avatar: l.avatar || getPlaceholderImage(l.name || 'listener'),
              isVip: Boolean(l.isVip),
              handRaised: Boolean(l.handRaised),
            }))
          : [];

        setRoomData({
          id: snap.id,
          title: raw.title || raw.name || 'Live Audio Space',
          description: raw.description || '',
          category: raw.category || 'Live Space',
          isLive: raw.isLive ?? raw.status === 'live',
          startedAt: startedAtIso,
          listenerCount: raw.viewersCount ?? raw.viewerCount ?? raw.listenerCount ?? 0,
          host: hostObj,
          speakers: parsedSpeakers,
          listeners: parsedListeners,
          pinnedTrack: raw.pinnedTrack,
        });
        setIsRoomLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `liveStreams/${id}`);
        setIsRoomLoading(false);
      }
    );

    const reqQuery = query(
      collection(db, `liveStreams/${id}/songRequests`),
      orderBy('createdAt', 'desc')
    );
    const unsubQueue = onSnapshot(
      reqQuery,
      (snap) => {
        const tracksFromDb: QueueTrack[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.songTitle || data.title || 'Untitled Track',
            artist: data.artistName || data.artist || 'Unknown Artist',
            cover: data.cover || getPlaceholderImage(data.songTitle || 'track'),
            duration: data.duration || '—',
            upvotes: data.upvotes || (data.tipAmount ? Number(data.tipAmount) : 1),
            upvotedBy: Array.isArray(data.upvotedBy) ? data.upvotedBy : [],
            submittedBy: data.requesterName || data.submittedBy || 'member',
            isPlaying: data.status === 'playing',
            genre: data.genre || 'Live Request',
          };
        });
        setQueueTracks(tracksFromDb);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `liveStreams/${id}/songRequests`);
      }
    );

    return () => {
      unsubscribe();
      unsubQueue();
    };
  }, [id]);

  // Compute elapsed duration from room startedAt
  useEffect(() => {
    if (!roomData?.isLive) {
      setSessionSeconds(0);
      return;
    }
    const updateElapsed = () => {
      const startMs = Date.parse(roomData.startedAt);
      const elapsed = Number.isNaN(startMs) ? 0 : Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setSessionSeconds(elapsed);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [roomData?.isLive, roomData?.startedAt]);

  const formatSessionDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Real-time Track Upvote
  const handleToggleUpvote = (trackId: string) => {
    const currentUserHandle = userProfile?.username || userProfile?.name || auth.currentUser?.uid || '';
    if (!currentUserHandle) {
      toast.error('Please sign in to upvote tracks.');
      return;
    }

    setQueueTracks(prevTracks => {
      const updated = prevTracks.map(track => {
        if (track.id !== trackId) return track;

        const hasUpvoted = track.upvotedBy.includes(currentUserHandle);
        const newUpvotedBy = hasUpvoted
          ? track.upvotedBy.filter(h => h !== currentUserHandle)
          : [...track.upvotedBy, currentUserHandle];
        const newUpvotes = hasUpvoted ? Math.max(0, track.upvotes - 1) : track.upvotes + 1;

        if (!hasUpvoted) {
          toast.success(`Upvoted "${track.title}"`);
        } else {
          toast.info(`Removed upvote for "${track.title}".`);
        }

        return {
          ...track,
          upvotes: newUpvotes,
          upvotedBy: newUpvotedBy
        };
      });

      const playing = updated.filter(t => t.isPlaying);
      const upcoming = updated.filter(t => !t.isPlaying).sort((a, b) => b.upvotes - a.upvotes);

      return [...playing, ...upcoming];
    });
  };

  // Handle Submit New Track to Queue
  const handleAddTrackToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!auth.currentUser) {
      toast.error('Please sign in to submit a track.');
      return;
    }
    if (!newTrackTitle.trim() || !newTrackArtist.trim()) {
      toast.error('Please enter both track title and artist.');
      return;
    }

    try {
      await submitStreamSongRequest(id, {
        streamId: id,
        requesterId: auth.currentUser.uid,
        requesterName: userProfile?.name || userProfile?.username || 'Member',
        requesterAvatar: userProfile?.avatar || getPlaceholderImage(userProfile?.name || 'member'),
        requesterTier: 'Listener',
        songTitle: newTrackTitle.trim(),
        artistName: newTrackArtist.trim(),
        isVipPriority: false,
      });

      toast.success(`Submitted "${newTrackTitle.trim()}" to the live session queue!`);
      setNewTrackTitle('');
      setNewTrackArtist('');
      setShowAddTrackModal(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit track request');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsBottomBarHidden(true);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 20) {
        setIsBottomBarHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handlers
  const handleJoinRoom = async () => {
    if (!roomData) return;
    if (isJoined) {
      toast.info('You are already connected to this live music session!');
      return;
    }

    const userName = userProfile?.name || 'Member';
    const userHandle = userProfile?.username || 'member';
    const userAvatar = userProfile?.avatar || getPlaceholderImage(userName);

    setIsJoined(true);
    setRoomData(prev =>
      prev
        ? {
            ...prev,
            listenerCount: prev.listenerCount + 1,
            listeners: [
              {
                id: userProfile?.uid || auth.currentUser?.uid || `l-${Date.now()}`,
                name: userName,
                handle: userHandle,
                avatar: userAvatar,
                isVip: false,
              },
              ...prev.listeners,
            ],
          }
        : null
    );

    if (auth.currentUser && id) {
      try {
        await updateDoc(doc(db, 'liveStreams', id), {
          viewersCount: increment(1),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `liveStreams/${id}`);
      }
    }

    toast.success(`Connected to Live Session: ${roomData.title}`);
  };

  const handleToggleMic = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    toast(nextState ? 'Microphone Muted' : 'Microphone Active', {
      description: nextState ? 'Your microphone input is now muted.' : 'Microphone is active live on stage!'
    });
  };

  const handleToggleDeafen = () => {
    const nextState = !isRoomAudioMuted;
    setIsRoomAudioMuted(nextState);
    toast(nextState ? 'Audio Deafened' : 'Audio Active', {
      description: nextState ? 'Room audio output is deafened.' : 'Listening to live stage audio stream.'
    });
  };

  const handleToggleHandRaise = async () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    const userName = userProfile?.name || 'Member';
    const userAvatar = userProfile?.avatar || getPlaceholderImage(userName);
    if (nextState) {
      addNotification('Hand raised. Host will receive your speaker request.', 'info');
      if (auth.currentUser && id) {
        await sendStreamChatMessage(id, {
          streamId: id,
          userId: auth.currentUser.uid,
          userName,
          userAvatar,
          text: `${userName} raised hand to request stage speaking access.`,
          type: 'system',
        });
      }
    } else {
      addNotification('Hand lowered.', 'info');
    }
  };

  const handleSendEmojiReaction = (emoji: string, burstCount = 1) => {
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        const newReaction: FloatingReaction = {
          id: `react-${Date.now()}-${i}`,
          emoji,
          x: 20 + ((Date.now() + i * 17) % 60),
        };

        setFloatingReactions(prev => [...prev.slice(-25), newReaction]);

        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 2800);
      }, i * 90);
    }

    setReactionCombo(prev => {
      if (prev && prev.emoji === emoji) {
        return { emoji, count: prev.count + burstCount };
      }
      return { emoji, count: burstCount };
    });
  };

  const handleOpenTipModal = (speaker: RoomSpeaker) => {
    setSelectedTipSpeaker(speaker);
    setShowTipModal(true);
  };

  const handleConfirmTip = async () => {
    if (!selectedTipSpeaker || !roomData) return;
    const amount = parseFloat(customTipAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive tip amount.');
      return;
    }

    const recipientAddress = selectedTipSpeaker.walletAddress || roomData.host.walletAddress || '';
    if (!recipientAddress || !validateTonAddress(recipientAddress)) {
      toast.error('Speaker has not configured a valid TON payout wallet.');
      return;
    }

    setIsSendingTip(true);
    try {
      const txResult = await sendTransactionSafe(tonConnectUI, {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: recipientAddress,
            amount: toNano(amount.toString()).toString(),
          },
        ],
      });

      const txHash = extractTxHashFromBoc(txResult?.boc);
      const userName = userProfile?.name || 'Supporter';
      const userAvatar = userProfile?.avatar || getPlaceholderImage(userName);

      if (auth.currentUser) {
        const txId = `tip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await setDoc(doc(db, 'transactions', txId), {
          id: txId,
          userId: auth.currentUser.uid,
          participants: [auth.currentUser.uid, selectedTipSpeaker.id].filter(Boolean),
          type: 'tip',
          amount,
          currency: 'TON',
          platformFee: 0,
          artistShare: amount,
          recipientAddress,
          trackTitle: `Space Tip: ${selectedTipSpeaker.name}`,
          txHash,
          status: 'pending',
          timestamp: new Date().toISOString(),
        });

        await sendStreamChatMessage(roomData.id, {
          streamId: roomData.id,
          userId: auth.currentUser.uid,
          userName,
          userAvatar,
          text: `Sent ${amount} TON tip to ${selectedTipSpeaker.name}`,
          type: 'tip',
          tipAmount: amount,
          tipCurrency: 'TON',
        });
      }

      addNotification(`Tip submitted: ${amount} TON to ${selectedTipSpeaker.name}`, 'success');
      setShowTipModal(false);
    } catch (error: any) {
      toast.error(error?.message || 'Tip transaction could not be completed.');
    } finally {
      setIsSendingTip(false);
    }
  };

  const handlePlaySoundboardEffect = (effectName: string) => {
    addNotification(`Played sound effect: ${effectName}`, 'info');
    handleSendEmojiReaction('🔊');
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  const handleLeaveClick = () => {
    setShowLeaveConfirmModal(true);
  };

  const confirmLeaveRoom = () => {
    setShowLeaveConfirmModal(false);
    addNotification('Left Space Room.', 'info');
    navigate('/jamspace');
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Space Room link copied to clipboard!');
  };

  if (isRoomLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e2e] text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Space Room...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-[#0a0e2e] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#090F2E] rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
            <Radio className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight">Space Room Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This live audio space does not exist or has already ended.
          </p>
          <button
            onClick={() => navigate('/jamspace')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Back to JamSpace
          </button>
        </div>
      </div>
    );
  }

  const allSpeakers = [roomData.host, ...roomData.speakers];
  const filteredListeners = roomData.listeners.filter(
    l => l.name.toLowerCase().includes(searchListener.toLowerCase()) || l.handle.toLowerCase().includes(searchListener.toLowerCase())
  );

  const allParticipantsList = [
    ...allSpeakers.map((sp) => ({
      id: sp.id,
      name: sp.name,
      handle: sp.handle,
      avatar: sp.avatar,
      role: sp.role,
      walletAddress: sp.walletAddress,
      isSpeaker: true,
      isHost: sp.role === 'Host',
      isMuted: sp.isMuted,
      isSpeaking: sp.isSpeaking,
      isVip: true,
      status: 'On Stage',
    })),
    ...roomData.listeners.map((l) => ({
      id: l.id,
      name: l.name,
      handle: l.handle,
      avatar: l.avatar,
      role: l.isVip ? 'VIP Listener' : 'Audience',
      walletAddress: '',
      isSpeaker: false,
      isHost: false,
      isMuted: true,
      isSpeaking: false,
      isVip: l.isVip || false,
      status: 'Listening',
    })),
  ];

  const filteredParticipantsList = allParticipantsList.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(participantSearch.toLowerCase()) || p.handle.toLowerCase().includes(participantSearch.toLowerCase());
    if (participantFilter === 'speakers') return matchesQuery && p.isSpeaker;
    if (participantFilter === 'vip') return matchesQuery && p.isVip;
    return matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0a0e2e] text-white flex flex-col justify-between font-sans relative overflow-x-hidden select-none pb-28">
      {/* Background Ambient Aura Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Reactions Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((react) => (
            <motion.div
              key={react.id}
              initial={{ opacity: 1, y: '85vh', scale: 0.6, x: `${react.x}vw` }}
              animate={{ opacity: 0, y: '20vh', scale: 1.8, rotate: [0, 15, -15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-4xl sm:text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            >
              {react.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOP ROOM BAR HEADER */}
      <div className="sticky top-0 z-40 bg-[#0a0e2e]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleLeaveClick}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Back to JamSpace"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                LIVE AUDIO SPACE
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {roomData.category}
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {roomData.listenerCount.toLocaleString()} listening
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] font-bold text-amber-400 font-mono flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shadow-sm" title="Live Session Duration">
                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{formatSessionDuration(sessionSeconds)}</span>
              </span>
            </div>

            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-white truncate max-w-xl">
              {roomData.title}
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isJoined ? (
            <button
              onClick={handleJoinRoom}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Join Room</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Connected Live
              </span>
            </div>
          )}

          <button
            onClick={() => setShowParticipantsPanel(true)}
            className="p-2.5 sm:px-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/5 hover:border-emerald-500/30"
            title="View Live Participants & Connection Status"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Participants</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black font-mono">
              {allParticipantsList.length}
            </span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            title="Share Room"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleLeaveClick}
            className="px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* MAIN SPACE ROOM CONTENT */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* LEFT COLUMN: MAIN AUDIO STAGE & AUDIENCE (Col 8) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          
          {/* Mobile Tab Toggle (Stage / Chat / Audience) */}
          <div className="flex lg:hidden bg-slate-900/80 p-1 rounded-xl border border-white/5">
            {[
              { key: 'stage', label: 'Audio Stage', icon: Radio },
              { key: 'chat', label: 'Live Chat', icon: MessageSquare },
              { key: 'listeners', label: `Audience (${roomData.listenerCount})`, icon: Users }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                aria-pressed={activeTab === tab.key}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all border ${
                  activeTab === tab.key ? 'bg-blue-600 text-white shadow-lg border-[#c0c0c0]/40' : 'text-slate-400 hover:text-white border-[#c0c0c0]/25'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* MAIN STAGE VIEW */}
          {(activeTab === 'stage' || typeof window !== 'undefined') && (
            <div className={`space-y-6 ${activeTab !== 'stage' ? 'hidden lg:block' : ''}`}>
              
              {/* STAGE CONTAINER HEADER */}
              <div className="bg-[#090F2E] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-2xl">
                {/* Stage Glow Background */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Join Room Banner Callout if not joined */}
                {!isJoined && (
                  <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                        <Radio className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                          Connect to Live Audio Feed
                        </h3>
                        <p className="text-xs text-slate-300">
                          Join {roomData.listenerCount.toLocaleString()} fans in this room to speak, tip creators, and react in real time.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleJoinRoom}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                      <span>Join Room Now</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <RadioTower className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Live Speakers Stage
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 flex items-center gap-1.5" title="Live Session Duration">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Elapsed: {formatSessionDuration(sessionSeconds)}</span>
                    </span>

                    <button
                      onClick={handleToggleDeafen}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                      title={isRoomAudioMuted ? "Undeafen Audio Output" : "Deafen Audio Output"}
                    >
                      {isRoomAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      <span>{isRoomAudioMuted ? 'Deafened' : 'Audio Live'}</span>
                    </button>
                  </div>
                </div>

                {/* HOST & SPEAKERS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {allSpeakers.map((sp) => {
                    const isHost = sp.role === 'Host';
                    return (
                      <motion.div
                        key={sp.id}
                        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3 transition-all border ${
                          sp.isSpeaking
                            ? 'bg-blue-600/20 border-blue-500/60 shadow-[0_0_25px_rgba(37,99,235,0.3)]'
                            : 'bg-white/[0.03] border-white/5 hover:border-white/15'
                        }`}
                        whileHover={{ y: -2 }}
                      >
                        {/* Speaker Avatar & Audio Aura Ring */}
                        <div className="relative">
                          {/* Animated Audio Frequency Aura when speaking */}
                          {sp.isSpeaking && (
                            <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
                          )}

                          <img
                            src={sp.avatar}
                            alt={sp.name}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 relative z-10 shadow-lg ${
                              sp.isSpeaking ? 'border-blue-400' : 'border-white/20'
                            }`}
                          />

                          {/* Mic Indicator Badge */}
                          <div className={`absolute bottom-0 right-0 z-20 p-1.5 rounded-full border border-black/40 text-white ${
                            sp.isMuted ? 'bg-red-500' : 'bg-emerald-500'
                          }`}>
                            {sp.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                          </div>

                          {/* Role Tag */}
                          <div className={`absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-md ${
                            isHost ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-blue-600'
                          }`}>
                            {sp.role}
                          </div>
                        </div>

                        {/* Speaker Details */}
                        <div className="space-y-0.5 w-full">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate px-1">
                            {sp.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 truncate font-mono">
                            @{sp.handle}
                          </p>
                        </div>

                        {/* Speaking Wave Visualizer Bar */}
                        {sp.isSpeaking && (
                          <div className="flex items-end justify-center gap-1 h-3 pt-1">
                            {STATIC_SPEAKING_BARS.map((lvl, i) => (
                              <div
                                key={i}
                                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                                style={{ height: `${lvl}%` }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Quick Tip Action Button */}
                        <button
                          onClick={() => handleOpenTipModal(sp)}
                          className="mt-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Coins className="w-3 h-3" />
                          <span>Tip</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* PINNED MUSIC TRACK / NFT DISCUSSIONS WIDGET */}
                {roomData.pinnedTrack && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group shrink-0">
                        <img
                          src={roomData.pinnedTrack.cover}
                          alt={roomData.pinnedTrack.title}
                          className="w-14 h-14 rounded-lg object-cover shadow-md"
                        />
                        <button
                          onClick={() => togglePlay()}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition-opacity cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                          <Pin className="w-3 h-3" />
                          <span>Pinned Track Discussion</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {roomData.pinnedTrack.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400">
                          {roomData.pinnedTrack.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">NFT Price</p>
                        <p className="text-sm font-black text-emerald-400">{roomData.pinnedTrack.price}</p>
                      </div>

                      <Link
                        to={`/nft/${roomData.pinnedTrack.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                      >
                        <span>Collect</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* REAL-TIME SESSION TRACK QUEUE & UPVOTE SYSTEM */}
                <div className="bg-[#080d28]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
                  {/* Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                        <ListMusic className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                            Live Session Playlist Queue
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Upvotes
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Upvote tracks to influence the live room queue. Top voted tracks play next!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddTrackModal(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 shrink-0 hover:scale-105 active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit Track</span>
                    </button>
                  </div>

                  {/* Queue List Grid */}
                  <div className="space-y-2.5 pt-1">
                    {queueTracks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No tracks queued yet. Submit a track for the session!
                      </div>
                    ) : (
                      queueTracks.map((track, idx) => {
                      const currentUserHandle = userProfile?.username || userProfile?.name || auth.currentUser?.uid || '';
                      const hasUpvoted = Boolean(currentUserHandle) && track.upvotedBy.includes(currentUserHandle);

                      return (
                        <motion.div
                          key={track.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className={`p-3.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            track.isPlaying
                              ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-lg shadow-amber-500/5'
                              : 'bg-white/5 hover:bg-white/[0.08] border border-white/5'
                          }`}
                        >
                          {/* Left: Track Info & Rank */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank / Playing Indicator Badge */}
                            <div className="shrink-0 text-center w-8">
                              {track.isPlaying ? (
                                <div className="flex items-center justify-center text-amber-400" title="Currently Playing">
                                  <Music className="w-4.5 h-4.5 animate-bounce" />
                                </div>
                              ) : (
                                <span className="text-xs font-mono font-bold text-slate-400">
                                  #{idx}
                                </span>
                              )}
                            </div>

                            {/* Artwork Cover */}
                            <div className="relative group shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                              <img
                                src={track.cover}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => togglePlay()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              >
                                {track.isPlaying && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>
                            </div>

                            {/* Title & Artist & Submitter */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                                  {track.title}
                                </h4>
                                {track.genre && (
                                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                    {track.genre}
                                  </span>
                                )}
                                {track.isPlaying && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                    NOW LIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 truncate">
                                {track.artist}
                              </p>
                              <p className="text-[9px] text-slate-500 font-mono truncate">
                                Submitted by <span className="text-slate-300 font-bold">@{track.submittedBy}</span> • {track.duration}
                              </p>
                            </div>
                          </div>

                          {/* Right: Upvote Button & Vote Count */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            {track.isPlaying ? (
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>On Stage Now</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleUpvote(track.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border shadow-md active:scale-95 ${
                                  hasUpvoted
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-105'
                                    : 'bg-white/5 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-400'
                                }`}
                                title={hasUpvoted ? 'Click to remove upvote' : 'Click to upvote track'}
                              >
                                <ChevronUp className={`w-4 h-4 transition-transform ${hasUpvoted ? 'stroke-[3] text-slate-950' : 'text-amber-400'}`} />
                                <span className="font-mono text-sm">{track.upvotes}</span>
                                <span className="text-[10px] uppercase tracking-wider font-sans">
                                  {hasUpvoted ? 'Upvoted' : 'Upvote'}
                                </span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                    )}
                  </div>
                </div>
              </div>

              {/* AUDIENCE LISTENERS GRID SECTION */}
              <div className="bg-[#090F2E]/60 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Audience ({roomData.listenerCount.toLocaleString()})
                    </h3>
                  </div>

                  <div className="relative w-48 hidden sm:block">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Find listener..."
                      value={searchListener}
                      onChange={(e) => setSearchListener(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {filteredListeners.map((listener) => (
                    <div
                      key={listener.id}
                      className="bg-white/[0.02] hover:bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center space-y-2 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={listener.avatar}
                          alt={listener.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        {listener.isVip && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full" title="GRAM VIP">
                            <Sparkles className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <p className="text-[11px] font-bold text-white truncate">{listener.name}</p>
                        <p className="text-[9px] text-slate-500 truncate font-mono">@{listener.handle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE CHAT & ROOM SOUNDBOARD (Col 4) */}
        <div className={`lg:col-span-4 space-y-6 flex flex-col justify-between ${
          activeTab === 'chat' || activeTab === 'listeners' ? 'block' : 'hidden lg:block'
        }`}>
          
          {/* REAL-TIME LIVESTREAM CHAT */}
          <div className="h-[520px] rounded-2xl overflow-hidden shadow-2xl">
            <LivestreamChat
              roomId={roomData.id}
              roomTitle={roomData.title}
              hostName={roomData.host.name}
              hostId={roomData.host.id}
              currentUser={{
                uid: userProfile?.uid,
                name: userProfile?.name,
                username: userProfile?.username,
                avatar: userProfile?.avatar,
                isArtist: userProfile?.role === 'artist' || userProfile?.uid === roomData.host.id,
                isVip: true
              }}
              onOpenTipModal={(amount) => {
                if (amount) setCustomTipAmount(amount.toString());
                setShowTipModal(true);
              }}
              onOpenNFTDropModal={() => {
                toast.info('NFT Drop Launchpad opened for this live session');
              }}
            />
          </div>

          {/* QUICK SOUNDBOARD / DJ EFFECTS */}
          <div className="bg-[#090F2E]/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                Studio Soundboard FX
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Airhorn', emoji: '📢' },
                { name: 'Vinyl Scratch', emoji: '🎛️' },
                { name: 'Crowd Cheer', emoji: '🎉' },
                { name: 'Bass Drop', emoji: '🔊' }
              ].map((fx) => (
                <button
                  key={fx.name}
                  onClick={() => handlePlaySoundboardEffect(fx.name)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <span className="text-base">{fx.emoji}</span>
                  <span>{fx.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FLOATING AUDIO CONTROLS BAR (STATION CONTROLLER) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-[#060B26]/90 backdrop-blur-2xl border-t border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 ${isBottomBarHidden ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        
        {/* Left: User Mic State Toggle, Deafen Toggle & Raise Hand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mic Input Toggle Button */}
          <button
            onClick={handleToggleMic}
            className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isMuted
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 animate-pulse'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Mute Mic' : 'Mic Active'}</span>
          </button>

          {/* Deafen / Audio Output Toggle Button */}
          <button
            onClick={handleToggleDeafen}
            className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg border ${
              isRoomAudioMuted
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={isRoomAudioMuted ? 'Undeafen Audio Output' : 'Deafen Audio Output'}
          >
            {isRoomAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Headphones className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isRoomAudioMuted ? 'Deafened' : 'Deafen'}</span>
          </button>

          {/* Raise Hand Button */}
          <button
            onClick={handleToggleHandRaise}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
              isHandRaised
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand to Speak'}
          >
            <Hand className="w-4 h-4" />
            <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
        </div>

        {/* Center: Live Floating Reaction Buttons & Reaction Menu Trigger */}
        <div className="relative flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          {['🔥', '🎵', '💎', '🚀', '👏', '❤️'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendEmojiReaction(emoji)}
              className="w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/10 rounded-xl text-lg sm:text-xl flex items-center justify-center transition-all cursor-pointer active:scale-125"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {/* Floating Reaction Menu Toggle Button */}
          <button
            onClick={() => setShowReactionMenu(!showReactionMenu)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
              showReactionMenu
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/30'
            }`}
            title="Open Floating Reactions Menu"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">More</span>
          </button>

          {/* FLOATING REACTION MENU POPOVER */}
          <AnimatePresence>
            {showReactionMenu && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute bottom-14 left-1/2 -translate-x-1/2 w-80 sm:w-96 bg-[#080d28]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 space-y-3"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Flame className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Floating Live Reactions
                      </h4>
                      <p className="text-[10px] text-slate-400">Tap to float emojis onto live room stage</p>
                    </div>
                  </div>

                  {reactionCombo && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold animate-pulse">
                      {reactionCombo.emoji} x{reactionCombo.count} Combo!
                    </span>
                  )}

                  <button
                    onClick={() => setShowReactionMenu(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Emojis Categorized Grid */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {/* Category 1: Hype & Heat */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Hype & Heat
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['🔥', '⚡', '💥', '💯', '💣', '📈'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleSendEmojiReaction(emoji)}
                          className="p-2 bg-white/5 hover:bg-amber-500/20 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer hover:scale-125 border border-white/5 hover:border-amber-500/40"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Music & Audio */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                      <Music className="w-3 h-3" /> Audio Vibes
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['🎵', '🎶', '🎧', '🎷', '🎸', '🔊'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleSendEmojiReaction(emoji)}
                          className="p-2 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer hover:scale-125 border border-white/5 hover:border-cyan-500/40"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Love & Support */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Love & Support
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['❤️', '💖', '💎', '👏', '👑', '🚀'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleSendEmojiReaction(emoji)}
                          className="p-2 bg-white/5 hover:bg-pink-500/20 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer hover:scale-125 border border-white/5 hover:border-pink-500/40"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Burst Feature Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Burst Mode:</span>
                  <div className="flex items-center gap-1.5">
                    {['🔥', '🎵', '❤️'].map(emoji => (
                      <button
                        key={`burst-${emoji}`}
                        onClick={() => handleSendEmojiReaction(emoji, 5)}
                        className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1"
                      >
                        <span>{emoji}</span>
                        <span>x5 Burst</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Quick Tip Host, Participants & Leave Space */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParticipantsPanel(true)}
            className="px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            title="Open Participants & Network Telemetry Panel"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Participants</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold">
              {allParticipantsList.length}
            </span>
          </button>

          <button
            onClick={() => handleOpenTipModal(roomData.host)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span className="hidden sm:inline">Tip Host</span>
          </button>
        </div>

      </div>

      {/* TIPPING MODAL OVERLAY */}
      <AnimatePresence>
        {showTipModal && selectedTipSpeaker && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#090F2E] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Coins className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black uppercase text-white tracking-tight">
                  Tip Speaker in TON
                </h3>
                <p className="text-xs text-slate-400">
                  Directly support <span className="font-bold text-white">@{selectedTipSpeaker.handle}</span> on the TON blockchain network.
                </p>
              </div>

              {/* Preset Tip Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {['1', '5', '10', '25'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCustomTipAmount(amt)}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase transition-all cursor-pointer border ${
                      customTipAmount === amt
                        ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {amt} TON
                  </button>
                ))}
              </div>

              {/* Custom Input Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Custom Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customTipAmount}
                    onChange={(e) => setCustomTipAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Enter amount..."
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                    TON
                  </span>
                </div>
              </div>

              {/* Confirm / Cancel Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowTipModal(false)}
                  disabled={isSendingTip}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmTip}
                  disabled={isSendingTip}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSendingTip ? 'Sending...' : 'Send Tip'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PARTICIPANTS & CONNECTION STATUS OVERLAY SIDE PANEL */}
      <AnimatePresence>
        {showParticipantsPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowParticipantsPanel(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Slide-over Side Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#080d28] border-l border-white/10 h-full flex flex-col z-10 shadow-2xl overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 bg-[#060a20] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <span>Room Participants</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                        {allParticipantsList.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Live connection status & latency monitoring
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowParticipantsPanel(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close Side Panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Session Status Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-b border-white/5 p-3 sm:px-5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${roomData.isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    {roomData.isLive ? 'Live Audio Session' : 'Session Inactive'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {roomData.listenerCount.toLocaleString()} listeners
                </span>
              </div>

              {/* Search & Filter Tabs */}
              <div className="p-4 border-b border-white/5 space-y-3 bg-[#060a20]/50 shrink-0">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search participants by name or @handle..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {participantSearch && (
                    <button
                      onClick={() => setParticipantSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[11px] font-bold uppercase">
                  {(['all', 'speakers', 'vip'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setParticipantFilter(f)}
                      aria-pressed={participantFilter === f}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer text-center border ${
                        participantFilter === f
                          ? 'bg-emerald-500 text-white font-black shadow-md border-[#c0c0c0]/40'
                          : 'text-slate-400 hover:text-white border-[#c0c0c0]/25'
                      }`}
                    >
                      {f === 'all' ? `All (${allParticipantsList.length})` : f === 'speakers' ? `Stage (${allSpeakers.length})` : `VIPs (${allParticipantsList.filter(p => p.isVip).length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Participant List Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {filteredParticipantsList.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-bold uppercase tracking-wider">No matching participants found</p>
                    <p className="text-[11px] text-slate-500">Try searching for a different name or clear filters.</p>
                  </div>
                ) : (
                  filteredParticipantsList.map((participant) => (
                    <div
                      key={participant.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        participant.isSpeaking
                          ? 'bg-blue-600/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                          : participant.isHost
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Left: Avatar & Names */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className={`w-10 h-10 rounded-full object-cover border ${
                              participant.isHost
                                ? 'border-amber-400'
                                : participant.isSpeaker
                                ? 'border-blue-400'
                                : 'border-white/10'
                            }`}
                          />
                          {/* Audio / Mic Badge */}
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border border-black/50 ${
                            participant.isSpeaker
                              ? participant.isMuted
                                ? 'bg-rose-500 text-white'
                                : 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {participant.isSpeaker ? (
                              participant.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />
                            ) : (
                              <Headphones className="w-2.5 h-2.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[140px]">
                              {participant.name}
                            </span>
                            {participant.isHost && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            {participant.isVip && !participant.isHost && (
                              <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-mono">
                              @{participant.handle}
                            </span>
                            <span className="text-slate-600 text-[10px]">•</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              participant.isHost
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : participant.isSpeaker
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {participant.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5 font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-bold">{participant.status}</span>
                        </div>

                        {/* Quick Action Button */}
                        <div className="flex items-center gap-1">
                          {participant.isSpeaker ? (
                            <button
                              onClick={() => {
                                setSelectedTipSpeaker({
                                  id: participant.id,
                                  name: participant.name,
                                  handle: participant.handle,
                                  avatar: participant.avatar,
                                  role: participant.role as 'Artist' | 'Speaker' | 'Host' | 'Co-Host',
                                  walletAddress: participant.walletAddress,
                                  isMuted: participant.isMuted,
                                  isSpeaking: participant.isSpeaking,
                                  gramsEarned: 0
                                });
                                setShowTipModal(true);
                              }}
                              className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3 text-amber-400" />
                              <span>Tip</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                toast.success(`Invited @${participant.handle} to Stage!`);
                              }}
                              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3 text-cyan-400" />
                              <span>Invite</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary Bar */}
              <div className="p-3 bg-[#060a20] border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{roomData.category}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {allParticipantsList.filter(p => p.isSpeaker).length} Stage / {allParticipantsList.filter(p => !p.isSpeaker).length} Audience
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAVE ROOM CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {showLeaveConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveConfirmModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#080d28] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5 overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    Leave Live Space Room?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Are you sure you want to disconnect from <span className="text-amber-300 font-bold">{roomData.title}</span>? You will stop receiving the live 48kHz audio stream.
                  </p>
                </div>
              </div>

              {/* Room Stats Quick Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Session: {formatSessionDuration(sessionSeconds)}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{roomData.listenerCount.toLocaleString()} listening</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowLeaveConfirmModal(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/10"
                >
                  Stay in Room
                </button>
                <button
                  onClick={confirmLeaveRoom}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMIT TRACK TO QUEUE MODAL */}
      <AnimatePresence>
        {showAddTrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTrackModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#080d28] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                      Submit Track to Session Queue
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add a track for the community to upvote in real-time
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTrackModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddTrackToQueue} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Track Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    placeholder="e.g. Lagos City Lights (VIP Remix)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Artist / Creator <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTrackArtist}
                    onChange={(e) => setNewTrackArtist(e.target.value)}
                    placeholder="e.g. Amina Sound ft. Kofi Beats"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Genre / Vibe
                  </label>
                  <select
                    value={newTrackGenre}
                    onChange={(e) => setNewTrackGenre(e.target.value)}
                    className="w-full bg-[#0d143d] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Afrobeats">Afrobeats</option>
                    <option value="Amapiano">Amapiano</option>
                    <option value="Afro-Genesis">Afro-Genesis</option>
                    <option value="Electronic">Electronic / Synthwave</option>
                    <option value="Hip-Hop">Hip-Hop / Rap</option>
                    <option value="Chillhop">Chillhop / R&B</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTrackModal(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Queue</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SpaceRoom;
