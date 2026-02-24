import React from 'react';
import PostCard from './PostCard';
import { Post } from '../types';

interface SocialFeedProps {
  posts: Post[];
  onDeletePost?: (id: string) => void;
  emptyMessage?: string;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onDeletePost, emptyMessage = "No signals detected." }) => {
  if (posts.length === 0) {
    return (
      <div className="py-24 text-center glass rounded-2xl border-dashed border-white/10">
        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={onDeletePost ? () => onDeletePost(post.id) : undefined} 
        />
      ))}
    </div>
  );
};

export default SocialFeed;
