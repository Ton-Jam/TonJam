import * as React from "react";
import { ArtistPost } from "../types";
import { Heart, MessageSquare, Share2, Pin, MessageCircle, MoreHorizontal } from "lucide-react";
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
    toast.success("Copied post copy text to clipboard!");
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
        <div className="space-y-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="bg-neutral-900/20 border border-neutral-900 rounded-[10px] p-5 space-y-4 transition-all hover:bg-neutral-900/30"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px]",
                    post.type === "announcement" 
                      ? "bg-red-500/10 text-red-400" 
                      : post.type === "behind-the-scenes" 
                        ? "bg-purple-500/10 text-purple-400" 
                        : "bg-cyan-500/10 text-cyan-400"
                  )}>
                    {post.type.replace('-', ' ')}
                  </span>
                  
                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-[8px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                      <Pin className="w-2.5 h-2.5 text-amber-400 fill-current" /> PINNED
                    </span>
                  )}
                </div>
                
                <span className="text-[10px] text-muted-foreground font-mono">{post.timestamp}</span>
              </div>

              {/* Text content */}
              <p className="text-sm text-neutral-200 leading-relaxed font-normal whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Optional media item */}
              {post.mediaUrl && (
                <div className="aspect-[16/10] bg-neutral-950 rounded-[10px] overflow-hidden border border-neutral-800/40">
                  <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Post attachment" />
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-6 pt-2 border-t border-neutral-900/40 text-muted-foreground text-xs font-semibold">
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
                </button>
              </div>

              {/* Comments expander */}
              {commentsVisible[post.id] && (
                <div className="pt-4 border-t border-neutral-900 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Dynamic Post Comment input */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a public comment..."
                      value={commentInput[post.id] || ""}
                      onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 bg-neutral-950 border border-neutral-900 rounded-[10px] px-3 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-neutral-800"
                    />
                    <button 
                      type="submit"
                      className="bg-white text-black px-4 py-1.5 rounded-[10px] text-xs font-bold hover:bg-neutral-200"
                    >
                      Post
                    </button>
                  </form>

                  {/* Dummy comments for premium display */}
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start text-xs text-neutral-300">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">TON_Whale</span>
                          <span className="text-[9px] text-muted-foreground">30m ago</span>
                        </div>
                        <p className="leading-relaxed">This drop is legendary! Wallet pre-approved and locked. 💎⚡</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
          <h4 className="text-base font-semibold text-white">No Posts Found</h4>
          <p className="text-xs text-muted-foreground max-w-xs">No updates or social posts have been cataloged in this feed yet.</p>
        </div>
      )}
    </div>
  );
};
