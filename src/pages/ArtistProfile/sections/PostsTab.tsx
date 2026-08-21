import * as React from "react";
import { ArtistPost } from "../types";
import { Heart, MessageSquare, Share2, Pin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostsTabProps {
  posts: ArtistPost[];
  onLikePost: (id: string) => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({ posts, onLikePost }) => {
  const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});
  const [commentsVisible, setCommentsVisible] = React.useState<Record<string, boolean>>({});

  const handleSharePost = (content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    toast.success("Copied post text to clipboard!");
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInput[postId]?.trim();
    if (!text) return;
    toast.success(`Comment posted successfully!`);
    setCommentInput(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in" id="posts-tab-root">
      
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="bg-neutral-900/40 rounded-2xl p-5 space-y-4 transition-all hover:bg-neutral-900/60 shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    post.type === "announcement" 
                      ? "bg-red-500/10 text-red-400" 
                      : post.type === "behind-the-scenes" 
                        ? "bg-purple-500/10 text-purple-400" 
                        : "bg-cyan-500/10 text-cyan-400"
                  )}>
                    {post.type.replace('-', ' ')}
                  </span>
                  
                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <Pin className="w-3 h-3 text-amber-400 fill-current" /> PINNED
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] text-neutral-400 font-mono">{post.timestamp}</span>
              </div>

              {/* Text content */}
              <p className="text-sm text-neutral-200 leading-relaxed font-normal whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Optional media item */}
              {post.mediaUrl && (
                <div className="aspect-[16/10] bg-neutral-950 rounded-xl overflow-hidden shadow-inner">
                  <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Post attachment" />
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-6 pt-2 text-neutral-400 text-xs font-semibold">
                <button 
                  onClick={() => onLikePost(post.id)}
                  className={cn(
                    "flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent",
                    post.isLiked && "text-red-500 animate-pulse"
                  )}
                >
                  <Heart className="w-4 h-4" fill={post.isLiked ? "currentColor" : "none"} />
                  <span>{post.likes}</span>
                </button>

                <button 
                  onClick={() => setCommentsVisible(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>

                <button 
                  onClick={(e) => handleSharePost(post.content, e)}
                  className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer border-none bg-transparent ml-auto"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comment Input */}
              {commentsVisible[post.id] && (
                <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={commentInput[post.id] || ""}
                    onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="flex-1 bg-neutral-950/80 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1DB954] text-black font-bold text-xs rounded-full cursor-pointer hover:bg-[#1ed760] transition-colors"
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl">
          <p className="text-xs">No posts yet.</p>
        </div>
      )}
    </div>
  );
};
