// src/components/FeedCard.tsx
import React from 'react';
import './FeedCard.css';

interface FeedCardProps {
  image: string;
  title: string;
  artist: string;
  isSponsored?: boolean;
  onPlay?: () => void;
  onMint?: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ image, title, artist, isSponsored, onPlay, onMint }) => {
  return (
    <div className="feed-card">
      <img src={image} alt={title} className="feed-image" />
      <div className="feed-info">
        <h3 className="feed-title">{title}</h3>
        <p className="feed-artist">@{artist}</p>
        {isSponsored && <span className="sponsored-tag">Sponsored</span>}
        <div className="feed-actions">
          <button className="feed-btn play" onClick={onPlay}>▶ Play</button>
          <button className="feed-btn mint" onClick={onMint}>🎵 Mint NFT</button>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
