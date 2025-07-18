import React from "react";
import "./FeedModal.css";

interface FeedModalProps {
  image: string;
  title: string;
  description: string;
  onClose: () => void;
}

const FeedModal: React.FC<FeedModalProps> = ({ image, title, description, onClose }) => {
  return (
    <div className="feed-modal-overlay" onClick={onClose}>
      <div className="feed-modal" onClick={(e) => e.stopPropagation()}>
        <img src={image} alt={title} />
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default FeedModal;
