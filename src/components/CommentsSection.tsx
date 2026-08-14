import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useTonAddress } from '@tonconnect/ui-react';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { 
  Trash2, 
  MessageSquare, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Send, 
  Award,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getPlaceholderImage } from '@/lib/utils';
import { updateEngagementScore } from '@/services/engagementService';

export interface CommentItem {
  id: string;
  targetId: string;
  targetType: 'track' | 'nft' | 'artist' | 'post';
  userId?: string;
  userName: string;
  userAvatar: string;
  walletAddress?: string;
  feedbackTag?: string;
  text: string;
  createdAt: any;
  likes?: number;
  likedBy?: string[];
}

interface CommentsSectionProps {
  targetId: string;
  targetType: 'track' | 'nft' | 'artist' | 'post';
  itemOwnerAddress?: string;
  creatorAddress?: string;
}

const FEEDBACK_TAGS = [
  { id: 'collector', label: '💎 Collector Review', bg: 'bg-purple-500/20 text-purple-300' },
  { id: 'fire', label: '🔥 Fire Track', bg: 'bg-orange-500/20 text-orange-300' },
  { id: 'stems', label: '🎧 Audio & Stems', bg: 'bg-blue-500/20 text-blue-300' },
  { id: 'bullish', label: '🚀 Bullish NFT', bg: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'general', label: '💬 General', bg: 'bg-zinc-800 text-zinc-300' },
];

