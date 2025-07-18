import React from "react";
import { useNavigate } from "react-router-dom";
import "./FavoriteArtistsSection.css";

const favoriteArtists = [
  { id: 5, name: "Ayra", image: "/ayra.png", verified: true },
  { id: 6, name: "Reyyma", image: "/rema.png", verified: false },
  { id: 7, name: "burrna", image: "/burna.png", verified: true },
  { id: 8, name: "chancee", image: "/chance.png", verified: true },
];

const FavoriteArtistsSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (artistId: number) => {
    navigate(`/artist/${artistId}`);
  };

  const handleFollowClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    artistId: number
  ) => {
    e.stopPropagation();
    console.log(`Followed artist ID: ${artistId}`);
    // Add follow logic or API call here
  };

  return (
    <div className="section">
      <h2 className="section-title">Favorite Artists</h2>
      <div className="artist-scroll">
        {favoriteArtists.map((artist) => (
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

export default FavoriteArtistsSection;
