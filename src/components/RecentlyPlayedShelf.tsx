// src/components/RecentlyPlayedShelf.tsx
import React from "react";
import "./RecentlyPlayedShelf.css";

const recentlyPlayed = [
  {
    id: 1,
    title: "Crypto Flow",
    artist: "Krust King",
    image: "/recent1.jpg",
  },
  {
    id: 2,
    title: "Late Night Chain",
    artist: "Nino Wavey",
    image: "/recent2.jpg",
  },
  {
    id: 3,
    title: "Jam Protocol",
    artist: "Zee Beat",
    image: "/recent3.jpg",
  },
];

const RecentlyPlayedShelf = () => {
  return (
    <div className="recently-played-section">
      <h2>🕒 Recently Played</h2>
      <div className="recently-played-list">
        {recentlyPlayed.map((song) => (
          <div className="recently-played-card" key={song.id}>
            <img src={song.image} alt={song.title} />
            <div className="recently-played-info">
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayedShelf;
