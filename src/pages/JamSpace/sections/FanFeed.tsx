import React from 'react';
import { Users, Award, Music, ShieldCheck } from 'lucide-react';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';

interface FanFeedProps {
  posts: Post[];
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onBookmark: (id: string) => void;
  onVote: (postId: string, optionIndex: number) => void;
}

export const FanFeed: React.FC<FanFeedProps> = ({
  posts,
  currentUserId,
  onLike,
  onRepost,
  onBookmark,
  onVote
}) => {
  // Fan feed displays posts where category is 'Fans' or user is not an artist, or general posts
  const fanPosts = posts.filter(p => p.category === 'Fans' || p.user.role === 'fan');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h2 className="section-title">Fan Feedback & Milestones</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Fan Node Ledger</span>
      </div>

      {fanPosts.length === 0 ? (
        <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-6 text-center text-slate-500 text-xs font-medium uppercase tracking-wider">
          <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          No recent fan activity signals in this grid block
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {fanPosts.map((post) => (
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
      )}
    </div>
  );
};
