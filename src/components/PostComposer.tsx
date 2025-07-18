// src/components/PostComposer.tsx
import React, { useState } from "react";
import "./PostComposer.css";

const PostComposer = ({ onPostSubmit }: { onPostSubmit: (post: any) => void }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const post = {
      text,
      file,
      createdAt: new Date().toISOString(),
    };

    onPostSubmit(post);
    setText("");
    setFile(null);
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Post</button>
    </form>
  );
};

export default PostComposer;
