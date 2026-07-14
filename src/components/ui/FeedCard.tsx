import * as React from "react";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { VerifiedBadge } from "./VerifiedBadge";

interface FeedCardProps {
  author?: {
    name: string;
    avatar: string;
    isVerified?: boolean;
    handle?: string;
  };
  time?: string;
  content?: string;
  likes?: number;
  comments?: number;
  hasLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function FeedCard({
  author = { name: "Aelous", avatar: "", isVerified: true, handle: "@aelous_jam" },
  time = "2 hours ago",
  content = "Just uploaded a brand new interactive sound wave experience to my JamSpace! Let me know what you think.",
  likes = 42,
  comments = 7,
  hasLiked = false,
  onLike,
  onComment,
  onShare,
}: FeedCardProps) {
  return (
    <div className="p-5 rounded-card bg-surface border border-border-subtle flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-white/5">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="font-black text-xs text-text-muted bg-white/5 uppercase">
              {author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                {author.name}
              </span>
              {author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <span className="text-[10px] font-medium text-text-muted">
              {author.handle} • {time}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-white/10">
          <MoreHorizontal className="size-4 text-text-muted" />
        </Button>
      </div>

      {/* Content */}
      <p className="text-xs font-medium text-text-secondary leading-relaxed">
        {content}
      </p>

      {/* Action Row */}
      <div className="flex items-center gap-6 border-t border-divider pt-3 mt-1">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 group text-text-muted hover:text-primary transition-colors text-xs font-semibold"
        >
          <Heart className={`size-4 transition-transform group-active:scale-95 ${hasLiked ? "fill-primary text-primary" : ""}`} />
          {likes}
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-xs font-semibold"
        >
          <MessageSquare className="size-4" />
          {comments}
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 ml-auto text-text-muted hover:text-text-primary transition-colors text-xs font-semibold"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
