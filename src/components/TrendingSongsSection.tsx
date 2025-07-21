import React from "react";
import "./TrendingSongsSection.css";

const trendingSongs = [
  {
    id: 1,
    title: "Midnight Echoes",
    artist: "Nina Blaze",
    cover: "/assets/covers/song1.png",
  },
  {
    id: 2,
    title: "Chain Vibes",
    artist: "DeeCrypto",
    cover: "/assets/covers/song2.png",
  },
  {
    id: 3,
    title: "Waves of Gold",
    artist: "OceanGod",
    cover: "/assets/covers/song3.png",
  },
  {
    id: 4,
    title: "Virtual Love",
    artist: "MetaBae",
    cover: "/assets/covers/song4.png",
  },
];

const TrendingSongsSection = () => {
  return (
    <div className="trending-songs-section">
      <h2 className="section-title">Top Trending Songs</h2>
      <div className="song-scroll-container">
        {trendingSongs.map((song) => (
          <div className="song-card" key={song.id}>
            <img src={song.cover} alt={song.title} className="song-cover" />
            <div className="song-info">
              <h3 className="song-title">{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSongsSection;
