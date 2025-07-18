// src/components/PostModal.tsx
import React, { useState } from "react";
import "./PostModal.css";

const PostModal = ({ onClose, onPost }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onPost({ text, image });
      setText("");
      setImage(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="post-modal">
        <textarea
          className="post-textarea"
          placeholder="What's Jammin'? 🎧"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {image && <img src={image} className="post-preview-img" alt="preview" />}
        <div className="modal-actions">
          <label className="upload-btn">
            📷
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="post-btn" onClick={handleSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
