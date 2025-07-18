import React from "react";
import PlaylistCard from "../components/PlaylistCard";
import "./AIPlaylistSection.css";

const mockAIPlaylists = [
  {
    id: 1,
    title: "Chill Vibes by Tonjam AI",
    description: "Relaxing tracks generated just for your mood",
    image: "/ai-chill.png",
    tracks: 20,
  },
  {
    id: 2,
    title: "AI Dance Boost",
    description: "Uplifting beats curated with AI",
    image: "/ai-dance.png",
    tracks: 25,
  },
  {
    id: 3,
    title: "Focus Flow AI",
    description: "Stay productive with smooth rhythms",
    image: "/ai-focus.png",
    tracks: 18,
  },
];

const AIPlaylistSection = () => {
  return (
    <div className="ai-playlist-section">
      <div className="section-header">
        <h3>Recommended by Tonjam AI</h3>
        <p className="subtext">Dynamic playlists tailored to your taste</p>
      </div>
      <div className="scroll-row">
        {mockAIPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} {...playlist} />
        ))}
      </div>
    </div>
  );
};

export default AIPlaylistSection;
