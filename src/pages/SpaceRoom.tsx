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

// Floating Reaction Emoji interface
interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage width
}

// Room Speaker interface
interface RoomSpeaker {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'Host' | 'Co-Host' | 'Speaker' | 'Artist';
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

// Room Chat Message
interface RoomChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  isTip?: boolean;
  tipAmount?: number;
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

// Queue Track interface for Live Real-Time Upvoting
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

const INITIAL_QUEUE_TRACKS: QueueTrack[] = [
  {
    id: 'q-track-1',
    title: 'Celestial Resonance (Genesis Edit)',
    artist: 'DJ Krupy ft. Amina Sound',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    duration: '3:42',
    upvotes: 142,
    upvotedBy: ['krusher', 'aminasound', 'zayn_r', 'marcus_k'],
    submittedBy: 'DJ Krupy',
    isPlaying: true,
    genre: 'Afro-Genesis'
  },
  {
    id: 'q-track-2',
    title: 'Lagos Midnight Groove',
    artist: 'Kofi Beats',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
    duration: '4:15',
    upvotes: 89,
    upvotedBy: ['kofibeats', 'zayn_r', 'niatech'],
    submittedBy: 'kofibeats',
    genre: 'Amapiano'
  },
  {
    id: 'q-track-3',
    title: 'Neon Horizons (Amapiano VIP)',
    artist: 'Sarah Vibe',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    duration: '3:50',
    upvotes: 64,
    upvotedBy: ['sarahvibe', 'elena_v'],
    submittedBy: 'sarahvibe',
    genre: 'Afrobeats'
  },
  {
    id: 'q-track-4',
    title: 'Afro-Futurism Synthwave',
    artist: 'Symphony Node',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
    duration: '4:02',
    upvotes: 45,
    upvotedBy: ['symphony_ton'],
    submittedBy: 'symphony_ton',
    genre: 'Electronic'
  },
  {
    id: 'q-track-5',
    title: 'Digital Sunset (Gram Session)',
    artist: 'Zayn R.',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
    duration: '3:28',
    upvotes: 28,
    upvotedBy: ['zayn_r'],
    submittedBy: 'zayn_r',
    genre: 'Chillhop'
  }
];

// Pre-populated Spaces catalog for switching or loading by ID
const MOCK_SPACE_ROOMS: Record<string, SpaceRoomData> = {
  'space-1': {
    id: 'space-1',
    title: 'Genesis Music Protocol & GRAM NFT-v2 Album Launch',
    description: 'Direct audio stream discussing gasless royalty distribution, smart contract listening rewards, and upcoming genesis drops on GRAM.',
    category: 'Genesis & Tech',
    isLive: true,
    startedAt: '42m ago',
    listenerCount: 1248,
    host: {
      id: 'sp-host-1',
      name: 'DJ Krupy',
      handle: 'krusher',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      role: 'Host',
      isMuted: false,
      isSpeaking: true,
      gramsEarned: 450
    },
    speakers: [
      {
        id: 'sp-2',
        name: 'Amina Sound',
        handle: 'aminasound',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Co-Host',
        isMuted: false,
        isSpeaking: false,
        gramsEarned: 180
      },
      {
        id: 'sp-3',
        name: 'Kofi Beats',
        handle: 'kofibeats',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'Artist',
        isMuted: true,
        isSpeaking: false,
        gramsEarned: 95
      },
      {
        id: 'sp-4',
        name: 'Symphony Node',
        handle: 'symphony_ton',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        role: 'Speaker',
        isMuted: false,
        isSpeaking: false,
        gramsEarned: 60
      }
    ],
    listeners: [
      { id: 'l-1', name: 'Zayn R.', handle: 'zayn_r', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', isVip: true },
      { id: 'l-2', name: 'Elena V.', handle: 'elena_v', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', isVip: false },
      { id: 'l-3', name: 'Marcus K.', handle: 'marcus_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isVip: true },
      { id: 'l-4', name: 'Nia Tech', handle: 'niatech', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isVip: false },
      { id: 'l-5', name: 'Tunde Prod', handle: 'tunde_beats', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', isVip: true }
    ],
    pinnedTrack: {
      id: 'track-gen-1',
      title: 'Celestial Resonance (Genesis Edit)',
      artist: 'DJ Krupy ft. Amina Sound',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
      price: '12.5 GRAM'
    }
  },
  'space-2': {
    id: 'space-2',
    title: 'Afrobeats & Amapiano Producer Masterclass & Feedback',
    description: 'Bring your unreleased tracks for live listening feedback from top chart creators and GRAM producers.',
    category: 'Afrobeats',
    isLive: true,
    startedAt: '18m ago',
    listenerCount: 890,
    host: {
      id: 'sp-host-2',
      name: 'Kofi Beats',
      handle: 'kofibeats',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Host',
      isMuted: false,
      isSpeaking: true,
      gramsEarned: 320
    },
    speakers: [
      {
        id: 'sp-5',
        name: 'Sarah Vibe',
        handle: 'sarahvibe',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        role: 'Artist',
        isMuted: false,
        isSpeaking: false,
        gramsEarned: 110
      }
    ],
    listeners: [
      { id: 'l-6', name: 'Liam P.', handle: 'liamp', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', isVip: false }
    ],
    pinnedTrack: {
      id: 'track-afro-1',
      title: 'Lagos Midnight Groove',
      artist: 'Kofi Beats',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      price: '8.0 GRAM'
    }
  }
};

export const SpaceRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { addNotification, currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // Load target room or default to space-1
  const roomId = id && MOCK_SPACE_ROOMS[id] ? id : 'space-1';
  const [roomData, setRoomData] = useState<SpaceRoomData>(MOCK_SPACE_ROOMS[roomId]);

  // Audio Controls & Room States
  const [isJoined, setIsJoined] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRoomAudioMuted, setIsRoomAudioMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'stage' | 'chat' | 'listeners'>('stage');
  const [searchListener, setSearchListener] = useState('');

  // Participant Overlay / Side Panel States
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState<'all' | 'speakers' | 'vip'>('all');

  // Live Session Duration Timer State (seconds)
  const [sessionSeconds, setSessionSeconds] = useState<number>(2520); // starts at 42m 00s

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Real-time Track Queue & Upvoting State
  const [queueTracks, setQueueTracks] = useState<QueueTrack[]>(INITIAL_QUEUE_TRACKS);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Afrobeats');

  // Handle Real-time Track Upvote
  const handleToggleUpvote = (trackId: string) => {
    const currentUserHandle = userProfile?.username || userProfile?.name || 'krusher';

    setQueueTracks(prevTracks => {
      const updated = prevTracks.map(track => {
        if (track.id !== trackId) return track;

        const hasUpvoted = track.upvotedBy.includes(currentUserHandle);
        const newUpvotedBy = hasUpvoted
          ? track.upvotedBy.filter(h => h !== currentUserHandle)
          : [...track.upvotedBy, currentUserHandle];
        const newUpvotes = hasUpvoted ? Math.max(0, track.upvotes - 1) : track.upvotes + 1;

        if (!hasUpvoted) {
          toast.success(`🔥 Upvoted "${track.title}"! Track boosted in session queue.`);
          confetti({
            particleCount: 25,
            spread: 60,
            origin: { y: 0.8 }
          });
          // Add system message to live chat
          setChatMessages(prev => [
            ...prev,
            {
              id: `msg-upvote-${Date.now()}`,
              userId: userProfile?.uid || 'curr-user',
              userName: userProfile?.name || 'DJ Krupy',
              userAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
              text: `🔥 upvoted track "${track.title}" (+1 Vote)!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true
            }
          ]);
        } else {
          toast.info(`Removed upvote for "${track.title}".`);
        }

        return {
          ...track,
          upvotes: newUpvotes,
          upvotedBy: newUpvotedBy
        };
      });

      // Keep currently playing track on top, sort upcoming queue tracks by upvotes descending
      const playing = updated.filter(t => t.isPlaying);
      const upcoming = updated.filter(t => !t.isPlaying).sort((a, b) => b.upvotes - a.upvotes);

      return [...playing, ...upcoming];
    });
  };

  // Handle Submit New Track to Queue
  const handleAddTrackToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !newTrackArtist.trim()) {
      toast.error('Please enter both track title and artist.');
      return;
    }

    const currentUserHandle = userProfile?.username || userProfile?.name || 'krusher';
    const sampleCovers = [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
    ];
    const randomCover = sampleCovers[Math.floor(Math.random() * sampleCovers.length)];

    const newTrack: QueueTrack = {
      id: `q-track-${Date.now()}`,
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim(),
      cover: randomCover,
      duration: '3:30',
      upvotes: 1,
      upvotedBy: [currentUserHandle],
      submittedBy: currentUserHandle,
      genre: newTrackGenre
    };

    setQueueTracks(prev => {
      const playing = prev.filter(t => t.isPlaying);
      const upcoming = [...prev.filter(t => !t.isPlaying), newTrack].sort((a, b) => b.upvotes - a.upvotes);
      return [...playing, ...upcoming];
    });

    // Add chat system message
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-submit-${Date.now()}`,
        userId: userProfile?.uid || 'curr-user',
        userName: userProfile?.name || 'DJ Krupy',
        userAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        text: `🎵 submitted "${newTrack.title}" by ${newTrack.artist} to the live session queue!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      }
    ]);

    toast.success(`Submitted "${newTrack.title}" to the live session queue!`);
    setNewTrackTitle('');
    setNewTrackArtist('');
    setShowAddTrackModal(false);
  };

  // Tipping Modal State
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTipSpeaker, setSelectedTipSpeaker] = useState<RoomSpeaker | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState('10');

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [reactionCombo, setReactionCombo] = useState<{ emoji: string; count: number } | null>(null);

  // Bottom Navigation Bar Hide on Scroll Down State
  const [isBottomBarHidden, setIsBottomBarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsBottomBarHidden(true); // Hide bottom bar on scroll down
      } else if (currentScrollY < lastScrollY || currentScrollY <= 20) {
        setIsBottomBarHidden(false); // Show bottom bar on scroll up or top
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Live Chat Stream State
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([
    {
      id: 'c-1',
      userId: 'sp-host-1',
      userName: 'DJ Krupy',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      text: 'Welcome everyone to the Genesis Space Room! Feel free to ask questions or raise your hand to speak.',
      timestamp: '10:14 AM'
    },
    {
      id: 'c-2',
      userId: 'l-1',
      userName: 'Zayn R.',
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
      text: 'Sound quality is crystal clear! Excited for the audio watermark demo.',
      timestamp: '10:16 AM'
    },
    {
      id: 'c-3',
      userId: 'sys-1',
      userName: 'System Node',
      userAvatar: '',
      text: '@Krusher tipped 25.0 GRAMS to Host @DJ Krupy 🔥',
      timestamp: '10:18 AM',
      isSystem: true,
      isTip: true,
      tipAmount: 25
    }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Audio Frequency Wave Animation Frame
  const [speakingLevels, setSpeakingLevels] = useState<number[]>([40, 75, 30, 90, 60, 85, 50, 95]);

  // Update room if ID changes in URL
  useEffect(() => {
    if (id && MOCK_SPACE_ROOMS[id]) {
      setRoomData(MOCK_SPACE_ROOMS[id]);
    }
  }, [id]);

  // Simulate subtle random audio wave shifts for live speaking visualizer
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakingLevels([
        Math.floor(Math.random() * 60) + 20,
        Math.floor(Math.random() * 70) + 30,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 90) + 10,
        Math.floor(Math.random() * 75) + 25,
        Math.floor(Math.random() * 85) + 15,
      ]);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handlers
  const handleJoinRoom = () => {
    if (isJoined) {
      toast.info('You are already connected to this live music session!');
      return;
    }

    const userName = userProfile?.name || 'You';
    const userHandle = userProfile?.username || 'you';
    const userAvatar = userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You';

    setIsJoined(true);
    setRoomData(prev => ({
      ...prev,
      listenerCount: prev.listenerCount + 1,
      listeners: [
        {
          id: userProfile?.uid || `l-me-${Date.now()}`,
          name: userName,
          handle: userHandle,
          avatar: userAvatar,
          isVip: true
        },
        ...prev.listeners
      ]
    }));

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 }
    });

    toast.success(`Connected to Live Session: ${roomData.title}`, {
      description: 'You are now tuned in live to the audio stream with other music fans!'
    });

    setChatMessages(prev => [
      ...prev,
      {
        id: `sys-join-${Date.now()}`,
        userId: userProfile?.uid || 'user-me',
        userName: userName,
        userAvatar: userAvatar,
        text: `🎉 @${userName} joined the live music room!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      }
    ]);
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

  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    const userName = userProfile?.name || 'You';
    const userAvatar = userProfile?.avatar || '';
    if (nextState) {
      addNotification('Hand raised. Host will receive your speaker request.', 'info');
      // Add system message to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          userId: userProfile?.uid || 'user-me',
          userName: userName,
          userAvatar: userAvatar,
          text: `${userName} raised hand to request stage speaking access.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }
      ]);
    } else {
      addNotification('Hand lowered.', 'info');
    }
  };

  const handleSendEmojiReaction = (emoji: string, burstCount = 1) => {
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        const newReaction: FloatingReaction = {
          id: `react-${Date.now()}-${Math.random()}`,
          emoji,
          x: Math.floor(Math.random() * 70) + 15 // 15% to 85% width
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

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const msg: RoomChatMessage = {
      id: `chat-${Date.now()}`,
      userId: userProfile?.uid || 'user-me',
      userName: userProfile?.name || 'You',
      userAvatar: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      text: newChatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, msg]);
    setNewChatMessage('');
  };

  const handleOpenTipModal = (speaker: RoomSpeaker) => {
    setSelectedTipSpeaker(speaker);
    setShowTipModal(true);
  };

  const handleConfirmTip = () => {
    if (!selectedTipSpeaker) return;
    const amount = parseFloat(customTipAmount) || 10;
    const userName = userProfile?.name || 'You';
    const userAvatar = userProfile?.avatar || '';

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    addNotification(`Successfully tipped ${amount} GRAMS to ${selectedTipSpeaker.name}!`, 'success');
    
    // Add tip message to chat
    setChatMessages(prev => [
      ...prev,
      {
        id: `tip-${Date.now()}`,
        userId: userProfile?.uid || 'user-me',
        userName: userName,
        userAvatar: userAvatar,
        text: `@${userName} tipped ${amount} GRAMS to ${selectedTipSpeaker.name}! 💎🔥`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isTip: true,
        tipAmount: amount
      }
    ]);

    setShowTipModal(false);
  };

  const handlePlaySoundboardEffect = (effectName: string) => {
    addNotification(`Played sound effect: ${effectName}`, 'info');
    handleSendEmojiReaction('🔊');
    // Web Audio synthesizer tone effect simulation
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
      // AudioContext fallback
    }
  };

  // Leave Confirmation Modal State
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

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

  const allSpeakers = [roomData.host, ...roomData.speakers];
  const filteredListeners = roomData.listeners.filter(
    l => l.name.toLowerCase().includes(searchListener.toLowerCase()) || l.handle.toLowerCase().includes(searchListener.toLowerCase())
  );

  // Combine speakers and listeners with real-time connection status & telemetry
  const allParticipantsList = [
    ...allSpeakers.map((sp, idx) => ({
      id: sp.id,
      name: sp.name,
      handle: sp.handle,
      avatar: sp.avatar,
      role: sp.role,
      isSpeaker: true,
      isHost: sp.role === 'Host',
      isMuted: sp.isMuted,
      isSpeaking: sp.isSpeaking,
      isVip: true,
      ping: idx === 0 ? '12ms' : idx === 1 ? '18ms' : '24ms',
      quality: '48kHz HD Lossless',
      bitrate: '320 kbps',
      status: 'Live Audio (Stage)'
    })),
    ...roomData.listeners.map((l, idx) => ({
      id: l.id,
      name: l.name,
      handle: l.handle,
      avatar: l.avatar,
      role: l.isVip ? 'VIP Listener' : 'Audience',
      isSpeaker: false,
      isHost: false,
      isMuted: true,
      isSpeaking: false,
      isVip: l.isVip || false,
      ping: idx % 3 === 0 ? '22ms' : idx % 2 === 0 ? '38ms' : '85ms',
      quality: idx % 3 === 0 ? '48kHz HD' : 'Standard Audio',
      bitrate: idx % 2 === 0 ? '256 kbps' : '192 kbps',
      status: idx === 3 ? 'Buffering...' : 'Connected (Stream)'
    }))
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
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === tab.key ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
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
                            {speakingLevels.map((lvl, i) => (
                              <div
                                key={i}
                                className="w-1 bg-cyan-400 rounded-full transition-all duration-150"
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
                    {queueTracks.map((track, idx) => {
                      const currentUserHandle = userProfile?.username || userProfile?.name || 'krusher';
                      const hasUpvoted = track.upvotedBy.includes(currentUserHandle);

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
                    })}
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
              roomId={id || 'genesis-live-room'}
              roomTitle={roomData.title}
              hostName={roomData.host.name}
              hostId={roomData.host.id}
              currentUser={{
                uid: userProfile?.uid,
                name: userProfile?.name,
                username: userProfile?.username,
                avatar: userProfile?.avatar,
                isArtist: userProfile?.role === 'artist' || userProfile?.name === roomData.host.name,
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
                  Tip Speaker in Grams
                </h3>
                <p className="text-xs text-slate-400">
                  Directly support <span className="font-bold text-white">@{selectedTipSpeaker.handle}</span> on the GRAM blockchain network.
                </p>
              </div>

              {/* Preset Tip Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {['5', '10', '25', '50'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCustomTipAmount(amt)}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase transition-all cursor-pointer border ${
                      customTipAmount === amt
                        ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {amt} GRAM
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
                    GRAMS
                  </span>
                </div>
              </div>

              {/* Confirm / Cancel Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmTip}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Send Tip
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

              {/* Real-time Network Telemetry Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-b border-white/5 p-3 sm:px-5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Stream: 48kHz HD Stereo
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Signal className="w-3 h-3" />
                    Avg Latency: 21ms
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-400 font-bold">100% Lossless</span>
                </div>
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
                      className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        participantFilter === f
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
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

                      {/* Right: Connection telemetry & Actions */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5 font-mono text-[10px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            participant.status.includes('Buffering')
                              ? 'bg-amber-400 animate-ping'
                              : 'bg-emerald-400'
                          }`} />
                          <span className={participant.status.includes('Buffering') ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {participant.ping}
                          </span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-300 text-[9px] hidden sm:inline">{participant.bitrate}</span>
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
                                toast.success(`Invited @${participant.handle} to Stage!`, {
                                  description: 'A stage speaking invitation notification was sent.'
                                });
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
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>320 kbps WebRTC</span>
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
