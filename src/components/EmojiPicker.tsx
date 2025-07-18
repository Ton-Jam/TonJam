import React from "react";
import "./EmojiPicker.css";

const emojiList = ["😂", "🔥", "❤️", "👍", "🎵", "🙌", "💯", "😎", "🤩", "🎶", "😭", "🫶"];

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  return (
    <div className="emoji-picker">
      {emojiList.map((emoji, index) => (
        <button key={index} className="emoji-btn" onClick={() => onSelect(emoji)}>
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
