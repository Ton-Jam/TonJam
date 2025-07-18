// src/screens/CreatePostScreen.tsx
import React, { useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import "./CreatePostScreen.css";

const CreatePostScreen = () => {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji: any) => {
    setContent(prev => prev + emoji.native);
  };

  const handlePostSubmit = () => {
    if (content.trim()) {
      // Call backend or local storage save logic here
      alert("Post created: " + content);
      setContent("");
    }
  };

  return (
    <div className="create-post-screen">
      <h2>Create a Post</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={5}
      />
      <div className="actions">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          😊 Emoji
        </button>
        <button onClick={handlePostSubmit}>Post</button>
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker-wrapper">
          <Picker onSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default CreatePostScreen;
