// Filename: src/components/FavoriteArtistCard.tsx

import React from 'react';
import './FavoriteArtistCard.css';

// This component needs more info: name, image, verification, and their latest song.
interface FavoriteArtistCardProps {
  name: string;
  imageUrl: string;
  isVerified: boolean;
  latestRelease: string;
}

const FavoriteArtistCard: React.FC<FavoriteArtistCardProps> = ({ name, imageUrl, isVerified, latestRelease }) => {
  return (
    <div className="fav-artist-card">
      <img src={imageUrl} alt={name} className="fav-artist-image" />
      <div className="fav-artist-info">
        <div className="fav-artist-header">
          <h4>{name}</h4>
          {isVerified && <img src="/icon-verified-check.png" alt="Verified" className="fav-artist-verified" />}
        </div>
        <p className="fav-artist-release">
          <span className="fire-emoji">🔥</span> New Drop: {latestRelease}
        </p>
      </div>
      <button className="follow-button">+ Follow</button>
    </div>
  );
};

export default FavoriteArtistCard;
