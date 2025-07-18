// NFTModal.tsx
import React from 'react';
import './NFTModal.css';

type NFTModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    artist: string;
    coverImage: string;
    type: 'track' | 'nft';
    audioUrl?: string;
    price?: string;
  } | null;
};

const NFTModal: React.FC<NFTModalProps> = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) return null;

  const { title, artist, coverImage, type, audioUrl, price } = post;

  return (
    <div className="nft-modal-overlay" onClick={onClose}>
      <div className="nft-modal-container" onClick={(e) => e.stopPropagation()}>
        <img src={coverImage} alt={title} className="nft-modal-image" />
        <h2>{title}</h2>
        <p>By: {artist}</p>

        {type === 'track' ? (
          <>
            <audio controls src={audioUrl} className="nft-modal-audio" />
            <button className="nft-modal-btn">Play</button>
          </>
        ) : (
          <>
            <p className="nft-modal-price">Price: {price ?? 'Free'}</p>
            <button className="nft-modal-btn">Mint</button>
          </>
        )}

        <button className="nft-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default NFTModal;
