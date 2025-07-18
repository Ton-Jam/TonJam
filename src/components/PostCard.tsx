import React, { useState } from "react";
import "./PostCard.css";
import emojiList from "../utils/emojiList.json"; // Simple emoji JSON file

const mockComments = [
  { id: 1, user: "Krusher", text: "Love this vibe!", emoji: "🔥", replyTo: null },
  { id: 2, user: "Anna", text: "Where can I mint this?", emoji: "💎", replyTo: null },
];

const PostCard = ({ post }) => {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const newC = {
        id: Date.now(),
        user: "You",
        text: newComment,
        emoji: "🗨️",
        replyTo,
      };
      setComments([...comments, newC]);
      setNewComment("");
      setReplyTo(null);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.userAvatar} className="post-avatar" />
        <span className="post-user">{post.username}</span>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-interactions">
        <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          😊
        </button>
        <span className="comment-count">{comments.length} Comments</span>
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojiList.map((e, i) => (
            <span key={i} onClick={() => handleEmojiClick(e)}>{e}</span>
          ))}
        </div>
      )}

      <div className="comment-input">
        {replyTo && <div className="replying-to">Replying to @{replyTo}</div>}
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Send</button>
      </div>

      <div className="comments-section">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.user}</strong>: {c.text} <span>{c.emoji}</span>
            <button className="reply-btn" onClick={() => setReplyTo(c.user)}>Reply</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
