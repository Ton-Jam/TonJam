import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, Pin, Globe, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ArtistPost } from '@/pages/ArtistProfile/types';
import { useToast } from '@/components/layout/ToastProvider';

interface PostsSectionProps {
  posts: ArtistPost[];
}

export const PostsSection: React.FC<PostsSectionProps> = ({ posts }) => {
  const toast = useToast();
  const [likesState, setLikesState] = useState<Record<string, { count: number; isLiked: boolean }>>(
    posts.reduce((acc, p) => {
      acc[p.id] = { count: p.likes, isLiked: !!p.isLiked };
      return acc;
    }, {} as Record<string, { count: number; isLiked: boolean }>)
  );

  const handleLike = (postId: string) => {
    setLikesState(prev => {
      const current = prev[postId] || { count: 0, isLiked: false };
      const nextLiked = !current.isLiked;
      return {
        ...prev,
        [postId]: {
          count: current.count + (nextLiked ? 1 : -1),
          isLiked: nextLiked
        }
      };
    });
    toast.success('Activity synchronized', 'Post engagement stored on local node.');
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-[#101A3B]/40 border border-white/5 rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
        No community announcements posted
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const likeInfo = likesState[post.id] || { count: post.likes, isLiked: !!post.isLiked };
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#101A3B] border border-white/5 rounded-2xl p-4 sm:p-5 text-white space-y-4 relative"
          >
            {/* Post Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/5">
                  TJ
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200">Community Node</span>
                    <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      {post.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {post.isPinned && (
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
              )}
            </div>

            {/* Post Body */}
            <p className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-line">
              {post.content}
            </p>

            {/* Post Media if available */}
            {post.mediaUrl && (
              <div className="rounded-xl overflow-hidden aspect-[16/9] w-full bg-slate-950/60 max-h-64 border border-white/5">
                <img
                  src={post.mediaUrl}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Post Footer/Interactions */}
            <div className="flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-slate-400 font-semibold select-none">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  likeInfo.isLiked ? 'text-red-400' : 'hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${likeInfo.isLiked ? 'fill-current' : ''}`} />
                <span className="font-mono">{likeInfo.count}</span>
              </button>

              <button
                onClick={() => toast.info('Comments', 'Discussion board loading...')}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-mono">{post.comments}</span>
              </button>

              <button
                onClick={() => toast.success('Link copied', 'Social share link generated.')}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-mono">{post.shares}</span>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PostsSection;
