import React from "react";
import TrackCard from "../components/TrackCard";
import "./TrendingSongsSection.css";

const trendingSongs = [
  {
    id: 1,
    title: "yayo",
    artist: "rema",
    image: "/rema.png",
  },
  {
    id: 2,
    title: "rushh",
    artist: "Ayraa",
    image: "/ayra.png",
  },
  {
    id: 3,
    title: "window",
    artist: "Travizz",
    image: "/travis.png",
  },
  {
    id: 4,
    title: "Coloba",
    artist: "Tiwaa",
    image: "/tiwa.png",
  },
];

const TrendingSongsSection = () => {
  return (
    <div className="trending-songs-section">
      <h3 className="section-title">Top Trending Songs</h3>
      <div className="songs-scroll">
        {trendingSongs.map((song) => (
          <TrackCard
            key={song.id}
            title={song.title}
            artist={song.artist}
            image={song.image}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingSongsSection;
