import React, { useState } from "react";
import "./CommentModal.css";

const CommentModal = ({ postId, onClose, onComment }) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = () => {
    if (commentText.trim()) {
      onComment(postId, commentText.trim());
      setCommentText("");
      onClose();
    }
  };

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal">
        <h3>Reply to Post</h3>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your reply..."
        />
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="submit-btn" onClick={handleSubmit}>Reply</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
