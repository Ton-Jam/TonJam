import React from "react";
import "./TrackModal.css";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  image: string;
}

const TrackModal: React.FC<TrackModalProps> = ({ isOpen, onClose, title, artist, image }) => {
  if (!isOpen) return null;

  return (
    <div className="track-modal-overlay" onClick={onClose}>
      <div className="track-modal" onClick={(e) => e.stopPropagation()}>
        <img src={image} alt={title} className="track-modal-image" />
        <h2>{title}</h2>
        <p>{artist}</p>
        <button className="track-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TrackModal;
