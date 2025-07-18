import React from "react";
import "./RecentlyAddedSongsSection.css";

const recentlyAdded = [
  {
    id: 1,
    title: "Cold Nights",
    artist: "Ray Blaze",
    image: "/ray.png",
  },
  {
    id: 2,
    title: "Moon Vibe",
    artist: "Sola Dee",
    image: "/sola.png",
  },
  {
    id: 3,
    title: "Dream Line",
    artist: "Ice V",
    image: "/ice.png",
  },
  {
    id: 4,
    title: "Wave Mode",
    artist: "Nami",
    image: "/nami.png",
  },
];

const RecentlyAddedSongsSection = () => {
  return (
    <div className="recently-added-section">
      <h3 className="section-title">🆕 Recently Added Songs</h3>
      <div className="song-scroll-container">
        {recentlyAdded.map((song) => (
          <div className="song-card" key={song.id}>
            <img src={song.image} alt={song.title} className="song-image" />
            <div className="song-info">
              <p className="song-title">{song.title}</p>
              <p className="song-artist">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyAddedSongsSection;
