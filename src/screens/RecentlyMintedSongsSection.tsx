// src/screens/RecentlyMintedSongsSection.tsx
import React from "react";
import "./RecentlyMintedSongsSection.css";

const recentlyMintedSongs = [
  {
    id: 1,
    title: "Waves",
    artist: "Lana",
    image: "/lana.png",
  },
  {
    id: 2,
    title: "Fever",
    artist: "Skale",
    image: "/skale.png",
  },
  {
    id: 3,
    title: "Lightning",
    artist: "Zina",
    image: "/zina.png",
  },
  {
    id: 4,
    title: "Galaxy",
    artist: "Nexus",
    image: "/nexus.png",
  },
];

const RecentlyMintedSongsSection = () => {
  return (
    <div className="recently-minted-section">
      <h2 className="section-title">Recently Minted Songs</h2>
      <div className="recently-minted-scroll">
        {recentlyMintedSongs.map((song) => (
          <div className="minted-card" key={song.id}>
            <img src={song.image} alt={song.title} className="minted-image" />
            <div className="minted-info">
              <h3 className="minted-title">{song.title}</h3>
              <p className="minted-artist">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyMintedSongsSection;
