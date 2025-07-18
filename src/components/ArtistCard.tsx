import React from "react";
import "./ArtistCard.css";
import { useFollow } from "../context/FollowContext";
import { useUser } from "../context/UserContext";

type Artist = {
  id: string;
  name: string;
  profilePic?: string;
  isVerified?: boolean;
  followersCount?: number;
};

const ArtistCard: React.FC<{ artist: Artist }> = ({ artist }) => {
  const { user } = useUser();
  const { isFollowing, toggleFollow } = useFollow();

  const handleFollowClick = () => {
    if (user) {
      toggleFollow(artist.id);
    } else {
      alert("Please log in to follow artists.");
    }
  };

  return (
    <div className="artist-card">
      <img className="artist-avatar" src={artist.profilePic || "/default-avatar.png"} alt={artist.name} />
      <div className="artist-info">
        <div className="artist-name">
          {artist.name}
          {artist.isVerified && <img src="/icon-verified-check.png" alt="Verified" className="verified-icon" />}
        </div>
        <div className="followers-count">
          {artist.followersCount ?? 0} followers
        </div>
        <button className="follow-btn" onClick={handleFollowClick}>
          {isFollowing(artist.id) ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
