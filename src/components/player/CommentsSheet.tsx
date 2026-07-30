import React, { useState } from "react";
import { MessageSquare, Send, Heart, User, X, Sparkles } from "lucide-react";
import { Track } from "@/types";
import { toast } from "sonner";
import { getPlaceholderImage } from "@/lib/utils";

interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

interface CommentsSheetProps {
  track: Track | null;
  onClose?: () => void;
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({ track, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "c1",
      user: "AlexVibes",
      avatar: getPlaceholderImage("avatar"),
      text: "This track goes so hard! The bass drop at 0:42 is unreal 🔥",
      timestamp: "2 mins ago",
      likes: 24,
      isLiked: true
    },
    {
      id: "c2",
      user: "CryptoBeats",
      avatar: getPlaceholderImage("avatar"),
      text: "Minted the NFT version last week. Best decision ever 💎🎵",
      timestamp: "15 mins ago",
      likes: 18
    },
    {
      id: "c3",
      user: "TonCollector",
      avatar: getPlaceholderImage("avatar"),
      text: "Hi-Fi lossless audio quality is top tier on TonJam!",
      timestamp: "1 hour ago",
      likes: 9
    }
  ]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      user: "You (Listener)",
      avatar: getPlaceholderImage("avatar"),
      text: commentText.trim(),
      timestamp: "Just now",
      likes: 0
    };

    setComments([newComment, ...comments]);
    setCommentText("");
    toast.success("Comment posted!");
  };

  const toggleCommentLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050A24] text-[#F2F4F8] select-none rounded-[18px] p-4 border border-[#16244F]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16244F]/60 mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#5B6BFF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Listener Comments ({comments.length})
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[10px]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSendComment} className="flex gap-2 my-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Leave a comment on this track..."
          className="flex-1 bg-[#0A113A] border border-[#16244F] rounded-[12px] px-3 py-2 text-xs text-[#F2F4F8] placeholder-[#9AA0AE] focus:outline-none focus:border-[#5B6BFF]"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="px-3 py-2 bg-[#5B6BFF] hover:bg-[#5B6BFF]/90 disabled:opacity-40 text-white rounded-[12px] text-xs font-bold flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 scrollbar-thin scrollbar-thumb-[#16244F]">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-2.5 rounded-[12px] bg-[#0A113A] border border-[#16244F] flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-6 h-6 rounded-full object-cover border border-[#16244F]"
                />
                <span className="text-xs font-bold text-[#F2F4F8]">{comment.user}</span>
                <span className="text-[10px] text-[#9AA0AE]">{comment.timestamp}</span>
              </div>

              <button
                onClick={() => toggleCommentLike(comment.id)}
                className="flex items-center gap-1 text-[10px] text-[#9AA0AE] hover:text-[#5B6BFF]"
              >
                <Heart
                  className={`w-3 h-3 ${
                    comment.isLiked ? "text-[#5B6BFF] fill-[#5B6BFF]" : ""
                  }`}
                />
                <span>{comment.likes}</span>
              </button>
            </div>

            <p className="text-xs text-[#F2F4F8]/90 font-normal pl-8">
              {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSheet;
