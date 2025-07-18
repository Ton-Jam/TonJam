import React, { useState } from "react";
import "./SpacePostCard.css";

interface SpacePostCardProps {
  authorImage: string;
  authorName: string;
  postText: string;
  commentCount: number;
  reactionCount: number;
  onNavigate: () => void;
}

const SpacePostCard: React.FC<SpacePostCardProps> = ({
  authorImage,
  authorName,
  postText,
  commentCount,
  reactionCount,
  onNavigate,
}) => {
  const [reacted, setReacted] = useState(false);

  const toggleReaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReacted(!reacted);
  };

  return (
    <div className="space-post-card" onClick={onNavigate}>
      <div className="space-post-header">
        <img src={authorImage} alt="Author" className="author-image" />
        <span className="author-name">{authorName}</span>
      </div>
      <div className="space-post-content">{postText}</div>

      <div className="space-post-footer">
        <div className="reaction" onClick={toggleReaction}>
          <img
            src={reacted ? "/icons/heart-filled.png" : "/icons/heart.png"}
            alt="React"
            className="reaction-icon"
          />
          <span>{reacted ? reactionCount + 1 : reactionCount}</span>
        </div>
        <div className="comments">
          <img
            src="/icons/comment.png"
            alt="Comment"
            className="comment-icon"
          />
          <span>{commentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default SpacePostCard;
