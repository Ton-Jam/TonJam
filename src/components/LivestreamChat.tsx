import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  Flame, 
  Heart, 
  MessageSquare, 
  DollarSign, 
  Pin, 
  X, 
  ChevronDown, 
  AtSign, 
  ThumbsUp, 
  Radio, 
  CheckCircle2, 
  Gift, 
  Coins, 
  Zap, 
  Share2, 
  Smile,
  Volume2,
  Lock,
  Flag,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Predefined prohibited words & phrases list for stream moderation filter
export const PROHIBITED_WORDS: string[] = [
  'fuck', 'fucking', 'fucked', 'fuk', 'fck', 'shit', 'shitty', 'bitch', 'bitches',
  'asshole', 'bastard', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'scam', 'scammer', 'free ton',
  'free crypto', 't.me/scam', 'send eth', 'send btc', 'double your money', 'ponzi',
  'phishing', 'seed phrase', 'private key', 'hack ton', 'hack wallet'
];

export interface ModerationResult {
  maskedText: string;
  hasProhibited: boolean;
  prohibitedFound: string[];
}

// Moderation function that detects and masks prohibited language
export function maskProhibitedWords(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { maskedText: '', hasProhibited: false, prohibitedFound: [] };
  }

  let result = text;
  let hasProhibited = false;
  const prohibitedFound: string[] = [];

  for (const word of PROHIBITED_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

    if (regex.test(result)) {
      hasProhibited = true;
      if (!prohibitedFound.includes(word)) {
        prohibitedFound.push(word);
      }
      result = result.replace(regex, (match) => {
        if (match.length <= 2) return '*'.repeat(match.length);
        return match[0] + '*'.repeat(match.length - 1);
      });
    }
  }

  return { maskedText: result, hasProhibited, prohibitedFound };
}

export interface LivestreamChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  type?: 'chat' | 'qa' | 'tip' | 'system' | 'nft_drop' | 'pinned';
  tipAmount?: number;
  currency?: string;
  replyTo?: {
    userName: string;
    text: string;
  };
  isArtist?: boolean;
  isHost?: boolean;
  isVip?: boolean;
  isQuestion?: boolean;
  questionUpvotes?: number;
  isAnswered?: boolean;
  reaction?: string;
  reactions?: Record<string, number>;
  userReactions?: Record<string, boolean>;
  isFlagged?: boolean;
  flagCount?: number;
}

interface LivestreamChatProps {
  roomId: string;
  roomTitle?: string;
  hostName?: string;
  hostId?: string;
  currentUser: {
    uid?: string;
    name?: string;
    username?: string;
    avatar?: string;
    isArtist?: boolean;
    isVip?: boolean;
  } | null;
  onOpenTipModal?: (amount?: number) => void;
  onOpenNFTDropModal?: () => void;
  isCompact?: boolean;
  className?: string;
}

