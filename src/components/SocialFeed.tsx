import React, { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import { Post } from '@/types';
import { APP_LOGO } from '@/constants';

interface SocialFeedProps {
  posts: Post[];
  onDeletePost?: (id: string) => void;
  emptyMessage?: string;
}

const POSTS_PER_PAGE = 5;

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onDeletePost, emptyMessage = "No posts found." }) => {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [posts]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < posts.length) {
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + POSTS_PER_PAGE, posts.length));
        }, 500);
      }
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [visibleCount, posts.length]);

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">{emptyMessage}</p>
      </div>
    );
  }

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {visiblePosts.map((post, idx) => (
        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${(idx % POSTS_PER_PAGE) * 100}ms` }}>
          <PostCard post={post} onDelete={onDeletePost} />
        </div>
      ))}
      
      {visibleCount < posts.length && (
        <div ref={sentinelRef} className="py-8 flex justify-center items-center">
          <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
