import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopArtistsSection.css";

const topArtists = [
  { id: 1, name: "Brizy", image: "/brizy.png", verified: true },
  { id: 2, name: "kanye", image: "/kanye.png", verified: true },
  { id: 3, name: "wizyy", image: "/wizy.png", verified: false },
  { id: 4, name: "Drakee", image: "/drake.png", verified: true },
];

const TopArtistsSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (artistId: number) => {
    navigate(`/artist/${artistId}`);
  };

  const handleFollowClick = (e: React.MouseEvent<HTMLButtonElement>, artistId: number) => {
    e.stopPropagation(); // prevent card click
    console.log(`Followed artist ID: ${artistId}`);
    // You can add logic to update follow state or API call here
  };

  return (
    <div className="section">
      <h2 className="section-title">Top Artists</h2>
      <div className="artist-scroll">
        {topArtists.map((artist) => (
          <div
            key={artist.id}
            className="artist-card clickable"
            onClick={() => handleCardClick(artist.id)}
          >
            <img src={artist.image} alt={artist.name} className="artist-image" />
            <span className="artist-name">
              {artist.name}
              {artist.verified && (
                <img
                  src="/icon-verified-check.png"
                  alt="verified"
                  className="verified-icon"
                />
              )}
            </span>
            <button
              className="follow-btn"
              onClick={(e) => handleFollowClick(e, artist.id)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArtistsSection;
