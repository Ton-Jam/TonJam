import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getPlaceholderImage } from '@/lib/utils';
import { updateEngagementScore } from '@/services/engagementService';

interface Comment {
  id: string;
  targetId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
}

interface CommentsSectionProps {
  targetId: string;
  targetType: 'track' | 'nft' | 'artist' | 'post';
}

export default function CommentsSection({ targetId, targetType }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile, addNotification } = useAudio();

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'comments');
    });

    return () => unsubscribe();
  }, [targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      addNotification("Please log in to comment", "error");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        targetId,
        targetType,
        userId: auth.currentUser.uid,
        userName: userProfile.name || 'Anonymous',
        userAvatar: userProfile.avatar || getPlaceholderImage(auth.currentUser.uid, 100, 100),
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      updateEngagementScore(auth.currentUser.uid, 2); // 2 points for commenting
      setNewComment('');
      addNotification("Comment posted", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      addNotification("Comment deleted", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
    }
  };

  return (
    <div className="pt-4">
      <h3 className="text-xl font-bold text-foreground tracking-tight mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments ({comments.length})
      </h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..." 
          className="w-full bg-muted/50 rounded-xl p-4 text-sm text-foreground placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none h-24"
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/50">
            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl bg-muted/50 group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={comment.userAvatar} 
                    alt={comment.userName} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{comment.userName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                </div>
                {auth.currentUser?.uid === comment.userId && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap pl-11">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
