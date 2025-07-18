// src/components/LikedSongsShelf.tsx
import React from "react";
import "./LikedSongsShelf.css";

const likedSongs = [
  {
    id: 1,
    title: "Vibe Nation",
    artist: "Kray Zee",
    image: "/liked1.jpg",
  },
  {
    id: 2,
    title: "Ocean Drive",
    artist: "Blaq Pearl",
    image: "/liked2.jpg",
  },
  {
    id: 3,
    title: "On Chain",
    artist: "Satoshi Beats",
    image: "/liked3.jpg",
  },
];

const LikedSongsShelf = () => {
  return (
    <div className="liked-songs-section">
      <h2>💖 Liked Songs</h2>
      <div className="liked-songs-list">
        {likedSongs.map((song) => (
          <div className="liked-song-card" key={song.id}>
            <img src={song.image} alt={song.title} />
            <div className="liked-song-info">
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedSongsShelf;
