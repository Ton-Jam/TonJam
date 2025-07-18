// src/components/SmartPlaylist.tsx
import React from "react";
import "./SmartPlaylist.css";

const smartPlaylists = [
  {
    id: 1,
    title: "Afrobeats for You",
    image: "/smart-afrobeats.jpg",
    description: "Based on your top Afrobeats listens",
  },
  {
    id: 2,
    title: "Late Night Chill",
    image: "/smart-night.jpg",
    description: "For those late working or jam sessions",
  },
  {
    id: 3,
    title: "Trending in Your Circle",
    image: "/smart-friends.jpg",
    description: "What your followers are vibing to",
  },
];

const SmartPlaylist = () => {
  return (
    <div className="smart-playlist-section">
      <h2>🧠 Smart Playlists</h2>
      <div className="smart-playlist-container">
        {smartPlaylists.map((playlist) => (
          <div key={playlist.id} className="smart-playlist-card">
            <img src={playlist.image} alt={playlist.title} />
            <div className="smart-playlist-info">
              <h4>{playlist.title}</h4>
              <p>{playlist.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartPlaylist;