function shortenAddress(address?: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function CommentsSection({ 
  targetId, 
  targetType, 
  itemOwnerAddress, 
  creatorAddress 
}: CommentsSectionProps) {
  const [remoteComments, setRemoteComments] = useState<CommentItem[]>([]);
  const [localComments, setLocalComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('collector');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { userProfile, addNotification } = useAudio();
  const tonAddress = useTonAddress();

  // Active wallet address (from TON wallet or user profile)
  const activeWalletAddress = useMemo(() => {
    return tonAddress || userProfile.walletAddress || '';
  }, [tonAddress, userProfile.walletAddress]);

  // Load stored local comments for offline / instant feedback resilience
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tonjam_comments_${targetId}`);
      if (saved) {
        setLocalComments(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error reading local comments:', err);
    }
  }, [targetId]);

  // Real-time Firestore sync
  useEffect(() => {
    if (!targetId) return;

    try {
      const q = query(
        collection(db, 'comments'),
        where('targetId', '==', targetId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              targetId: data.targetId,
              targetType: data.targetType,
              userId: data.userId,
              userName: data.userName || 'Anonymous',
              userAvatar: data.userAvatar || getPlaceholderImage(data.userId || 'anon', 100, 100),
              walletAddress: data.walletAddress || '',
              feedbackTag: data.feedbackTag || 'general',
              text: data.text || '',
              createdAt: data.createdAt,
              likes: data.likes || 0,
              likedBy: data.likedBy || [],
            } as CommentItem;
          });
          setRemoteComments(fetched);
        },
        (error) => {
          console.warn('Firestore subscription info:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore fallback mode for comments');
    }
  }, [targetId]);

  // Combined comments list
  const combinedComments = useMemo(() => {
    const map = new Map<string, CommentItem>();
    
    // Add remote comments first
    remoteComments.forEach((c) => map.set(c.id, c));
    
    // Add local comments if not already present
    localComments.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, c);
      }
    });

    const list = Array.from(map.values());
    
    // Sort descending by time
    return list.sort((a, b) => {
      const timeA = typeof a.createdAt === 'string' 
        ? new Date(a.createdAt).getTime() 
        : a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Date.now();
      const timeB = typeof b.createdAt === 'string' 
        ? new Date(b.createdAt).getTime() 
        : b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Date.now();
      return timeB - timeA;
    });
  }, [remoteComments, localComments]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    addNotification(`Copied wallet address ${shortenAddress(address)}`, 'info');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const commentText = newComment.trim();

    const timestamp = new Date().toISOString();
    const displayName = userProfile.name || (activeWalletAddress ? `TON Collector (${shortenAddress(activeWalletAddress)})` : 'Web3 Music Fan');
    const avatar = userProfile.avatar || getPlaceholderImage(activeWalletAddress || auth.currentUser?.uid || 'user', 100, 100);

    const newCommentObj: CommentItem = {
      id: `local_${Date.now()}`,
      targetId,
      targetType,
      userId: auth.currentUser?.uid || activeWalletAddress || `guest_${Date.now()}`,
      userName: displayName,
      userAvatar: avatar,
      walletAddress: activeWalletAddress,
      feedbackTag: selectedTag,
      text: commentText,
      createdAt: timestamp,
      likes: 0,
      likedBy: [],
    };

    try {
      // Optimistic update
      const updatedLocal = [newCommentObj, ...localComments];
      setLocalComments(updatedLocal);
      localStorage.setItem(`tonjam_comments_${targetId}`, JSON.stringify(updatedLocal));

      // Attempt Firestore write
      if (auth.currentUser || activeWalletAddress) {
        await addDoc(collection(db, 'comments'), {
          targetId,
          targetType,
          userId: auth.currentUser?.uid || activeWalletAddress,
          userName: displayName,
          userAvatar: avatar,
          walletAddress: activeWalletAddress,
          feedbackTag: selectedTag,
          text: commentText,
          createdAt: serverTimestamp(),
          likes: 0,
          likedBy: [],
        });
      }

      if (auth.currentUser?.uid) {
        updateEngagementScore(auth.currentUser.uid, 2);
      }

      setNewComment('');
      addNotification('Feedback posted with linked wallet address!', 'success');
    } catch (error) {
      console.warn('Saved comment locally to track history:', error);
      setNewComment('');
      addNotification('Feedback published locally!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      // Remove from local storage first
      const updatedLocal = localComments.filter((c) => c.id !== commentId);
      setLocalComments(updatedLocal);
      localStorage.setItem(`tonjam_comments_${targetId}`, JSON.stringify(updatedLocal));

      // Remove from remote if not a local ID
      if (!commentId.startsWith('local_')) {
        await deleteDoc(doc(db, 'comments', commentId));
      }

      addNotification('Comment removed', 'info');
    } catch (error) {
      console.error('Delete error:', error);
      addNotification('Comment removed from view', 'info');
    }
  };

  const handleLikeComment = async (comment: CommentItem) => {
    const userIdentifier = auth.currentUser?.uid || activeWalletAddress || 'guest';
    const isLiked = comment.likedBy?.includes(userIdentifier);

    const newLikes = isLiked ? Math.max(0, (comment.likes || 1) - 1) : (comment.likes || 0) + 1;
    const newLikedBy = isLiked
      ? (comment.likedBy || []).filter((id) => id !== userIdentifier)
      : [...(comment.likedBy || []), userIdentifier];

    // Update local state
    setLocalComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, likes: newLikes, likedBy: newLikedBy } : c))
    );
    setRemoteComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, likes: newLikes, likedBy: newLikedBy } : c))
    );

    if (!comment.id.startsWith('local_')) {
      try {
        const commentRef = doc(db, 'comments', comment.id);
        await updateDoc(commentRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked ? arrayRemove(userIdentifier) : arrayUnion(userIdentifier),
        });
      } catch (err) {
        console.warn('Liked state saved locally:', err);
      }
    }
  };

  return (
    <div className="py-2 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              Track Feedback & Reviews
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full">
                {combinedComments.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              On-chain community reviews linked to TON wallet signatures
            </p>
          </div>
        </div>

        {/* Connected Wallet Indicator */}
        {activeWalletAddress ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold">
            <Wallet className="w-3.5 h-3.5" />
            <span>Linked: {shortenAddress(activeWalletAddress)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-xl text-xs font-bold">
            <Wallet className="w-3.5 h-3.5 animate-pulse" />
            <span>Connect TON Wallet to tag address</span>
          </div>
        )}
      </div>

      {/* New Comment Submission Form */}
      <form onSubmit={handleSubmit} className="p-5 bg-zinc-900/60 rounded-2xl space-y-4">
        {/* Category / Feedback Tag Selector */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
            Feedback Category
          </label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTag === tag.id
                    ? `${tag.bg} shadow-md`
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
            placeholder={
              activeWalletAddress
                ? `Leave text-based feedback linked to ${shortenAddress(activeWalletAddress)}...`
                : 'Write your thoughts on this track / NFT...'
            }
            className="w-full bg-zinc-950/80 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none h-28"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-bold text-zinc-500">
            {newComment.length} / 500
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Feedback earns +2 Curator Engagement Points</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Posting...' : 'Post Feedback'}
          </button>
        </div>
      </form>

      {/* Comments Feed List */}
      <div className="space-y-3.5">
        {combinedComments.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 rounded-2xl space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-400">No feedback posted for this track yet.</p>
            <p className="text-xs text-zinc-500">
              Be the first collector or listener to leave feedback linked to your TON wallet!
            </p>
          </div>
        ) : (
          combinedComments.map((comment) => {
            const tagInfo = FEEDBACK_TAGS.find((t) => t.id === comment.feedbackTag) || FEEDBACK_TAGS[4];
            const isOwner = itemOwnerAddress && comment.walletAddress && itemOwnerAddress.toLowerCase() === comment.walletAddress.toLowerCase();
            const isCreator = creatorAddress && comment.walletAddress && creatorAddress.toLowerCase() === comment.walletAddress.toLowerCase();
            const canDelete = 
              (auth.currentUser?.uid && comment.userId === auth.currentUser.uid) ||
              (activeWalletAddress && comment.walletAddress && activeWalletAddress.toLowerCase() === comment.walletAddress.toLowerCase()) ||
              comment.id.startsWith('local_');

            const formattedTime = comment.createdAt
              ? typeof comment.createdAt === 'string'
                ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                : comment.createdAt?.toDate
                ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })
                : 'Just now'
              : 'Just now';

            const userIdentifier = auth.currentUser?.uid || activeWalletAddress || 'guest';
            const isLiked = comment.likedBy?.includes(userIdentifier);

            return (
              <div 
                key={comment.id}
                className="p-4 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl transition-all space-y-3 group"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={comment.userAvatar} 
                      alt={comment.userName} 
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">
                          {comment.userName}
                        </span>

                        {/* Badges */}
                        {isOwner && (
                          <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500/20 text-amber-300 rounded-full flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" /> NFT Collector
                          </span>
                        )}

                        {isCreator && (
                          <span className="px-2 py-0.5 text-[9px] font-black bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Track Artist
                          </span>
                        )}

                        {/* Feedback Category Tag */}
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${tagInfo.bg}`}>
                          {tagInfo.label}
                        </span>
                      </div>

                      {/* Wallet Address Link & Timestamp */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                        {comment.walletAddress ? (
                          <div className="flex items-center gap-1 bg-zinc-950/60 px-2 py-0.5 rounded-md">
                            <Wallet className="w-3 h-3 text-blue-400" />
                            <span className="font-mono text-zinc-300">{shortenAddress(comment.walletAddress)}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(comment.walletAddress!)}
                              className="text-zinc-500 hover:text-white transition-colors p-0.5"
                              title="Copy wallet address"
                            >
                              {copiedAddress === comment.walletAddress ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={`https://tonviewer.com/${comment.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-blue-400 transition-colors p-0.5"
                              title="View on TON Explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-500 font-mono">Web3 User</span>
                        )}
                        <span>•</span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Option */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-zinc-800"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Comment Body Text */}
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap pl-1 sm:pl-12">
                  {comment.text}
                </p>

                {/* Comment Actions / Likes */}
                <div className="flex items-center justify-between pt-1 pl-1 sm:pl-12">
                  <button
                    type="button"
                    onClick={() => handleLikeComment(comment)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{comment.likes || 0}</span>
                  </button>

                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified On-Chain User Feedback
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
