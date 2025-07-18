// Filename: src/components/CreatorCard.tsx

import React from 'react';
import './CreatorCard.css';

interface CreatorCardProps {
  imageUrl: string;
  name: string;
  isVerified: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ imageUrl, name, isVerified }) => {
  return (
    <div className="creator-card">
      <img src={imageUrl} alt={name} className="creator-image" />
      <div className="creator-name-container">
        <span className="creator-name">{name}</span>
        {isVerified && (
          <img
            src="/icon-verified-check.png"
            alt="Verified"
            className="verified-icon"
          />
        )}
      </div>
    </div>
  );
};

export default CreatorCard;
