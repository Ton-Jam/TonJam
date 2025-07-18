// src/components/ArtistListCard.tsx
import React from "react";
import "./ArtistListCard.css";

interface ArtistListCardProps {
  id: number;
  name: string;
  profilePic: string;
  isVerified?: boolean;
  followers?: number;
}

const ArtistListCard: React.FC<ArtistListCardProps> = ({ name, profilePic, isVerified, followers }) => {
  return (
    <div className="artist-list-card">
      <img src={profilePic} alt={name} className="artist-list-image" />
      <div className="artist-list-info">
        <h4 className="artist-list-name">
          {name}
          {isVerified && <img src="/icon-verified-check.png" alt="Verified" className="verified-icon" />}
        </h4>
        {followers !== undefined && <p className="artist-followers">{followers.toLocaleString()} followers</p>}
      </div>
      <button className="follow-btn">Follow</button>
    </div>
  );
};

export default ArtistListCard;
