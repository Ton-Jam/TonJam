// src/screens/TracksListScreen.tsx
import React from "react";
import TrackCard from "../components/TrackCard";
import "./TrackListScreen.css";

const mockTracks = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  title: `Track ${i + 1}`,
  artist: `Artist ${i + 1}`,
  image: "/image.png",
  isMinted: i % 2 === 0,
}));

const TracksListScreen = () => {
  return (
    <div className="tracks-list-screen">
      <h2>Trending Tracks</h2>
      <div className="tracks-grid">
        {mockTracks.map((track) => (
          <TrackCard key={track.id} {...track} />
        ))}
      </div>
    </div>
  );
};

export default TracksListScreen;
