import React from 'react';
import './JamFeedCard.css';

interface JamFeedCardProps {
  id: string;
  image: string;
  artist: string;
  isVerified?: boolean;
  caption?: string;
  type: 'track' | 'nft';
  onClick: () => void;
}

const JamFeedCard: React.FC<JamFeedCardProps> = ({
  image,
  artist,
  isVerified,
  caption,
  type,
  onClick,
}) => {
  return (
    <div className="jamfeed-card" onClick={onClick}>
      <img src={image} alt="Jam Cover" className="jamfeed-image" />
      <div className="jamfeed-content">
        <div className="jamfeed-artist">
          {artist}
          {isVerified && (
            <img
              src="/icon-verified-check.png"
              alt="Verified"
              className="verified-icon"
            />
          )}
        </div>
        {caption && <div className="jamfeed-caption">{caption}</div>}
        <button className="jamfeed-button">
          {type === 'track' ? '▶ Play' : 'Mint NFT'}
        </button>
      </div>
    </div>
  );
};

export default JamFeedCard;
