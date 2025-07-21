import React, { useState } from 'react';
import './ArtistHeader.css';

interface ArtistHeaderProps {
  artist: {
    name: string;
    bio: string;
    followers: number;
    image: string;
    verified: boolean;
  };
}

const ArtistHeader: React.FC<ArtistHeaderProps> = ({ artist }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
  };

  return (
    <div className="artist-header">
      <img src={artist.image} alt={artist.name} className="artist-image" />

      <div className="artist-info">
        <div className="artist-name-row">
          <h1 className="artist-name">{artist.name}</h1>
          {artist.verified && (
            <img src="/icon-verified-check.png" alt="Verified" className="verified-icon" />
          )}
        </div>
        <p className="artist-bio">{artist.bio}</p>
        <p className="artist-followers">{artist.followers.toLocaleString()} followers</p>
        <button className="follow-btn" onClick={toggleFollow}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default ArtistHeader;
