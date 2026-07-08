import React from 'react';
import { Pin, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';

interface FeaturedPostsProps {
  posts: Post[];
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onBookmark: (id: string) => void;
  onVote: (postId: string, optionIndex: number) => void;
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  posts,
  currentUserId,
  onLike,
  onRepost,
  onBookmark,
  onVote
}) => {
  // Pinned posts, or posts with attachments represent featured items
  const featured = posts.filter(p => p.isPinned || (p.attachments && p.attachments.length > 0)).slice(0, 2);

  if (featured.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Featured Streams</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Top Priority Transmissions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featured.map((post) => (
          <PostCard 
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onLike={onLike}
            onRepost={onRepost}
            onBookmark={onBookmark}
            onVote={onVote}
          />
        ))}
      </div>
    </div>
  );
};
