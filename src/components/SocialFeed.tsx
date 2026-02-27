import React from 'react';
import PostCard from './PostCard';
import { Post } from '@/types';

interface SocialFeedProps {
  posts: Post[];
  onDeletePost?: (id: string) => void;
  emptyMessage?: string;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onDeletePost, emptyMessage = "No posts found." }) => {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, idx) => (
        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
          <PostCard post={post} onDelete={onDeletePost} />
        </div>
      ))}
    </div>
  );
};

export default SocialFeed;
