import React from 'react';
import { Mic, Radio } from 'lucide-react';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';

interface ArtistPostsProps {
  posts: Post[];
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onBookmark: (id: string) => void;
  onVote: (postId: string, optionIndex: number) => void;
}

export const ArtistPosts: React.FC<ArtistPostsProps> = ({
  posts,
  currentUserId,
  onLike,
  onRepost,
  onBookmark,
  onVote
}) => {
  // Artist posts represents posts created by verified artists
  const artistPosts = posts.filter(p => p.user.role === 'artist');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Artist Cabin Transmission</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Creator Channels</span>
      </div>

      {artistPosts.length === 0 ? (
        <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-6 text-center text-slate-500 text-xs font-medium uppercase tracking-wider">
          <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          Silence... no creators are actively transmitting in this segment
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {artistPosts.map((post) => (
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
