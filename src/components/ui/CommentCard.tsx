import * as React from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { VerifiedBadge } from "./VerifiedBadge";
import { colors, typography } from "@/design";

interface CommentCardProps {
  author?: {
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  time?: string;
  content?: string;
  likes?: number;
  hasLiked?: boolean;
  onLike?: () => void;
}

export function CommentCard({
  author = { name: "Aria", avatar: "", isVerified: false },
  time = "1 hour ago",
  content = "This track is absolutely fire! The synthesizer work is insane.",
  likes = 12,
  hasLiked = false,
  onLike,
}: CommentCardProps) {
  return (
    <div
      style={{
        fontFamily: typography.fontFamily.primary,
      }}
      className="flex gap-3 py-3"
    >
      <Avatar className="size-8 shrink-0 border border-white/5">
        <AvatarImage src={author.avatar} alt={author.name} />
        <AvatarFallback className="font-black text-[10px] text-text-muted bg-white/5 uppercase">
          {author.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-text-primary">
            {author.name}
          </span>
          {author.isVerified && <VerifiedBadge size="sm" />}
          <span className="text-[9px] font-medium text-text-muted">
            • {time}
          </span>
        </div>
        
        <p className="text-xs font-medium text-text-secondary leading-normal">
          {content}
        </p>
      </div>

      <button
        onClick={onLike}
        className="flex flex-col items-center gap-0.5 text-text-muted hover:text-primary transition-colors text-[9px] font-semibold"
      >
        <Heart className={`size-3.5 ${hasLiked ? "fill-primary text-primary" : ""}`} />
        {likes}
      </button>
    </div>
  );
}