export const LivestreamChat: React.FC<LivestreamChatProps> = ({
  roomId,
  roomTitle = 'Live Session',
  hostName = 'Artist',
  hostId,
  currentUser,
  onOpenTipModal,
  onOpenNFTDropModal,
  isCompact = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'qa' | 'tips'>('all');
  const [messages, setMessages] = useState<LivestreamChatMessage[]>([
    {
      id: 'init-1',
      userId: hostId || 'host-1',
      userName: hostName,
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      text: `Welcome to the live session! Dropping exclusive unreleased stems and taking your live questions during the broadcast.`,
      timestamp: '10:00 AM',
      type: 'chat',
      isArtist: true,
      isHost: true,
      reactions: { '🔥': 14, '🎶': 9, '🚀': 6 }
    },
    {
      id: 'init-2',
      userId: 'user-vip-1',
      userName: 'Sasha_K',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: 'Bassline is sounding huge! Can you breakdown the synth patch in the chorus?',
      timestamp: '10:02 AM',
      type: 'qa',
      isQuestion: true,
      questionUpvotes: 14,
      isVip: true,
      reactions: { '🎶': 8, '🔥': 5 }
    },
    {
      id: 'init-3',
      userId: 'tip-user-1',
      userName: 'Alex_Ton',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'Support the sound! Keep pushing Web3 music forward 🚀',
      timestamp: '10:04 AM',
      type: 'tip',
      tipAmount: 15,
      currency: 'TON',
      isVip: true,
      reactions: { '🚀': 18, '🔥': 11, '💎': 7 }
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ userName: string; text: string } | null>(null);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<LivestreamChatMessage | null>({
    id: 'pin-1',
    userId: hostId || 'host-1',
    userName: hostName,
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    text: `⚡ Live AMA & Genesis Stem Drop at 45m mark! Type in your questions or send tips to boost priority.`,
    timestamp: 'Pinned',
    type: 'pinned',
    isArtist: true
  });
  const [upvotedQuestions, setUpvotedQuestions] = useState<Record<string, boolean>>({ 'init-2': true });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // Moderation & Reporting States
  const [reportingMessage, setReportingMessage] = useState<LivestreamChatMessage | null>(null);
  const [reportReason, setReportReason] = useState<string>('harassment');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [hideMessageOnReport, setHideMessageOnReport] = useState<boolean>(true);
  const [reportedMessageIds, setReportedMessageIds] = useState<Record<string, { reason: string; timestamp: number }>>({});
  const [hiddenMessageIds, setHiddenMessageIds] = useState<Record<string, boolean>>({});

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const isCurrentHost = currentUser?.uid === hostId || currentUser?.username?.toLowerCase() === hostName.toLowerCase();

  // Connect to Socket.IO room
  useEffect(() => {
    try {
      const socket = io();
      socketRef.current = socket;

      socket.emit('join-room', `livestream-${roomId}`);

      socket.on('new-message', (data: any) => {
        const rawText = data.text || '';
        const { maskedText } = maskProhibitedWords(rawText);

        const newMsg: LivestreamChatMessage = {
          id: data.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: data.user?.id || 'anon',
          userName: data.user?.name || 'Viewer',
          userAvatar: data.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer',
          text: maskedText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: data.type || (data.isQuestion ? 'qa' : data.tipAmount ? 'tip' : 'chat'),
          tipAmount: data.tipAmount,
          currency: data.currency || 'TON',
          replyTo: data.replyTo,
          isArtist: data.isArtist || data.user?.isArtist,
          isHost: data.user?.id === hostId,
          isVip: data.isVip || data.user?.isVip,
          isQuestion: data.isQuestion,
          questionUpvotes: data.questionUpvotes || 0,
          reaction: data.reaction
        };

        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Trigger confetti for tips
        if (newMsg.tipAmount) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      });

      socket.on('new-reaction', (data: any) => {
        if (data.reaction) {
          triggerFloatingReaction(data.reaction);
          if (data.messageId) {
            setMessages(prev => prev.map(m => {
              if (m.id === data.messageId) {
                const currentCount = m.reactions?.[data.reaction] || 0;
                return {
                  ...m,
                  reactions: {
                    ...(m.reactions || {}),
                    [data.reaction]: currentCount + 1
                  }
                };
              }
              return m;
            }));
          }
        }
      });

      socket.on('message-pinned', (data: any) => {
        if (data) {
          setPinnedMessage(data);
        }
      });

      socket.on('message-reported', (data: any) => {
        if (data?.messageId) {
          setMessages(prev => prev.map(m => {
            if (m.id === data.messageId) {
              return {
                ...m,
                isFlagged: true,
                flagCount: (m.flagCount || 0) + 1
              };
            }
            return m;
          }));
        }
      });

      socket.on('message-deleted', (data: any) => {
        if (data?.messageId) {
          setMessages(prev => prev.filter(m => m.id !== data.messageId));
        }
      });

      return () => {
        socket.emit('leave-room', `livestream-${roomId}`);
        socket.disconnect();
      };
    } catch (e) {
      console.warn('Socket connection fallback active:', e);
    }
  }, [roomId, hostId]);

  // Handle scroll detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 70;
    setIsUserScrolledUp(isScrolledUp);
    if (!isScrolledUp) {
      setHasNewMessagesBelow(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isUserScrolledUp) {
      setHasNewMessagesBelow(true);
    } else {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isUserScrolledUp]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessagesBelow(false);
    setIsUserScrolledUp(false);
  };

  const triggerFloatingReaction = (emoji: string) => {
    const newReaction = {
      id: `reaction-${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.floor(Math.random() * 60) + 20
    };
    setFloatingReactions(prev => [...prev.slice(-15), newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  const handleSendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji);
    if (socketRef.current) {
      socketRef.current.emit('send-reaction', {
        roomId: `livestream-${roomId}`,
        reaction: emoji,
        user: {
          id: currentUser?.uid || 'guest',
          name: currentUser?.name || 'Guest Fan'
        }
      });
    }
  };

  const handleToggleMessageReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const userReactions = m.userReactions || {};
        const isReacted = !!userReactions[emoji];
        const currentCount = m.reactions?.[emoji] || 0;
        const newCount = isReacted ? Math.max(0, currentCount - 1) : currentCount + 1;
        const updatedReactions = { ...(m.reactions || {}) };
        if (newCount > 0) {
          updatedReactions[emoji] = newCount;
        } else {
          delete updatedReactions[emoji];
        }
        return {
          ...m,
          reactions: updatedReactions,
          userReactions: {
            ...userReactions,
            [emoji]: !isReacted
          }
        };
      }
      return m;
    }));

    triggerFloatingReaction(emoji);

    if (socketRef.current) {
      socketRef.current.emit('send-reaction', {
        roomId: `livestream-${roomId}`,
        reaction: emoji,
        messageId,
        user: {
          id: currentUser?.uid || 'guest',
          name: currentUser?.name || currentUser?.username || 'Guest Fan'
        }
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const trimmed = inputMessage.trim();
    // Moderation filter: detect and mask prohibited words
    const { maskedText, hasProhibited, prohibitedFound } = maskProhibitedWords(trimmed);

    if (hasProhibited) {
      toast.info(`Moderation Filter: Prohibited term (${prohibitedFound.join(', ')}) masked.`);
    }

    const isQuestion = isQuestionMode || trimmed.endsWith('?') || trimmed.toLowerCase().startsWith('q:') || trimmed.toLowerCase().startsWith('@' + hostName.toLowerCase());

    const messageData: LivestreamChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser?.uid || `guest-${Date.now()}`,
      userName: currentUser?.name || currentUser?.username || 'Guest Fan',
      userAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (currentUser?.name || 'Fan'),
      text: maskedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: isQuestion ? 'qa' : 'chat',
      replyTo: replyTarget || undefined,
      isArtist: currentUser?.isArtist || currentUser?.uid === hostId,
      isHost: currentUser?.uid === hostId,
      isVip: currentUser?.isVip,
      isQuestion: isQuestion,
      questionUpvotes: isQuestion ? 1 : 0
    };

    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        roomId: `livestream-${roomId}`,
        message: maskedText,
        user: {
          id: messageData.userId,
          name: messageData.userName,
          avatar: messageData.userAvatar,
          isArtist: messageData.isArtist,
          isVip: messageData.isVip
        },
        type: messageData.type,
        replyTo: messageData.replyTo,
        isQuestion: messageData.isQuestion,
        questionUpvotes: messageData.questionUpvotes
      });
    }

    setMessages(prev => [...prev, messageData]);
    setInputMessage('');
    setReplyTarget(null);
    setIsQuestionMode(false);
    scrollToBottom();
  };

  const handleOpenReportModal = (msg: LivestreamChatMessage) => {
    setReportingMessage(msg);
    setReportReason('harassment');
    setReportDetails('');
    setHideMessageOnReport(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessage) return;

    const msgId = reportingMessage.id;
    setReportedMessageIds(prev => ({
      ...prev,
      [msgId]: { reason: reportReason, timestamp: Date.now() }
    }));

    if (hideMessageOnReport) {
      setHiddenMessageIds(prev => ({
        ...prev,
        [msgId]: true
      }));
    }

    // Flag message in state
    setMessages(msgs => msgs.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          isFlagged: true,
          flagCount: (m.flagCount || 0) + 1
        };
      }
      return m;
    }));

    // Broadcast report over socket to room moderators/host
    if (socketRef.current) {
      socketRef.current.emit('report-message', {
        roomId: `livestream-${roomId}`,
        messageId: msgId,
        reportedUserId: reportingMessage.userId,
        reason: reportReason,
        details: reportDetails,
        reporter: {
          id: currentUser?.uid || 'guest',
          name: currentUser?.name || currentUser?.username || 'Viewer'
        }
      });
    }

    toast.success('Report submitted. Thank you for keeping the stream safe.');
    setReportingMessage(null);
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (socketRef.current) {
      socketRef.current.emit('delete-message', {
        roomId: `livestream-${roomId}`,
        messageId: msgId
      });
    }
    toast.info('Message removed by moderator');
  };

  const toggleUnhideMessage = (msgId: string) => {
    setHiddenMessageIds(prev => {
      const copy = { ...prev };
      delete copy[msgId];
      return copy;
    });
  };

  const handleUpvoteQuestion = (msgId: string) => {
    setUpvotedQuestions(prev => {
      const alreadyUpvoted = !!prev[msgId];
      const newState = { ...prev, [msgId]: !alreadyUpvoted };

      setMessages(msgs => msgs.map(m => {
        if (m.id === msgId) {
          const currentCount = m.questionUpvotes || 0;
          return {
            ...m,
            questionUpvotes: alreadyUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return m;
      }));

      return newState;
    });
  };

  const handleToggleAnswered = (msgId: string) => {
    if (!isCurrentHost) return;
    setMessages(msgs => msgs.map(m => {
      if (m.id === msgId) {
        return { ...m, isAnswered: !m.isAnswered };
      }
      return m;
    }));
    toast.success('Question status updated');
  };

  const handlePinMessage = (msg: LivestreamChatMessage) => {
    setPinnedMessage(msg);
    if (socketRef.current) {
      socketRef.current.emit('pin-message', {
        roomId: `livestream-${roomId}`,
        message: msg
      });
    }
    toast.info('Message pinned to broadcast header');
  };

  const handleMentionUser = (userName: string) => {
    setInputMessage(prev => {
      const tag = `@${userName} `;
      if (prev.includes(tag)) return prev;
      return `${tag}${prev}`;
    });
  };

  // Filtered views
  const filteredMessages = useMemo(() => {
    if (activeTab === 'qa') {
      return messages.filter(m => m.isQuestion || m.type === 'qa');
    }
    if (activeTab === 'tips') {
      return messages.filter(m => m.type === 'tip' || m.tipAmount);
    }
    return messages;
  }, [messages, activeTab]);

  const questionsCount = messages.filter(m => m.isQuestion || m.type === 'qa').length;
  const tipsCount = messages.filter(m => m.type === 'tip' || m.tipAmount).length;

  return (
    <div className={`relative flex flex-col h-full bg-[#060B24]/90 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* FLOATING EMOJI REACTIONS OVERLAY */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 1, y: 350, scale: 0.8, x: `${reaction.x}%` }}
              animate={{ opacity: 0, y: 50, scale: 1.5, x: `${reaction.x + (Math.random() * 20 - 10)}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute bottom-20 text-3xl select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CHAT HEADER & MODE TABS */}
      <div className="px-4 py-3 bg-white/[0.03] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                Livestream Chat
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {messages.length} active broadcast signals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenTipModal && (
              <button
                onClick={() => onOpenTipModal()}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                title="Send virtual crypto tip"
              >
                <Coins className="w-3 h-3 stroke-[2.5]" />
                <span>Tip</span>
              </button>
            )}
            {isCurrentHost && onOpenNFTDropModal && (
              <button
                onClick={onOpenNFTDropModal}
                className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-purple-600/20"
                title="Drop limited NFT to viewers"
              >
                <Sparkles className="w-3 h-3" />
                <span>NFT Drop</span>
              </button>
            )}
          </div>
        </div>

        {/* MODE SWITCHER TABS */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qa'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            <span>Q&A</span>
            {questionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-400/30 text-purple-200 text-[9px] font-bold">
                {questionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tips'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Tips</span>
            {tipsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[9px] font-bold">
                {tipsCount}
              </span>
            )}
          </button>
        </div>

        {/* PINNED MESSAGE BANNER */}
        {pinnedMessage && (
          <div className="flex items-start gap-2.5 p-2 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 rounded-xl relative group">
            <div className="p-1 rounded-md bg-blue-500/20 text-blue-300 mt-0.5 shrink-0">
              <Pin className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider truncate">
                  {pinnedMessage.userName}
                </span>
                <span className="px-1 rounded bg-blue-500/20 text-blue-200 text-[8px] font-black uppercase">
                  Pinned
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 mt-0.5">
                {pinnedMessage.text}
              </p>
            </div>
            {isCurrentHost && (
              <button
                onClick={() => setPinnedMessage(null)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                title="Unpin message"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES SCROLL CONTAINER */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-2 text-slate-400">
            {activeTab === 'qa' ? (
              <>
                <HelpCircle className="w-8 h-8 text-purple-400 opacity-60" />
                <p className="text-xs font-bold text-slate-300">No questions asked yet!</p>
                <p className="text-[10px] max-w-[200px] text-slate-500">
                  Be the first to ask @{hostName} a question during the stream.
                </p>
              </>
            ) : activeTab === 'tips' ? (
              <>
                <Coins className="w-8 h-8 text-amber-400 opacity-60" />
                <p className="text-xs font-bold text-slate-300">No tips in this session yet</p>
                <p className="text-[10px] max-w-[200px] text-slate-500">
                  Send a crypto tip to highlight your message and support the artist.
                </p>
              </>
            ) : (
              <>
                <MessageSquare className="w-8 h-8 text-blue-400 opacity-60" />
                <p className="text-xs font-bold text-slate-300">Stream chat is quiet</p>
                <p className="text-[10px] text-slate-500">Say hello to the artist and fellow fans!</p>
              </>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.userId === currentUser?.uid;
            const isTip = msg.type === 'tip' || Boolean(msg.tipAmount);
            const isQA = msg.isQuestion || msg.type === 'qa';
            const isReportedByMe = Boolean(reportedMessageIds[msg.id]);
            const isHidden = Boolean(hiddenMessageIds[msg.id]);

            // Moderation check on text display
            const moderated = maskProhibitedWords(msg.text);

            if (isHidden) {
              return (
                <div 
                  key={msg.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 text-[11px] text-slate-400"
                >
                  <span className="flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Message hidden (Reported by you)</span>
                  </span>
                  <button
                    onClick={() => toggleUnhideMessage(msg.id)}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Reveal
                  </button>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative flex gap-2.5 items-start ${
                  isTip
                    ? 'p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent'
                    : isQA
                    ? 'p-3 rounded-2xl bg-purple-950/20'
                    : ''
                }`}
              >
                {/* USER AVATAR WITH BADGE */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={msg.userAvatar} alt={msg.userName} />
                    <AvatarFallback className="text-[10px] font-bold bg-slate-800 text-slate-300">
                      {msg.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {msg.isArtist && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 rounded-full text-white" title="Host Artist">
                      <Sparkles className="w-2 h-2" />
                    </div>
                  )}
                </div>

                {/* MESSAGE BODY */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* SENDER INFO & TAGS */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMentionUser(msg.userName)}
                        className="text-[11px] font-black text-slate-200 hover:text-blue-400 transition-colors truncate cursor-pointer text-left"
                      >
                        {msg.userName}
                      </button>

                      {/* BADGES */}
                      {msg.isArtist && (
                        <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-black uppercase tracking-wider">
                          Artist
                        </span>
                      )}
                      {msg.isHost && !msg.isArtist && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-600 text-white text-[8px] font-black uppercase tracking-wider">
                          Host
                        </span>
                      )}
                      {msg.isVip && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                      {isTip && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                          <Coins className="w-2.5 h-2.5" />
                          <span>{msg.tipAmount} {msg.currency || 'TON'} TIP</span>
                        </span>
                      )}
                      {isQA && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[8px] font-black uppercase tracking-wider">
                          Question
                        </span>
                      )}
                      {msg.isAnswered && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Answered</span>
                        </span>
                      )}
                      {(isReportedByMe || msg.isFlagged) && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                          <Flag className="w-2 h-2" />
                          <span>Flagged</span>
                        </span>
                      )}
                      {moderated.hasProhibited && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                          <ShieldCheck className="w-2 h-2" />
                          <span>Moderated</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* REPLY QUOTE PREVIEW */}
                  {msg.replyTo && (
                    <div className="px-2 py-1 bg-white/[0.04] rounded-lg text-[10px] text-slate-400 flex items-center gap-1 truncate">
                      <span className="font-bold text-blue-300">@{msg.replyTo.userName}:</span>
                      <span className="truncate">{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* MAIN TEXT (MASKED BY MODERATION FILTER) */}
                  <p className={`text-xs leading-relaxed break-words ${
                    isTip
                      ? 'text-amber-100 font-medium'
                      : isQA
                      ? 'text-purple-100 font-semibold'
                      : 'text-slate-200'
                  }`}>
                    {moderated.maskedText}
                  </p>

                  {/* QUICK-REACTION BAR BENEATH EACH MESSAGE */}
                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    {/* Aggregated Reaction Badges */}
                    {msg.reactions && Object.entries(msg.reactions).map(([emoji, count]) => {
                      if (count <= 0) return null;
                      const hasUserReacted = msg.userReactions?.[emoji];
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleToggleMessageReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer select-none active:scale-95 ${
                            hasUserReacted 
                              ? 'bg-blue-600/30 text-blue-200' 
                              : 'bg-white/[0.04] hover:bg-white/10 text-slate-300'
                          }`}
                          title={`React with ${emoji} (${count})`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[9px] font-mono opacity-80">{count}</span>
                        </button>
                      );
                    })}

                    {/* Quick Reaction Emoji Picker Bar */}
                    <div className="flex items-center gap-0.5 bg-white/[0.03] p-0.5 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
                      {['🔥', '🎶', '🚀', '👏', '❤️', '💎'].map((emoji) => {
                        const hasUserReacted = msg.userReactions?.[emoji];
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleMessageReaction(msg.id, emoji)}
                            className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center transition-all cursor-pointer select-none hover:scale-125 active:scale-95 ${
                              hasUserReacted ? 'bg-blue-500/20' : 'hover:bg-white/10'
                            }`}
                            title={`React ${emoji}`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q&A UPVOTES & ANSWER CONTROLS */}
                  {isQA && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpvoteQuestion(msg.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          upvotedQuestions[msg.id]
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white/5 hover:bg-purple-600/20 text-purple-300'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{msg.questionUpvotes || 0}</span>
                      </button>

                      {isCurrentHost && (
                        <button
                          onClick={() => handleToggleAnswered(msg.id)}
                          className="text-[9px] font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                        >
                          {msg.isAnswered ? 'Mark Unanswered' : 'Mark as Answered'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* HOVER ACTIONS: REPLY, PIN, REPORT & DELETE */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2.5 pt-0.5">
                    <button
                      onClick={() => {
                        setReplyTarget({ userName: msg.userName, text: moderated.maskedText });
                        handleMentionUser(msg.userName);
                      }}
                      className="text-[9px] font-bold text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                    >
                      <AtSign className="w-2.5 h-2.5" />
                      <span>Reply</span>
                    </button>

                    {isCurrentHost && (
                      <button
                        onClick={() => handlePinMessage(msg)}
                        className="text-[9px] font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pin className="w-2.5 h-2.5" />
                        <span>Pin</span>
                      </button>
                    )}

                    {/* REPORT MESSAGE ACTION */}
                    <button
                      onClick={() => handleOpenReportModal(msg)}
                      className="text-[9px] font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                      title="Report inappropriate message to stream moderation"
                    >
                      <Flag className="w-2.5 h-2.5" />
                      <span>Report</span>
                    </button>

                    {/* HOST MODERATOR DELETE ACTION */}
                    {isCurrentHost && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-[9px] font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                        title="Remove message from stream"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* NEW MESSAGES INDICATOR */}
      {hasNewMessagesBelow && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 transition-all animate-bounce cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>New Messages</span>
        </button>
      )}

      {/* QUICK EMOJI REACTION TRAY */}
      <div className="px-3 py-1.5 bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          {['🔥', '💎', '❤️', '🚀', '👏', '🎵'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-base flex items-center justify-center transition-all cursor-pointer active:scale-125"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuestionMode(!isQuestionMode)}
            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              isQuestionMode
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-purple-300 hover:bg-white/5'
            }`}
            title="Ask artist a question"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Ask Q&A</span>
          </button>
        </div>
      </div>

      {/* INPUT FORM CONTAINER */}
      <div className="p-3 bg-white/[0.02] shrink-0 space-y-2">
        {/* REPLY PREVIEW BAR */}
        {replyTarget && (
          <div className="flex items-center justify-between px-2.5 py-1 bg-blue-950/40 rounded-lg text-[10px]">
            <div className="flex items-center gap-1 text-slate-300 truncate">
              <span className="text-blue-400 font-bold">Replying to @{replyTarget.userName}:</span>
              <span className="text-slate-400 truncate">{replyTarget.text}</span>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="text-slate-500 hover:text-slate-200 p-0.5 ml-2 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isQuestionMode
                  ? `Ask @${hostName} a question...`
                  : `Message stream viewers or @${hostName}...`
              }
              className={`w-full bg-white/5 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                isQuestionMode
                  ? 'focus:ring-1 focus:ring-purple-500 bg-purple-950/20'
                  : 'focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {onOpenTipModal && (
              <button
                type="button"
                onClick={() => onOpenTipModal()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 p-1 cursor-pointer transition-transform hover:scale-110"
                title="Send Crypto Tip"
              >
                <Coins className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isQuestionMode
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* REPORT MESSAGE MODAL DIALOG */}
      <AnimatePresence>
        {reportingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setReportingMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0C1230] rounded-2xl p-4 shadow-2xl space-y-3.5 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Report Message
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Flag inappropriate livestream content
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReportingMessage(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Target Preview */}
              <div className="p-2.5 rounded-xl bg-black/40 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span>From:</span>
                  <span className="text-slate-200">@{reportingMessage.userName}</span>
                </div>
                <p className="text-xs text-slate-300 italic line-clamp-2">
                  "{reportingMessage.text}"
                </p>
              </div>

              {/* Report Reason Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Select Violation Reason
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'harassment', label: 'Harassment or Hate Speech', icon: '🚫' },
                    { id: 'scam', label: 'Scam, Phishing or Spam', icon: '⚠️' },
                    { id: 'nsfw', label: 'Inappropriate or NSFW Content', icon: '🔞' },
                    { id: 'prohibited', label: 'Prohibited Words & Slurs', icon: '💥' },
                    { id: 'other', label: 'Other Violation', icon: '📝' }
                  ].map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => setReportReason(reason.id)}
                      className={`w-full p-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        reportReason === reason.id
                          ? 'bg-rose-500/20 text-rose-200 font-bold'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{reason.icon}</span>
                        <span>{reason.label}</span>
                      </span>
                      {reportReason === reason.id && (
                        <Check className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Context Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Additional Details (Optional)
                </label>
                <input
                  type="text"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe why this message should be removed..."
                  className="w-full bg-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Hide Message Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideMessageOnReport}
                  onChange={(e) => setHideMessageOnReport(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 text-rose-500 focus:ring-0 focus:outline-none accent-rose-500 cursor-pointer"
                />
                <span className="text-[11px]">Hide this message from my chat view</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReportingMessage(null)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LivestreamChat;
